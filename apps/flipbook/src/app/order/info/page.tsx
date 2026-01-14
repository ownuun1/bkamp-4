'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';

export default function InfoPage() {
  const router = useRouter();
  const { orderData, updateOrderData } = useOrder();
  const [sameAsCustomer, setSameAsCustomer] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!orderData.customerName.trim()) {
      newErrors.customerName = '이름을 입력해주세요';
    }
    if (!orderData.customerPhone.trim()) {
      newErrors.customerPhone = '연락처를 입력해주세요';
    }
    if (!orderData.addressZipcode.trim()) {
      newErrors.addressZipcode = '우편번호를 입력해주세요';
    }
    if (!orderData.addressMain.trim()) {
      newErrors.addressMain = '주소를 입력해주세요';
    }

    if (!sameAsCustomer) {
      if (!orderData.recipientName.trim()) {
        newErrors.recipientName = '수령인 이름을 입력해주세요';
      }
      if (!orderData.recipientPhone.trim()) {
        newErrors.recipientPhone = '수령인 연락처를 입력해주세요';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSameAsCustomerChange = (checked: boolean) => {
    setSameAsCustomer(checked);
    if (checked) {
      updateOrderData({
        recipientName: orderData.customerName,
        recipientPhone: orderData.customerPhone,
      });
    }
  };

  const handleNext = () => {
    if (sameAsCustomer) {
      updateOrderData({
        recipientName: orderData.customerName,
        recipientPhone: orderData.customerPhone,
      });
    }

    if (validate()) {
      router.push('/order/confirm');
    }
  };

  const inputStyle = {
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
  };

  const inputErrorStyle = {
    border: '1px solid #ef4444',
    backgroundColor: '#ffffff',
  };

  return (
    <div>
      {/* Steps */}
      <ul className="steps steps-horizontal w-full mb-8">
        <li className="step step-primary">영상 업로드</li>
        <li className="step step-primary">정보 입력</li>
        <li className="step">주문 확인</li>
        <li className="step">완료</li>
      </ul>

      <h1 className="text-2xl font-bold mb-6">주문 정보 입력</h1>

      <form className="space-y-6">
        {/* Customer Info */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">주문자 정보</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">이름 *</label>
                <input
                  type="text"
                  className="input w-full"
                  style={errors.customerName ? inputErrorStyle : inputStyle}
                  value={orderData.customerName}
                  onChange={(e) => updateOrderData({ customerName: e.target.value })}
                  placeholder="홍길동"
                />
                {errors.customerName && (
                  <p className="text-error text-sm mt-1">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">연락처 *</label>
                <input
                  type="tel"
                  className="input w-full"
                  style={errors.customerPhone ? inputErrorStyle : inputStyle}
                  value={orderData.customerPhone}
                  onChange={(e) => updateOrderData({ customerPhone: e.target.value })}
                  placeholder="010-1234-5678"
                />
                {errors.customerPhone && (
                  <p className="text-error text-sm mt-1">{errors.customerPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">이메일</label>
                <input
                  type="email"
                  className="input w-full"
                  style={inputStyle}
                  value={orderData.customerEmail}
                  onChange={(e) => updateOrderData({ customerEmail: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">배송 정보</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox"
                  style={{ border: '2px solid #9ca3af' }}
                  checked={sameAsCustomer}
                  onChange={(e) => handleSameAsCustomerChange(e.target.checked)}
                />
                <span className="text-sm">주문자 정보와 동일</span>
              </label>

              {!sameAsCustomer && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">수령인 이름 *</label>
                    <input
                      type="text"
                      className="input w-full"
                      style={errors.recipientName ? inputErrorStyle : inputStyle}
                      value={orderData.recipientName}
                      onChange={(e) => updateOrderData({ recipientName: e.target.value })}
                      placeholder="홍길동"
                    />
                    {errors.recipientName && (
                      <p className="text-error text-sm mt-1">{errors.recipientName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">수령인 연락처 *</label>
                    <input
                      type="tel"
                      className="input w-full"
                      style={errors.recipientPhone ? inputErrorStyle : inputStyle}
                      value={orderData.recipientPhone}
                      onChange={(e) => updateOrderData({ recipientPhone: e.target.value })}
                      placeholder="010-1234-5678"
                    />
                    {errors.recipientPhone && (
                      <p className="text-error text-sm mt-1">{errors.recipientPhone}</p>
                    )}
                  </div>
                </>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">우편번호 *</label>
                  <input
                    type="text"
                    className="input w-full"
                    style={errors.addressZipcode ? inputErrorStyle : inputStyle}
                    value={orderData.addressZipcode}
                    onChange={(e) => updateOrderData({ addressZipcode: e.target.value })}
                    placeholder="12345"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">주소 *</label>
                  <input
                    type="text"
                    className="input w-full"
                    style={errors.addressMain ? inputErrorStyle : inputStyle}
                    value={orderData.addressMain}
                    onChange={(e) => updateOrderData({ addressMain: e.target.value })}
                    placeholder="서울시 강남구 테헤란로 123"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">상세주소</label>
                <input
                  type="text"
                  className="input w-full"
                  style={inputStyle}
                  value={orderData.addressDetail}
                  onChange={(e) => updateOrderData({ addressDetail: e.target.value })}
                  placeholder="101동 1001호"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">배송 메모</label>
                <select
                  className="select w-full"
                  style={inputStyle}
                  value={orderData.deliveryMemo}
                  onChange={(e) => updateOrderData({ deliveryMemo: e.target.value })}
                >
                  <option value="">배송 메모를 선택해주세요</option>
                  <option value="문 앞에 놓아주세요">문 앞에 놓아주세요</option>
                  <option value="경비실에 맡겨주세요">경비실에 맡겨주세요</option>
                  <option value="배송 전 연락주세요">배송 전 연락주세요</option>
                  <option value="부재 시 문 앞에 놓아주세요">부재 시 문 앞에 놓아주세요</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Gift Options */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">선물 옵션</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox"
                  style={{ border: '2px solid #9ca3af' }}
                  checked={orderData.isGift}
                  onChange={(e) => updateOrderData({ isGift: e.target.checked })}
                />
                <span className="text-sm">선물 포장</span>
              </label>

              {orderData.isGift && (
                <div>
                  <label className="block text-sm font-medium mb-2">메시지 카드 문구</label>
                  <textarea
                    className="textarea w-full"
                    style={inputStyle}
                    value={orderData.giftMessage}
                    onChange={(e) => updateOrderData({ giftMessage: e.target.value })}
                    placeholder="메시지를 입력해주세요 (선택)"
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          className="btn min-w-24"
          style={{ border: '1px solid #d1d5db' }}
          onClick={() => router.push('/order/upload')}
        >
          이전
        </button>
        <button
          type="button"
          className="btn min-w-24"
          style={{ backgroundColor: '#7c3aed', color: '#ffffff', border: '1px solid #7c3aed' }}
          onClick={handleNext}
        >
          다음
        </button>
      </div>
    </div>
  );
}
