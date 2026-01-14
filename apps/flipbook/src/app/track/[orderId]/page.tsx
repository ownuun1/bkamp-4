import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrackDetailClient from '@/components/TrackDetailClient';
import { getOrderByNumber } from '@/lib/actions/order';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function TrackDetailPage({ params }: PageProps) {
  const { orderId } = await params;

  // 주문 조회
  const result = await getOrderByNumber(orderId);

  if (!result.success || !result.order) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">주문 현황</h1>
          <TrackDetailClient order={result.order} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
