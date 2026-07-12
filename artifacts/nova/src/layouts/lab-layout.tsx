import { Link } from 'wouter';

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-lab tech-grid min-h-[100dvh] bg-background text-foreground flex flex-col font-sans">
      <header className="border-b border-border bg-background/95">
        <div className="px-6 h-14 flex items-center justify-between max-w-7xl mx-auto w-full">
          <Link href="/lab" className="font-display font-bold tracking-widest text-primary text-sm uppercase flex items-center gap-3">
            <span className="w-2 h-2 bg-primary animate-pulse"></span>
            AI&U // LAB
          </Link>
          <nav className="flex gap-6 text-xs uppercase tracking-wider">
            <Link href="/lab/systems" className="text-muted-foreground hover:text-primary transition-colors">Systems</Link>
            <Link href="/lab/briefing" className="text-muted-foreground hover:text-primary transition-colors">Request Briefing</Link>
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors ml-4 pl-4 border-l border-border">Exit Lab</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
