import { useParams, Link } from 'wouter';
import { useGetProject, useCreateLead } from '@workspace/api-client-react';
import { ArrowLeft, Check, Download, Shield, Cpu, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  organization: z.string().optional(),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id, 10);
  
  const { data: project, isLoading, isError } = useGetProject(projectId);
  const createLead = useCreateLead();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leadSource, setLeadSource] = useState<'buy-now' | 'consultation'>('consultation');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      organization: '',
      note: '',
    }
  });

  const onSubmit = (data: FormValues) => {
    createLead.mutate({
      data: {
        ...data,
        source: leadSource,
        projectId,
        interest: project?.name
      }
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        toast({
          title: "Request Received",
          description: "Nova will route your request. Expect a response shortly.",
        });
        form.reset();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to submit request. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-32 text-center animate-pulse">Loading...</div>;
  }

  if (isError || !project) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-display font-bold mb-4">Project not found</h1>
        <Link href="/projects" className="text-primary hover:underline">Return to projects</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-6xl">
      <Link href="/projects" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-12 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-primary font-mono uppercase tracking-wider">{project.category}</span>
              <span className={`text-[10px] px-2 py-1 rounded border uppercase tracking-widest font-bold
                ${project.status === 'deployed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                  project.status === 'in_development' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                  'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">{project.name}</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {project.oneLiner}
            </p>
          </div>

          {project.imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-border bg-muted aspect-video relative">
              <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              System Overview
            </h2>
            <div className="prose prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed max-w-none">
              <p>{project.description}</p>
            </div>
          </div>

          {project.capabilities && project.capabilities.length > 0 && (
            <div>
              <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
                <Cpu className="w-6 h-6 text-primary" />
                Core Capabilities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.capabilities.map((cap, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                    <div className="mt-1 bg-primary/20 p-1 rounded text-primary">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-foreground leading-snug">{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-8 shadow-xl">
            <h3 className="text-xl font-display font-bold mb-2">Acquisition</h3>
            
            {project.price ? (
              <div className="text-3xl font-mono font-bold mb-6 text-primary">{project.price}</div>
            ) : (
              <div className="text-lg font-mono mb-6 text-muted-foreground">Custom Quote Required</div>
            )}

            <div className="space-y-4 mb-8">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full h-12 text-base font-bold"
                    onClick={() => setLeadSource('buy-now')}
                  >
                    Acquire System
                  </Button>
                </DialogTrigger>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full h-12 text-base border-border hover:bg-muted"
                    onClick={() => setLeadSource('consultation')}
                  >
                    Request Consultation
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px] bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">
                      {leadSource === 'buy-now' ? 'System Acquisition' : 'Consultation Request'}
                    </DialogTitle>
                    <p className="text-muted-foreground text-sm mt-2">
                      Submit your details. Nova will review and route your request to the appropriate channel.
                    </p>
                  </DialogHeader>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Doe" className="bg-background" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="jane@company.com" type="email" className="bg-background" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="organization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Company / Agency" className="bg-background" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Context</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Use cases, deployment timeline, etc." className="bg-background resize-none" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full mt-4 h-12" disabled={createLead.isPending}>
                        {createLead.isPending ? "Transmitting..." : "Submit Request"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="pt-8 border-t border-border space-y-4">
              {project.whitepaper && (
                <a href={project.whitepaper} target="_blank" rel="noreferrer" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group">
                  <Download className="w-4 h-4 mr-3 group-hover:text-primary transition-colors" />
                  Download Whitepaper
                </a>
              )}
              {project.linkedinUrl && (
                <a href={project.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group">
                  <ExternalLink className="w-4 h-4 mr-3 group-hover:text-primary transition-colors" />
                  View on LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
