-- =====================================================
-- FLIPBOOK 주문 조회 정책 추가
-- 비회원도 주문번호로 자신의 주문 조회 가능
-- =====================================================

-- 주문번호를 알면 누구나 조회 가능 (비회원 주문 추적용)
-- 이미 존재하면 스킵
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'flipbook_orders'
    AND policyname = 'Anyone can view orders'
  ) THEN
    CREATE POLICY "Anyone can view orders" ON flipbook_orders
      FOR SELECT USING (true);
  END IF;
END $$;
