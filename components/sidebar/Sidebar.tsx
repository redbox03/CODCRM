'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const items=[{href:'/dashboard',label:'Dashboard'},{href:'/users',label:'Users'},{href:'/teams',label:'Teams'},{href:'/stores',label:'Stores'}];
export function Sidebar(){const pathname=usePathname();return <aside className="sidebar"><h2 style={{marginTop:0}}>CODCRM</h2><p className="muted" style={{color:'#94a3b8'}}>Phase 1</p><nav style={{marginTop:20}}>{items.map(item=><Link key={item.href} href={item.href} className={pathname===item.href?'active':''}>{item.label}</Link>)}</nav></aside>;}
