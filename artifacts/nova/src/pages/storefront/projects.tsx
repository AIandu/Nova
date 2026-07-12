import { useState } from 'react';
import { useListProjects } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { ArrowRight, Cpu, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProjectsIndex() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  
  const { data: projects, isLoading } = useListProjects({ category });

  const categories = ['All', 'Defense', 'Public Safety', 'Cognitive AI', 'Personal'];

  const handleCategoryClick = (cat: string) => {
    setCategory(cat === 'All' ? undefined : cat);
  };

  const visibleProjects = projects?.filter(p => p.storefrontVisible) || [];

  return (
    <div className="container mx-auto px-4 md:px-8 py-20 max-w-6xl">
      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">Systems & Capabilities</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore our portfolio of autonomous systems, predictive engines, and defensive tools.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-12 items-center justify-center">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                (cat === 'All' && !category) || cat === category
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[400px] rounded-xl bg-card border border-border animate-pulse"></div>
          ))}
        </div>
      ) : visibleProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleProjects.map(project => (
            <Link href={`/projects/${project.id}`} key={project.id} className="group flex flex-col">
              <div className="h-full rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors duration-300 flex flex-col">
                <div className="h-48 bg-muted relative overflow-hidden border-b border-border">
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-background to-muted flex items-center justify-center">
                      <Cpu className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`text-[10px] px-2 py-1 rounded border uppercase tracking-widest font-bold
                      ${project.status === 'deployed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                        project.status === 'in_development' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                        'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-xs text-primary font-mono mb-2 uppercase tracking-wider">{project.category}</div>
                  <h3 className="text-2xl font-display font-bold mb-3 group-hover:text-primary transition-colors">{project.name}</h3>
                  <p className="text-muted-foreground mb-6 flex-1 line-clamp-3">{project.oneLiner}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <span className="font-mono text-foreground font-semibold">
                      {project.price || 'Contact for pricing'}
                    </span>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 border border-border border-dashed rounded-xl bg-card/30">
          <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-display font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground">Try selecting a different category.</p>
        </div>
      )}
    </div>
  );
}
