import { Sidebar } from '@/components/sidebar/Sidebar';
export default function AppLayout({ children }: { children: React.ReactNode }) { return <div className="app-shell"><Sidebar /><main className="main">{children}</main></div>; }
