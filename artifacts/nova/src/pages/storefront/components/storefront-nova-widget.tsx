import { useState, useRef, useEffect } from 'react';
import { useCreateConversation, useGetConversation } from '@workspace/api-client-react';
import { streamNovaMessage } from '@/lib/nova-stream';
import { MessageSquare, X, Send, Cpu, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function StorefrontNovaWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: "Hello. I'm Nova, the AI concierge for AI&U. What kind of system are you looking for today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createConv = useCreateConversation();

  const handleOpen = () => {
    setIsOpen(true);
    if (!hasOpened && !conversationId) {
      setHasOpened(true);
      createConv.mutate(
        { data: { door: 'storefront', title: 'Storefront Chat' } },
        {
          onSuccess: (data) => {
            setConversationId(data.id);
          }
        }
      );
    }
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !conversationId || isStreaming) return;

    const userMessage = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Add empty assistant message to stream into
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    setIsStreaming(true);

    try {
      await streamNovaMessage(
        conversationId,
        userMessage,
        (chunk) => {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content += chunk;
            return newMessages;
          });
        },
        () => {
          setIsStreaming(false);
        }
      );
    } catch (err) {
      console.error("Failed to stream", err);
      setIsStreaming(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen ? (
        <div className="w-80 sm:w-[380px] h-[500px] max-h-[calc(100vh-100px)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 fade-in-0 duration-300">
          {/* Header */}
          <div className="h-14 bg-muted/30 border-b border-border flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>
                <Sparkles className="w-4 h-4 relative z-10" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm">Nova</h3>
                <p className="text-[10px] text-primary font-mono uppercase tracking-widest">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex max-w-[85%]", msg.role === 'user' ? "ml-auto" : "mr-auto")}>
                <div className={cn(
                  "p-3 rounded-2xl text-sm",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground rounded-tr-sm" 
                    : "bg-muted text-foreground rounded-tl-sm border border-border/50"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isStreaming && (
               <div className="flex max-w-[85%] mr-auto">
                <div className="p-3 rounded-2xl text-sm bg-muted text-foreground rounded-tl-sm border border-border/50 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-bounce delay-300"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-muted/10 border-t border-border mt-auto">
            <div className="relative">
              <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Nova..."
                className="pr-10 bg-background border-border"
                disabled={isStreaming}
              />
              <Button 
                type="submit" 
                size="icon" 
                variant="ghost" 
                className="absolute right-1 top-1 w-8 h-8 text-primary hover:text-primary hover:bg-primary/10"
                disabled={isStreaming || !inputValue.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <button 
          onClick={handleOpen}
          className="group w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all duration-300"
        >
          <Sparkles className="w-6 h-6 group-hover:hidden" />
          <MessageSquare className="w-6 h-6 hidden group-hover:block" />
        </button>
      )}
    </div>
  );
}
