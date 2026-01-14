'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface OrderData {
  // Video
  videoFile: File | null;
  videoUrl: string;

  // Customer info
  customerName: string;
  customerPhone: string;
  customerEmail: string;

  // Shipping info
  recipientName: string;
  recipientPhone: string;
  addressZipcode: string;
  addressMain: string;
  addressDetail: string;
  deliveryMemo: string;

  // Gift options
  isGift: boolean;
  giftMessage: string;

  // Order result
  orderNumber: string;
}

interface OrderContextType {
  orderData: OrderData;
  updateOrderData: (data: Partial<OrderData>) => void;
  resetOrderData: () => void;
}

const initialOrderData: OrderData = {
  videoFile: null,
  videoUrl: '',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  recipientName: '',
  recipientPhone: '',
  addressZipcode: '',
  addressMain: '',
  addressDetail: '',
  deliveryMemo: '',
  isGift: false,
  giftMessage: '',
  orderNumber: '',
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orderData, setOrderData] = useState<OrderData>(initialOrderData);

  const updateOrderData = (data: Partial<OrderData>) => {
    setOrderData((prev) => ({ ...prev, ...data }));

    // 주문번호가 있으면 localStorage에 저장
    if (data.orderNumber) {
      try {
        const savedOrders = JSON.parse(localStorage.getItem('flipbook_orders') || '[]');
        const newOrder = {
          orderNumber: data.orderNumber,
          createdAt: new Date().toISOString(),
        };
        // 중복 제거 후 최근 10개만 유지
        const filtered = savedOrders.filter((o: { orderNumber: string }) => o.orderNumber !== data.orderNumber);
        const updated = [newOrder, ...filtered].slice(0, 10);
        localStorage.setItem('flipbook_orders', JSON.stringify(updated));
      } catch {
        // localStorage 에러 무시
      }
    }
  };

  const resetOrderData = () => {
    setOrderData(initialOrderData);
  };

  return (
    <OrderContext.Provider value={{ orderData, updateOrderData, resetOrderData }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
