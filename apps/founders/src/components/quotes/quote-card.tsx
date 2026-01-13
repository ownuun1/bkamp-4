'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { getPersonaById } from '@/lib/personas';
import type { QuoteData } from '@/lib/quotes';

interface QuoteCardProps {
  quote: QuoteData;
}

export function QuoteCard({ quote }: QuoteCardProps) {
  const [copied, setCopied] = useState(false);
  const persona = getPersonaById(quote.personaId);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(quote.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <Card className="p-5 h-full flex flex-col">
        <div
          className="h-1 w-16 rounded-full mb-4"
          style={{ backgroundColor: persona?.color }}
        />
        <blockquote className="flex-1">
          <p className="text-lg font-medium leading-relaxed mb-4">
            "{quote.content}"
          </p>
        </blockquote>
        <div className="flex items-center justify-between mt-auto pt-4 border-t">
          <div className="flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
              style={{ backgroundColor: persona ? `${persona.color}20` : undefined }}
            >
              {persona?.emoji}
            </span>
            <div>
              <p className="text-sm font-medium">{persona?.name}</p>
              <p className="text-xs text-muted-foreground">{quote.source}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
