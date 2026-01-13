'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { PersonaData } from '@/lib/personas';

interface ChatHeaderProps {
  persona: PersonaData;
}

export function ChatHeader({ persona }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-4 pb-4 border-b">
      <Link href="/personas">
        <Button variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
        style={{ backgroundColor: `${persona.color}20` }}
      >
        {persona.emoji}
      </div>
      <div>
        <h1 className="font-semibold">{persona.name}</h1>
        <p className="text-sm text-muted-foreground">{persona.title}</p>
      </div>
    </div>
  );
}
