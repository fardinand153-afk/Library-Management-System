import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Book type
export type Book = {
    id: string;
    title: string;
    author: string;
    isbn: string;
    genre: string;
    publisher?: string;
    publication_year?: number;
    description?: string;
    cover_url?: string;
    status: 'AVAILABLE' | 'BORROWED' | 'RESERVED' | 'MAINTENANCE';
    total_copies: number;
    available_copies: number;
    created_at: string;
};

// Profile type
export type Profile = {
    id: string;
    email: string;
    name: string;
    role: 'STUDENT' | 'LIBRARIAN';
    phone?: string;
    address?: string;
    created_at: string;
};

// Transaction type
export type Transaction = {
    id: string;
    user_id: string;
    book_id: string;
    borrow_date: string;
    due_date: string;
    return_date?: string;
    status: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'LOST';
    created_at: string;
};

// =====================================================
// BOOKS FUNCTIONS
// =====================================================

export async function getBooks() {
    const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title');

    if (error) throw error;
    return data as Book[];
}

export async function getBookById(id: string) {
    const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as Book;
}

export async function searchBooks(query: string) {
    const { data, error } = await supabase
        .from('books')
        .select('*')
        .or(`title.ilike.%${query}%,author.ilike.%${query}%,isbn.ilike.%${query}%`)
        .order('title');

    if (error) throw error;
    return data as Book[];
}

export async function getBooksByGenre(genre: string) {
    const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('genre', genre)
        .order('title');

    if (error) throw error;
    return data as Book[];
}

export async function createBook(book: Partial<Book>) {
    const { data, error } = await supabase
        .from('books')
        .insert(book)
        .select()
        .single();

    if (error) throw error;
    return data as Book;
}

export async function updateBook(id: string, updates: Partial<Book>) {
    const { data, error } = await supabase
        .from('books')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Book;
}

export async function deleteBook(id: string) {
    const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// =====================================================
// PROFILES FUNCTIONS
// =====================================================

export async function getProfiles() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

    if (error) throw error;
    return data as Profile[];
}

export async function updateProfile(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Profile;
}

// =====================================================
// TRANSACTIONS FUNCTIONS
// =====================================================

export async function getTransactions() {
    const { data, error } = await supabase
        .from('transactions')
        .select(`
      *,
      profiles (name, email),
      books (title, author, isbn)
    `)
        .order('borrow_date', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getUserTransactions(userId: string) {
    const { data, error } = await supabase
        .from('transactions')
        .select(`
      *,
      books (id, title, author, isbn, cover_url, genre)
    `)
        .eq('user_id', userId)
        .order('borrow_date', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getActiveTransactions() {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .in('status', ['ACTIVE', 'OVERDUE']);

    if (error) throw error;
    return data as Transaction[];
}

export async function createTransaction(transaction: Partial<Transaction>) {
    const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();

    if (error) throw error;
    return data as Transaction;
}

export async function returnBook(transactionId: string) {
    const { data, error } = await supabase
        .from('transactions')
        .update({
            return_date: new Date().toISOString(),
            status: 'RETURNED'
        })
        .eq('id', transactionId)
        .select()
        .single();

    if (error) throw error;
    return data as Transaction;
}

export { supabase };
