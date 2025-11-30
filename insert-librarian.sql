-- =====================================================
-- Insert Librarian Account
-- =====================================================
-- Email: admin@gmail.com
-- Password: admin (hashed with bcrypt)
-- Role: LIBRARIAN

INSERT INTO profiles (email, name, password, role) 
VALUES (
    'admin@gmail.com',
    'Admin User',
    '$2a$10$Wm3Svm1Z.XYiSHfOqeZaoOu0WY5T2X3hrlZo6OPrzdIDVj3cZotee',
    'LIBRARIAN'
);

-- =====================================================
-- Login Credentials:
-- Email: admin@gmail.com
-- Password: admin
-- =====================================================
