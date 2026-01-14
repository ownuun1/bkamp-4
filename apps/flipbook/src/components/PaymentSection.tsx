'use client';

import { useState } from 'react';

type PaymentMethod = 'card' | 'bank' | 'kakao' | 'naver' | 'toss';

interface PaymentSectionProps {
  totalPrice: number;
  onPaymentSelect?: (method: PaymentMethod) => void;
}

const PAYMENT_METHODS = [
  { id: 'card' as const, name: '신용/체크카드', icon: '💳', description: '카드 결제' },
  { id: 'bank' as const, name: '계좌이체', icon: '🏦', description: '실시간 계좌이체' },
  { id: 'kakao' as const, name: '카카오페이', icon: '🟡', description: '카카오페이 간편결제' },
  { id: 'naver' as const, name: '네이버페이', icon: '🟢', description: '네이버페이 간편결제' },
  { id: 'toss' as const, name: '토스페이', icon: '🔵', description: '토스페이 간편결제' },
];

export default function PaymentSection({ totalPrice, onPaymentSelect }: PaymentSectionProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const handleSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    onPaymentSelect?.(method);
  };

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-lg">결제 방법 선택</h2>

        {/* 결제 방법 선택 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              type="button"
              className="btn h-auto py-4 flex flex-col items-center gap-1"
              style={
                selectedMethod === method.id
                  ? {
                      backgroundColor: '#7c3aed',
                      color: '#ffffff',
                      border: '2px solid #7c3aed',
                    }
                  : {
                      backgroundColor: '#ffffff',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                    }
              }
              onClick={() => handleSelect(method.id)}
            >
              <span className="text-2xl">{method.icon}</span>
              <span className="text-sm font-medium">{method.name}</span>
            </button>
          ))}
        </div>

        {/* 선택된 결제 방법 안내 */}
        {selectedMethod && (
          <div
            className="mt-4 p-3 rounded-lg text-sm"
            style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}
          >
            {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.description}로{' '}
            {totalPrice.toLocaleString()}원을 결제합니다.
          </div>
        )}

        {/* 결제 금액 요약 */}
        <div className="divider my-2"></div>
        <div className="flex justify-between items-center">
          <span style={{ color: '#6b7280' }}>결제 금액</span>
          <span className="text-xl font-bold" style={{ color: '#7c3aed' }}>
            {totalPrice.toLocaleString()}원
          </span>
        </div>

        {/* 안내 문구 */}
        <p className="text-xs mt-2" style={{ color: '#9ca3af' }}>
          * 현재 결제 시스템 준비 중입니다. 주문 완료 후 별도 안내드립니다.
        </p>
      </div>
    </div>
  );
}
