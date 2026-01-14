'use client';

import { useState } from 'react';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (title: string) => void;
}

const PLATFORMS = [
  { value: '', label: '선택 안함' },
  { value: 'naver', label: '네이버웹툰' },
  { value: 'kakao', label: '카카오웹툰' },
  { value: 'kakaopage', label: '카카오페이지' },
  { value: 'lezhin', label: '레진코믹스' },
  { value: 'other', label: '기타 (직접 입력)' },
];

export default function SuggestionModal({ isOpen, onClose, onSuccess }: SuggestionModalProps) {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('');
  const [customPlatform, setCustomPlatform] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('웹툰 제목을 입력해주세요');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const platformValue = platform === 'other' ? customPlatform.trim() : platform;
      const response = await fetch('/api/webtoon/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          platform: platformValue || null
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '제보 저장 중 오류가 발생했습니다');
      }

      setSuccess(true);
      if (onSuccess) {
        onSuccess(title.trim());
      }

      // 2초 후 모달 닫기
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setPlatform('');
    setCustomPlatform('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white border-3 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>웹툰 제보하기</span>
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">&#10003;</div>
            <p className="text-lg font-medium text-green-600">
              제보해주셔서 감사합니다!
            </p>
            <p className="text-sm text-black/60 mt-2">
              검토 후 목록에 추가됩니다.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-black/60 mb-4 text-sm">
              목록에 없는 웹툰을 알려주세요!<br />
              검토 후 목록에 추가됩니다.
            </p>

            {/* 웹툰 제목 */}
            <div className="mb-4">
              <label className="block font-medium mb-2">
                웹툰 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 신의 탑"
                className="nb-input w-full"
                autoFocus
              />
            </div>

            {/* 플랫폼 선택 */}
            <div className="mb-6">
              <label className="block font-medium mb-2">
                플랫폼 <span className="text-black/40">(선택)</span>
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="nb-input w-full"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              {platform === 'other' && (
                <input
                  type="text"
                  value={customPlatform}
                  onChange={(e) => setCustomPlatform(e.target.value)}
                  placeholder="플랫폼명을 입력하세요"
                  className="nb-input w-full mt-2"
                  maxLength={50}
                />
              )}
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="nb-button bg-nb-green w-full py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  제출 중...
                </span>
              ) : (
                '제보하기'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
