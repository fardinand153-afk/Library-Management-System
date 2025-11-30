"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, BookOpen, LogOut, ChevronDown, BookMarked, Library, Menu } from "lucide-react";
import { getBooks, searchBooks as searchBooksDB, type Book } from "@/lib/supabase";
import { signOut } from "@/lib/auth";
import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { BorrowModal } from "@/components/borrow-modal";
import { RecommendationChat } from "@/components/recommendation-chat";

export default function CatalogPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [showGenreDropdown, setShowGenreDropdown] = useState(false);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [showBorrowModal, setShowBorrowModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Protect the route
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Load books on mount
    useEffect(() => {
        if (user) {
            loadBooks();
        }
    }, [user]);

    const loadBooks = async () => {
        try {
            const data = await getBooks();
            setBooks(data);
        } catch (error) {
            console.error('Error loading books:', error);
        } finally {
            setLoading(false);
        }
    };

    // Search books
    useEffect(() => {
        if (searchQuery) {
            const searchTimeout = setTimeout(async () => {
                try {
                    const results = await searchBooksDB(searchQuery);
                    setBooks(results);
                } catch (error) {
                    console.error('Error searching books:', error);
                }
            }, 300);
            return () => clearTimeout(searchTimeout);
        } else {
            loadBooks();
        }
    }, [searchQuery]);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    // Group books by genre
    const genres = Array.from(new Set(books.map(b => b.genre)));
    const booksByGenre = genres.map(genre => ({
        genre,
        books: books.filter(b => b.genre === genre)
    }));

    const filteredBooks = selectedGenre
        ? books.filter(book => book.genre === selectedGenre)
        : books;

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const handleBorrowClick = (book: Book) => {
        if (!user) {
            alert('Please login to borrow books');
            router.push('/login');
            return;
        }
        setSelectedBook(book);
        setShowBorrowModal(true);
    };

    const handleBorrowConfirm = async () => {
        if (!user || !selectedBook) return;

        const response = await fetch('/api/borrow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId: selectedBook.id, userId: user.id }),
        });

        if (response.ok) {
            await loadBooks();
        } else {
            const data = await response.json();
            return data.error || 'Failed to borrow book';
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
                            <div className="relative">
                                <button
                                    onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                                    className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                                >
                                    Genres
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                {showGenreDropdown && (
                                    <div className="absolute top-full mt-2 bg-card border border-border rounded-lg shadow-lg py-2 min-w-[160px]">
                                        {genres.map((genre) => (
                                            <Link
                                                key={genre}
                                                href={`/genre/${encodeURIComponent(genre)}`}
                                                onClick={() => setShowGenreDropdown(false)}
                                                className="block w-full text-left px-4 py-2 hover:bg-accent transition-colors cursor-pointer"
                                            >
                                                {genre}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Link href="/my-books" className="hover:text-primary transition-colors cursor-pointer">
                                My Books
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search books, authors..."
                                className="pl-8 bg-secondary/50 border-border focus-visible:ring-1 focus-visible:ring-primary"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            <ModeToggle />
                            <Button variant="ghost" size="sm" className="cursor-pointer" onClick={handleLogout}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>

                        {/* Mobile Menu */}
                        <div className="md:hidden flex items-center gap-2">
                            <ModeToggle />
                            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="cursor-pointer">
                                        <Menu className="w-5 h-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                    <SheetHeader>
                                        <SheetTitle className="flex items-center gap-2">
                                            <Library className="w-5 h-5 text-primary" />
                                            Menu
                                        </SheetTitle>
                                    </SheetHeader>
                                    <div className="flex flex-col gap-6 mt-8">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search books..."
                                                className="pl-8 bg-secondary/50"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <nav className="flex flex-col gap-4">
                                            <Link 
                                                href="/browse" 
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors"
                                            >
                                                <BookOpen className="w-5 h-5" />
                                                Browse Books
                                            </Link>
                                            <Link 
                                                href="/my-books" 
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors"
                                            >
                                                <BookMarked className="w-5 h-5" />
                                                My Books
                                            </Link>
                                            <div className="space-y-3">
                                                <p className="text-sm font-medium text-muted-foreground">Genres</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {genres.map((genre) => (
                                                        <Link
                                                            key={genre}
                                                            href={`/genre/${encodeURIComponent(genre)}`}
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className="text-sm hover:text-primary transition-colors py-1"
                                                        >
                                                            {genre}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </nav>
                                        <div className="pt-6 border-t border-border">
                                            <Button variant="destructive" className="w-full justify-start cursor-pointer" onClick={handleLogout}>
                                                <LogOut className="w-4 h-4 mr-2" />
                                                Logout
                                            </Button>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </header>

            <main className="pb-20">
                {/* Hero/Featured Section */}
                {!searchQuery && !selectedGenre && books.length > 0 && (
                    <div className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/20 border-b border-border overflow-hidden">
                        <div className="absolute inset-0">
                            <img
                                src={books[0].cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f'}
                                alt={books[0].title}
                                className="w-full h-full object-cover opacity-15"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
                        </div>

                        <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="max-w-4xl"
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider mb-6 backdrop-blur-sm border border-primary/20">
                                    <BookMarked className="w-3 h-3" />
                                    Featured Book
                                </div>
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-4 drop-shadow-sm">
                                    {books[0].title}
                                </h1>
                                <p className="text-lg md:text-xl text-muted-foreground mb-2 font-medium">
                                    by {books[0].author}
                                </p>
                                <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-2xl leading-relaxed line-clamp-3">
                                    {books[0].description || 'Discover this amazing book in our collection. A must-read for enthusiasts of the genre.'}
                                </p>
                                <div className="flex flex-wrap gap-4 items-center">
                                    <Button size="lg" className="h-12 px-8 gap-2 text-base shadow-lg shadow-primary/20 hover:scale-105 transition-transform cursor-pointer w-full sm:w-auto" onClick={() => handleBorrowClick(books[0])}>
                                        <BookMarked className="w-5 h-5" /> Borrow Now
                                    </Button>
                                    <Link href={`/books/${books[0].id}`} className="w-full sm:w-auto">
                                        <Button size="lg" variant="outline" className="w-full h-12 px-8 gap-2 text-base hover:bg-background/50 backdrop-blur-sm border-primary/20 cursor-pointer">
                                            <BookOpen className="w-5 h-5" /> Read Details
                                        </Button>
                                    </Link>
                                    <div className="hidden sm:block w-px h-8 bg-border mx-2" />
                                    <RecommendationChat books={books} variant="button" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="container mx-auto px-4 py-8">
                    <Breadcrumbs />

                    {loading ? (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground">Loading books...</p>
                        </div>
                    ) : searchQuery || selectedGenre ? (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">
                                {selectedGenre ? `${selectedGenre} Books` : 'Search Results'}
                                <span className="text-muted-foreground text-lg ml-2">({filteredBooks.length})</span>
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                {filteredBooks.map((book) => (
                                    <BookCard key={book.id} book={book} onBorrow={handleBorrowClick} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {booksByGenre.map((category) => (
                                <div key={category.genre} className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl md:text-2xl font-semibold">{category.genre}</h2>
                                        <Link href={`/genre/${encodeURIComponent(category.genre)}`}>
                                            <Button variant="ghost" size="sm" className="cursor-pointer">
                                                View All
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                        {category.books.slice(0, 5).map((book) => (
                                            <BookCard key={book.id} book={book} onBorrow={handleBorrowClick} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {selectedBook && (
                <BorrowModal
                    isOpen={showBorrowModal}
                    onClose={() => setShowBorrowModal(false)}
                    onConfirm={handleBorrowConfirm}
                    book={selectedBook}
                />
            )}
        </div>
    );
}

function BookCard({ book, onBorrow }: { book: Book; onBorrow: (book: Book) => void }) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group"
        >
            <Card className="overflow-hidden border-border hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                <Link href={`/books/${book.id}`} className="cursor-pointer">
                    <div className="aspect-[2/3] relative bg-muted overflow-hidden">
                        <img
                            src={book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f'}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 rounded-md text-xs font-semibold backdrop-blur-sm ${book.status === 'AVAILABLE'
                                ? 'bg-green-500/90 text-white'
                                : 'bg-orange-500/90 text-white'
                                }`}>
                                {book.status === 'AVAILABLE' ? 'Available' : 'Borrowed'}
                            </span>
                        </div>
                    </div>
                </Link>
                <CardContent className="p-4 flex-1 flex flex-col">
                    <Link href={`/books/${book.id}`} className="cursor-pointer">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                            {book.title}
                        </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mb-2">{book.author}</p>
                    <p className="text-xs text-muted-foreground mb-3">ISBN: {book.isbn}</p>
                    <Button
                        size="sm"
                        className="w-full mt-auto cursor-pointer"
                        disabled={book.status !== 'AVAILABLE'}
                        onClick={(e) => {
                            e.stopPropagation();
                            onBorrow(book);
                        }}
                    >
                        {book.status === 'AVAILABLE' ? (
                            <>
                                <BookMarked className="w-3 h-3 mr-1" />
                                Borrow
                            </>
                        ) : (
                            'Unavailable'
                        )}
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}
