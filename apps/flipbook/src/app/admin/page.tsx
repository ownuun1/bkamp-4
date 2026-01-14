'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getOrders } from '@/lib/actions/order';
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

export default function AdminPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const result = await getOrders(); // 항상 전체 주문 로드
    if (result.success && result.orders) {
      setAllOrders(result.orders);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // 프론트엔드에서 필터링
  const filteredOrders = allOrders.filter((order) => {
    // 상태 필터
    if (statusFilter && order.status !== statusFilter) return false;

    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.order_number.toLowerCase().includes(query) ||
        order.customer_name.toLowerCase().includes(query) ||
        order.customer_phone.includes(query)
      );
    }

    return true;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleStatusFilter = (status: OrderStatus | null) => {
    setStatusFilter(statusFilter === status ? null : status);
  };

  const handleReset = () => {
    setStatusFilter(null);
    setSearchInput('');
    setSearchQuery('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 전체 주문에서 통계 계산
  const statusCounts = allOrders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">주문 관리</h1>
        <button
          type="button"
          className="btn px-6"
          style={{ backgroundColor: '#7c3aed', color: '#ffffff', border: '1px solid #7c3aed' }}
          onClick={loadOrders}
        >
          새로고침
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {(Object.keys(ORDER_STATUS_CONFIG) as OrderStatus[]).map((status) => (
          <button
            key={status}
            type="button"
            className="card p-3 text-center cursor-pointer transition-all"
            style={{
              backgroundColor: statusFilter === status ? STATUS_COLORS[status].bg : '#ffffff',
              border: `2px solid ${statusFilter === status ? STATUS_COLORS[status].text : '#e5e7eb'}`,
            }}
            onClick={() => handleStatusFilter(status)}
          >
            <p className="text-2xl font-bold" style={{ color: STATUS_COLORS[status].text }}>
              {statusCounts[status] || 0}
            </p>
            <p className="text-xs" style={{ color: '#6b7280' }}>
              {ORDER_STATUS_CONFIG[status].label}
            </p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card bg-base-100 mb-6" style={{ border: '1px solid #e5e7eb' }}>
        <div className="card-body p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              className="input flex-1"
              style={{ border: '1px solid #d1d5db', backgroundColor: '#ffffff' }}
              placeholder="주문번호, 고객명, 연락처로 검색"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
              type="submit"
              className="btn px-6"
              style={{ backgroundColor: '#7c3aed', color: '#ffffff', border: '1px solid #7c3aed' }}
            >
              검색
            </button>
            {(searchQuery || statusFilter) && (
              <button
                type="button"
                className="btn px-6"
                style={{ border: '1px solid #ef4444', color: '#ef4444', backgroundColor: '#ffffff' }}
                onClick={handleReset}
              >
                초기화
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Order List */}
      <div className="card bg-base-100" style={{ border: '1px solid #e5e7eb' }}>
        {loading ? (
          <div className="p-8 text-center">
            <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center" style={{ color: '#6b7280' }}>
            {allOrders.length === 0 ? '주문이 없습니다.' : '검색 결과가 없습니다.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th>주문번호</th>
                  <th>고객정보</th>
                  <th>수령인</th>
                  <th>금액</th>
                  <th>상태</th>
                  <th>주문일시</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover">
                    <td>
                      <span className="font-mono font-medium" style={{ color: '#7c3aed' }}>
                        {order.order_number}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm" style={{ color: '#6b7280' }}>
                          {order.customer_phone}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p>{order.recipient_name}</p>
                        <p className="text-sm" style={{ color: '#6b7280' }}>
                          {order.recipient_phone}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className="font-medium">{order.total_price.toLocaleString()}원</span>
                      {order.is_gift && (
                        <span
                          className="ml-1 text-xs px-1 rounded"
                          style={{ backgroundColor: '#fce7f3', color: '#be185d' }}
                        >
                          선물
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: STATUS_COLORS[order.status].bg,
                          color: STATUS_COLORS[order.status].text,
                        }}
                      >
                        {ORDER_STATUS_CONFIG[order.status].label}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm" style={{ color: '#6b7280' }}>
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="btn btn-sm"
                        style={{ border: '1px solid #d1d5db' }}
                      >
                        상세
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
