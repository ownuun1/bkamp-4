import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="nb-card p-8 bg-nb-green text-center max-w-lg w-full">
        <div className="text-7xl mb-6 animate-bounce-slow">📖</div>
        <h1 className="text-4xl font-black mb-3">웹툰 추천</h1>
        <p className="text-lg mb-2 text-black/80">
          좋아하는 웹툰을 알려주세요
        </p>
        <p className="text-base mb-8 text-black/60">
          AI가 당신의 취향을 분석해서 딱 맞는 웹툰을 추천해드려요
        </p>

        <div className="space-y-4">
          <Link
            href="/login"
            className="nb-button bg-white w-full block text-lg py-3"
          >
            시작하기
          </Link>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <span className="nb-tag text-xs">취향 분석</span>
            <span className="nb-tag text-xs">맞춤 추천</span>
            <span className="nb-tag text-xs">플랫폼 링크</span>
          </div>
        </div>
      </div>

      <p className="mt-8 text-black/50 text-sm">
        네이버웹툰, 카카오웹툰 등 다양한 플랫폼 지원
      </p>
    </main>
  );
}
