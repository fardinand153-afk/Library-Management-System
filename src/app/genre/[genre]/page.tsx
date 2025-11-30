"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Library, LogOut, BookMarked, ArrowLeft } from "lucide-react";
import { getBooks, type Book } from "@/lib/supabase";
import { signOut } from "@/lib/auth";
import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/components/providers/AuthProvider";

export default function GenrePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const genre = decodeURIComponent(params.genre as string);

    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBooks();
    }, [genre]);

    const loadBooks = async () => {
        try {
            const allBooks = await getBooks();
            // Filter books by genre client-side since our getBooks fetches all
            // In a real app with many books, we'd want a specific API endpoint
            const genreBooks = allBooks.filter(b => b.genre === genre);
            setBooks(genreBooks);
        } catch (error) {
            console.error('Error loading books:', error);
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

    const handleBorrow = async (bookId: string) => {
        if (!user) {
            alert('Please login to borrow books');
            router.push('/login');
            return;
        }

        try {
            const response = await fetch('/api/borrow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId, userId: user.id }),
            });

            if (response.ok) {
                alert('Book borrowed successfully!');
                loadBooks();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to borrow book');
            }
        } catch (error) {
            console.error('Error borrowing book:', error);
            alert('Failed to borrow book');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Navbar */}
            <header className="sticky top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/catalog" className="flex items-center gap-2 cursor-pointer">
                            <Library className="w-6 h-6 text-primary" />
                            <span className="text-xl font-bold tracking-tight">LMS</span>
                        </Link>
                        <nav className="hidden md:flex gap-6 text-sm font-medium">
                            <Link href="/browse" className="text-foreground hover:text-primary transition-colors cursor-pointer">
                                Browse Books
                            </Link>
                            <Link href="/catalog" className="text-foreground hover:text-primary transition-colors cursor-pointer">
                                Catalog
                            </Link>
                            <Link href="/my-books" className="hover:text-primary transition-colors cursor-pointer">
                                My Books
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <Button variant="ghost" size="sm" className="cursor-pointer" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Breadcrumbs />
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">{genre} Books</h1>
                    <p className="text-muted-foreground">
                        Explore our collection of {genre.toLowerCase()} books
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">Loading books...</p>
                    </div>
                ) : books.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {books.map((book) => (
                            <CompactBookCard key={book.id} book={book} onBorrow={handleBorrow} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
                        <p className="text-muted-foreground">No books found in this genre.</p>
                        <Button variant="link" onClick={() => router.push('/browse')} className="mt-2">
                            Browse all books
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}

function CompactBookCard({ book, onBorrow }: { book: Book; onBorrow: (id: string) => void }) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="group"
        >
            <Card className="overflow-hidden border-border hover:border-primary/50 transition-all duration-300 h-full flex flex-col text-sm">
                <Link href={`/books/${book.id}`} className="cursor-pointer">
                    <div className="aspect-[2/3] relative bg-muted overflow-hidden">
                        <img
                            src={book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f'}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-1 right-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold backdrop-blur-sm ${book.status === 'AVAILABLE'
                                ? 'bg-green-500/90 text-white'
                                : 'bg-orange-500/90 text-white'
                                }`}>
                                {book.status === 'AVAILABLE' ? 'AVL' : 'OUT'}
                            </span>
                        </div>
                    </div>
                </Link>
                <CardContent className="p-3 flex-1 flex flex-col gap-1">
                    <Link href={`/books/${book.id}`} className="cursor-pointer">
                        <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors" title={book.title}>
                            {book.title}
                        </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
                    <Button
                        size="sm"
                        variant="secondary"
                        className="w-full mt-auto h-7 text-xs cursor-pointer"
                        disabled={book.status !== 'AVAILABLE'}
                        onClick={(e) => {
                            e.stopPropagation();
                            onBorrow(book.id);
                        }}
                    >
                        {book.status === 'AVAILABLE' ? 'Borrow' : 'Unavailable'}
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}
