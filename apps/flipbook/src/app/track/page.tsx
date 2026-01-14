'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface SavedOrder {
  orderNumber: string;
  createdAt: string;
}

export default function TrackPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');
  const [recentOrders, setRecentOrders] = useState<SavedOrder[]>([]);
  const [showManualSearch, setShowManualSearch] = useState(false);

  useEffect(() => {
    // localStorage에서 최근 주문 목록 로드
    try {
      const saved = localStorage.getItem('flipbook_orders');
      if (saved) {
        const orders = JSON.parse(saved) as SavedOrder[];
        setRecentOrders(orders);
      }
    } catch {
      // localStorage 에러 무시
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!orderNumber.trim()) {
      setError('주문번호를 입력해주세요.');
      return;
    }

    // Validate order number format (FB + date + random)
    if (!/^FB\d{8}[A-Z0-9]{4}$/.test(orderNumber.toUpperCase())) {
      setError('올바른 주문번호 형식이 아닙니다.');
      return;
    }

    router.push(`/track/${orderNumber.toUpperCase()}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="text-5xl mb-6">📦</div>
            <h1 className="text-3xl font-bold mb-2">내 주문</h1>
            <p style={{ color: '#6b7280' }}>
              주문 현황을 확인하세요
            </p>
          </div>

          {/* 최근 주문 목록 */}
          {recentOrders.length > 0 ? (
            <div className="space-y-3 mb-8">
              {recentOrders.map((order) => (
                <Link
                  key={order.orderNumber}
                  href={`/track/${order.orderNumber}`}
                  className="block card"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div className="card-body p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-mono font-bold" style={{ color: '#7c3aed' }}>
                          {order.orderNumber}
                        </p>
                        <p className="text-sm" style={{ color: '#6b7280' }}>
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div style={{ color: '#9ca3af' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-8 mb-8 rounded-lg"
              style={{ backgroundColor: '#f9fafb' }}
            >
              <p style={{ color: '#6b7280' }}>아직 주문 내역이 없습니다.</p>
              <Link
                href="/order/upload"
                className="btn mt-4"
                style={{
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  border: '1px solid #7c3aed',
                }}
              >
                주문하러 가기
              </Link>
            </div>
          )}

          {/* 주문번호로 조회 */}
          <div className="text-center">
            {!showManualSearch ? (
              <button
                type="button"
                className="text-sm underline"
                style={{ color: '#6b7280' }}
                onClick={() => setShowManualSearch(true)}
              >
                주문번호로 직접 조회
              </button>
            ) : (
              <div className="card" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                <div className="card-body">
                  <h3 className="font-medium mb-4">주문번호로 조회</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        className="input w-full text-center font-mono"
                        style={{
                          border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
                          backgroundColor: '#ffffff',
                        }}
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                        placeholder="FB20240101XXXX"
                        maxLength={16}
                      />
                      {error && (
                        <p className="text-sm mt-1" style={{ color: '#ef4444' }}>
                          {error}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="btn w-full"
                      style={{
                        backgroundColor: '#7c3aed',
                        color: '#ffffff',
                        border: '1px solid #7c3aed',
                      }}
                    >
                      조회하기
                    </button>
                  </form>

                  <button
                    type="button"
                    className="text-sm mt-4"
                    style={{ color: '#6b7280' }}
                    onClick={() => setShowManualSearch(false)}
                  >
                    닫기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
