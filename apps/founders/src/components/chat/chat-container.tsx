'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './chat-message';
import { AIInput } from '@/components/ui/ai-input';
import { AITextLoading } from '@/components/ui/ai-text-loading';
import { useAuth } from '@/contexts/auth-context';
import type { Message } from '@/types';
import type { PersonaData } from '@/lib/personas';

interface ChatContainerProps {
  sessionId: string;
  persona: PersonaData;
  initialMessages: Message[];
}

export function ChatContainer({
  sessionId,
  persona,
  initialMessages,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { refreshProfile } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    // Add user message to UI immediately
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      session_id: sessionId,
      role: 'user',
      content: userMessage,
      is_highlighted: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
          personaId: persona.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.error === 'Insufficient credits') {
          alert('크레딧이 부족합니다. 프로필에서 크레딧을 확인해주세요.');
        } else {
          throw new Error(error.error);
        }
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullContent += parsed.text;
                  setStreamingContent(fullContent);
                }
              } catch {
                // Ignore parsing errors
              }
            }
          }
        }
      }

      // Add assistant message after streaming is complete
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        session_id: sessionId,
        role: 'assistant',
        content: fullContent,
        is_highlighted: false,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent('');

      // Refresh profile to update credits
      await refreshProfile();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
      // Remove the temporary user message
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
              style={{ backgroundColor: `${persona.color}20` }}
            >
              {persona.emoji}
            </div>
            <p className="font-medium">{persona.name}</p>
            <p className="text-sm mt-1">{persona.philosophy}</p>
            <p className="text-sm mt-4">무엇이든 물어보세요!</p>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            personaColor={persona.color}
            personaEmoji={persona.emoji}
          />
        ))}

        {isLoading && streamingContent && (
          <ChatMessage
            role="assistant"
            content={streamingContent}
            personaColor={persona.color}
            personaEmoji={persona.emoji}
            isStreaming
          />
        )}

        {isLoading && !streamingContent && (
          <div className="p-4">
            <AITextLoading />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t">
        <AIInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          placeholder={`${persona.name}에게 질문하세요...`}
          disabled={false}
          isLoading={isLoading}
        />
        <p className="text-xs text-center text-muted-foreground mt-2">
          메시지당 1 크레딧이 사용됩니다
        </p>
      </div>
    </div>
  );
}
