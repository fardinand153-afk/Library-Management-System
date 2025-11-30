export type Role = 'LIBRARIAN' | 'STUDENT';

export type User = {
    id: string;
    email: string;
    name: string;
    role: Role;
    created_at?: string;
};

export type BookStatus = 'AVAILABLE' | 'BORROWED' | 'LOST' | 'DAMAGED';

export type Book = {
    id: string;
    title: string;
    author: string;
    isbn: string;
    genre: string;
    status: BookStatus;
    cover_url?: string;
    created_at?: string;
};

export type TransactionStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';

export type Transaction = {
    id: string;
    user_id: string;
    book_id: string;
    borrow_date: string;
    due_date: string;
    return_date?: string;
    status: TransactionStatus;
    created_at?: string;
};
