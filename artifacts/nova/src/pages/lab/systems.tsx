import { useListProjects } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';

export default function LabSystems() {
  const { data: projects, isLoading } = useListProjects();

  const labProjects = projects?.filter(p => p.labVisible) || [];

  // Group by category manually
  const groupedProjects = labProjects.reduce((acc, project) => {
    const cat = project.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(project);
    return acc;
  }, {} as Record<string, typeof labProjects>);

  if (isLoading) {
    return (
      <div className="p-8 animate-pulse font-mono text-sm text-muted-foreground">
        [LOADING_SYSTEM_INDEX...]
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12">
      <div className="mb-12 border-b border-border pb-6">
        <h1 className="text-2xl font-display uppercase tracking-widest text-foreground">
          System Index
        </h1>
        <p className="font-mono text-xs text-muted-foreground mt-2">
          CLASSIFICATION: CONFIDENTIAL // VIEW-ONLY
        </p>
      </div>

      <div className="space-y-16">
        {Object.entries(groupedProjects).map(([category, projs]) => (
          <div key={category}>
            <h2 className="text-sm font-mono text-primary uppercase tracking-[0.2em] mb-6 flex items-center">
              <span className="w-4 h-[1px] bg-primary mr-3"></span>
              {category}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {projs.map(project => (
                <Link href={`/lab/systems/${project.id}`} key={project.id} className="group block">
                  <div className="border border-border p-5 bg-card/50 hover:bg-card hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-display text-lg uppercase tracking-wider group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 border uppercase tracking-wider
                        ${project.status === 'deployed' ? 'border-emerald-500/50 text-emerald-500' : 
                          project.status === 'in_development' ? 'border-blue-500/50 text-blue-500' : 
                          'border-amber-500/50 text-amber-500'}`}>
                        {project.status.replace('_', '-')}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {project.oneLiner}
                    </p>
                    <div className="mt-4 flex items-center text-xs font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      VIEW_DETAILS <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {labProjects.length === 0 && (
          <div className="font-mono text-sm text-muted-foreground p-8 border border-dashed border-border text-center">
            NO_SYSTEMS_FOUND
          </div>
        )}
      </div>
    </div>
  );
}
