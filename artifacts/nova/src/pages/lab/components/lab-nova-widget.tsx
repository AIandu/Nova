import { useState, useRef, useEffect } from 'react';
import { useCreateConversation } from '@workspace/api-client-react';
import { streamNovaMessage } from '@/lib/nova-stream';
import { Terminal, Send, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function LabNovaWidget({ projectName }: { projectName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: `[NOVA_INSTANCE_ACTIVE] Subject: ${projectName}. Awaiting query.` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createConv = useCreateConversation();

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && !hasOpened && !conversationId) {
      setHasOpened(true);
      createConv.mutate(
        { data: { door: 'lab', title: `Query: ${projectName}` } },
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
    <div className="fixed bottom-0 right-6 md:right-12 z-50 w-full md:w-[450px]">
      <div className="border border-border border-b-0 bg-card/95 backdrop-blur-md flex flex-col font-mono shadow-2xl">
        {/* Header Toggle */}
        <button 
          onClick={handleOpen}
          className="w-full px-4 py-3 flex items-center justify-between text-xs text-muted-foreground hover:text-primary transition-colors border-b border-border/50"
        >
          <div className="flex items-center">
            <Terminal className="w-4 h-4 mr-2" />
            <span className="uppercase tracking-widest">NOVA_TERMINAL // {projectName}</span>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {/* Content */}
        {isOpen && (
          <div className="h-[400px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                  <span className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest">
                    {msg.role === 'user' ? 'USER_INPUT' : 'NOVA_OUTPUT'}
                  </span>
                  <div className={cn(
                    "px-3 py-2 border max-w-[90%]",
                    msg.role === 'user' 
                      ? "bg-primary/10 border-primary/30 text-primary" 
                      : "bg-muted/30 border-border text-foreground/90"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isStreaming && (
                <div className="flex flex-col items-start">
                   <span className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest">NOVA_OUTPUT</span>
                   <div className="px-3 py-2 border bg-muted/30 border-border text-foreground/90 animate-pulse">
                     [PROCESSING_QUERY...]
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-2 border-t border-border flex gap-2 bg-background/50">
              <div className="flex-1 relative flex items-center">
                <span className="absolute left-3 text-primary">{`>`}</span>
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter query..."
                  className="w-full bg-transparent border border-border h-10 pl-8 pr-4 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                  disabled={isStreaming}
                />
              </div>
              <Button 
                type="submit" 
                variant="outline"
                className="rounded-none border-border hover:bg-primary/10 hover:text-primary hover:border-primary/50 w-10 p-0"
                disabled={isStreaming || !inputValue.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
