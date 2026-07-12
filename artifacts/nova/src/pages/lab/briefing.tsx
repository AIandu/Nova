import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateLead } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  organization: z.string().min(2, "Organization is required for Lab briefings"),
  role: z.string().optional(),
  interest: z.string().min(1, "Please select an area of interest"),
  note: z.string().min(10, "Please provide context for the briefing request"),
});

type FormValues = z.infer<typeof formSchema>;

export default function LabBriefing() {
  const { toast } = useToast();
  const createLead = useCreateLead();
  const [submitted, setSubmitted] = useState(false);
  const [location] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      organization: '',
      role: '',
      interest: '',
      note: '',
    }
  });

  // Pre-fill if coming from a specific project
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('project');
    if (projectId) {
      // In a real scenario we might fetch the project name here, but for simplicity
      form.setValue('interest', `system_id_${projectId}`);
    }
  }, [form, location]);

  const onSubmit = (data: FormValues) => {
    createLead.mutate({
      data: {
        ...data,
        source: 'lab',
      }
    }, {
      onSuccess: () => {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onError: () => {
        toast({
          title: "SUBMISSION_FAILED",
          description: "Internal error. Please retry.",
          variant: "destructive"
        });
      }
    });
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-6">
        <div className="border border-border p-8 bg-card/30 text-center font-mono">
          <Check className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-xl text-primary uppercase tracking-widest mb-4">Briefing Request Logged</h2>
          <p className="text-sm text-muted-foreground mb-8">
            TRANSMISSION SECURE. CLEARANCE VERIFICATION PENDING.
            YOU WILL BE CONTACTED VIA SECURE CHANNEL WITHIN 48 HOURS.
          </p>
          <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-none border-border font-mono text-xs uppercase tracking-widest">
            Submit Additional Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="mb-12 border-b border-border pb-6">
        <h1 className="text-3xl font-display uppercase tracking-widest mb-2 flex items-center">
          <ShieldAlert className="w-6 h-6 mr-3 text-primary" />
          Request Briefing
        </h1>
        <p className="font-mono text-xs text-muted-foreground">
          SECURE INTAKE // CLEARANCE LEVEL: UNCLASSIFIED
        </p>
      </div>

      <div className="border border-border bg-card/20 p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Operative Name</FormLabel>
                    <FormControl>
                      <Input placeholder="[ENTER_NAME]" className="bg-background rounded-none border-border focus-visible:ring-primary focus-visible:ring-1 focus-visible:ring-offset-0" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Agency / Organization</FormLabel>
                    <FormControl>
                      <Input placeholder="[ENTER_ORG]" className="bg-background rounded-none border-border focus-visible:ring-primary focus-visible:ring-1 focus-visible:ring-offset-0" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Title / Role <span className="opacity-50">(OPT)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="[ENTER_ROLE]" className="bg-background rounded-none border-border focus-visible:ring-primary focus-visible:ring-1 focus-visible:ring-offset-0" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Secure Comm Link (Email)</FormLabel>
                    <FormControl>
                      <Input placeholder="[ENTER_EMAIL]" type="email" className="bg-background rounded-none border-border focus-visible:ring-primary focus-visible:ring-1 focus-visible:ring-offset-0" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="interest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Primary Subject / System</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger className="bg-background rounded-none border-border focus:ring-primary focus:ring-1 focus:ring-offset-0">
                        <SelectValue placeholder="[SELECT_SUBJECT]" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-none border-border bg-card font-mono text-sm">
                      <SelectItem value="defense_systems">Defense Systems Integration</SelectItem>
                      <SelectItem value="aerospace">Aerospace / Orbital</SelectItem>
                      <SelectItem value="cognitive">Cognitive Autonomous Agents</SelectItem>
                      <SelectItem value="public_safety">Public Safety / Threat Detection</SelectItem>
                      <SelectItem value="other">Other / Custom Requirement</SelectItem>
                      {/* We keep the dynamic ID if it was set via URL */}
                      {field.value?.startsWith('system_id_') && (
                        <SelectItem value={field.value}>Specific System (ID: {field.value.replace('system_id_', '')})</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Operational Context</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="[ENTER_CONTEXT_AND_REQUIREMENTS]" 
                      className="bg-background rounded-none border-border min-h-[150px] focus-visible:ring-primary focus-visible:ring-1 focus-visible:ring-offset-0" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <div className="pt-6">
              <Button type="submit" className="w-full rounded-none h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs uppercase tracking-widest" disabled={createLead.isPending}>
                {createLead.isPending ? "[TRANSMITTING...]" : "SUBMIT_BRIEFING_REQUEST"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
