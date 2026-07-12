import { Link } from 'wouter';
import { Search, Mail, Github } from 'lucide-react';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-partner h-[100dvh] bg-background text-foreground flex flex-col overflow-hidden font-sans relative">
      {/* Absolute Header for Partner Space */}
      <header className="absolute top-0 w-full z-50 pointer-events-none p-6 flex justify-between items-start">
        <Link href="/partner" className="font-display font-bold tracking-tight text-muted-foreground pointer-events-auto hover:text-foreground transition-colors">
          AI&U
        </Link>
        <div className="flex items-center gap-4 pointer-events-auto">
          <Link href="/partner/decisions" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest mr-4">
            Decisions Log
          </Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <Github className="w-5 h-5" />
          </a>
          <a href="mailto:hello@example.com" className="text-muted-foreground hover:text-foreground transition-colors">
            <Mail className="w-5 h-5" />
          </a>
          <a href="https://google.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <Search className="w-5 h-5" />
          </a>
          <Link href="/" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest ml-4 px-2 py-1 border border-border rounded">
            Exit
          </Link>
        </div>
      </header>

      {/* Main content takes full height */}
      <main className="flex-1 min-h-0 relative">
        {children}
      </main>
    </div>
  );
}
