import type { PersonaId } from '@/types';

export interface QuoteData {
  id: string;
  personaId: PersonaId;
  content: string;
  source: string;
}

export const quotes: QuoteData[] = [
  // Elon style
  { id: 'elon-1', personaId: 'elon', content: '실패는 하나의 옵션입니다. 만약 실패하고 있지 않다면, 충분히 혁신하고 있지 않은 것입니다.', source: 'First Principles Thinking' },
  { id: 'elon-2', personaId: 'elon', content: '사람들이 미래가 더 나아질 것이라고 믿을 이유가 있어야 합니다.', source: 'Long-term Vision' },
  { id: 'elon-3', personaId: 'elon', content: '무언가가 충분히 중요하다면, 확률이 당신에게 불리해도 해야 합니다.', source: 'Risk Taking' },
  { id: 'elon-4', personaId: 'elon', content: '끈기는 매우 중요합니다. 포기해야 할 때가 아니라면 포기하지 마세요.', source: 'Persistence' },
  { id: 'elon-5', personaId: 'elon', content: '물리학의 관점에서 생각하세요. 불가능은 없습니다.', source: 'Physics-based Thinking' },
  { id: 'elon-6', personaId: 'elon', content: '10% 개선이 아니라 10배 개선을 목표로 하세요.', source: 'Ambitious Goals' },
  { id: 'elon-7', personaId: 'elon', content: '첫 원리로 돌아가서 생각하세요. 왜 그렇게 되어야 하는지 질문하세요.', source: 'First Principles' },
  { id: 'elon-8', personaId: 'elon', content: '복잡한 문제를 가장 단순한 형태로 분해하세요.', source: 'Problem Decomposition' },

  // Steve style
  { id: 'steve-1', personaId: 'steve', content: '단순함은 복잡함보다 어렵습니다.', source: 'Design Philosophy' },
  { id: 'steve-2', personaId: 'steve', content: '디자인은 어떻게 생겼는지가 아니라 어떻게 작동하는지입니다.', source: 'Functionality' },
  { id: 'steve-3', personaId: 'steve', content: '점들을 연결할 수 있는 것은 과거를 돌아볼 때뿐입니다.', source: 'Connecting the Dots' },
  { id: 'steve-4', personaId: 'steve', content: '배고픔을 유지하세요. 어리석음을 유지하세요.', source: 'Stay Hungry, Stay Foolish' },
  { id: 'steve-5', personaId: 'steve', content: '품질은 천 번 거절하는 것에서 나옵니다.', source: 'Quality through Focus' },
  { id: 'steve-6', personaId: 'steve', content: '기술과 인문학의 교차점에 서세요.', source: 'Intersection of Tech and Liberal Arts' },
  { id: 'steve-7', personaId: 'steve', content: '세상을 바꿀 수 있다고 믿을 만큼 미친 사람들이 실제로 바꿉니다.', source: 'Changing the World' },
  { id: 'steve-8', personaId: 'steve', content: '뒤편의 울타리도 중요합니다.', source: 'Attention to Detail' },

  // Jeff style
  { id: 'jeff-1', personaId: 'jeff', content: '고객에게 집착하세요. 경쟁자가 아닙니다.', source: 'Customer Obsession' },
  { id: 'jeff-2', personaId: 'jeff', content: '매일이 Day 1입니다.', source: 'Day 1 Philosophy' },
  { id: 'jeff-3', personaId: 'jeff', content: '오래 오해받을 준비가 되어 있어야 합니다.', source: 'Long-term Thinking' },
  { id: 'jeff-4', personaId: 'jeff', content: '고객으로부터 시작해서 거꾸로 일하세요.', source: 'Working Backwards' },
  { id: 'jeff-5', personaId: 'jeff', content: '후회 최소화 프레임워크로 결정하세요.', source: 'Regret Minimization' },
  { id: 'jeff-6', personaId: 'jeff', content: '장기적으로 생각하면 고객과 주주의 이익이 일치합니다.', source: 'Aligned Interests' },
  { id: 'jeff-7', personaId: 'jeff', content: '발명하고 개척하려면 실패를 기꺼이 받아들여야 합니다.', source: 'Invention and Failure' },
  { id: 'jeff-8', personaId: 'jeff', content: '브랜드는 당신이 없을 때 사람들이 하는 말입니다.', source: 'Brand Definition' },

  // Bill style
  { id: 'bill-1', personaId: 'bill', content: '성공은 형편없는 선생입니다.', source: 'Learning from Failure' },
  { id: 'bill-2', personaId: 'bill', content: '우리는 항상 2년 후의 변화를 과대평가하고 10년 후를 과소평가합니다.', source: 'Change Prediction' },
  { id: 'bill-3', personaId: 'bill', content: '가장 불만족스러운 고객이 가장 큰 배움의 원천입니다.', source: 'Customer Feedback' },
  { id: 'bill-4', personaId: 'bill', content: '인내심은 성공의 핵심 요소입니다.', source: 'Patience' },
  { id: 'bill-5', personaId: 'bill', content: '매년 좋은 책 50권을 읽으세요.', source: 'Continuous Learning' },
  { id: 'bill-6', personaId: 'bill', content: '큰 비전은 작은 세부사항에서 시작합니다.', source: 'Vision and Details' },
  { id: 'bill-7', personaId: 'bill', content: '세상에서 가장 큰 문제를 해결하려고 노력하세요.', source: 'Solving Big Problems' },
  { id: 'bill-8', personaId: 'bill', content: '부는 그것을 사용해 좋은 일을 할 때 의미가 있습니다.', source: 'Meaningful Wealth' },

  // Mark style
  { id: 'mark-1', personaId: 'mark', content: '완벽보다 완료가 낫습니다.', source: 'Done is Better than Perfect' },
  { id: 'mark-2', personaId: 'mark', content: '빠르게 움직이고 things를 부수세요.', source: 'Move Fast' },
  { id: 'mark-3', personaId: 'mark', content: '가장 큰 리스크는 리스크를 감수하지 않는 것입니다.', source: 'Risk Taking' },
  { id: 'mark-4', personaId: 'mark', content: '사람들이 연결되면 놀라운 일이 일어납니다.', source: 'Connection Power' },
  { id: 'mark-5', personaId: 'mark', content: '해커 문화는 지속적인 개선입니다.', source: 'Hacker Culture' },
  { id: 'mark-6', personaId: 'mark', content: '장기적인 것을 구축하는 데 집중하세요.', source: 'Long-term Building' },
  { id: 'mark-7', personaId: 'mark', content: '미션에 집중하세요. 돈은 따라옵니다.', source: 'Mission Focus' },
  { id: 'mark-8', personaId: 'mark', content: '플랫폼을 구축하면 다른 사람들이 그 위에 구축합니다.', source: 'Platform Thinking' },
];

export function getQuotesByPersona(personaId: PersonaId): QuoteData[] {
  return quotes.filter((q) => q.personaId === personaId);
}

export function getRandomQuotes(count: number = 5): QuoteData[] {
  const shuffled = [...quotes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
