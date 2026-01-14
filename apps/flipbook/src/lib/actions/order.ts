'use server';

import { createClient } from '@bkamp/supabase/server';
import type { Order, OrderStatus, OrderFilters } from '../types';

// 주문번호 생성
function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FB${dateStr}${random}`;
}

// 주문 생성
export async function createOrder(formData: FormData): Promise<{
  success: boolean;
  orderNumber?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const orderNumber = generateOrderNumber();

    // FormData에서 값 추출
    const videoFile = formData.get('videoFile') as File;
    const customerName = formData.get('customerName') as string;
    const customerPhone = formData.get('customerPhone') as string;
    const customerEmail = formData.get('customerEmail') as string | null;
    const recipientName = formData.get('recipientName') as string;
    const recipientPhone = formData.get('recipientPhone') as string;
    const addressZipcode = formData.get('addressZipcode') as string;
    const addressMain = formData.get('addressMain') as string;
    const addressDetail = formData.get('addressDetail') as string | null;
    const deliveryMemo = formData.get('deliveryMemo') as string | null;
    const isGift = formData.get('isGift') === 'true';
    const giftMessage = formData.get('giftMessage') as string | null;

    if (!videoFile || !customerName || !customerPhone) {
      return { success: false, error: '필수 정보가 누락되었습니다.' };
    }

    // 1. 영상 업로드
    const timestamp = Date.now();
    const filePath = `${orderNumber}/${timestamp}_${videoFile.name}`;

    // 먼저 버킷 존재 확인 및 생성
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === 'flipbook-videos');

    if (!bucketExists) {
      const { error: createBucketError } = await supabase.storage.createBucket('flipbook-videos', {
        public: false,
      });
      if (createBucketError) {
        console.error('Bucket creation error:', createBucketError);
        // 버킷 생성 실패해도 계속 진행 (이미 있을 수 있음)
      }
    }

    const { error: uploadError } = await supabase.storage
      .from('flipbook-videos')
      .upload(filePath, videoFile);

    let uploadedFilePath = filePath;
    if (uploadError) {
      console.error('Upload error:', uploadError);
      // 개발 환경에서는 업로드 실패해도 주문 진행 가능하도록
      console.warn('Video upload failed, continuing with order...');
      uploadedFilePath = `pending/${orderNumber}/${videoFile.name}`;
    }

    // 2. 가격 계산
    const basePrice = 25000;
    const giftPackagePrice = isGift ? 3000 : 0;
    const totalPrice = basePrice + giftPackagePrice;

    // 3. 주문 데이터 저장
    const { error: insertError } = await supabase.from('flipbook_orders').insert({
      order_number: orderNumber,
      video_url: uploadedFilePath,
      video_filename: videoFile.name,
      video_size_bytes: videoFile.size,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || null,
      recipient_name: recipientName || customerName,
      recipient_phone: recipientPhone || customerPhone,
      address_zipcode: addressZipcode,
      address_main: addressMain,
      address_detail: addressDetail || null,
      delivery_memo: deliveryMemo || null,
      is_gift: isGift,
      gift_message: giftMessage || null,
      base_price: basePrice,
      gift_package_price: giftPackagePrice,
      total_price: totalPrice,
    });

    if (insertError) {
      console.error('Insert error:', insertError);
      // 업로드된 영상 롤백 (업로드 성공했을 때만)
      if (!uploadError) {
        await supabase.storage.from('flipbook-videos').remove([filePath]);
      }
      return { success: false, error: '주문 저장에 실패했습니다.' };
    }

    return { success: true, orderNumber };
  } catch (error) {
    console.error('Order creation error:', error);
    return { success: false, error: '주문 처리 중 오류가 발생했습니다.' };
  }
}

// 주문 조회 (주문번호로)
export async function getOrderByNumber(orderNumber: string): Promise<{
  success: boolean;
  order?: Order;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('flipbook_orders')
      .select('*')
      .eq('order_number', orderNumber.toUpperCase())
      .single();

    if (error || !data) {
      return { success: false, error: '주문을 찾을 수 없습니다.' };
    }

    return { success: true, order: data as Order };
  } catch (error) {
    console.error('Order fetch error:', error);
    return { success: false, error: '주문 조회 중 오류가 발생했습니다.' };
  }
}

// 주문 목록 조회 (관리자용)
export async function getOrders(filters?: OrderFilters): Promise<{
  success: boolean;
  orders?: Order[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('flipbook_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(
        `order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: '주문 목록 조회에 실패했습니다.' };
    }

    return { success: true, orders: data as Order[] };
  } catch (error) {
    console.error('Orders fetch error:', error);
    return { success: false, error: '주문 목록 조회 중 오류가 발생했습니다.' };
  }
}

// 주문 상태 변경 (관리자용)
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  adminNote?: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = { status };
    if (adminNote !== undefined) {
      updateData.admin_note = adminNote;
    }

    const { error } = await supabase
      .from('flipbook_orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      console.error('Status update error:', error);
      return { success: false, error: '상태 변경에 실패했습니다.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Status update error:', error);
    return { success: false, error: '상태 변경 중 오류가 발생했습니다.' };
  }
}

// 운송장 번호 입력 (관리자용)
export async function updateTrackingNumber(
  orderId: string,
  courier: string,
  trackingNumber: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('flipbook_orders')
      .update({
        courier,
        tracking_number: trackingNumber,
        status: 'shipping' as OrderStatus,
      })
      .eq('id', orderId);

    if (error) {
      console.error('Tracking update error:', error);
      return { success: false, error: '운송장 등록에 실패했습니다.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Tracking update error:', error);
    return { success: false, error: '운송장 등록 중 오류가 발생했습니다.' };
  }
}

// 주문 상세 조회 (관리자용 - ID로)
export async function getOrderById(orderId: string): Promise<{
  success: boolean;
  order?: Order;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('flipbook_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !data) {
      return { success: false, error: '주문을 찾을 수 없습니다.' };
    }

    return { success: true, order: data as Order };
  } catch (error) {
    console.error('Order fetch error:', error);
    return { success: false, error: '주문 조회 중 오류가 발생했습니다.' };
  }
}

// 고객 주문 취소 (pending_payment 상태에서만 가능)
export async function cancelOrderByCustomer(
  orderNumber: string,
  reason?: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // 주문 조회 및 상태 확인
    const { data: order, error: fetchError } = await supabase
      .from('flipbook_orders')
      .select('id, status')
      .eq('order_number', orderNumber.toUpperCase())
      .single();

    if (fetchError || !order) {
      return { success: false, error: '주문을 찾을 수 없습니다.' };
    }

    // pending_payment 상태에서만 취소 가능
    if (order.status !== 'pending_payment') {
      return {
        success: false,
        error: '입금 전 상태에서만 취소가 가능합니다.',
      };
    }

    // 취소 사유 라벨 변환
    const reasonLabels: Record<string, string> = {
      change_mind: '단순 변심',
      wrong_info: '정보 입력 오류',
      duplicate: '중복 주문',
      other: '기타',
    };
    const reasonText = reason ? reasonLabels[reason] || reason : '';

    // 주문 상태를 cancelled로 변경
    const { error: updateError } = await supabase
      .from('flipbook_orders')
      .update({
        status: 'cancelled' as OrderStatus,
        admin_note: reasonText ? `고객 취소 사유: ${reasonText}` : '고객 취소',
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Cancel order error:', updateError);
      return { success: false, error: '주문 취소에 실패했습니다.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Cancel order error:', error);
    return { success: false, error: '주문 취소 중 오류가 발생했습니다.' };
  }
}
