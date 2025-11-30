-- =====================================================
-- Library Management System - Supabase Schema
-- =====================================================
-- This script creates all necessary tables, indexes, and RLS policies
-- for the Library Management System with support for both users and admins

-- =====================================================
-- 1. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. CREATE ENUMS
-- =====================================================

-- User roles
CREATE TYPE user_role AS ENUM ('STUDENT', 'LIBRARIAN');

-- Book status
CREATE TYPE book_status AS ENUM ('AVAILABLE', 'BORROWED', 'RESERVED', 'MAINTENANCE');

-- Transaction status
CREATE TYPE transaction_status AS ENUM ('ACTIVE', 'RETURNED', 'OVERDUE', 'LOST');

-- =====================================================
-- 3. CREATE TABLES
-- =====================================================

-- Users/Profiles Table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Books Table
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE NOT NULL,
    genre TEXT NOT NULL,
    publisher TEXT,
    publication_year INTEGER,
    description TEXT,
    cover_url TEXT,
    status book_status NOT NULL DEFAULT 'AVAILABLE',
    total_copies INTEGER NOT NULL DEFAULT 1,
    available_copies INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT positive_copies CHECK (total_copies > 0),
    CONSTRAINT available_not_exceed_total CHECK (available_copies <= total_copies),
    CONSTRAINT available_non_negative CHECK (available_copies >= 0)
);

-- Transactions Table (Borrow/Return records)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    borrow_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE,
    status transaction_status NOT NULL DEFAULT 'ACTIVE',
    fine_amount DECIMAL(10, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_dates CHECK (due_date > borrow_date),
    CONSTRAINT return_after_borrow CHECK (return_date IS NULL OR return_date >= borrow_date)
);

-- Reservations Table
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    reservation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, FULFILLED, CANCELLED, EXPIRED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_reservation_dates CHECK (expiry_date > reservation_date)
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- OVERDUE, REMINDER, RESERVATION, GENERAL
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Books indexes
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_books_status ON books(status);

-- Transactions indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_book_id ON transactions(book_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_due_date ON transactions(due_date);
CREATE INDEX idx_transactions_borrow_date ON transactions(borrow_date);

-- Reservations indexes
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_book_id ON reservations(book_id);
CREATE INDEX idx_reservations_status ON reservations(status);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- =====================================================
-- 5. CREATE FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check for overdue transactions
CREATE OR REPLACE FUNCTION check_overdue_transactions()
RETURNS void AS $$
BEGIN
    UPDATE transactions
    SET status = 'OVERDUE'
    WHERE status = 'ACTIVE'
    AND due_date < NOW()
    AND return_date IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update book availability when transaction is created
CREATE OR REPLACE FUNCTION update_book_availability_on_borrow()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'ACTIVE' THEN
        UPDATE books
        SET available_copies = available_copies - 1,
            status = CASE 
                WHEN available_copies - 1 = 0 THEN 'BORROWED'::book_status
                ELSE status
            END
        WHERE id = NEW.book_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update book availability when transaction is returned
CREATE OR REPLACE FUNCTION update_book_availability_on_return()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'RETURNED' AND OLD.status != 'RETURNED' THEN
        UPDATE books
        SET available_copies = available_copies + 1,
            status = 'AVAILABLE'::book_status
        WHERE id = NEW.book_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. CREATE TRIGGERS
-- =====================================================

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers for book availability
CREATE TRIGGER trigger_update_book_on_borrow AFTER INSERT ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_book_availability_on_borrow();

CREATE TRIGGER trigger_update_book_on_return AFTER UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_book_availability_on_return();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Librarians can view all profiles
CREATE POLICY "Librarians can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'LIBRARIAN'
        )
    );

-- Librarians can insert profiles
CREATE POLICY "Librarians can insert profiles"
    ON profiles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'LIBRARIAN'
        )
    );

-- Librarians can update all profiles
CREATE POLICY "Librarians can update all profiles"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'LIBRARIAN'
        )
    );

-- =====================================================
-- BOOKS POLICIES
-- =====================================================

-- Everyone can view available books
CREATE POLICY "Anyone can view books"
    ON books FOR SELECT
    USING (true);

-- Only librarians can insert books
CREATE POLICY "Librarians can insert books"
    ON books FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'LIBRARIAN'
        )
    );

