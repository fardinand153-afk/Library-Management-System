"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBooks, createBook, updateBook, deleteBook, type Book } from "@/lib/supabase";
import { Plus, Edit, Trash2, Search } from "lucide-react";

export default function AdminBooksPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        isbn: "",
        genre: "",
        publisher: "",
        publication_year: "",
        description: "",
        cover_url: "",
        total_copies: "1",
    });

    useEffect(() => {
        loadBooks();
    }, []);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const bookData = {
                ...formData,
                publication_year: formData.publication_year ? parseInt(formData.publication_year) : undefined,
                total_copies: parseInt(formData.total_copies),
                available_copies: parseInt(formData.total_copies),
                status: 'AVAILABLE' as const,
            };

            if (editingBook) {
                await updateBook(editingBook.id, bookData);
            } else {
                await createBook(bookData);
            }

            await loadBooks();
            resetForm();
        } catch (error) {
            console.error('Error saving book:', error);
            alert('Failed to save book');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (book: Book) => {
        setEditingBook(book);
        setFormData({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            genre: book.genre,
            publisher: book.publisher || "",
            publication_year: book.publication_year?.toString() || "",
            description: book.description || "",
            cover_url: book.cover_url || "",
            total_copies: book.total_copies.toString(),
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this book?')) return;

        try {
            await deleteBook(id);
            await loadBooks();
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Failed to delete book');
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            author: "",
            isbn: "",
            genre: "",
            publisher: "",
            publication_year: "",
            description: "",
            cover_url: "",
            total_copies: "1",
        });
        setEditingBook(null);
        setShowForm(false);
    };

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.includes(searchQuery)
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Book Management</h1>
                <Button onClick={() => setShowForm(!showForm)} className="cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Book
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="author">Author *</Label>
                                    <Input
                                        id="author"
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="isbn">ISBN *</Label>
                                    <Input
                                        id="isbn"
                                        value={formData.isbn}
                                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="genre">Genre *</Label>
                                    <Input
                                        id="genre"
                                        value={formData.genre}
                                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="publisher">Publisher</Label>
                                    <Input
                                        id="publisher"
                                        value={formData.publisher}
                                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="publication_year">Publication Year</Label>
                                    <Input
                                        id="publication_year"
                                        type="number"
                                        value={formData.publication_year}
                                        onChange={(e) => setFormData({ ...formData, publication_year: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="total_copies">Total Copies *</Label>
                                    <Input
                                        id="total_copies"
                                        type="number"
                                        min="1"
                                        value={formData.total_copies}
                                        onChange={(e) => setFormData({ ...formData, total_copies: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cover_url">Cover URL</Label>
                                    <Input
                                        id="cover_url"
                                        value={formData.cover_url}
                                        onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={loading} className="cursor-pointer">
                                    {loading ? 'Saving...' : editingBook ? 'Update Book' : 'Add Book'}
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm} className="cursor-pointer">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search books..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8 text-muted-foreground">Loading...</p>
                    ) : (
                        <div className="space-y-4">
                            {filteredBooks.map((book) => (
                                <motion.div
                                    key={book.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{book.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {book.author} • {book.genre} • ISBN: {book.isbn}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Copies: {book.available_copies}/{book.total_copies} available
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(book)}
                                            className="cursor-pointer"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(book.id)}
                                            className="cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
