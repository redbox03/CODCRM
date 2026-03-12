import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'CODCRM', description: 'CODCRM Phase 1' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