-- Only librarians can update books
CREATE POLICY "Librarians can update books"
    ON books FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'LIBRARIAN'
        )
    );

-- Only librarians can delete books
CREATE POLICY "Librarians can delete books"
    ON books FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'LIBRARIAN'
        )
    );

-- =====================================================
-- TRANSACTIONS POLICIES
-- =====================================================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

-- Librarians can view all transactions
CREATE POLICY "Librarians can view all transactions"
    ON transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'LIBRARIAN'
        )
    );

-- Librarians can create transactions
CREATE POLICY "Librarians can create transactions"
    ON transactions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'LIBRARIAN'
        )
    );

-- Librarians can update transactions
CREATE POLICY "Librarians can update transactions"
    ON transactions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'LIBRARIAN'
        )
    );

-- =====================================================
-- RESERVATIONS POLICIES
-- =====================================================

-- Users can view their own reservations
CREATE POLICY "Users can view own reservations"
    ON reservations FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own reservations
CREATE POLICY "Users can create own reservations"
    ON reservations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Librarians can view all reservations
CREATE POLICY "Librarians can view all reservations"
    ON reservations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'LIBRARIAN'
        )
    );

-- Librarians can update all reservations
CREATE POLICY "Librarians can update all reservations"
    ON reservations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'LIBRARIAN'
        )
    );

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Librarians can create notifications for any user
CREATE POLICY "Librarians can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'LIBRARIAN'
        )
    );

-- =====================================================
-- 8. CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for active borrowings with user and book details
CREATE OR REPLACE VIEW active_borrowings AS
SELECT 
    t.id,
    t.user_id,
    p.name AS user_name,
    p.email AS user_email,
    t.book_id,
    b.title AS book_title,
    b.author AS book_author,
    b.isbn,
    t.borrow_date,
    t.due_date,
    t.status,
    CASE 
        WHEN t.due_date < NOW() AND t.status = 'ACTIVE' THEN true
        ELSE false
    END AS is_overdue,
    t.fine_amount
FROM transactions t
JOIN profiles p ON t.user_id = p.id
JOIN books b ON t.book_id = b.id
WHERE t.status IN ('ACTIVE', 'OVERDUE');

-- View for book availability summary
CREATE OR REPLACE VIEW book_availability_summary AS
SELECT 
    b.id,
    b.title,
    b.author,
    b.isbn,
    b.genre,
    b.total_copies,
    b.available_copies,
    b.status,
    COUNT(t.id) FILTER (WHERE t.status = 'ACTIVE') AS currently_borrowed,
    COUNT(r.id) FILTER (WHERE r.status = 'PENDING') AS pending_reservations
FROM books b
LEFT JOIN transactions t ON b.id = t.book_id AND t.status = 'ACTIVE'
LEFT JOIN reservations r ON b.id = r.book_id AND r.status = 'PENDING'
GROUP BY b.id;

-- =====================================================
-- 9. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Insert sample books (uncomment to use)
/*
INSERT INTO books (title, author, isbn, genre, description, cover_url, total_copies, available_copies) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Classic', 'A classic American novel', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f', 3, 3),
('1984', 'George Orwell', '9780451524935', 'Dystopian', 'A dystopian social science fiction novel', 'https://images.unsplash.com/photo-1532012197267-da84d127e765', 2, 2),
('To Kill a Mockingbird', 'Harper Lee', '9780446310789', 'Classic', 'A novel about racial injustice', 'https://images.unsplash.com/photo-1512820790803-83ca734da794', 2, 1);
*/

-- =====================================================
-- 10. HELPFUL QUERIES
-- =====================================================

-- Query to find overdue books
-- SELECT * FROM active_borrowings WHERE is_overdue = true;

-- Query to find available books
-- SELECT * FROM books WHERE status = 'AVAILABLE' AND available_copies > 0;

-- Query to get user borrowing history
-- SELECT * FROM transactions WHERE user_id = 'USER_UUID' ORDER BY borrow_date DESC;

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Run this script in your Supabase SQL Editor
-- 2. Make sure to set up Supabase Auth before using these tables
-- 3. When a user signs up, create a corresponding profile record
-- 4. Librarians should be created manually or through an admin interface
-- 5. Consider setting up a cron job to run check_overdue_transactions() daily
