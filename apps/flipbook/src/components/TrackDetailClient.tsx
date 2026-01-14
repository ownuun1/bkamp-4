'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Order } from '@/lib/types';
import { ORDER_STATUS_CONFIG } from '@/lib/types';
import { cancelOrderByCustomer } from '@/lib/actions/order';
import CancelOrderModal from './CancelOrderModal';

interface TrackDetailClientProps {
  order: Order;
}

export default function TrackDetailClient({ order }: TrackDetailClientProps) {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const currentStatus = ORDER_STATUS_CONFIG[order.status];

  // pending_payment 상태에서만 취소 가능
  const canCancel = order.status === 'pending_payment';

  const handleCancelOrder = async (reason: string) => {
    const result = await cancelOrderByCustomer(order.order_number, reason);
    if (result.success) {
      setShowCancelModal(false);
      router.refresh();
    } else {
      alert(result.error || '주문 취소에 실패했습니다.');
    }
  };

  return (
    <>
      {/* Order Number */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-base-content/70">주문번호</p>
              <p className="font-mono font-bold text-lg">{order.order_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-base-content/70">주문일시</p>
              <p className="text-sm">
                {new Date(order.created_at).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Steps */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4">진행 상태</h2>

          {order.status === 'cancelled' ? (
            <div className="alert alert-error">
              <span>주문이 취소되었습니다.</span>
            </div>
          ) : (
            <ul className="steps steps-vertical w-full">
              <li className={`step ${currentStatus.step >= 1 ? 'step-primary' : ''}`}>
                입금 대기
              </li>
              <li className={`step ${currentStatus.step >= 2 ? 'step-primary' : ''}`}>
                입금 확인
              </li>
              <li className={`step ${currentStatus.step >= 3 ? 'step-primary' : ''}`}>
                제작 중
              </li>
              <li className={`step ${currentStatus.step >= 4 ? 'step-primary' : ''}`}>
                배송 준비
              </li>
              <li className={`step ${currentStatus.step >= 5 ? 'step-primary' : ''}`}>
                배송 중
              </li>
              <li className={`step ${currentStatus.step >= 6 ? 'step-primary' : ''}`}>
                배송 완료
              </li>
            </ul>
          )}

          {order.status !== 'cancelled' && (
            <div className="alert mt-4">
              <div>
                <div className="font-bold">{currentStatus.label}</div>
                <div className="text-sm">{currentStatus.description}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tracking Info */}
      {order.tracking_number && (
        <div className="card bg-base-100 shadow-sm mb-6">
          <div className="card-body">
            <h2 className="card-title text-lg">배송 정보</h2>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-base-content/70">
                  {order.courier === 'cj' && 'CJ대한통운'}
                  {order.courier === 'hanjin' && '한진택배'}
                  {order.courier === 'lotte' && '롯데택배'}
                  {order.courier === 'post' && '우체국'}
                  {!['cj', 'hanjin', 'lotte', 'post'].includes(order.courier || '') &&
                    (order.courier || '택배')}
                </p>
                <p className="font-mono">{order.tracking_number}</p>
              </div>
              <a
                href={`https://tracker.delivery/#/${order.tracking_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                배송 추적
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <h2 className="card-title text-lg">주문 정보</h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-base-content/70">주문자</span>
              <span>{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">수령인</span>
              <span>{order.recipient_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">배송지</span>
              <span className="text-right">
                ({order.address_zipcode}) {order.address_main}
                {order.address_detail && ` ${order.address_detail}`}
              </span>
            </div>
            <div className="divider my-2"></div>
            <div className="flex justify-between font-bold">
              <span>결제 금액</span>
              <span>{order.total_price.toLocaleString()}원</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Link
          href="/track"
          className="btn w-full"
          style={{ backgroundColor: '#7c3aed', color: '#ffffff', border: '1px solid #7c3aed' }}
        >
          다른 주문 조회
        </Link>
        <Link
          href="/"
          className="btn w-full"
          style={{ border: '1px solid #d1d5db', backgroundColor: '#ffffff' }}
        >
          홈으로
        </Link>
        {canCancel && (
          <button
            type="button"
            className="btn w-full"
            style={{ border: '1px solid #ef4444', color: '#ef4444', backgroundColor: '#ffffff' }}
            onClick={() => setShowCancelModal(true)}
          >
            주문 취소
          </button>
        )}
      </div>

      {/* 취소 모달 */}
      <CancelOrderModal
        orderNumber={order.order_number}
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
      />
    </>
  );
}
