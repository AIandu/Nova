import { useState } from 'react';
import { useListDecisions, useCreateDecision, getListDecisionsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Plus, X, ChevronRight, Target, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const newDecisionSchema = z.object({
  context: z.string().min(10, 'Describe the decision context'),
  chosen: z.string().min(2, 'Required'),
  prediction: z.string().min(10, 'Required'),
  confidence: z.coerce.number().min(0).max(1, 'Enter 0–1'),
  primaryRisk: z.string().min(5, 'Required'),
  options: z.string().optional(),
});

type FormValues = z.infer<typeof newDecisionSchema>;

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    value >= 0.75
      ? 'text-green-400 border-green-400/30 bg-green-400/10'
      : value >= 0.5
      ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
      : 'text-red-400 border-red-400/30 bg-red-400/10';
  return (
    <span className={cn('font-mono text-xs border rounded-full px-2 py-0.5', color)}>
      {pct}%
    </span>
  );
}

export default function PartnerDecisions() {
  const queryClient = useQueryClient();
  const { data: decisions = [], isLoading } = useListDecisions();
  const createDecision = useCreateDecision();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(newDecisionSchema),
    defaultValues: {
      context: '',
      chosen: '',
      prediction: '',
      confidence: 0.7,
      primaryRisk: '',
      options: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    createDecision.mutate(
      {
        data: {
          context: values.context,
          chosen: values.chosen,
          prediction: values.prediction,
          confidence: values.confidence,
          primaryRisk: values.primaryRisk,
          options: values.options
            ? values.options.split('\n').map((o) => o.trim()).filter(Boolean)
            : [],
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListDecisionsQueryKey() });
          setDialogOpen(false);
          form.reset();
        },
      }
    );
  };

  return (
    <div className="min-h-full bg-black text-white pt-24 pb-16 px-6 md:px-16">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">
              Decision Log
            </h1>
            <p className="text-sm text-white/30 mt-1 font-mono">
              {decisions.length} decisions recorded
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-primary/30 text-primary hover:bg-primary/10 gap-2"
                data-testid="add-decision-btn"
              >
                <Plus className="w-4 h-4" />
                Log Decision
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border-white/10 text-white max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display text-lg">Log a Decision</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
                  <FormField
                    control={form.control}
                    name="context"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/60 text-xs uppercase tracking-widest font-mono">
                          Context
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            placeholder="What problem or choice prompted this decision?"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-primary/40 resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="options"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/60 text-xs uppercase tracking-widest font-mono">
                          Options Considered (one per line)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            placeholder="Option A&#10;Option B&#10;Option C"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-primary/40 resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="chosen"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/60 text-xs uppercase tracking-widest font-mono">
                          Path Chosen
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="What was decided?"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-primary/40"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="prediction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/60 text-xs uppercase tracking-widest font-mono">
                          Predicted Outcome
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            placeholder="What do you expect to happen?"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-primary/40 resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="confidence"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/60 text-xs uppercase tracking-widest font-mono">
                            Confidence (0–1)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.05"
                              min="0"
                              max="1"
                              className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-primary/40"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="primaryRisk"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/60 text-xs uppercase tracking-widest font-mono">
                            Primary Risk
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Single biggest risk"
                              className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-primary/40"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={createDecision.isPending}
                    className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                    data-testid="submit-decision-btn"
                  >
                    {createDecision.isPending ? 'Saving...' : 'Log Decision'}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Decisions list */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && decisions.length === 0 && (
          <div className="text-center py-24">
            <Target className="w-10 h-10 text-white/10 mx-auto mb-4" />
            <p className="text-white/25 font-mono text-sm">No decisions logged yet.</p>
            <p className="text-white/15 font-mono text-xs mt-1">
              Ask Nova to help you make one, or log it manually.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {decisions.map((decision) => {
            const isExpanded = expanded === decision.id;
            const opts = Array.isArray(decision.options) ? decision.options : [];
            return (
              <div
                key={decision.id}
                className={cn(
                  'border rounded-2xl transition-all duration-200 overflow-hidden',
                  isExpanded
                    ? 'border-primary/20 bg-white/[0.03]'
                    : 'border-white/[0.07] bg-white/[0.02] hover:border-white/10'
                )}
                data-testid={`decision-card-${decision.id}`}
              >
                {/* Collapsed header */}
                <button
                  className="w-full flex items-start gap-4 px-5 py-4 text-left"
                  onClick={() => setExpanded(isExpanded ? null : decision.id)}
                  data-testid={`decision-toggle-${decision.id}`}
                >
                  <ChevronRight
                    className={cn(
                      'w-4 h-4 text-white/30 mt-0.5 flex-shrink-0 transition-transform duration-200',
                      isExpanded && 'rotate-90'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 leading-snug">{decision.context}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <ConfidenceBadge value={decision.confidence} />
                      <span className="text-xs text-white/30 font-mono">
                        {new Date(decision.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {decision.outcome && (
                        <span className="flex items-center gap-1 text-xs text-green-400/60 font-mono">
                          <CheckCircle2 className="w-3 h-3" />
                          Outcome logged
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4 border-t border-white/[0.06] pt-4">
                    {opts.length > 0 && (
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-white/25 mb-2">
                          Options Considered
                        </p>
                        <ul className="space-y-1">
                          {opts.map((opt, i) => (
                            <li key={i} className="text-sm text-white/40 flex items-start gap-2">
                              <span className="text-white/20 font-mono text-xs mt-0.5">
                                {String.fromCharCode(65 + i)}.
                              </span>
                              {opt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-primary/5 border border-primary/10 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Target className="w-3 h-3 text-primary/60" />
                          <p className="font-mono text-[10px] uppercase tracking-widest text-primary/60">
                            Directive
                          </p>
                        </div>
                        <p className="text-sm text-primary/90 leading-snug">{decision.chosen}</p>
                      </div>

                      <div className="bg-secondary/5 border border-secondary/10 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <TrendingUp className="w-3 h-3 text-secondary/60" />
                          <p className="font-mono text-[10px] uppercase tracking-widest text-secondary/60">
                            Prediction
                          </p>
                        </div>
                        <p className="text-sm text-secondary/90 leading-snug">{decision.prediction}</p>
                        <ConfidenceBadge value={decision.confidence} />
                      </div>

                      <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <AlertTriangle className="w-3 h-3 text-red-400/60" />
                          <p className="font-mono text-[10px] uppercase tracking-widest text-red-400/60">
                            Primary Risk
                          </p>
                        </div>
                        <p className="text-sm text-red-400/80 leading-snug">{decision.primaryRisk}</p>
                      </div>
                    </div>

                    {decision.outcome && (
                      <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-3">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-green-400/60 mb-1.5">
                          Outcome
                        </p>
                        <p className="text-sm text-green-400/80">{decision.outcome}</p>
                      </div>
                    )}
                    {decision.lesson && (
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-white/25 mb-1.5">
                          Lesson
                        </p>
                        <p className="text-sm text-white/50 italic">{decision.lesson}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
