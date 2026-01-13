'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card } from '@/lib/hand-drawn-ui';
import { createClient } from '@bkamp/supabase/client';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const supabase = createClient();

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    if (isLoading) return; // 이미 로딩 중이면 무시
    setIsLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        console.error('Login error:', error);
        alert('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="text-6xl mb-4">
              <span role="img" aria-label="speaking head">
                {String.fromCodePoint(0x1f5e3, 0xfe0f)}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-text">Jansori</h1>
          </Link>
          <p className="text-muted mt-2">로그인하고 잔소리 시작하기</p>
        </div>

        {/* Login Card */}
        <Card elevation={2}>
          <div className="p-8 space-y-4">
            {/* Google Login */}
            <div onClick={() => handleSocialLogin('google')}>
              <Button>
                {isLoading === 'google' ? '로그인 중...' : '🔵 Google로 계속하기'}
              </Button>
            </div>

            {/* Kakao Login */}
            <div onClick={() => handleSocialLogin('kakao')}>
              <Button>
                {isLoading === 'kakao' ? '로그인 중...' : '🟡 Kakao로 계속하기'}
              </Button>
            </div>

            <div className="mt-6 text-center text-sm text-muted">
              <p>
                로그인하면{' '}
                <a href="#" className="underline">
                  서비스 약관
                </a>
                과{' '}
                <a href="#" className="underline">
                  개인정보처리방침
                </a>
                에 동의하게 됩니다.
              </p>
            </div>
          </div>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-muted hover:text-text underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
