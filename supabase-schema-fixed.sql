-- =====================================================
-- Library Management System - FIXED Supabase Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CREATE ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('STUDENT', 'LIBRARIAN');
CREATE TYPE book_status AS ENUM ('AVAILABLE', 'BORROWED', 'RESERVED', 'MAINTENANCE');
CREATE TYPE transaction_status AS ENUM ('ACTIVE', 'RETURNED', 'OVERDUE', 'LOST');

-- =====================================================
-- CREATE TABLES
-- =====================================================

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

CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    reservation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_reservation_dates CHECK (expiry_date > reservation_date)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_book_id ON transactions(book_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_due_date ON transactions(due_date);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_book_id ON reservations(book_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- =====================================================
-- CREATE FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Helper function to check if user is librarian (avoids recursion)
CREATE OR REPLACE FUNCTION is_librarian(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id AND role = 'LIBRARIAN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_book_on_borrow AFTER INSERT ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_book_availability_on_borrow();

CREATE TRIGGER trigger_update_book_on_return AFTER UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_book_availability_on_return();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - FIXED
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES (FIXED - No recursion)
-- =====================================================

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Librarians can view all profiles (using helper function)
CREATE POLICY "Librarians can view all profiles"
    ON profiles FOR SELECT
    USING (is_librarian(auth.uid()));

-- Librarians can update all profiles
CREATE POLICY "Librarians can update all profiles"
    ON profiles FOR UPDATE
    USING (is_librarian(auth.uid()));

-- =====================================================
-- BOOKS POLICIES
-- =====================================================

-- Everyone can view books
CREATE POLICY "Anyone can view books"
    ON books FOR SELECT
    USING (true);

-- Librarians can insert books
CREATE POLICY "Librarians can insert books"
    ON books FOR INSERT
    WITH CHECK (is_librarian(auth.uid()));

-- Librarians can update books
CREATE POLICY "Librarians can update books"
    ON books FOR UPDATE
    USING (is_librarian(auth.uid()));

-- Librarians can delete books
CREATE POLICY "Librarians can delete books"
    ON books FOR DELETE
    USING (is_librarian(auth.uid()));

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
    USING (is_librarian(auth.uid()));

-- Librarians can create transactions
CREATE POLICY "Librarians can create transactions"
    ON transactions FOR INSERT
    WITH CHECK (is_librarian(auth.uid()));

-- Users can create their own transactions (for borrowing)
CREATE POLICY "Users can create own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Librarians can update transactions
CREATE POLICY "Librarians can update transactions"
    ON transactions FOR UPDATE
    USING (is_librarian(auth.uid()));

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
    USING (is_librarian(auth.uid()));

-- Librarians can update all reservations
CREATE POLICY "Librarians can update all reservations"
    ON reservations FOR UPDATE
    USING (is_librarian(auth.uid()));

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Librarians can create notifications
CREATE POLICY "Librarians can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (is_librarian(auth.uid()));

-- =====================================================
-- VIEWS
-- =====================================================

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
