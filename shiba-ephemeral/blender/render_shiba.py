"""
Blender Cycles render pipeline for the Shiba ephemeral reel.

Usage (from project root):
    "C:/Users/Jason/tools/blender/blender-4.5.5-windows-x64/blender.exe" \
        --background --factory-startup --python blender/render_shiba.py

Outputs PNG sequence to out/blender-frames/ at 1080x1920 @ 30fps for 300
frames. After this finishes, encode to MP4 with ffmpeg and composite the
existing VO/captions/SFX over it in a Remotion overlay composition.
"""
import os
import sys
from math import radians

import bpy

# -------- Paths --------

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
MODEL_PATH = os.path.join(PROJECT_ROOT, "public", "models", "shiba-quaternius.glb")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "out", "blender-frames")
os.makedirs(OUTPUT_DIR, exist_ok=True)


# -------- Reset --------

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


# -------- Render settings --------

scene.render.engine = "CYCLES"
scene.render.resolution_x = 1080
scene.render.resolution_y = 1920
scene.render.resolution_percentage = 100
scene.render.fps = 30
scene.frame_start = 1
scene.frame_end = 300

# Allow a single-frame smoke test via env var BLENDER_FRAMES="30-30" or "30".
_frames_override = os.environ.get("BLENDER_FRAMES")
if _frames_override:
    if "-" in _frames_override:
        a, b = _frames_override.split("-", 1)
        scene.frame_start = int(a)
        scene.frame_end = int(b)
    else:
        scene.frame_start = int(_frames_override)
        scene.frame_end = int(_frames_override)
    print(
        f"[render_shiba] BLENDER_FRAMES override: {scene.frame_start}..{scene.frame_end}"
    )

scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.image_settings.compression = 15
scene.render.film_transparent = False
scene.render.filepath = os.path.join(OUTPUT_DIR, "frame_")

# Cycles configuration tuned for an RTX 5060 / 8 GB VRAM.
scene.cycles.samples = 64
scene.cycles.use_adaptive_sampling = True
scene.cycles.adaptive_threshold = 0.02
scene.cycles.use_denoising = True
scene.cycles.denoiser = "OPENIMAGEDENOISE"
scene.cycles.max_bounces = 6
scene.cycles.diffuse_bounces = 3
scene.cycles.glossy_bounces = 3
scene.cycles.transmission_bounces = 4
scene.cycles.transparent_max_bounces = 4
scene.view_settings.view_transform = "Filmic"
scene.view_settings.look = "Medium High Contrast"
scene.view_settings.exposure = -0.3
scene.view_settings.gamma = 1.0

# GPU: try OPTIX (RTX path tracing cores), then CUDA, then fall back.
prefs = bpy.context.preferences.addons["cycles"].preferences
selected_type = None
for dtype in ("OPTIX", "CUDA", "HIP", "ONEAPI"):
    try:
        prefs.compute_device_type = dtype
    except TypeError:
        continue
    prefs.refresh_devices()
    has_gpu = False
    for d in prefs.devices:
        if d.type == dtype:
            d.use = True
            has_gpu = True
        elif d.type == "CPU":
            # Leave CPU off — GPU only for speed.
            d.use = False
    if has_gpu:
        selected_type = dtype
        break

scene.cycles.device = "GPU" if selected_type else "CPU"
print(f"[render_shiba] using device={scene.cycles.device} type={selected_type}")


# -------- World / lighting --------

# Use a procedural Nishita sky for natural outdoor lighting, then add
# discrete lights for shaping. Cycles handles the sky as the environment
# IBL and gives proper rim/contact light on the dog's fur.
world = bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
nt = world.node_tree
for n in list(nt.nodes):
    nt.nodes.remove(n)
out = nt.nodes.new("ShaderNodeOutputWorld")
bg = nt.nodes.new("ShaderNodeBackground")
sky = nt.nodes.new("ShaderNodeTexSky")
sky.sky_type = "NISHITA"
sky.sun_elevation = radians(35)
sky.sun_rotation = radians(60)
sky.air_density = 1.0
sky.dust_density = 0.8
sky.sun_intensity = 1.0
bg.inputs["Strength"].default_value = 0.35
nt.links.new(sky.outputs[0], bg.inputs[0])
nt.links.new(bg.outputs[0], out.inputs[0])


# -------- Import the Shiba GLB --------

print(f"[render_shiba] importing {MODEL_PATH}")
bpy.ops.import_scene.gltf(filepath=MODEL_PATH)

# Find the armature so we can scale/place the whole rig at once.
imported_armature = None
for obj in bpy.data.objects:
    if obj.type == "ARMATURE":
        imported_armature = obj
        break

if imported_armature is None:
    # Fallback: take the first imported object's parent chain root.
    for obj in bpy.data.objects:
        if obj.users_collection:
            imported_armature = obj
            break

print(f"[render_shiba] armature = {imported_armature}")


# -------- Scale + orient the model --------

