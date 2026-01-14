import { createClient } from '@bkamp/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const { title, platform } = await request.json();

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: '웹툰 제목을 입력해주세요' },
        { status: 400 }
      );
    }

    if (title.trim().length > 100) {
      return NextResponse.json(
        { error: '웹툰 제목은 100자 이하로 입력해주세요' },
        { status: 400 }
      );
    }

    const normalizedPlatform = platform ? platform.trim() : null;

    if (normalizedPlatform && normalizedPlatform.length > 50) {
      return NextResponse.json(
        { error: '플랫폼명은 50자 이하로 입력해주세요' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('webtoon_suggestions')
      .insert({
        user_id: user.id,
        title: title.trim(),
        platform: normalizedPlatform,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: '제보 저장 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '제보해주셔서 감사합니다!',
      suggestion_id: data.id,
    });
  } catch (error) {
    console.error('Suggestion API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
