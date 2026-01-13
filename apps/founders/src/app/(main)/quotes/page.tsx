'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { QuoteCard } from '@/components/quotes/quote-card';
import { Button } from '@/components/ui/button';
import { quotes, getQuotesByPersona } from '@/lib/quotes';
import { personas } from '@/lib/personas';
import type { PersonaId } from '@/types';
import { cn } from '@/lib/utils';

export default function QuotesPage() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaId | 'all'>('all');

  const filteredQuotes =
    selectedPersona === 'all' ? quotes : getQuotesByPersona(selectedPersona);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">명언 모음</h1>
        <p className="text-muted-foreground">
          전설적인 창업가들에게서 영감을 받은 명언들
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant={selectedPersona === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedPersona('all')}
        >
          전체
        </Button>
        {personas.map((persona) => (
          <Button
            key={persona.id}
            variant={selectedPersona === persona.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPersona(persona.id)}
            className={cn(
              selectedPersona === persona.id && 'text-white'
            )}
            style={
              selectedPersona === persona.id
                ? { backgroundColor: persona.color, borderColor: persona.color }
                : undefined
            }
          >
            {persona.emoji} {persona.name}
          </Button>
        ))}
      </div>

      {/* Quotes Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredQuotes.map((quote) => (
          <QuoteCard key={quote.id} quote={quote} />
        ))}
      </motion.div>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          이 명언들은 공개된 인터뷰, 책, 연설에서 영감을 받아 재구성되었습니다.
        </p>
      </div>
    </div>
  );
}
