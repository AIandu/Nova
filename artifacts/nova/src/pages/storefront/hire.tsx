import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateLead } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, ArrowRight, Zap, CheckCircle2, Cpu } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  organization: z.string().optional(),
  note: z.string().min(10, "Please provide some details about the engagement"),
});

type FormValues = z.infer<typeof formSchema>;

export default function HireMe() {
  const { toast } = useToast();
  const createLead = useCreateLead();
  const [submitted, setSubmitted] = useState(false);

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
        source: 'hire-me',
      }
    }, {
      onSuccess: () => {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onError: () => {
        toast({
          title: "Transmission Failed",
          description: "Could not send the request. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-32 max-w-3xl text-center">
        <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">Transmission Received</h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto">
          Nova has logged your request. You will be contacted shortly with next steps.
        </p>
        <Button onClick={() => setSubmitted(false)} variant="outline" className="border-border">
          Send another request
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-20 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Context / Pitch */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8 border border-accent/20">
            <Briefcase className="w-4 h-4" />
            <span>Consulting & Advisory</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
            Bring AI&U capabilities to your organization.
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            I don't just advise; I build. If you need a cognitive system, a predictive engine, or a defensive architecture designed from the ground up, we should talk.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold font-display text-lg mb-1">Architecture Design</h3>
                <p className="text-muted-foreground">Designing robust AI systems that don't rely on brittle prompts or stateless APIs.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold font-display text-lg mb-1">Rapid Prototyping</h3>
                <p className="text-muted-foreground">From concept to functional prototype in weeks, not months. High-velocity execution.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl border border-border p-8 md:p-10 shadow-xl">
          <h2 className="text-2xl font-display font-bold mb-6">Initiate Contact</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" className="bg-background" {...field} />
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
                        <Input placeholder="john@company.com" type="email" className="bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <FormControl>
                      <Input placeholder="Company or Agency" className="bg-background" {...field} />
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
                    <FormLabel>Engagement Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what you are trying to build or solve..." 
                        className="bg-background min-h-[150px] resize-y" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-14 text-lg font-bold" disabled={createLead.isPending}>
                {createLead.isPending ? "Transmitting..." : (
                  <>Send Request <ArrowRight className="w-5 h-5 ml-2" /></>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
