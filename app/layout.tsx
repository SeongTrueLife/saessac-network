import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '새싹 4기 캐릭터 테스트',
  description: '나는 어떤 팀원 캐릭터일까? 밸런스 게임으로 알아보기 ✨',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-gray-50">{children}</body>
    </html>
  );
}
