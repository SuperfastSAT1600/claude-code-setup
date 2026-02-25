import { RadioCard } from '@/components/ui/RadioCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PROGRAM_TYPES } from '@/lib/data/pricing';
import { ICON_MAP } from './icons';
import { SectionHeader } from './SectionHeader';
import type { ProgramType } from '@/types/enrollment';

interface ProgramTypeSectionProps {
  programType: ProgramType | null;
  onSelect: (type: ProgramType) => void;
}

export function ProgramTypeSection({ programType, onSelect }: ProgramTypeSectionProps) {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16">
      <SectionHeader number={1} title="프로그램 선택" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PROGRAM_TYPES.map((pt) => {
          const IconComponent = ICON_MAP[pt.icon];
          const isDisabled = !!pt.disabled;

          const cardContent = (
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-accent-glow/15 flex items-center justify-center">
                  {IconComponent && (
                    <IconComponent className="w-5 h-5 text-accent-glow" />
                  )}
                </div>
                <div className="flex gap-2">
                  {pt.badge && (
                    <Badge variant="warning">{pt.badge}</Badge>
                  )}
                  {pt.recommended && (
                    <Badge variant="primary">추천</Badge>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">
                  {pt.name}
                </h3>
                <Badge variant="neutral" className="mt-1">
                  {pt.subtitle}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                {pt.description}
              </p>
            </div>
          );

          if (isDisabled) {
            return (
              <Card
                key={pt.id}
                className="min-h-[140px] opacity-40 cursor-not-allowed"
              >
                {cardContent}
              </Card>
            );
          }

          return (
            <RadioCard
              key={pt.id}
              selected={programType === pt.id}
              onSelect={() => onSelect(pt.id)}
              className={`min-h-[140px]`}
            >
              {cardContent}
            </RadioCard>
          );
        })}
      </div>
    </section>
  );
}
