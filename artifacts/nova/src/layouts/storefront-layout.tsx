import { Link } from 'wouter';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-storefront min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-display font-bold text-xl tracking-tight flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary"></div>
              AI&U
            </Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium">
              <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">Projects</Link>
              <Link href="/custom" className="text-muted-foreground hover:text-foreground transition-colors">Custom Build</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/hire" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Hire Loretta
            </Link>
            <Link href="/lab" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1 rounded-md border border-border">
              Lab Access
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      
      <footer className="py-8 md:py-12 border-t border-border mt-auto">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AI&U. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/partner" className="hover:text-foreground transition-colors">Partner Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
