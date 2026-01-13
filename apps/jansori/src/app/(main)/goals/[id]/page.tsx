'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card } from '@/lib/hand-drawn-ui';
import { createClient } from '@bkamp/supabase/client';
import {
  GoalWithSettings,
  ToneType,
  NaggingHistory,
  TONE_INFO,
  CATEGORY_INFO,
} from '@/types';

export default function GoalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = params.id as string;
  const supabase = createClient();

  const [goal, setGoal] = useState<GoalWithSettings | null>(null);
  const [history, setHistory] = useState<NaggingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  // 설정 상태
  const [tone, setTone] = useState<ToneType>('friend');
  const [timeSlots, setTimeSlots] = useState<string[]>(['09:00']);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    loadGoal();
  }, [goalId]);

  const loadGoal = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // 목표 로드
    const { data: goalData } = await supabase
      .from('goals')
      .select(
        `
        *,
        nagging_settings (*)
      `
      )
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single();

    if (!goalData) {
      router.push('/dashboard');
      return;
    }

    const formattedGoal = {
      ...goalData,
      nagging_settings: Array.isArray(goalData.nagging_settings)
        ? goalData.nagging_settings[0] || null
        : goalData.nagging_settings,
    };
    setGoal(formattedGoal);

    // 설정 초기화
    if (formattedGoal.nagging_settings) {
      setTone(formattedGoal.nagging_settings.tone);
      setTimeSlots(formattedGoal.nagging_settings.time_slots);
      setIsEnabled(formattedGoal.nagging_settings.is_enabled);
    }

    // 히스토리 로드
    const { data: historyData } = await supabase
      .from('nagging_history')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', user.id)
      .order('sent_at', { ascending: false })
      .limit(10);

    setHistory(historyData || []);
    setIsLoading(false);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/goals/${goalId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tone,
          frequency: 'daily',
          time_slots: timeSlots,
          is_enabled: isEnabled,
        }),
      });
      alert('설정이 저장되었습니다!');
      loadGoal();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNagging = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/nagging/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal_id: goalId, tone }),
      });
      const data = await response.json();
      setTestMessage(data.message);
    } catch (error) {
      console.error('Failed to generate nagging:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 목표를 삭제하시겠습니까?')) return;

    try {
      await fetch(`/api/goals/${goalId}`, { method: 'DELETE' });
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  if (isLoading || !goal) {
    return (
      <div className="text-center py-12">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  const categoryInfo = CATEGORY_INFO[goal.category];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-2xl">
          ←
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryInfo.emoji}</span>
            <h1 className="text-2xl font-bold">{goal.title}</h1>
          </div>
          {goal.description && (
            <p className="text-muted">{goal.description}</p>
          )}
        </div>
      </div>

      {/* Test Message */}
      {testMessage && (
        <Card elevation={1}>
          <div className="p-4 bg-yellow-50">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <p className="font-bold text-sm mb-1">테스트 잔소리</p>
                <p className="italic">&quot;{testMessage}&quot;</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Settings */}
      <Card elevation={2}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">잔소리 설정</h2>

          {/* Tone */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">톤</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(TONE_INFO).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`px-3 py-2 rounded-lg border-2 border-black transition-colors ${
                    tone === t.id
                      ? 'bg-primary text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {t.emoji} {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">
              알림 시간 (최대 3개)
            </label>
            <div className="flex flex-wrap gap-2">
              {['09:00', '12:00', '18:00', '21:00'].map((time) => (
                <button
                  key={time}
                  onClick={() => {
                    const slots = timeSlots.includes(time)
                      ? timeSlots.filter((t) => t !== time)
                      : [...timeSlots, time].slice(0, 3);
                    setTimeSlots(slots);
                  }}
                  className={`px-3 py-2 rounded-lg border-2 border-black transition-colors ${
                    timeSlots.includes(time)
                      ? 'bg-primary text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Enable Toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="font-bold">잔소리 활성화</span>
            </label>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {!isSaving && (
              <div onClick={handleSaveSettings}>
                <Button>설정 저장</Button>
              </div>
            )}
            {isSaving && (
              <div className="text-center py-2">
                <span className="text-muted">저장 중...</span>
              </div>
            )}
            {!isGenerating && (
              <div onClick={handleTestNagging}>
                <Button>테스트 잔소리 받아보기</Button>
              </div>
            )}
            {isGenerating && (
              <div className="text-center py-2">
                <span className="text-muted">생성 중...</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* History */}
      <Card elevation={1}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">최근 잔소리</h2>
          {history.length === 0 ? (
            <p className="text-muted text-center py-4">
              아직 받은 잔소리가 없어요
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const toneInfo = TONE_INFO[item.tone as ToneType];
                return (
                  <div
                    key={item.id}
                    className="p-3 bg-gray-50 rounded-lg border-2 border-black"
                  >
                    <p className="italic mb-2">&quot;{item.message}&quot;</p>
                    <div className="flex items-center justify-between text-sm text-muted">
                      <span>
                        {toneInfo?.emoji} {toneInfo?.name}톤
                      </span>
                      <span>
                        {new Date(item.sent_at).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Delete */}
      <div className="text-center">
        <button
          onClick={handleDelete}
          className="text-red-500 underline text-sm"
        >
          목표 삭제
        </button>
      </div>
    </div>
  );
}
