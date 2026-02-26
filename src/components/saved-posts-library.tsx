'use client';

import * as React from 'react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Upload, Trash2, Search, Calendar, FileText } from 'lucide-react';
import type { GeneratedContent } from '@blog-agent/types';

interface SavedPostMetadata {
  filename: string;
  title: string;
  category: string;
  savedAt: Date;
  wordCount: number;
}

interface SavedPostsLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPost: (post: GeneratedContent) => void;
}

export function SavedPostsLibrary({
  isOpen,
  onClose,
  onLoadPost,
}: SavedPostsLibraryProps) {
  const [posts, setPosts] = React.useState<SavedPostMetadata[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  // Fetch posts when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      fetchPosts();
    }
  }, [isOpen]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();

      if (data.success) {
        // Convert savedAt strings to Date objects
        const postsWithDates = data.posts.map((post: SavedPostMetadata) => ({
          ...post,
          savedAt: new Date(post.savedAt),
        }));
        setPosts(postsWithDates);
      } else {
        setError(data.error || 'Failed to load posts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (filename: string) => {
    try {
      const res = await fetch(`/api/posts/${filename}`);
      const data = await res.json();

      if (data.success) {
        onLoadPost(data.post);
        onClose();
      } else {
        alert(`❌ Failed to load: ${data.error}`);
      }
    } catch (err) {
      alert(`❌ Error loading post: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (filename: string, title: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/posts/${filename}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        setPosts(posts.filter((p) => p.filename !== filename));
        alert('✅ Post deleted successfully');
      } else {
        alert(`❌ Failed to delete: ${data.error}`);
      }
    } catch (err) {
      alert(`❌ Error deleting post: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Filter posts by search term
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Saved Drafts</DialogTitle>
      </DialogHeader>
      <DialogContent>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading saved posts...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-destructive mb-2">Error loading posts</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchPosts} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No posts found' : 'No saved posts yet'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm
                ? 'Try a different search term'
                : 'Generate and save a blog post to see it here'}
            </p>
          </div>
        )}

        {/* Posts List */}
        {!loading && !error && filteredPosts.length > 0 && (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredPosts.map((post) => (
              <Card key={post.filename} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-2 truncate">
                        {post.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{post.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {post.savedAt.toLocaleDateString()}{' '}
                            {post.savedAt.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">{post.wordCount}</span>{' '}
                          words
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleLoad(post.filename)}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(post.filename, post.title)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
