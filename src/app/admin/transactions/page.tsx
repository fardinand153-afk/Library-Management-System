"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTransactions } from "@/lib/supabase";
import { format } from "date-fns";

type TransactionWithDetails = {
    id: string;
    borrow_date: string;
    due_date: string;
    return_date?: string;
    status: string;
    profiles: { name: string; email: string };
    books: { title: string; author: string; isbn: string };
};

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            const data = await getTransactions();
            setTransactions(data as any);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (transactionId: string) => {
        try {
            const response = await fetch('/api/return', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId }),
            });

            if (response.ok) {
                await loadTransactions();
            } else {
                alert('Failed to return book');
            }
        } catch (error) {
            console.error('Error returning book:', error);
            alert('Failed to return book');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-blue-500/10 text-blue-500';
            case 'RETURNED': return 'bg-green-500/10 text-green-500';
            case 'OVERDUE': return 'bg-red-500/10 text-red-500';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Transaction Management</h1>

            <Card>
                <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8 text-muted-foreground">Loading...</p>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{transaction.books.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            by {transaction.books.author}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Borrowed by: {transaction.profiles.name} ({transaction.profiles.email})
                                        </p>
                                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                            <span>Borrowed: {format(new Date(transaction.borrow_date), 'MMM dd, yyyy')}</span>
                                            <span>Due: {format(new Date(transaction.due_date), 'MMM dd, yyyy')}</span>
                                            {transaction.return_date && (
                                                <span>Returned: {format(new Date(transaction.return_date), 'MMM dd, yyyy')}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                                            {transaction.status}
                                        </span>
                                        {transaction.status === 'ACTIVE' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleReturn(transaction.id)}
                                                className="cursor-pointer"
                                            >
                                                Mark as Returned
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {transactions.length === 0 && (
                                <p className="text-center py-8 text-muted-foreground">No transactions found</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
