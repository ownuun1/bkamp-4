import { createClient } from '@bkamp/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// POST /api/push/subscribe - 푸시 구독 등록
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const subscription: PushSubscriptionJSON = body.subscription;

  if (!subscription?.endpoint || !subscription?.keys) {
    return NextResponse.json(
      { error: 'Invalid subscription data' },
      { status: 400 }
    );
  }

  // 기존 구독 확인
  const { data: existing } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('endpoint', subscription.endpoint)
    .single();

  if (existing) {
    // 이미 존재하면 업데이트
    const { error } = await supabase
      .from('push_subscriptions')
      .update({
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        is_active: true,
        user_agent: request.headers.get('user-agent') || null,
      })
      .eq('id', existing.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: true });
  }

  // 새 구독 생성
  const { error } = await supabase.from('push_subscriptions').insert({
    user_id: user.id,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
    user_agent: request.headers.get('user-agent') || null,
    is_active: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, created: true }, { status: 201 });
}

// DELETE /api/push/subscribe - 푸시 구독 해제
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { endpoint } = body;

  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('endpoint', endpoint);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