# Native Quaternius scale is tiny; bump up so the dog is ~2 m tall and easy
# to frame in a portrait camera at 5 m distance.
ARMATURE_SCALE = 60.0
if imported_armature:
    imported_armature.scale = (ARMATURE_SCALE, ARMATURE_SCALE, ARMATURE_SCALE)
    imported_armature.location = (0, 0, 0)
    # Quaternius models often face -Y; rotate to face +Y so camera at -Y looks at front.
    imported_armature.rotation_euler = (0, 0, radians(180))

# Compute the world bounding box AFTER scaling so we know where to put the
# camera.
bpy.context.view_layer.update()


# -------- Animation timeline --------

# The GLB ships with named actions like AnimalArmature|Idle, |Eating, etc.
# Map composition frames to actions and bake the result into an NLA so the
# timeline plays the right clip at the right moment.
ACTION_PLAN = [
    (1,   "AnimalArmature|Idle_2"),
    (90,  "AnimalArmature|Eating"),     # "Like treats."
    (132, "AnimalArmature|Gallop"),     # "Like squirrels."
    (200, "AnimalArmature|Idle"),
    (230, "AnimalArmature|Jump_ToIdle"),
]

actions_by_name = {a.name: a for a in bpy.data.actions}
print(f"[render_shiba] available actions: {list(actions_by_name.keys())[:20]}")

if imported_armature and imported_armature.animation_data is None:
    imported_armature.animation_data_create()

if imported_armature and imported_armature.animation_data:
    # Clear any default NLA tracks and the active action (so the NLA stack
    # alone drives the timeline).
    imported_armature.animation_data.action = None
    for trk in list(imported_armature.animation_data.nla_tracks):
        imported_armature.animation_data.nla_tracks.remove(trk)

    plan = ACTION_PLAN
    for i, (start_frame, action_name) in enumerate(plan):
        action = actions_by_name.get(action_name)
        if action is None:
            short = action_name.split("|", 1)[-1]
            action = actions_by_name.get(short)
        if action is None:
            print(f"[render_shiba] missing action {action_name}, skipping")
            continue
        end_frame = plan[i + 1][0] - 1 if i + 1 < len(plan) else scene.frame_end
        # Each action lives on its own NLA track so they crossfade with
        # use_auto_blend.
        track = imported_armature.animation_data.nla_tracks.new()
        track.name = f"shiba_{i:02d}_{action_name}"
        strip = track.strips.new(action_name, int(start_frame), action)
        strip.frame_end = int(end_frame)
        action_len = max(1, int(action.frame_range[1] - action.frame_range[0]))
        strip.repeat = max(1.0, (end_frame - start_frame) / action_len)
        strip.use_auto_blend = True
        # Layer-stack: later tracks override earlier ones inside their range.
        track.is_solo = False
        print(
            f"[render_shiba] strip {action_name} -> frames {start_frame}..{end_frame}"
        )


# -------- Camera --------

cam_data = bpy.data.cameras.new("ReelCam")
cam_data.lens = 50  # 50mm — flattering portrait of the dog
cam_data.sensor_width = 36
cam = bpy.data.objects.new("ReelCam", cam_data)
scene.collection.objects.link(cam)

# Position camera in front of the dog, slightly elevated.
cam.location = (0, -5.0, 1.4)
cam.rotation_euler = (radians(83), 0, 0)
scene.camera = cam

# Subtle dolly push: 5m to 3.8m across the reel.
cam.keyframe_insert(data_path="location", frame=1)
cam.location = (0, -3.8, 1.25)
cam.keyframe_insert(data_path="location", frame=scene.frame_end)
# Make the dolly linear, not eased — feels more like a steady push.
for fcurve in cam.animation_data.action.fcurves:
    for kp in fcurve.keyframe_points:
        kp.interpolation = "LINEAR"


# -------- Discrete lights for shape --------

# Warm key — golden hour sun from upper-front-right.
key_data = bpy.data.lights.new("Key", type="AREA")
key_data.energy = 1500
key_data.size = 2.0
key_data.color = (1.0, 0.88, 0.65)
key = bpy.data.objects.new("Key", key_data)
key.location = (3.5, -3.5, 4.0)
key.rotation_euler = (radians(55), 0, radians(35))
scene.collection.objects.link(key)

# Cool rim from behind-left for silhouette separation.
rim_data = bpy.data.lights.new("Rim", type="AREA")
rim_data.energy = 900
rim_data.size = 1.2
rim_data.color = (0.65, 0.85, 1.0)
rim = bpy.data.objects.new("Rim", rim_data)
rim.location = (-3.0, 3.0, 3.5)
rim.rotation_euler = (radians(110), 0, radians(-30))
scene.collection.objects.link(rim)

# Bottom bounce so shadows under chin aren't pitch black.
bounce_data = bpy.data.lights.new("Bounce", type="AREA")
bounce_data.energy = 300
bounce_data.size = 4.0
bounce_data.color = (1.0, 0.85, 0.65)
bounce = bpy.data.objects.new("Bounce", bounce_data)
bounce.location = (0, -3.0, -1.5)
bounce.rotation_euler = (radians(-30), 0, 0)
scene.collection.objects.link(bounce)


# -------- Ground plane --------

bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, -0.05))
ground = bpy.context.active_object
ground.name = "Ground"
mat = bpy.data.materials.new("GroundMat")
mat.use_nodes = True
bsdf = mat.node_tree.nodes.get("Principled BSDF")
if bsdf:
    bsdf.inputs["Base Color"].default_value = (0.95, 0.65, 0.30, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.85
ground.data.materials.append(mat)


# -------- Smooth shade the imported meshes --------

# Just flag smooth shading on every imported mesh so the low-poly Quaternius
# look reads as soft volumes rather than blocky facets. SubSurf was tried
# but breaks the vertex-color-painted materials, so we leave geometry alone.
for obj in bpy.data.objects:
    if obj.type == "MESH" and (
        imported_armature is None or obj.parent == imported_armature
    ):
        for poly in obj.data.polygons:
            poly.use_smooth = True


# -------- Material override: shiba-faithful PBR coat --------

# Diagnose imported material structure so we can build a faithful override.
print("[render_shiba] === materials inspection ===")
for mat in bpy.data.materials:
    print(f"  material: {mat.name} use_nodes={mat.use_nodes}")
    if mat.use_nodes and mat.node_tree:
        for n in mat.node_tree.nodes:
            if n.type == "BSDF_PRINCIPLED" and "Base Color" in n.inputs:
                bc = n.inputs["Base Color"].default_value
                print(f"    Principled.BaseColor = {tuple(bc)}")
        for n in mat.node_tree.nodes:
            if n.type == "TEX_IMAGE":
                img = n.image
                if img:
                    print(f"    image: {img.name} size={img.size[:]}")
print("[render_shiba] images in bpy.data:", [i.name for i in bpy.data.images])

# A Shiba's coat reads as: warm orange on the back/face/legs, cream-white on
# muzzle/belly/chest/tail-tip. The Quaternius model is one mesh with several
# material slots; we override each slot's BSDF and pick base color by name.
SHIBA_PALETTE = {
    "orange": (0.85, 0.32, 0.10, 1.0),  # back, face top, legs — punchy
    "cream":  (0.92, 0.80, 0.60, 1.0),  # muzzle, belly, chest, tail tip
    "black":  (0.04, 0.03, 0.03, 1.0),  # eyes, nose, claws
    "white":  (0.95, 0.92, 0.84, 1.0),  # teeth, tongue (dull)
    "pink":   (0.90, 0.55, 0.62, 1.0),  # inner ear / tongue
}

def shiba_color_for(name: str):
    n = name.lower()
    # Explicit mapping for Quaternius Animal Pack material names.
    if n == "main":
        return SHIBA_PALETTE["orange"]      # back, face, legs, ears
    if n == "main_light":
        return SHIBA_PALETTE["cream"]       # muzzle, belly, chest, tail tip
    if n == "black":
        return SHIBA_PALETTE["black"]       # nose, claws
    if n.startswith("eyes_white"):
        # Slight cream tint so the eye whites read warm.
        return (0.92, 0.86, 0.74, 1.0)
    if n.startswith("eyes_pupil"):
        return SHIBA_PALETTE["black"]
    if n.startswith("eyes_black"):
        # Iris ring — warm dark amber so the eye reads alive, not dead-flat.
        return (0.22, 0.10, 0.04, 1.0)
    # Fallbacks if the model deviates from the standard names.
    if any(k in n for k in ("nose", "claw", "hoof")):
        return SHIBA_PALETTE["black"]
    if any(k in n for k in ("belly", "cream", "muzzle", "mask", "chest", "white", "tip")):
        return SHIBA_PALETTE["cream"]
    if "pink" in n or "tongue" in n:
        return SHIBA_PALETTE["pink"]
    return SHIBA_PALETTE["orange"]

for obj in bpy.data.objects:
    if obj.type != "MESH":
        continue
    if imported_armature is not None and obj.parent != imported_armature:
        continue
    for slot in obj.material_slots:
        if slot.material is None:
            continue
        mat = slot.material
        mat.use_nodes = True
        nt = mat.node_tree
        # Clear all existing nodes so we don't inherit anything weird from
        # the FBX2glTF importer.
        for n in list(nt.nodes):
            nt.nodes.remove(n)
        bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
        out = nt.nodes.new("ShaderNodeOutputMaterial")
        out.location = (300, 0)
        bsdf.location = (0, 0)

        color = shiba_color_for(mat.name)
        bsdf.inputs["Base Color"].default_value = color

        def set_input(name, value):
            if name in bsdf.inputs:
                try:
                    bsdf.inputs[name].default_value = value
                except (TypeError, AttributeError):
                    pass
        set_input("Roughness", 0.85)
        set_input("Specular IOR Level", 0.2)
        # Sheen and subsurface are off — they wash out the low-poly silhouettes.

        nt.links.new(bsdf.outputs[0], out.inputs[0])
        print(f"  override {mat.name} -> color={color}")


# -------- Render the timeline --------

print(
    f"[render_shiba] rendering {scene.frame_start}..{scene.frame_end} "
    f"to {scene.render.filepath}"
)
bpy.ops.render.render(animation=True, write_still=False)
print("[render_shiba] done")
