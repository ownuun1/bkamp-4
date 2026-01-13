import { PersonaGrid } from '@/components/personas/persona-grid';

export const dynamic = 'force-dynamic';

export default function PersonasPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI 멘토 선택</h1>
        <p className="text-muted-foreground">
          대화하고 싶은 창업가 스타일을 선택하세요
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-center text-sm text-muted-foreground">
        <p>
          이 AI 멘토들은 실제 인물이 아닙니다.
          <br />
          공개된 인터뷰, 책, 연설에서 영감을 받아 만들어진 가상의 페르소나입니다.
        </p>
      </div>

      <PersonaGrid />
    </div>
  );
}
