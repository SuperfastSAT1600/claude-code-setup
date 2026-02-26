'use client';

import * as React from 'react';
import { ContentPreview } from './content-preview';
import { ContentEditor } from './content-editor';
import { Button } from './ui/button';
import { Edit, Save, FileJson, FileDown, FileType } from 'lucide-react';
import type { GeneratedContent } from '@blog-agent/types';
import { markdownToHTML } from '@/lib/markdown-to-html';
import { stripEmojis } from '@/lib/strip-emojis';

interface EditableContentPreviewProps {
  content: GeneratedContent;
  onGenerateNew: () => void;
  onSaved?: (filename: string) => void;
  onRegenerate?: () => void;
}

export function EditableContentPreview({
  content,
  onGenerateNew,
  onSaved,
  onRegenerate,
}: EditableContentPreviewProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedContent, setEditedContent] =
    React.useState<GeneratedContent>(content);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isCompleting, setIsCompleting] = React.useState(false);

  const isIncomplete = editedContent.completionStatus?.stopReason === 'max_tokens';

  // Update editedContent when content prop changes
  React.useEffect(() => {
    setEditedContent(content);
    setHasUnsavedChanges(false);
  }, [content]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/posts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedContent),
      });

      const data = await response.json();

      if (data.success) {
        setHasUnsavedChanges(false);
        setIsEditing(false);
        alert(`✅ Saved as ${data.filename}`);
        if (onSaved) onSaved(data.filename);
      } else {
        alert(`❌ Failed to save: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Error saving: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to discard them?'
      );
      if (!confirmed) return;
    }

    setEditedContent(content);
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  const handleExportJSON = () => {
    const slug = editedContent.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);

    const blob = new Blob([JSON.stringify(editedContent, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    let markdownContent = editedContent.content;

    // Strip emojis for Naver platform
    if (editedContent.seoPlatform === 'naver') {
      markdownContent = stripEmojis(markdownContent);
    }

    const slug = editedContent.title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);

    const blob = new Blob([markdownContent], {
      type: 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportHTML = () => {
    let markdownContent = editedContent.content;

    // Strip emojis for Naver platform
    if (editedContent.seoPlatform === 'naver') {
      markdownContent = stripEmojis(markdownContent);
    }

    const htmlContent = markdownToHTML(markdownContent, editedContent.title);

    const slug = editedContent.title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);

    const blob = new Blob([htmlContent], {
      type: 'text/html',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleContentChange = (newContent: GeneratedContent) => {
    setEditedContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const response = await fetch('/api/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedContent.title,
          incompleteContent: editedContent.content,
          seoPlatform: editedContent.seoPlatform,
          metadata: editedContent.metadata
        })
      });

      if (!response.ok) throw new Error('Completion failed');

      const result = await response.json();

      // Update content with completed version
      setEditedContent({
        ...editedContent,
        content: result.data.content,
        completionStatus: result.data.completionStatus
      });

      alert('✅ 포스팅이 완성되었습니다!');
    } catch (error) {
      console.error('Failed to complete content:', error);
      alert('완성하기 실패: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons - shown when not editing */}
      {!isEditing && (
        <div className="flex flex-wrap gap-2 mb-4">
          {isIncomplete && (
            <Button
              onClick={handleComplete}
              disabled={isCompleting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCompleting ? '완성하는 중...' : '✨ 완성하기'}
            </Button>
          )}
          {onRegenerate && (
            <Button
              onClick={onRegenerate}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              🔄 같은 조건으로 재생성
            </Button>
          )}
          <Button onClick={handleEdit} variant="default">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button onClick={handleExportMarkdown} variant="outline">
            <FileType className="w-4 h-4 mr-2" />
            Markdown
          </Button>
          <Button onClick={handleExportHTML} variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            HTML
          </Button>
          <Button onClick={handleExportJSON} variant="outline">
            <FileJson className="w-4 h-4 mr-2" />
            JSON
          </Button>
        </div>
      )}

      {/* Incomplete post warning */}
      {isIncomplete && !isEditing && (
        <div className="mb-4 rounded-lg border border-yellow-500 bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                ⚠️ 포스팅이 완결되지 않았을 수 있습니다
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                생성 중 토큰 제한에 도달하여 글이 중간에 끊겼을 가능성이 있습니다.
                "완성하기" 버튼을 눌러 나머지 내용을 생성하세요.
              </p>
              {editedContent.completionStatus?.tokenUsage && (
                <p className="mt-2 text-xs text-yellow-600">
                  토큰 사용량: {editedContent.completionStatus.tokenUsage.output.toLocaleString()} / {editedContent.completionStatus.tokenUsage.input.toLocaleString()} (output/input)
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unsaved changes warning */}
      {isEditing && hasUnsavedChanges && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          ⚠️ You have unsaved changes
        </div>
      )}

      {/* Content Display/Editor */}
      {isEditing ? (
        <ContentEditor
          content={editedContent}
          onChange={handleContentChange}
          onSave={handleSave}
          onCancel={handleDiscard}
        />
      ) : (
        <ContentPreview content={editedContent} onGenerateNew={onGenerateNew} />
      )}

      {/* Save Indicator */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4 animate-pulse" />
            <span>Saving...</span>
          </div>
        </div>
      )}
    </div>
  );
}
