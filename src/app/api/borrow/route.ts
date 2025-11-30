import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { bookId, userId } = await request.json();

        if (!bookId || !userId) {
            return NextResponse.json(
                { error: 'Book ID and User ID are required' },
                { status: 400 }
            );
        }

        // Check if book is available
        const { data: book, error: bookError } = await supabase
            .from('books')
            .select('*')
            .eq('id', bookId)
            .single();

        if (bookError || !book) {
            return NextResponse.json(
                { error: 'Book not found' },
                { status: 404 }
            );
        }

        if (book.available_copies <= 0) {
            return NextResponse.json(
                { error: 'Book is not available' },
                { status: 400 }
            );
        }

        // Check if user has already borrowed 3 books
        const { count, error: countError } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'ACTIVE');

        if (countError) {
            console.error('Error checking active loans:', countError);
            return NextResponse.json(
                { error: 'Failed to validate borrowing limit' },
                { status: 500 }
            );
        }

        if (count !== null && count >= 3) {
            return NextResponse.json(
                { error: 'You cannot borrow more than 3 books at a time' },
                { status: 400 }
            );
        }

        // Check if user has already borrowed THIS specific book
        const { data: existingLoan, error: existingLoanError } = await supabase
            .from('transactions')
            .select('id')
            .eq('user_id', userId)
            .eq('book_id', bookId)
            .eq('status', 'ACTIVE')
            .single();

        if (existingLoan) {
            return NextResponse.json(
                { error: 'You have already borrowed this book' },
                { status: 400 }
            );
        }

        // Create transaction (14 days loan period)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        const { data: transaction, error: transactionError } = await supabase
            .from('transactions')
            .insert({
                user_id: userId,
                book_id: bookId,
                due_date: dueDate.toISOString(),
                status: 'ACTIVE',
            })
            .select()
            .single();

        if (transactionError) {
            console.error('Transaction error details:', transactionError);
            return NextResponse.json(
                { error: `Failed to create transaction: ${transactionError.message}` },
                { status: 500 }
            );
        }

        // Decrement available copies
        const newAvailableCopies = book.available_copies - 1;
        const newStatus = newAvailableCopies <= 0 ? 'BORROWED' : 'AVAILABLE';

        const { error: updateError } = await supabase
            .from('books')
            .update({
                available_copies: newAvailableCopies,
                status: newStatus
            })
            .eq('id', bookId);

        if (updateError) {
            console.error('Error updating book copies:', updateError);
            // Transaction was created but book update failed
            // You might want to rollback the transaction here in production
        }

        return NextResponse.json({ transaction }, { status: 201 });
    } catch (error) {
        console.error('Borrow error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
