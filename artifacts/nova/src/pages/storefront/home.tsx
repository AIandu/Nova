import { Link } from 'wouter';
import { ArrowRight, Sparkles, Shield, Cpu, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useListProjects } from '@workspace/api-client-react';
import StorefrontNovaWidget from './components/storefront-nova-widget';

export default function StorefrontHome() {
  const { data: projects, isLoading } = useListProjects({ status: 'deployed' });

  const featuredProjects = projects?.filter(p => p.featured && p.storefrontVisible).slice(0, 3) || [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-background z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.15)_0%,transparent_50%)]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-8 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
            <Sparkles className="w-4 h-4" />
            <span>Next-Generation Cognitive Systems</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70">
            Intelligence that <br/> <span className="text-primary">Defends & Elevates</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            AI&U builds autonomous partners, predictive engines, and robust defensive systems. 
            We do not build wrappers. We build engines of capability.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/projects">
              <Button size="lg" className="h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
                Browse Projects
              </Button>
            </Link>
            <Link href="/custom">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-border hover:bg-muted w-full sm:w-auto">
                Request Custom Build
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary border border-primary/20">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">Defense-Grade</h3>
              <p className="text-muted-foreground">Built to withstand adversarial conditions. Systems designed for reliability when it matters most.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 text-accent border border-accent/20">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">Cognitive Independence</h3>
              <p className="text-muted-foreground">Beyond simple prompts. Our agents maintain state, make decisions, and act autonomously.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-500 border border-emerald-500/20">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">High-Velocity Output</h3>
              <p className="text-muted-foreground">From prototype to production. Rapid deployment cycles without sacrificing architectural integrity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-4xl font-display font-bold mb-4">Featured Systems</h2>
              <p className="text-muted-foreground text-lg max-w-xl">A selection of deployed systems and public-facing capabilities available for immediate integration.</p>
            </div>
            <Link href="/projects" className="group flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors">
              View all capabilities <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 rounded-xl bg-muted/30 animate-pulse border border-border"></div>
              ))}
            </div>
          ) : featuredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProjects.map(project => (
                <Link href={`/projects/${project.id}`} key={project.id} className="group block">
                  <div className="h-full rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors duration-300 flex flex-col">
                    <div className="h-48 bg-muted relative overflow-hidden">
                      {project.imageUrl ? (
                        <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Cpu className="w-12 h-12 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className={`text-xs px-2 py-1 rounded border uppercase tracking-wider font-bold
                          ${project.status === 'deployed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                            project.status === 'in_development' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                            'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="text-xs text-primary font-mono mb-2 uppercase tracking-wider">{project.category}</div>
                      <h3 className="text-2xl font-display font-bold mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
                      <p className="text-muted-foreground mb-6 flex-1">{project.oneLiner}</p>
                      
                      {project.price && (
                        <div className="text-lg font-mono text-foreground font-semibold mb-6">
                          {project.price}
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm font-medium text-foreground mt-auto">
                        View Details <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform text-primary" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
             <div className="text-center py-20 border border-border border-dashed rounded-xl text-muted-foreground">
               No featured projects available.
             </div>
          )}
        </div>
      </section>

      <StorefrontNovaWidget />
    </div>
  );
}
