"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Bot, User as UserIcon, Loader2, Trash2 } from "lucide-react";
import { type Book } from "@/lib/supabase";
import { motion } from "framer-motion";

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export function BookChat({ book }: { book: Book }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleClearChat = () => {
        setMessages([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMessage }],
                    book
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                console.error('Chat error:', data.error);
                setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="h-14 px-6 gap-2 text-base font-medium border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all shadow-sm cursor-pointer">
                    <MessageSquare className="w-5 h-5" />
                    Ask AI
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 gap-0 overflow-hidden border border-white/10 shadow-2xl bg-background/60 backdrop-blur-xl">
                {/* Decorative gradient blob */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none opacity-50" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none opacity-50" />

                <DialogHeader className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md z-10 flex flex-row items-center justify-between space-y-0">
                    <div className="flex flex-col gap-1.5">
                        <DialogTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight">
                            <div className="p-2 rounded-xl bg-white/10 ring-1 ring-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            Chat about "{book.title}"
                        </DialogTitle>
                        <DialogDescription className="text-xs uppercase tracking-widest font-medium text-muted-foreground/60 pl-12">
                            Powered by GPT-4o Mini
                        </DialogDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClearChat}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="Clear Chat"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Clear chat</span>
                    </Button>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth z-10" ref={scrollRef}>
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 backdrop-blur-md border border-white/10 shadow-lg">
                                <Bot className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-foreground mb-2">AI Book Assistant</h3>
                            <p className="text-sm text-muted-foreground/80 max-w-[260px] leading-relaxed">
                                I'm here to help! Ask me about the plot, characters, themes, or key takeaways.
                            </p>
                        </div>
                    )}
                    
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-white/10">
                                    <Bot className="w-4 h-4 text-black" />
                                </div>
                            )}
                            <div
                                className={`rounded-2xl px-5 py-3 max-w-[85%] text-sm leading-relaxed shadow-sm backdrop-blur-md border ${
                                    msg.role === 'user'
                                        ? 'bg-primary/90 text-primary-foreground rounded-br-sm border-primary/50 shadow-[0_4px_12px_rgba(var(--primary),0.2)]'
                                        : 'bg-white/10 text-foreground rounded-bl-sm border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
                                }`}
                            >
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                    
                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-lg shadow-white/10">
                                <Bot className="w-4 h-4 text-black" />
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-1.5 shadow-sm backdrop-blur-md">
                                <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-xl flex gap-3 z-10">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about this book..."
                        className="flex-1 bg-white/5 border-white/10 focus-visible:ring-primary/50 backdrop-blur-md text-sm h-11 px-4 rounded-xl placeholder:text-muted-foreground/50 shadow-inner transition-all focus:bg-white/10"
                        disabled={isLoading}
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        disabled={isLoading || !input.trim()} 
                        className="h-11 w-11 bg-white hover:bg-white/90 cursor-pointer shadow-lg shadow-white/10 transition-all active:scale-95 rounded-xl"
                    >
                        <Send className="w-5 h-5 text-black" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

