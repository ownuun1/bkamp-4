import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="hero min-h-[70vh] relative">
          {/* 배경 이미지 */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/hero-bg.png')" }}
          />
          {/* 어두운 오버레이 */}
          <div className="absolute inset-0 bg-black/50" />

          <div className="hero-content text-center relative z-10">
            <div className="max-w-lg">
              <h1 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">
                특별한 순간을<br />플립북으로 간직하세요
              </h1>
              <p className="text-lg text-white/90 mb-8 drop-shadow-md">
                포토부스에서 찍은 영상을 아날로그 감성의 플립북으로 제작해드립니다.
                손끝으로 넘기는 추억, 선물하기에도 완벽해요.
              </p>
              <Link
                href="/order"
                className="btn btn-lg shadow-lg"
                style={{ backgroundColor: '#7c3aed', color: '#ffffff', border: '1px solid #7c3aed' }}
              >
                나만의 플립북 만들기
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-4 bg-base-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">이렇게 만들어져요</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card bg-base-100 shadow-sm card-hover">
                <div className="card-body items-center text-center">
                  <div className="text-4xl mb-2">🎬</div>
                  <h3 className="card-title text-lg">1. 영상 업로드</h3>
                  <p className="text-sm text-base-content/70">
                    포토부스에서 찍은 3-10초 영상을 업로드해주세요
                  </p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-sm card-hover">
                <div className="card-body items-center text-center">
                  <div className="text-4xl mb-2">✍️</div>
                  <h3 className="card-title text-lg">2. 정보 입력</h3>
                  <p className="text-sm text-base-content/70">
                    배송 정보와 선물 옵션을 선택해주세요
                  </p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-sm card-hover">
                <div className="card-body items-center text-center">
                  <div className="text-4xl mb-2">📦</div>
                  <h3 className="card-title text-lg">3. 제작 & 배송</h3>
                  <p className="text-sm text-base-content/70">
                    정성껏 제작하여 안전하게 배송해드려요
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-base-200">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">지금 바로 시작하세요</h2>
            <p className="text-base-content/70 mb-6">
              소중한 순간을 손으로 만지는 추억으로 바꿔드릴게요
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/order"
                className="btn shadow-md"
                style={{ backgroundColor: '#7c3aed', color: '#ffffff', border: '1px solid #7c3aed' }}
              >
                주문하기
              </Link>
              <Link
                href="/track"
                className="btn"
                style={{ border: '1px solid #7c3aed', color: '#7c3aed' }}
              >
                주문 조회
              </Link>
              <Link
                href="/admin"
                className="btn"
                style={{ border: '1px solid #6b7280', color: '#6b7280' }}
              >
                관리자
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
