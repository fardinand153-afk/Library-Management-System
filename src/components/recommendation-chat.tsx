"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Bot, Trash2 } from "lucide-react";
import { type Book } from "@/lib/supabase";
import { motion } from "framer-motion";

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export function RecommendationChat({ books, variant = 'card' }: { books: Book[], variant?: 'card' | 'button' | 'compact' }) {
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
            const response = await fetch('/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMessage }],
                    books
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
                {variant === 'button' ? (
                     <Button size="lg" variant="ghost" className="h-12 px-6 gap-2 text-base backdrop-blur-sm border border-primary/20 hover:bg-primary/10 cursor-pointer w-full sm:w-auto">
                        <Sparkles className="w-5 h-5 text-primary" /> 
                        AI Book Concierge
                    </Button>
                ) : variant === 'compact' ? (
                     <Button size="sm" variant="outline" className="gap-2 text-xs backdrop-blur-sm cursor-pointer">
                        <Sparkles className="w-3 h-3 text-primary" /> 
                        Ask AI
                    </Button>
                ) : (
                    <div className="group relative p-6 rounded-xl bg-background/30 border border-white/10 backdrop-blur-md hover:bg-background/40 transition-all duration-300 cursor-pointer overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 shadow-lg shadow-primary/5 group-hover:scale-110 transition-transform duration-300">
                                <Sparkles className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-foreground/90">AI Book Concierge</h3>
                            <p className="text-sm text-muted-foreground/90 leading-relaxed mb-4">
                                Not sure what to read? Let our AI guide you to your next favorite book based on your mood.
                            </p>
                            <div className="flex items-center text-primary text-sm font-medium">
                                Get Recommendations
                                <Sparkles className="w-4 h-4 ml-2 animate-pulse" />
                            </div>
                        </div>
                    </div>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 gap-0 overflow-hidden border border-white/10 shadow-2xl bg-background/60 backdrop-blur-xl">
                            {/* Decorative gradient blob */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none opacity-50" />
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none opacity-50" />

                            <DialogHeader className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md z-10 flex flex-row items-center justify-between space-y-0">
                                <div className="flex flex-col gap-1.5">
                                    <DialogTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight">
                                        <div className="p-2 rounded-xl bg-white/10 ring-1 ring-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        Book Concierge
                                    </DialogTitle>
                                    <DialogDescription className="text-xs uppercase tracking-widest font-medium text-muted-foreground/60 pl-12">
                                        Personalized Picks
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
                                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-6 backdrop-blur-md border border-white/10 shadow-lg">
                                            <Sparkles className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="font-bold text-lg text-foreground mb-2">I can help you choose!</h3>
                                        <p className="text-sm text-muted-foreground/80 max-w-[260px] leading-relaxed">
                                            Tell me what genres you like, or a specific mood or plot you're looking for.
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
                                                <Sparkles className="w-4 h-4 text-black" />
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
                                            <Sparkles className="w-4 h-4 text-black" />
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
                                    placeholder="e.g., I want a mystery set in space..."
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

