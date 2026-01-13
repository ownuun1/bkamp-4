'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Input } from '@/lib/hand-drawn-ui';
import {
  CategoryType,
  ToneType,
  CATEGORY_INFO,
  TONE_INFO,
} from '@/types';

export default function NewGoalPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [data, setData] = useState({
    title: '',
    description: '',
    category: 'etc' as CategoryType,
    tone: 'friend' as ToneType,
    timeSlots: ['09:00'],
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // 1. 목표 생성
      const goalRes = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description || null,
          category: data.category,
        }),
      });
      const { goal } = await goalRes.json();

      // 2. 잔소리 설정 생성
      await fetch(`/api/goals/${goal.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tone: data.tone,
          frequency: 'daily',
          time_slots: data.timeSlots,
          is_enabled: true,
        }),
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to create goal:', error);
      alert('목표 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-2xl">
          ←
        </Link>
        <h1 className="text-2xl font-bold">새 목표 만들기</h1>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted">Step {step}/3</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Goal Info */}
      {step === 1 && (
        <Card elevation={2}>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">목표 정보</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  목표 제목 *
                </label>
                <Input
                  value={data.title}
                  onChange={(value) => setData({ ...data, title: value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  상세 설명 (선택)
                </label>
                <Input
                  value={data.description}
                  onChange={(value) => setData({ ...data, description: value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">카테고리</label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(CATEGORY_INFO).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setData({ ...data, category: cat.id })}
                      className={`px-3 py-2 rounded-lg border-2 border-black transition-colors ${
                        data.category === cat.id
                          ? 'bg-primary text-white'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      {cat.emoji} {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {data.title.trim() && (
              <div className="mt-6" onClick={() => setStep(2)}>
                <Button>다음</Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 2: Tone */}
      {step === 2 && (
        <Card elevation={2}>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">잔소리 톤 선택</h2>
            <div className="space-y-3 mb-6">
              {Object.values(TONE_INFO).map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setData({ ...data, tone: tone.id })}
                  className={`w-full p-4 rounded-lg border-2 border-black text-left transition-colors ${
                    data.tone === tone.id
                      ? 'bg-primary text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tone.emoji}</span>
                    <div>
                      <p className="font-bold">{tone.name}</p>
                      <p
                        className={`text-sm ${
                          data.tone === tone.id ? 'text-white/80' : 'text-muted'
                        }`}
                      >
                        {tone.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <div onClick={() => setStep(1)} className="flex-1">
                <Button>이전</Button>
              </div>
              <div onClick={() => setStep(3)} className="flex-1">
                <Button>다음</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Time */}
      {step === 3 && (
        <Card elevation={2}>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">알림 시간 설정</h2>
            <div className="space-y-3 mb-6">
              {['09:00', '12:00', '18:00', '21:00'].map((time) => (
                <button
                  key={time}
                  onClick={() => {
                    const slots = data.timeSlots.includes(time)
                      ? data.timeSlots.filter((t) => t !== time)
                      : [...data.timeSlots, time].slice(0, 3);
                    setData({ ...data, timeSlots: slots });
                  }}
                  className={`w-full p-4 rounded-lg border-2 border-black text-left transition-colors ${
                    data.timeSlots.includes(time)
                      ? 'bg-primary text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{time}</span>
                    {data.timeSlots.includes(time) && <span>✓</span>}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-sm text-muted mb-4">
              최대 3개까지 선택할 수 있어요
            </p>
            <div className="flex gap-3">
              <div onClick={() => setStep(2)} className="flex-1">
                <Button>이전</Button>
              </div>
              {!isLoading && data.timeSlots.length > 0 && (
                <div onClick={handleSubmit} className="flex-1">
                  <Button>완료</Button>
                </div>
              )}
              {isLoading && (
                <div className="flex-1 text-center py-2">
                  <span className="text-muted">생성 중...</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
