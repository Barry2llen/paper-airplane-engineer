import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '纸飞机工程师',
  description: '设计并试飞纸飞机。',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="zh-CN">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
