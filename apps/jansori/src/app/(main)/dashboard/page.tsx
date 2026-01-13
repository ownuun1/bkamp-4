'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card } from '@/lib/hand-drawn-ui';
import { createClient } from '@bkamp/supabase/client';
import { GoalWithSettings, TONE_INFO, CATEGORY_INFO, Profile } from '@/types';

export default function DashboardPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<GoalWithSettings[]>([]);
  const [todayNagging, setTodayNagging] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // 프로필 로드
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    setProfile(profileData);

    // 목표 로드
    const { data: goalsData } = await supabase
      .from('goals')
      .select(
        `
        *,
        nagging_settings (*)
      `
      )
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const formattedGoals = (goalsData || []).map((goal: Record<string, unknown>) => ({
      ...goal,
      nagging_settings: Array.isArray(goal.nagging_settings)
        ? goal.nagging_settings[0] || null
        : goal.nagging_settings,
    })) as GoalWithSettings[];
    setGoals(formattedGoals);

    // 오늘의 잔소리 로드 (최신 1개)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: historyData } = await supabase
      .from('nagging_history')
      .select('message')
      .eq('user_id', user.id)
      .gte('sent_at', today.toISOString())
      .order('sent_at', { ascending: false })
      .limit(1)
      .single();

    if (historyData) {
      setTodayNagging(historyData.message);
    }

    setIsLoading(false);
  };

  const generateTestNagging = async (goalId: string, tone: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/nagging/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal_id: goalId, tone }),
      });
      const data = await response.json();
      if (data.message) {
        setTodayNagging(data.message);
      }
    } catch (error) {
      console.error('Failed to generate nagging:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          안녕, {profile?.nickname || 'User'}!
        </h1>
        <p className="text-muted">오늘도 목표를 향해 화이팅!</p>
      </div>

      {/* Today's Nagging */}
      {todayNagging && (
        <Card elevation={2}>
          <div className="p-6">
            <div className="flex items-start gap-3">
              <span className="text-3xl">
                {String.fromCodePoint(0x1f4ac)}
              </span>
              <div>
                <h2 className="font-bold text-lg mb-2">오늘의 잔소리</h2>
                <p className="text-text italic">&quot;{todayNagging}&quot;</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Goals List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">내 목표</h2>
          <Link href="/goals/new">
            <Button>+ 추가</Button>
          </Link>
        </div>

        {goals.length === 0 ? (
          <Card elevation={1}>
            <div className="p-6 text-center">
              <p className="text-muted mb-4">아직 등록된 목표가 없어요</p>
              <Link href="/goals/new">
                <Button>첫 번째 목표 만들기</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const settings = goal.nagging_settings;
              const toneInfo = settings ? TONE_INFO[settings.tone] : null;
              const categoryInfo = CATEGORY_INFO[goal.category];

              return (
                <Link key={goal.id} href={`/goals/${goal.id}`}>
                  <Card elevation={1}>
                    <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{categoryInfo.emoji}</span>
                            <h3 className="font-bold">{goal.title}</h3>
                          </div>
                          {settings && (
                            <div className="flex items-center gap-2 text-sm text-muted">
                              <span>{toneInfo?.emoji}</span>
                              <span>{toneInfo?.name}톤</span>
                              <span>|</span>
                              <span>{settings.time_slots.join(', ')}</span>
                            </div>
                          )}
                        </div>
                        {settings && !isGenerating && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              generateTestNagging(goal.id, settings.tone);
                            }}
                            className="text-sm text-primary underline"
                          >
                            테스트
                          </button>
                        )}
                        {settings && isGenerating && (
                          <span className="text-sm text-muted">생성중...</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
