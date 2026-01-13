'use client';

import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  personaColor?: string;
  personaEmoji?: string;
  isStreaming?: boolean;
}

export function ChatMessage({
  role,
  content,
  personaColor,
  personaEmoji,
  isStreaming,
}: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-xl',
        isUser ? 'bg-primary/5' : 'bg-muted/50'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'text-lg'
        )}
        style={!isUser && personaColor ? { backgroundColor: `${personaColor}20` } : undefined}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : personaEmoji ? (
          personaEmoji
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          {isUser ? '나' : 'AI 멘토'}
        </p>
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap">
            {content}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary animate-pulse" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
