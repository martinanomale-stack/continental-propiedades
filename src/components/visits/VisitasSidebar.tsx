'use client'
interface Props { userId: string; isAdmin: boolean }
export default function VisitasSidebar({ userId, isAdmin }: Props) { return <aside style={{width:240,borderRight:'1px solid var(--border)',minHeight:'calc(100vh - 60px)',background:'var(--surface)'}}></aside> }
