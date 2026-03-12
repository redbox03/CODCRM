import Link from 'next/link';

export default function HomePage() {
  return <main className="auth-shell"><div className="card" style={{ width: 420 }}><h1>CODCRM Phase 1</h1><p className="muted">Basic scaffold ready.</p><div className="grid" style={{ marginTop: 16 }}><Link className="button" href="/auth/login">Go to Login</Link><Link className="button" href="/dashboard">Go to Dashboard</Link></div></div></main>;
}
