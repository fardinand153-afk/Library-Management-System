import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { transactionId } = await request.json();

        if (!transactionId) {
            return NextResponse.json(
                { error: 'Transaction ID is required' },
                { status: 400 }
            );
        }

        // Update transaction
        const { data: transaction, error } = await supabase
            .from('transactions')
            .update({
                return_date: new Date().toISOString(),
                status: 'RETURNED',
            })
            .eq('id', transactionId)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: 'Failed to return book' },
                { status: 500 }
            );
        }

        if (!transaction) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        // Increment available copies
        const { data: book, error: bookError } = await supabase
            .from('books')
            .select('available_copies, total_copies')
            .eq('id', transaction.book_id)
            .single();

        if (!bookError && book) {
            const newAvailableCopies = book.available_copies + 1;
            const newStatus = newAvailableCopies > 0 ? 'AVAILABLE' : 'BORROWED';

            await supabase
                .from('books')
                .update({
                    available_copies: newAvailableCopies,
                    status: newStatus
                })
                .eq('id', transaction.book_id);
        }

        return NextResponse.json({ transaction }, { status: 200 });
    } catch (error) {
        console.error('Return error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
