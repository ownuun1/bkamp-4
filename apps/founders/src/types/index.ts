export interface Persona {
  id: string;
  name: string;
  title: string;
  philosophy: string;
  color: string;
  avatar_url: string | null;
  system_prompt: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string | null;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  persona_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  persona?: Persona;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  is_highlighted: boolean;
  created_at: string;
}

export interface Quote {
  id: string;
  persona_id: string;
  content: string;
  source: string | null;
  created_at: string;
  persona?: Persona;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'initial' | 'usage' | 'bonus';
  description: string | null;
  created_at: string;
}

export type PersonaId = 'elon' | 'steve' | 'jeff' | 'bill' | 'mark';

export const PERSONA_COLORS: Record<PersonaId, string> = {
  elon: '#E82127',
  steve: '#555555',
  jeff: '#FF9900',
  bill: '#00A4EF',
  mark: '#1877F2',
};
