'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import type { PersonaData } from '@/lib/personas';

interface PersonaCardProps {
  persona: PersonaData;
  onSelect: (personaId: string) => void;
  isLoading?: boolean;
}

export function PersonaCard({ persona, onSelect, isLoading }: PersonaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full overflow-hidden group">
        <div
          className="h-2"
          style={{ backgroundColor: persona.color }}
        />
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${persona.color}20` }}
            >
              {persona.emoji}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{persona.name}</h3>
              <p className="text-sm text-muted-foreground">{persona.title}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {persona.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {persona.traits.map((trait) => (
              <span
                key={trait}
                className="text-xs px-2 py-0.5 rounded-full bg-muted"
              >
                {trait}
              </span>
            ))}
          </div>
          <Button
            onClick={() => onSelect(persona.id)}
            disabled={isLoading}
            className="w-full"
            style={{
              backgroundColor: persona.color,
              borderColor: persona.color,
            }}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            대화 시작하기
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
