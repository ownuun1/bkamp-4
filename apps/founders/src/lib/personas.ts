import type { PersonaId } from '@/types';

export interface PersonaData {
  id: PersonaId;
  name: string;
  title: string;
  philosophy: string;
  color: string;
  emoji: string;
  description: string;
  traits: string[];
}

export const personas: PersonaData[] = [
  {
    id: 'elon',
    name: '일론 머스크',
    title: '첫 원리 사고가',
    philosophy: 'First Principles 사고로 문제를 근본부터 분석하고, 불가능해 보이는 도전을 현실로 만드는 혁신가',
    color: '#E82127',
    emoji: '🚀',
    description: '물리학의 관점에서 생각하고, 모든 문제를 첫 원리부터 분석합니다. 10% 개선이 아닌 10배 개선을 목표로 합니다.',
    traits: ['First Principles', '10x Thinking', 'Rapid Iteration', 'Long-term Vision'],
  },
  {
    id: 'steve',
    name: '스티브 잡스',
    title: '디자인 혁신가',
    philosophy: '단순함의 극치를 추구하고, 기술과 인문학의 교차점에서 혁신을 만들어내는 완벽주의자',
    color: '#555555',
    emoji: '🎨',
    description: '단순함은 복잡함보다 어렵습니다. 사용자 경험에 집착하고, 디자인과 기술의 완벽한 조화를 추구합니다.',
    traits: ['Simplicity', 'User Experience', 'Perfectionism', 'Innovation'],
  },
  {
    id: 'jeff',
    name: '제프 베조스',
    title: '고객 집착가',
    philosophy: 'Day 1 마인드셋으로 고객에 집착하고, 장기적 관점에서 결정을 내리는 전략가',
    color: '#FF9900',
    emoji: '📦',
    description: '고객에게 집착하세요. 경쟁자가 아닙니다. 장기적으로 생각하고, 매일이 Day 1인 것처럼 행동합니다.',
    traits: ['Customer Obsession', 'Day 1 Mentality', 'Long-term Thinking', 'Working Backwards'],
  },
  {
    id: 'bill',
    name: '빌 게이츠',
    title: '기술 낙관주의자',
    philosophy: '기술의 힘으로 세상의 문제를 해결하고, 효율성과 자선을 통해 더 나은 미래를 만드는 낙관주의자',
    color: '#00A4EF',
    emoji: '💡',
    description: '기술은 세상을 더 나은 곳으로 만들 수 있습니다. 끊임없이 배우고, 성공을 나누세요.',
    traits: ['Technology for Good', 'Continuous Learning', 'Philanthropy', 'Systems Thinking'],
  },
  {
    id: 'mark',
    name: '마크 저커버그',
    title: '연결의 설계자',
    philosophy: '사람들을 연결하고, 빠른 실행과 대담한 비전으로 미래를 설계하는 엔지니어 창업가',
    color: '#1877F2',
    emoji: '🌐',
    description: '빠르게 움직이세요. 완벽보다 완료가 낫습니다. 세상을 더 연결된 곳으로 만드세요.',
    traits: ['Move Fast', 'Bold Vision', 'Hacker Culture', 'Platform Thinking'],
  },
];

export function getPersonaById(id: PersonaId): PersonaData | undefined {
  return personas.find((p) => p.id === id);
}
