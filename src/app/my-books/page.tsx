"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    BookMarked, Calendar, AlertCircle, User, Mail, Library, 
    LogOut, Clock, TrendingUp, BookOpen, CheckCircle2, History as HistoryIcon,
    Search, Filter, ChevronRight
} from "lucide-react";
import { getUserTransactions } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { format, isPast, differenceInDays } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { ModeToggle } from "@/components/ui/mode-toggle";

type UserTransaction = {
    id: string;
    borrow_date: string;
    due_date: string;
    return_date?: string;
    status: string;
    books: {
        title: string;
        author: string;
        isbn: string;
        cover_url?: string;
        genre?: string;
    };
};

export default function MyBooksPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [transactions, setTransactions] = useState<UserTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

    useEffect(() => {
        if (user) {
            loadTransactions();
        }
    }, [user]);

    const loadTransactions = async () => {
        if (!user) return;

        try {
            const data = await getUserTransactions(user.id);
            setTransactions(data as any);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const activeTransactions = transactions.filter(t => t.status === 'ACTIVE' || t.status === 'OVERDUE');
    const pastTransactions = transactions.filter(t => t.status === 'RETURNED');

    return (
        <div className="min-h-screen bg-muted/20">
            {/* Navbar */}
            <header className="sticky top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/catalog" className="flex items-center gap-2 cursor-pointer group">
                            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                                <Library className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">LMS</span>
                        </Link>
                        <nav className="hidden md:flex gap-1">
                            <Link href="/browse" className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                Browse Books
                            </Link>
                            <Link href="/catalog" className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                Catalog
                            </Link>
                            <Link href="/my-books" className="px-4 py-2 rounded-md text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                My Books
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <Button variant="ghost" size="sm" className="cursor-pointer text-muted-foreground hover:text-foreground" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
                        <p className="text-muted-foreground animate-pulse">Fetching your library...</p>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Profile Header */}
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-background">
                                    {user?.name?.charAt(0).toUpperCase() || 'S'}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight">My Library</h1>
                                    <p className="text-muted-foreground">Welcome back, {user?.name}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 w-full md:w-auto">
                                <Card className="flex-1 md:w-32 bg-background/50 backdrop-blur-sm border-muted">
                                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                        <span className="text-2xl font-bold text-primary">{activeTransactions.length}</span>
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active</span>
                                    </CardContent>
                                </Card>
                                <Card className="flex-1 md:w-32 bg-background/50 backdrop-blur-sm border-muted">
                                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                        <span className="text-2xl font-bold text-foreground">{pastTransactions.length}</span>
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Returned</span>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex flex-col space-y-6">
                            <div className="flex items-center gap-2 border-b border-border/50 pb-1">
                                <button
                                    onClick={() => setActiveTab('current')}
                                    className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                                        activeTab === 'current' 
                                            ? 'text-primary' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Current Loans
                                    {activeTab === 'current' && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                        />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                                        activeTab === 'history' 
                                            ? 'text-primary' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Reading History
                                    {activeTab === 'history' && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                        />
                                    )}
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === 'current' ? (
                                    <motion.div
                                        key="current"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {activeTransactions.length === 0 ? (
                                            <EmptyState 
                                                icon={BookMarked}
                                                title="No active loans"
                                                description="You haven't borrowed any books yet. Explore our catalog to find your next read."
                                                actionLink="/catalog"
                                                actionText="Browse Catalog"
                                            />
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {activeTransactions.map((transaction) => (
                                                    <LoanCard key={transaction.id} transaction={transaction} />
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="history"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {pastTransactions.length === 0 ? (
                                            <EmptyState 
                                                icon={HistoryIcon}
                                                title="No reading history"
                                                description="Books you return will appear here."
                                            />
                                        ) : (
                                            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                                                <div className="divide-y divide-border">
                                                    {pastTransactions.map((transaction) => (
                                                        <HistoryRow key={transaction.id} transaction={transaction} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function LoanCard({ transaction }: { transaction: UserTransaction }) {
    const isOverdue = isPast(new Date(transaction.due_date)) && !transaction.return_date;
    const daysLeft = differenceInDays(new Date(transaction.due_date), new Date());
    const dueDate = new Date(transaction.due_date);
    
    // Calculate progress dynamically
    const totalLoanDays = differenceInDays(new Date(transaction.due_date), new Date(transaction.borrow_date)) || 14; 
    const daysPassed = totalLoanDays - daysLeft;
    const progress = Math.min(Math.max((daysPassed / totalLoanDays) * 100, 0), 100);

    return (
        <div className="group relative bg-card hover:bg-accent/5 rounded-xl border border-border p-4 transition-all hover:shadow-md flex gap-4 overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${isOverdue ? 'bg-destructive' : 'bg-primary/50'}`} />
            
            {/* Cover */}
            <Link href={`/books/${transaction.books.id || '#'}`} className="shrink-0 w-24 h-36 bg-muted rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                <img 
                    src={transaction.books.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f'} 
                    alt={transaction.books.title}
                    className="w-full h-full object-cover"
                />
            </Link>

            <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <Link href={`/books/${transaction.books.id || '#'}`} className="hover:text-primary transition-colors">
                            <h3 className="font-semibold line-clamp-2 leading-tight">{transaction.books.title}</h3>
                        </Link>
                        {isOverdue && (
                            <div className="text-destructive" title="Overdue">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{transaction.books.author}</p>
                    {transaction.books.genre && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                            {transaction.books.genre}
                        </span>
                    )}
                </div>

                <div className="mt-4 space-y-3">
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className={isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}>
                                {isOverdue ? "Overdue by " + Math.abs(daysLeft) + " days" : daysLeft + " days remaining"}
                            </span>
                            <span className="text-muted-foreground">{format(dueDate, "MMM d")}</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${isOverdue ? 'bg-destructive' : 'bg-primary'}`} 
                                style={{ width: `${isOverdue ? 100 : 100 - progress}%` }} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HistoryRow({ transaction }: { transaction: UserTransaction }) {
    return (
        <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group">
            <div className="shrink-0 w-12 h-16 bg-muted rounded overflow-hidden">
                <img 
                    src={transaction.books.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f'} 
                    alt={transaction.books.title}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate group-hover:text-primary transition-colors">{transaction.books.title}</h4>
                <p className="text-sm text-muted-foreground truncate">{transaction.books.author}</p>
            </div>
            <div className="hidden sm:block text-right text-sm">
                <p className="text-muted-foreground">Borrowed</p>
                <p className="font-medium">{format(new Date(transaction.borrow_date), 'MMM d, yyyy')}</p>
            </div>
            <div className="hidden sm:block text-right text-sm">
                <p className="text-muted-foreground">Returned</p>
                <p className="font-medium text-green-600 dark:text-green-500">
                    {transaction.return_date ? format(new Date(transaction.return_date), 'MMM d, yyyy') : '-'}
                </p>
            </div>
            <div className="px-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, title, description, actionLink, actionText }: any) {
    return (
        <Card className="border-dashed border-2 bg-transparent shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
                {actionLink && (
                    <Link href={actionLink}>
                        <Button className="gap-2 cursor-pointer">
                            <BookOpen className="w-4 h-4" />
                            {actionText}
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
