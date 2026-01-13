'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageSquare, Sparkles, BookOpen, Users } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'AI 멘토와 대화',
    description: '창업가들의 사고방식으로 조언을 받으세요',
  },
  {
    icon: Sparkles,
    title: '다양한 페르소나',
    description: '5명의 전설적인 창업가 스타일 중 선택',
  },
  {
    icon: BookOpen,
    title: '명언 모음',
    description: '영감을 주는 창업가들의 명언을 만나보세요',
  },
  {
    icon: Users,
    title: '대화 기록 저장',
    description: '인사이트를 저장하고 다시 확인하세요',
  },
];

const personas = [
  { name: '일론 머스크', color: '#E82127', emoji: '🚀' },
  { name: '스티브 잡스', color: '#555555', emoji: '🎨' },
  { name: '제프 베조스', color: '#FF9900', emoji: '📦' },
  { name: '빌 게이츠', color: '#00A4EF', emoji: '💡' },
  { name: '마크 저커버그', color: '#1877F2', emoji: '🌐' },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              전설적인 창업가의
              <br />
              <span className="text-primary">사고방식</span>으로 대화하세요
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              일론 머스크, 스티브 잡스, 제프 베조스 등
              <br className="hidden md:block" />
              위대한 창업가들에게서 영감받은 AI 멘토와 대화해보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  무료로 시작하기
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  로그인
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              가입 시 50 크레딧 무료 지급
            </p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </section>

      {/* Personas Preview */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            5명의 AI 멘토를 만나보세요
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {personas.map((persona, index) => (
              <motion.div
                key={persona.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-default"
                  style={{ borderLeftColor: persona.color, borderLeftWidth: 4 }}
                >
                  <span className="text-2xl">{persona.emoji}</span>
                  <span className="font-medium">{persona.name}</span>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            주요 기능
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-md transition-shadow">
                  <feature.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            본 서비스의 AI 멘토는 실제 인물이 아닙니다.
            <br />
            공개된 인터뷰, 책, 연설 등에서 영감을 받아 만들어진 가상의 AI 페르소나입니다.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 창업가 가상 대담. All rights reserved.</p>
          <p className="mt-2">
            <Link href="http://localhost:3000" className="hover:text-primary">
              BKAMP Services 포털로 돌아가기
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
