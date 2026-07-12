import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function LabHome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)]">
      <div className="text-center max-w-2xl px-6">
        <h1 className="text-2xl md:text-3xl font-display uppercase tracking-[0.2em] mb-8 font-light">
          Advanced Systems <span className="text-primary mx-2">—</span> AI&U
        </h1>
        
        <div className="w-16 h-[1px] bg-border mx-auto mb-12"></div>
        
        <p className="font-mono text-sm text-muted-foreground leading-relaxed mb-16 max-w-lg mx-auto text-justify">
          SECURE ACCESS GRANTED. YOU ARE VIEWING CLEARED TECHNICAL SUMMARIES FOR DEPLOYED AND IN-DEVELOPMENT CAPABILITIES.
        </p>
        
        <Link href="/lab/systems">
          <Button variant="outline" className="font-mono uppercase tracking-widest text-xs h-12 px-8 border-primary text-primary hover:bg-primary/10 rounded-none">
            View Systems [//]
          </Button>
        </Link>
      </div>
    </div>
  );
}
