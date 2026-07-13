import { useState, useRef, useEffect, useCallback } from 'react';
import { useClerk } from '@clerk/react';
import {
  useCreateConversation,
  useListTodos,
  useCreateTodo,
  useUpdateTodo,
  useListUploads,
  useDeleteUpload,
  getListTodosQueryKey,
  getListUploadsQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { streamNovaMessage } from '@/lib/nova-stream';
import { cn } from '@/lib/utils';
import {
  Mic,
  Paperclip,
  Send,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Trash2,
  Plus,
  X,
  Check,
  Clock,
  AlertCircle,
} from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type TodoStatus = 'approval_needed' | 'waiting' | 'completed';

const statusMeta: Record<TodoStatus, { label: string; icon: React.ElementType; color: string }> = {
  approval_needed: { label: 'Approval Needed', icon: AlertCircle, color: 'text-yellow-400' },
  waiting: { label: 'Waiting', icon: Clock, color: 'text-blue-400' },
  completed: { label: 'Completed', icon: Check, color: 'text-green-400' },
};

/** Renders Nova's decision-engine output with styled blocks */
function NovaMessageContent({ content }: { content: string }) {
  // Parse **Directive:**, **Prediction:**, **Primary risk:** blocks
  const parts = content.split(/(\*\*(?:Directive|Prediction|Primary [Rr]isk):?\*\*)/g);

  if (parts.length <= 1) {
    return <span>{content}</span>;
  }

  return (
    <span>
      {parts.map((part, i) => {
        if (part.match(/\*\*Directive:?\*\*/i)) {
          return (
            <span key={i} className="font-mono text-[10px] uppercase tracking-widest text-primary/70 block mt-3 mb-0.5">
              DIRECTIVE
            </span>
          );
        }
        if (part.match(/\*\*Prediction:?\*\*/i)) {
          return (
            <span key={i} className="font-mono text-[10px] uppercase tracking-widest text-secondary/70 block mt-3 mb-0.5">
              PREDICTION
            </span>
          );
        }
        if (part.match(/\*\*Primary [Rr]isk:?\*\*/i)) {
          return (
            <span key={i} className="font-mono text-[10px] uppercase tracking-widest text-red-400/70 block mt-3 mb-0.5">
              PRIMARY RISK
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export default function PartnerHome() {
  const queryClient = useQueryClient();

  // Chat state
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // UI panels
  const [todoBoardOpen, setTodoBoardOpen] = useState(false);
  const [uploadsOpen, setUploadsOpen] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [addingTodo, setAddingTodo] = useState(false);

  // Upload state
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // API
  const createConv = useCreateConversation();
  const { data: todos = [] } = useListTodos();
  const { data: uploads = [] } = useListUploads();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteUpload = useDeleteUpload();

    // Init conversation
  useEffect(() => {
    createConv.mutate(
      { data: { door: 'partner' } },
      {
        onSuccess: (conv) => {
          setConversationId(conv.id);
          setMessages([
            {
              role: 'assistant',
              content: "Running. What do you need me to think through?",
            },
          ]);
        },
        onError: (err) => {
          setMessages([
            {
              role: 'assistant',
              content: `⚠️ Could not start session: ${err instanceof Error ? err.message : String(err)}`,
            },
          ]);
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !conversationId || isStreaming) return;
    const userContent = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userContent }]);
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
    setIsStreaming(true);

    try {
      await streamNovaMessage(
        conversationId,
        userContent,
        (chunk) => {
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
              ...next[next.length - 1],
              content: next[next.length - 1].content + chunk,
            };
            return next;
          });
        },
        () => setIsStreaming(false)
      );
        } catch (err) {
      setIsStreaming(false);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${err instanceof Error ? err.message : 'Unknown error'}`,
        },
      ]);
    }
  }, [input, conversationId, isStreaming]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTodoCreate = () => {
    if (!newTodoText.trim()) return;
    createTodo.mutate(
      { data: { title: newTodoText.trim(), status: 'approval_needed' } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
          setNewTodoText('');
          setAddingTodo(false);
        },
      }
    );
  };

  const cycleTodoStatus = (id: number, current: TodoStatus) => {
    const cycle: TodoStatus[] = ['approval_needed', 'waiting', 'completed'];
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
    updateTodo.mutate(
      { id, data: { status: next } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() }) }
    );
  };

    const clerk = useClerk();

  const handleUploadFile = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const base = import.meta.env.VITE_API_BASE_URL ?? '';
    try {
      const token = await clerk.session?.getToken();
      await fetch(`${base}/api/uploads`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      queryClient.invalidateQueries({ queryKey: getListUploadsQueryKey() });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteUpload = (id: number) => {
    deleteUpload.mutate(
      { id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListUploadsQueryKey() }) }
    );
  };

  const todosByStatus = {
    approval_needed: todos.filter((t) => t.status === 'approval_needed'),
    waiting: todos.filter((t) => t.status === 'waiting'),
    completed: todos.filter((t) => t.status === 'completed'),
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">

      {/* ── BACKGROUND: scrollable chat feed ── */}
      <div
        className={cn(
          'absolute inset-0 overflow-y-auto partner-bg-fade pt-20 pb-40 px-6 md:px-16 lg:px-32',
          isFocused && 'focused'
        )}
        data-testid="chat-feed"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex flex-col gap-1',
                msg.role === 'user' ? 'items-end' : 'items-start'
              )}
            >
              <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest px-1">
                {msg.role === 'user' ? 'Loretta' : 'Nova'}
              </span>
              <div
                className={cn(
                  'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'partner-user-msg bg-white/5 rounded-tr-sm'
                    : 'partner-nova-msg bg-white/[0.03] rounded-tl-sm border border-white/5'
                )}
              >
                {msg.role === 'assistant' ? (
                  <NovaMessageContent content={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {isStreaming && messages[messages.length - 1]?.content === '' && (
            <div className="flex items-start gap-2">
              <div className="flex gap-1 px-4 py-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* ── FOREGROUND: floating command bar ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-30">
        <div className={cn(
          'relative bg-black/80 backdrop-blur-xl border rounded-2xl transition-all duration-300',
          isFocused
            ? 'border-primary/40 shadow-[0_0_40px_rgba(255,128,171,0.12)]'
            : 'border-white/10'
        )}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="What do you need me to think through?"
            rows={1}
            disabled={isStreaming}
            data-testid="partner-input"
            className="w-full bg-transparent text-white placeholder:text-white/25 resize-none px-5 pt-4 pb-3 pr-28 text-sm focus:outline-none font-sans leading-relaxed"
            style={{ minHeight: '52px', maxHeight: '160px' }}
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-1">
            <label
              className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors cursor-pointer"
              title="Upload file"
            >
              <Paperclip className="w-4 h-4" />
              <input
                ref={uploadInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadFile(file);
                  e.target.value = '';
                }}
              />
            </label>
            <button
              className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
              title="Voice (coming soon)"
              type="button"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
              data-testid="partner-send"
              className="w-8 h-8 flex items-center justify-center text-primary hover:text-primary/80 disabled:text-white/20 transition-colors"
              type="button"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-white/15 mt-2 font-mono">
          SHIFT+ENTER for new line — ENTER to send
        </p>
      </div>

      {/* ── BOTTOM-LEFT: Upload folder ── */}
      <div className="absolute bottom-8 left-4 z-40 max-w-[220px]">
        <button
          onClick={() => setUploadsOpen((o) => !o)}
          className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors font-mono uppercase tracking-widest mb-2"
          data-testid="uploads-toggle"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Files ({uploads.length})
          {uploadsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
        {uploadsOpen && (
          <div className="bg-black/80 border border-white/10 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto backdrop-blur-xl">
            {uploading && (
              <p className="text-xs text-primary/60 font-mono animate-pulse">Uploading...</p>
            )}
            {uploads.length === 0 && !uploading && (
              <p className="text-xs text-white/20 font-mono">No files yet</p>
            )}
            {uploads.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-2 group">
                <span className="text-xs text-white/50 truncate max-w-[150px]" title={u.originalName}>
                  {u.originalName}
                </span>
                <button
                  onClick={() => handleDeleteUpload(u.id)}
                  className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all"
                  data-testid={`delete-upload-${u.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT EDGE: To-Do Board toggle ── */}
      <button
        onClick={() => setTodoBoardOpen((o) => !o)}
        className="absolute top-1/2 -translate-y-1/2 right-0 z-40 h-24 w-6 flex items-center justify-center bg-white/5 hover:bg-white/10 border-l border-white/10 transition-colors rounded-l-lg"
        data-testid="todo-board-toggle"
        title="To-Do Board"
      >
        <span className="text-[9px] text-white/30 font-mono uppercase tracking-widest rotate-90 whitespace-nowrap">
          Board
        </span>
      </button>

      {/* ── TO-DO BOARD PANEL ── */}
      <div
        className={cn(
          'absolute top-0 right-0 h-full w-[340px] bg-black/95 border-l border-white/10 z-50 flex flex-col transition-transform duration-300 backdrop-blur-xl',
          todoBoardOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        data-testid="todo-board"
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/10">
          <h2 className="font-display text-sm font-semibold text-white/80 tracking-tight">
            To-Do Board
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAddingTodo(true)}
              className="text-primary/60 hover:text-primary transition-colors"
              data-testid="add-todo-btn"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTodoBoardOpen(false)}
              className="text-white/30 hover:text-white/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {addingTodo && (
          <div className="px-5 py-3 border-b border-white/10">
            <input
              autoFocus
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTodoCreate();
                if (e.key === 'Escape') setAddingTodo(false);
              }}
              placeholder="New task..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary/40"
              data-testid="new-todo-input"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleTodoCreate}
                className="text-xs text-primary hover:text-primary/80 font-mono transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setAddingTodo(false)}
                className="text-xs text-white/30 hover:text-white/60 font-mono transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {(['approval_needed', 'waiting', 'completed'] as TodoStatus[]).map((status) => {
            const { label, icon: Icon, color } = statusMeta[status];
            const items = todosByStatus[status];
            return (
              <div key={status}>
                <div className={cn('flex items-center gap-2 mb-3', color)}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="font-mono text-[10px] uppercase tracking-widest">{label}</span>
                  <span className="text-[10px] opacity-50">({items.length})</span>
                </div>
                <div className="space-y-2">
                  {items.length === 0 && (
                    <p className="text-xs text-white/15 font-mono pl-1">—</p>
                  )}
                  {items.map((todo) => (
                    <div
                      key={todo.id}
                      className="group flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 cursor-pointer hover:border-white/10 transition-colors"
                      onClick={() => cycleTodoStatus(todo.id, todo.status as TodoStatus)}
                      data-testid={`todo-item-${todo.id}`}
                      title="Click to advance status"
                    >
                      <div className={cn('mt-0.5 w-3.5 h-3.5 flex-shrink-0', color)}>
                        <Icon className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/70 leading-snug break-words">
                          {todo.title}
                        </p>
                        {todo.description && (
                          <p className="text-xs text-white/30 mt-1 leading-snug">
                            {todo.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backdrop for todo board on mobile */}
      {todoBoardOpen && (
        <div
          className="absolute inset-0 z-40 md:hidden"
          onClick={() => setTodoBoardOpen(false)}
        />
      )}
    </div>
  );
}
