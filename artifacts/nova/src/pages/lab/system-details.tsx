import { useParams, Link } from 'wouter';
import { useGetProject } from '@workspace/api-client-react';
import { ArrowLeft, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LabNovaWidget from './components/lab-nova-widget';

export default function LabSystemDetails() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id, 10);
  
  const { data: project, isLoading, isError } = useGetProject(projectId);

  if (isLoading) {
    return <div className="p-8 font-mono text-sm text-muted-foreground animate-pulse">[LOADING_SYSTEM_DATA...]</div>;
  }

  if (isError || !project) {
    return (
      <div className="p-12">
        <div className="border border-destructive bg-destructive/10 text-destructive font-mono text-sm p-4 mb-6">
          ERROR: SYSTEM_NOT_FOUND
        </div>
        <Link href="/lab/systems" className="font-mono text-xs text-primary hover:underline uppercase tracking-widest">
          RETURN_TO_INDEX
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 relative pb-40">
      <Link href="/lab/systems" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors font-mono text-xs uppercase tracking-widest">
        <ArrowLeft className="w-3 h-3 mr-2" />
        Back to Index
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Header Block */}
          <div className="border-l-2 border-primary pl-6">
            <div className="flex items-center gap-4 mb-4 font-mono text-xs">
              <span className="text-primary uppercase tracking-widest">{project.category}</span>
              <span className="text-muted-foreground">|</span>
              <span className={`uppercase tracking-wider
                ${project.status === 'deployed' ? 'text-emerald-500' : 
                  project.status === 'in_development' ? 'text-blue-500' : 
                  'text-amber-500'}`}>
                STATUS: {project.status.replace('_', '-')}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display uppercase tracking-widest mb-4">{project.name}</h1>
            <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {project.oneLiner}
            </p>
          </div>

          {/* Technical Overview */}
          <div className="border border-border bg-card/30 p-6">
            <h2 className="font-display text-lg uppercase tracking-widest mb-4 border-b border-border pb-2">
              System Overview
            </h2>
            <div className="font-mono text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </div>
          </div>

          {/* Capabilities */}
          {project.capabilities && project.capabilities.length > 0 && (
            <div>
              <h2 className="font-display text-lg uppercase tracking-widest mb-6 flex items-center">
                <Terminal className="w-4 h-4 mr-3 text-primary" />
                Capabilities Matrix
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                {project.capabilities.map((cap, i) => (
                  <li key={i} className="flex items-start border border-border/50 p-3 bg-card/20">
                    <span className="text-primary mr-2">{`>`}</span>
                    <span className="leading-tight">{cap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technical Note */}
          {project.technicalNote && (
            <div className="border-l-2 border-amber-500 bg-amber-500/5 p-4">
              <h3 className="font-mono text-xs text-amber-500 uppercase tracking-widest mb-2 flex items-center">
                [TECHNICAL_NOTE]
              </h3>
              <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                {project.technicalNote}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-1">
          <div className="border border-border bg-card p-6 sticky top-24">
            <h3 className="font-display text-base uppercase tracking-widest mb-4">Required Action</h3>
            <p className="font-mono text-xs text-muted-foreground mb-8 leading-relaxed">
              Direct acquisition of this system is restricted. A formal briefing is required to assess operational fit and deployment constraints.
            </p>
            <Link href={`/lab/briefing?project=${project.id}`}>
              <Button className="w-full font-mono uppercase tracking-widest text-xs h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none">
                Request Briefing
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <LabNovaWidget projectName={project.name} />
    </div>
  );
}
