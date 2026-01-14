'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // TODO: 실제 운영 시 인증 체크 활성화
    // 현재는 개발 중이므로 인증 없이 접근 가능
    setAuthorized(true);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Admin Header */}
      <header
        className="navbar bg-base-100 shadow-sm px-4"
        style={{ borderBottom: '1px solid #e5e7eb' }}
      >
        <div className="navbar-start">
          <Link href="/admin" className="text-xl font-bold" style={{ color: '#7c3aed' }}>
            Flipbook Admin
          </Link>
        </div>
        <div className="navbar-center">
          <nav className="flex gap-4">
            <Link
              href="/admin"
              className="text-sm font-medium hover:text-primary"
              style={{ color: '#374151' }}
            >
              주문 관리
            </Link>
          </nav>
        </div>
        <div className="navbar-end">
          <Link href="/" className="btn btn-ghost btn-sm" style={{ color: '#6b7280' }}>
            사이트로 이동
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">{children}</main>
    </div>
  );
}
