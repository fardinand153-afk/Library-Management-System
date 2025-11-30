"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Library, LogOut, BookMarked, Calendar, User, Building2, Hash, BookOpen, Star, ChevronRight, Home } from "lucide-react";
import { getBookById, type Book } from "@/lib/supabase";
import { signOut } from "@/lib/auth";
import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useAuth } from "@/components/providers/AuthProvider";

import { BorrowModal } from "@/components/borrow-modal";
import { BookChat } from "@/components/book-chat";

export default function BookDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const bookId = params.id as string;

    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showBorrowModal, setShowBorrowModal] = useState(false);

    useEffect(() => {
        if (bookId) {
            loadBook();
        }
    }, [bookId]);

    const loadBook = async () => {
        try {
            const data = await getBookById(bookId);
            setBook(data);
        } catch (error) {
            console.error('Error loading book:', error);
            setError("Failed to load book details.");
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

    const handleBorrowClick = () => {
        if (!user) {
            alert('Please login to borrow books');
            router.push('/login');
            return;
        }
        setShowBorrowModal(true);
    };

    const handleBorrowConfirm = async () => {
        if (!user || !book) return;

        const response = await fetch('/api/borrow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId: book.id, userId: user.id }),
        });

        if (response.ok) {
            await loadBook(); // Reload to update status
        } else {
            const data = await response.json();
            return data.error || 'Failed to borrow book';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-12 w-12 bg-primary/20 rounded-full" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
                <p className="text-destructive text-lg font-medium">{error || "Book not found"}</p>
                <Button onClick={() => router.back()} variant="outline">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
            {/* Navbar */}
            <header className="fixed top-0 w-full z-50 bg-background/0 backdrop-blur-sm transition-all duration-300 bg-gradient-to-b from-background/80 to-transparent">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/catalog" className="flex items-center gap-2 cursor-pointer group">
                            <Library className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                            <span className="text-2xl font-bold tracking-tighter">LMS</span>
                        </Link>
                        <nav className="hidden md:flex gap-8 text-sm font-medium">
                            <Link href="/browse" className="text-foreground/80 hover:text-primary transition-colors cursor-pointer">
                                Browse
                            </Link>
                            <Link href="/catalog" className="text-foreground/80 hover:text-primary transition-colors cursor-pointer">
                                Catalog
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <Button variant="ghost" size="sm" className="cursor-pointer hover:bg-white/10" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="relative w-full overflow-x-hidden">
                {/* Hero Section with Netflix-style Layout */}
                <div className="relative w-full min-h-screen flex items-center">

                    {/* Background Image (Faded to Right) */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden">
                        <div className="absolute inset-0 bg-background z-0" />
                        <motion.div
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="absolute left-0 top-0 bottom-0 w-[70%] z-0"
                        >
                            <img
                                src={book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f'}
                                alt=""
                                className="w-full h-full object-cover object-center mask-image-gradient"
                                style={{
                                    maskImage: 'linear-gradient(to right, black 0%, black 40%, transparent 100%)',
                                    WebkitMaskImage: 'linear-gradient(to right, black 0%, black 40%, transparent 100%)'
                                }}
                            />
                            {/* Overlay for better text readability if needed */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-background/40 to-background" />
                        </motion.div>
                    </div>

                    {/* Content Container */}
                    <div className="container mx-auto px-4 relative z-10 pt-20">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left Spacer (covers the image area) */}
                            <div className="hidden lg:block" />

                            {/* Right Content (Important Info) */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="flex flex-col gap-6"
                            >
                                {/* Custom Breadcrumbs */}
                                <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                                    <Link href="/catalog" className="hover:text-primary transition-colors flex items-center gap-1">
                                        <Home className="w-3 h-3" />
                                        Home
                                    </Link>
                                    <ChevronRight className="w-3 h-3" />
                                    <Link href="/catalog" className="hover:text-primary transition-colors">
                                        Catalog
                                    </Link>
                                    <ChevronRight className="w-3 h-3" />
                                    <span className="text-foreground font-medium truncate max-w-[200px]">{book.title}</span>
                                </nav>

                                {/* Title and Availability Row */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none text-foreground">
                                            {book.title}
                                        </h1>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6 mt-2">
                                        <div className="flex items-center gap-2 text-xl text-muted-foreground">
                                            <User className="w-5 h-5" />
                                            <span>{book.author}</span>
                                        </div>
                                        <div className="w-px h-6 bg-border" />
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <Star className="w-5 h-5 fill-current" />
                                            <span className="font-bold text-foreground">4.8</span>
                                        </div>
                                        <div className="w-px h-6 bg-border" />
                                        <span className="text-primary font-medium tracking-wide uppercase text-sm border border-primary/30 px-3 py-1 rounded-full bg-primary/10">
                                            {book.genre}
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl line-clamp-4 hover:line-clamp-none transition-all duration-300">
                                    {book.description || "No description available for this book. Dive into the pages to discover the story within."}
                                </p>

                                {/* Action Buttons & Availability */}
                                <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6 mt-4">
                                    <div className="flex gap-4">
                                        <Button
                                            size="lg"
                                            className="h-14 px-8 text-lg gap-3 cursor-pointer shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                                            disabled={book.status !== 'AVAILABLE'}
                                            onClick={handleBorrowClick}
                                        >
                                            {book.status === 'AVAILABLE' ? (
                                                <>
                                                    <BookMarked className="w-6 h-6" /> Borrow Now
                                                </>
                                            ) : (
                                                'Currently Unavailable'
                                            )}
                                        </Button>
                                        <BookChat book={book} />
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Availability</span>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${book.status === 'AVAILABLE' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                                            <span className={`text-lg font-medium ${book.status === 'AVAILABLE' ? 'text-green-500' : 'text-red-500'}`}>
                                                {book.status === 'AVAILABLE' ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                            <span className="text-sm text-muted-foreground ml-1">
                                                ({book.available_copies} of {book.total_copies} copies)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Details Grid */}
                                <div className="grid grid-cols-2 gap-6 mt-8 border-t border-border/50 pt-8">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                            <Building2 className="w-4 h-4" /> Publisher
                                        </div>
                                        <p className="font-medium">{book.publisher || "Unknown"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                            <Calendar className="w-4 h-4" /> Year
                                        </div>
                                        <p className="font-medium">{book.publication_year || "N/A"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                            <Hash className="w-4 h-4" /> ISBN
                                        </div>
                                        <p className="font-mono text-sm">{book.isbn}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                            <BookOpen className="w-4 h-4" /> Format
                                        </div>
                                        <p className="font-medium">Hardcover</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            <BorrowModal
                isOpen={showBorrowModal}
                onClose={() => setShowBorrowModal(false)}
                onConfirm={handleBorrowConfirm}
                book={book}
            />
        </div>
    );
}
