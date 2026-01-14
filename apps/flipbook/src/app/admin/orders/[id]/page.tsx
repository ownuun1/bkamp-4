'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrderById, updateOrderStatus, updateTrackingNumber } from '@/lib/actions/order';
import type { Order, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_CONFIG } from '@/lib/types';

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  pending_payment: { bg: '#fef3c7', text: '#92400e' },
  paid: { bg: '#dbeafe', text: '#1e40af' },
  producing: { bg: '#e0e7ff', text: '#3730a3' },
  ready_to_ship: { bg: '#f3e8ff', text: '#6b21a8' },
  shipping: { bg: '#dcfce7', text: '#166534' },
  delivered: { bg: '#d1fae5', text: '#065f46' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
};

const COURIERS = [
  { id: 'cj', name: 'CJ대한통운' },
  { id: 'lotte', name: '롯데택배' },
  { id: 'hanjin', name: '한진택배' },
  { id: 'post', name: '우체국택배' },
  { id: 'logen', name: '로젠택배' },
  { id: 'cu', name: 'CU편의점택배' },
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // 상태 변경
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [adminNote, setAdminNote] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // 운송장 등록
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUpdating, setTrackingUpdating] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    const result = await getOrderById(params.id as string);
    if (result.success && result.order) {
      setOrder(result.order);
      setNewStatus(result.order.status);
      setAdminNote(result.order.admin_note || '');
      setCourier(result.order.courier || '');
      setTrackingNumber(result.order.tracking_number || '');
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStatusUpdate = async () => {
    if (!order || !newStatus) return;
    setStatusUpdating(true);
    const result = await updateOrderStatus(order.id, newStatus, adminNote);
    if (result.success) {
      alert('상태가 변경되었습니다.');
      loadOrder();
    } else {
      alert(result.error || '상태 변경에 실패했습니다.');
    }
    setStatusUpdating(false);
  };

  const handleTrackingUpdate = async () => {
    if (!order || !courier || !trackingNumber) {
      alert('택배사와 운송장 번호를 모두 입력해주세요.');
      return;
    }
    setTrackingUpdating(true);
    const result = await updateTrackingNumber(order.id, courier, trackingNumber);
    if (result.success) {
      alert('운송장이 등록되었습니다.');
      loadOrder();
    } else {
      alert(result.error || '운송장 등록에 실패했습니다.');
    }
    setTrackingUpdating(false);
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

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p style={{ color: '#6b7280' }}>주문을 찾을 수 없습니다.</p>
        <Link href="/admin" className="btn mt-4" style={{ border: '1px solid #d1d5db' }}>
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={() => router.push('/admin')}
        >
          &larr; 목록
        </button>
        <h1 className="text-2xl font-bold">주문 상세</h1>
        <span
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: STATUS_COLORS[order.status].bg,
            color: STATUS_COLORS[order.status].text,
          }}
        >
          {ORDER_STATUS_CONFIG[order.status].label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* 주문 기본 정보 */}
          <div className="card bg-base-100" style={{ border: '1px solid #e5e7eb' }}>
            <div className="card-body">
              <h2 className="card-title text-lg">주문 정보</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: '#6b7280' }}>주문번호</span>
                  <span className="font-mono font-bold" style={{ color: '#7c3aed' }}>
                    {order.order_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6b7280' }}>주문일시</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6b7280' }}>최종수정</span>
                  <span>{formatDate(order.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 고객 정보 */}
          <div className="card bg-base-100" style={{ border: '1px solid #e5e7eb' }}>
            <div className="card-body">
              <h2 className="card-title text-lg">고객 정보</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: '#6b7280' }}>이름</span>
                  <span>{order.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6b7280' }}>연락처</span>
                  <span>{order.customer_phone}</span>
                </div>
                {order.customer_email && (
                  <div className="flex justify-between">
                    <span style={{ color: '#6b7280' }}>이메일</span>
                    <span>{order.customer_email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 배송 정보 */}
          <div className="card bg-base-100" style={{ border: '1px solid #e5e7eb' }}>
            <div className="card-body">
              <h2 className="card-title text-lg">배송 정보</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: '#6b7280' }}>수령인</span>
                  <span>{order.recipient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6b7280' }}>연락처</span>
                  <span>{order.recipient_phone}</span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>주소</span>
                  <p className="mt-1">
                    ({order.address_zipcode}) {order.address_main}
                    {order.address_detail && ` ${order.address_detail}`}
                  </p>
                </div>
                {order.delivery_memo && (
                  <div>
                    <span style={{ color: '#6b7280' }}>배송메모</span>
                    <p className="mt-1">{order.delivery_memo}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 영상/상품 정보 */}
          <div className="card bg-base-100" style={{ border: '1px solid #e5e7eb' }}>
            <div className="card-body">
              <h2 className="card-title text-lg">영상 정보</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: '#6b7280' }}>파일명</span>
                  <span className="truncate max-w-[200px]">{order.video_filename}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6b7280' }}>파일크기</span>
                  <span>{formatFileSize(order.video_size_bytes)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 금액 정보 */}
          <div className="card bg-base-100" style={{ border: '1px solid #e5e7eb' }}>
            <div className="card-body">
              <h2 className="card-title text-lg">금액 정보</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: '#6b7280' }}>기본가</span>
                  <span>{order.base_price.toLocaleString()}원</span>
                </div>
                {order.is_gift && (
                  <div className="flex justify-between">
                    <span style={{ color: '#6b7280' }}>선물포장</span>
                    <span>{order.gift_package_price.toLocaleString()}원</span>
                  </div>
                )}
                <div className="divider my-2"></div>
                <div className="flex justify-between font-bold">
                  <span>총 금액</span>
                  <span style={{ color: '#7c3aed' }}>{order.total_price.toLocaleString()}원</span>
                </div>
              </div>
            </div>
          </div>

          {/* 선물 옵션 */}
          {order.is_gift && (
            <div className="card bg-base-100" style={{ border: '1px solid #e5e7eb' }}>
              <div className="card-body">
                <h2 className="card-title text-lg">선물 옵션</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: '#6b7280' }}>선물포장</span>
                    <span>예</span>
                  </div>
                  {order.gift_message && (
                    <div>
                      <span style={{ color: '#6b7280' }}>선물메시지</span>
                      <p className="mt-1 p-2 rounded" style={{ backgroundColor: '#f9fafb' }}>
                        {order.gift_message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - 관리 기능 */}
        <div className="space-y-6">
          {/* 상태 변경 */}
          <div className="card bg-base-100" style={{ border: '1px solid #e5e7eb' }}>
            <div className="card-body">
              <h2 className="card-title text-lg">상태 변경</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">상태 선택</label>
                  <select
                    className="select w-full"
                    style={{ border: '1px solid #d1d5db', backgroundColor: '#ffffff' }}
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  >
                    {(Object.keys(ORDER_STATUS_CONFIG) as OrderStatus[]).map((status) => (
                      <option key={status} value={status}>
                        {ORDER_STATUS_CONFIG[status].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">관리자 메모</label>
                  <textarea
                    className="textarea w-full"
                    style={{ border: '1px solid #d1d5db', backgroundColor: '#ffffff' }}
                    rows={3}
                    placeholder="관리자 메모 (선택사항)"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn w-full"
                  style={{
                    backgroundColor: statusUpdating ? '#9ca3af' : '#7c3aed',
                    color: '#ffffff',
                    border: `1px solid ${statusUpdating ? '#9ca3af' : '#7c3aed'}`,
                  }}
                  onClick={handleStatusUpdate}
                  disabled={statusUpdating || newStatus === order.status}
                >
                  {statusUpdating ? '변경 중...' : '상태 변경'}
                </button>
              </div>
            </div>
          </div>

          {/* 운송장 등록 */}
          <div className="card bg-base-100" style={{ border: '1px solid #e5e7eb' }}>
            <div className="card-body">
              <h2 className="card-title text-lg">운송장 등록</h2>
              {order.tracking_number && (
                <div
                  className="p-3 rounded mb-4"
                  style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac' }}
                >
                  <p className="text-sm font-medium" style={{ color: '#166534' }}>
                    등록된 운송장
                  </p>
                  <p className="text-sm mt-1">
                    {COURIERS.find((c) => c.id === order.courier)?.name || order.courier}:{' '}
                    <span className="font-mono">{order.tracking_number}</span>
                  </p>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">택배사</label>
                  <select
                    className="select w-full"
                    style={{ border: '1px solid #d1d5db', backgroundColor: '#ffffff' }}
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                  >
                    <option value="">택배사 선택</option>
                    {COURIERS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">운송장 번호</label>
                  <input
                    type="text"
                    className="input w-full font-mono"
                    style={{ border: '1px solid #d1d5db', backgroundColor: '#ffffff' }}
                    placeholder="운송장 번호 입력"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn w-full"
                  style={{
                    backgroundColor: trackingUpdating ? '#9ca3af' : '#059669',
                    color: '#ffffff',
                    border: `1px solid ${trackingUpdating ? '#9ca3af' : '#059669'}`,
                  }}
                  onClick={handleTrackingUpdate}
                  disabled={trackingUpdating || !courier || !trackingNumber}
                >
                  {trackingUpdating ? '등록 중...' : '운송장 등록'}
                </button>
                <p className="text-xs" style={{ color: '#6b7280' }}>
                  * 운송장 등록 시 상태가 자동으로 &apos;배송 중&apos;으로 변경됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
