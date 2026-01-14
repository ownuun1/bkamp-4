'use client';

import { useState } from 'react';

interface CancelOrderModalProps {
  orderNumber: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

const CANCEL_REASONS = [
  { value: 'change_mind', label: '단순 변심' },
  { value: 'wrong_info', label: '정보 입력 오류' },
  { value: 'duplicate', label: '중복 주문' },
  { value: 'other', label: '기타' },
];

export default function CancelOrderModal({
  orderNumber,
  isOpen,
  onClose,
  onConfirm,
}: CancelOrderModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [reason, setReason] = useState('');

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm(reason);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg text-error">주문 취소</h3>

        <div className="py-4">
          <p className="mb-4">
            주문번호 <span className="font-mono font-bold">{orderNumber}</span>를
            취소하시겠습니까?
          </p>

          {/* 취소 사유 선택 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">취소 사유 (선택)</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">선택해주세요</option>
              {CANCEL_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="alert alert-warning mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-sm">취소 후에는 복구할 수 없습니다.</span>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose} disabled={isProcessing}>
            닫기
          </button>
          <button
            className={`btn btn-error ${isProcessing ? 'loading' : ''}`}
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? '처리 중...' : '주문 취소'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
