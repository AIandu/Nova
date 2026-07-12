import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateLead } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Wrench, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  organization: z.string().optional(),
  interest: z.string().min(1, "Please select a budget range"),
  note: z.string().min(10, "Please describe your custom build needs"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CustomBuild() {
  const { toast } = useToast();
  const createLead = useCreateLead();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      organization: '',
      interest: '',
      note: '',
    }
  });

  const onSubmit = (data: FormValues) => {
    createLead.mutate({
      data: {
        ...data,
        source: 'custom-request',
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
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">Build Request Logged</h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto">
          Your specifications have been sent to Nova for initial review. We will reach out to schedule a scoping session.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-20 max-w-4xl">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
          <Wrench className="w-4 h-4" />
          <span>Bespoke Engineering</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">Custom Systems</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Need something that doesn't exist yet? We engineer custom cognitive architectures tailored exactly to your operational requirements.
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-8 md:p-12 shadow-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Point of Contact</FormLabel>
                    <FormControl>
                      <Input placeholder="Commander Shepard" className="bg-background h-12" {...field} />
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
                    <FormLabel className="text-base">Secure Comm Link (Email)</FormLabel>
                    <FormControl>
                      <Input placeholder="shepard@alliance.gov" type="email" className="bg-background h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Organization / Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="Systems Alliance" className="bg-background h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Budget Allocation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background h-12">
                          <SelectValue placeholder="Select a range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="prototype">Prototype ($10k - $25k)</SelectItem>
                        <SelectItem value="mvp">MVP ($25k - $50k)</SelectItem>
                        <SelectItem value="production">Production System ($50k - $150k+)</SelectItem>
                        <SelectItem value="unknown">To Be Determined</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">System Requirements</FormLabel>
                  <FormDescription>Describe the problem space, desired capabilities, and expected timeline.</FormDescription>
                  <FormControl>
                    <Textarea 
                      placeholder="We need an autonomous agent capable of analyzing satellite imagery in real-time and identifying..." 
                      className="bg-background min-h-[200px] resize-y text-base p-4" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground" disabled={createLead.isPending}>
              {createLead.isPending ? "Transmitting Specification..." : (
                <>Submit Build Request <ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
