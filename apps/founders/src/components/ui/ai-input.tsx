'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Send, Loader2 } from 'lucide-react';

interface AIInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function AIInput({
  value,
  onChange,
  onSubmit,
  placeholder = '메시지를 입력하세요...',
  disabled = false,
  isLoading = false,
  className,
}: AIInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  React.useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !isLoading && value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-end gap-2 rounded-2xl border border-input bg-background p-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        rows={1}
        className="flex-1 resize-none bg-transparent px-2 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        style={{ minHeight: '40px', maxHeight: '200px' }}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || isLoading || !value.trim()}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
          value.trim() && !disabled && !isLoading
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
