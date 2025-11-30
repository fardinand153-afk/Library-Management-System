"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import { format, addDays } from "date-fns";
import { type Book } from "@/lib/supabase";

interface BorrowModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<string | void | null>;
    book: Book;
}

export function BorrowModal({ isOpen, onClose, onConfirm, book }: BorrowModalProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const returnDate = addDays(new Date(), 14);

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await onConfirm();
            if (typeof result === 'string') {
                setError(result);
                return;
            }
            
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);
        } catch (error: any) {
            console.error("Borrow failed", error);
            setError(error.message || "Failed to borrow book");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center py-10 text-center space-y-4"
                        >
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold">Success!</h2>
                            <p className="text-muted-foreground">
                                You have successfully borrowed <br />
                                <span className="font-semibold text-foreground">{book.title}</span>
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <DialogHeader>
                                <DialogTitle>Confirm Borrow</DialogTitle>
                                <DialogDescription>
                                    Please review the details below before confirming.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-6 py-6">
                                <div className="flex gap-4">
                                    <div className="w-20 h-28 bg-muted rounded overflow-hidden flex-shrink-0">
                                        <img
                                            src={book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f'}
                                            alt={book.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold line-clamp-2">{book.title}</h3>
                                        <p className="text-sm text-muted-foreground">{book.author}</p>
                                        <div className="text-xs bg-secondary px-2 py-1 rounded inline-block mt-1">
                                            ISBN: {book.isbn}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 border-t pt-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Calendar className="w-4 h-4" /> Borrow Date
                                        </span>
                                        <span className="font-medium">{format(new Date(), 'MMM dd, yyyy')}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Calendar className="w-4 h-4" /> Return Date
                                        </span>
                                        <span className="font-medium text-primary">{format(returnDate, 'MMM dd, yyyy')}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" /> Duration
                                        </span>
                                        <span className="font-medium">14 Days</span>
                                    </div>
                                </div>

                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-3 items-start">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-yellow-700 dark:text-yellow-500">
                                        Please return the book by the due date to avoid late fees. You can view your borrowed books in "My Books".
                                    </p>
                                </div>

                                {error && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm font-medium text-yellow-700 dark:text-yellow-500">
                                            {error}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={onClose} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button onClick={handleConfirm} disabled={loading} className="gap-2">
                                    {loading ? 'Processing...' : 'Confirm Borrow'}
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
