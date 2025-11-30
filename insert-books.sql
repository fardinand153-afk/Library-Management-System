-- =====================================================
-- INSERT ALL BOOKS DATA
-- =====================================================

INSERT INTO books (title, author, isbn, genre, publisher, publication_year, description, cover_url, total_copies, available_copies, status) VALUES

-- Classics
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Classic', 'Scribner', 1925, 'A classic American novel exploring themes of decadence, idealism, and the American Dream in the Jazz Age. Experience the timeless story of Jay Gatsby and his pursuit of the elusive Daisy Buchanan.', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800', 3, 3, 'AVAILABLE'),

('To Kill a Mockingbird', 'Harper Lee', '9780446310789', 'Classic', 'Harper Perennial', 1960, 'A gripping tale of racial injustice and childhood innocence in the American South. Through the eyes of Scout Finch, witness her father Atticus defend a black man falsely accused of a crime.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800', 2, 1, 'AVAILABLE'),

('Pride and Prejudice', 'Jane Austen', '9780141439518', 'Classic', 'Penguin Classics', 1813, 'A romantic novel of manners that critiques the British landed gentry at the end of the 18th century. Follow Elizabeth Bennet as she navigates issues of morality, education, and marriage.', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800', 2, 2, 'AVAILABLE'),

('Moby Dick', 'Herman Melville', '9781503280786', 'Classic', 'CreateSpace', 1851, 'The epic tale of Captain Ahab''s obsessive quest to kill the white whale that destroyed his ship and took his leg. A masterpiece of American literature exploring themes of obsession and fate.', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&q=80&w=800', 2, 2, 'AVAILABLE'),

-- Sci-Fi
('1984', 'George Orwell', '9780451524935', 'Sci-Fi', 'Signet Classic', 1949, 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism. Set in Airstrip One (formerly Great Britain), it follows Winston Smith as he rebels against the oppressive Party.', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800', 3, 3, 'AVAILABLE'),

('Dune', 'Frank Herbert', '9780441172719', 'Sci-Fi', 'Ace', 1965, 'Set in the distant future amidst a huge interstellar empire, Dune tells the story of young Paul Atreides as his family accepts control of the desert planet Arrakis, the only source of the valuable spice melange.', 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800', 2, 2, 'AVAILABLE'),

('The Martian', 'Andy Weir', '9780553418026', 'Sci-Fi', 'Broadway Books', 2011, 'After a dust storm nearly kills him and forces his crew to evacuate, astronaut Mark Watney is stranded alone on Mars. With only meager supplies, he must draw upon his ingenuity and spirit to survive.', 'https://images.unsplash.com/photo-1614726365723-49cfae96c6b4?auto=format&fit=crop&q=80&w=800', 3, 3, 'AVAILABLE'),

('Project Hail Mary', 'Andy Weir', '9780593135204', 'Sci-Fi', 'Ballantine Books', 2021, 'Ryland Grace wakes up on a spaceship with no memory of why he''s there. His crewmates are dead, he''s the sole survivor, and he has to save the world. A thrilling tale of survival and discovery.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800', 2, 1, 'AVAILABLE'),

('Foundation', 'Isaac Asimov', '9780553293357', 'Sci-Fi', 'Spectra', 1951, 'The first novel in Isaac Asimov''s classic science-fiction masterpiece, the Foundation series. For twelve thousand years the Galactic Empire has ruled supreme, but now it is dying.', 'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=800', 2, 2, 'AVAILABLE'),

-- Fantasy
('The Hobbit', 'J.R.R. Tolkien', '9780547928227', 'Fantasy', 'Mariner Books', 1937, 'Bilbo Baggins enjoys a comfortable life until the wizard Gandalf and a company of dwarves arrive on his doorstep and whisks him away on an adventure to reclaim the dwarves'' mountain home from a dragon.', 'https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?auto=format&fit=crop&q=80&w=800', 3, 3, 'AVAILABLE'),

('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', '9780590353427', 'Fantasy', 'Scholastic', 1997, 'Harry Potter has never been the star of a Quidditch team, scoring points while riding a broom far above the ground. He knows no spells, has never helped to hatch a dragon, and has never worn a cloak of invisibility.', 'https://images.unsplash.com/photo-1618666012174-83b441c0bc76?auto=format&fit=crop&q=80&w=800', 4, 4, 'AVAILABLE'),

('The Name of the Wind', 'Patrick Rothfuss', '9780756404079', 'Fantasy', 'DAW Books', 2007, 'Told in Kvothe''s own voice, this is the tale of the magically gifted young man who grows to be the most notorious wizard his world has ever seen. A beautifully written epic fantasy.', 'https://images.unsplash.com/photo-1621351183012-e2f1f6f8b6b0?auto=format&fit=crop&q=80&w=800', 2, 1, 'AVAILABLE'),

('A Game of Thrones', 'George R.R. Martin', '9780553103540', 'Fantasy', 'Bantam', 1996, 'In a land where summers span decades and winters can last a lifetime, trouble is brewing. The cold is returning, and in the frozen wastes to the north, sinister forces are massing beyond the kingdom''s protective Wall.', 'https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?auto=format&fit=crop&q=80&w=800', 3, 3, 'AVAILABLE'),

-- Mystery
('The Girl with the Dragon Tattoo', 'Stieg Larsson', '9780307454546', 'Mystery', 'Vintage Crime', 2005, 'Harriet Vanger disappeared over forty years ago. Her uncle is convinced she was murdered. He wants Mikael Blomkvist, a crusading journalist, to find out what happened. Aided by the pierced and tattooed punk prodigy Lisbeth Salander.', 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=800', 2, 2, 'AVAILABLE'),

('Gone Girl', 'Gillian Flynn', '9780307588371', 'Mystery', 'Crown', 2012, 'On a warm summer morning in North Carthage, Missouri, it is Nick and Amy Dunne''s fifth wedding anniversary. Presents are being wrapped and reservations are being made when Amy goes missing. A gripping psychological thriller.', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800', 3, 3, 'AVAILABLE'),

('The Da Vinci Code', 'Dan Brown', '9780307474278', 'Mystery', 'Anchor', 2003, 'While in Paris on business, Harvard symbologist Robert Langdon receives an urgent late-night phone call: the elderly curator of the Louvre has been murdered inside the museum. A stunning exploration of religious history.', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800', 2, 1, 'AVAILABLE'),

('Sherlock Holmes: Complete Collection', 'Arthur Conan Doyle', '9781435114944', 'Mystery', 'Barnes & Noble', 1892, 'The complete adventures of the world''s greatest detective. From A Study in Scarlet to The Case-Book of Sherlock Holmes, experience all the brilliant deductions of Holmes and the loyal companionship of Dr. Watson.', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800', 2, 2, 'AVAILABLE'),

-- Romance
('The Notebook', 'Nicholas Sparks', '9780446605236', 'Romance', 'Grand Central Publishing', 1996, 'Every so often a love story captures our hearts and becomes more than just a story - it becomes an experience to treasure and to share. The Notebook is such a book, a timeless tale of enduring passion.', 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&q=80&w=800', 2, 2, 'AVAILABLE'),

('Me Before You', 'Jojo Moyes', '9780143124542', 'Romance', 'Penguin Books', 2012, 'Lou Clark knows lots of things. She knows how many footsteps there are between the bus stop and home. But Lou doesn''t know she''s about to lose her job or that knowing what''s coming is what keeps her sane.', 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&q=80&w=800', 3, 3, 'AVAILABLE'),

('The Fault in Our Stars', 'John Green', '9780142424179', 'Romance', 'Dutton Books', 2012, 'Despite the tumor-shrinking medical miracle that has bought her a few years, Hazel has never been anything but terminal. But when a gorgeous plot twist named Augustus Waters suddenly appears at Cancer Kid Support Group, Hazel''s story is about to be completely rewritten.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800', 2, 1, 'AVAILABLE'),

-- Thriller
('The Silent Patient', 'Alex Michaelides', '9781250301697', 'Thriller', 'Celadon Books', 2019, 'Alicia Berenson''s life is seemingly perfect. One evening her husband Gabriel returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800', 3, 3, 'AVAILABLE'),

('The Woman in the Window', 'A.J. Finn', '9780062678416', 'Thriller', 'William Morrow', 2018, 'Anna Fox lives alone, a recluse in her New York City home, unable to venture outside. She spends her day drinking wine, watching old movies, and spying on her neighbors. Then the Russells move in across the way.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800', 2, 2, 'AVAILABLE'),

('Big Little Lies', 'Liane Moriarty', '9780399587191', 'Thriller', 'Berkley', 2014, 'Sometimes it''s the little lies that turn out to be the most lethal. A murder, a tragic accident, or just parents behaving badly? What''s indisputable is that someone is dead. Gripping, thought-provoking, and funny.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=800', 2, 2, 'AVAILABLE'),

-- Biography
('Steve Jobs', 'Walter Isaacson', '9781451648539', 'Biography', 'Simon & Schuster', 2011, 'Based on more than forty interviews with Steve Jobs conducted over two years, as well as interviews with more than 100 family members, friends, adversaries, competitors, and colleagues, this is the exclusive biography of the man who revolutionized six industries.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800', 2, 2, 'AVAILABLE'),

('Becoming', 'Michelle Obama', '9781524763138', 'Biography', 'Crown', 2018, 'In her memoir, a work of deep reflection and mesmerizing storytelling, Michelle Obama invites readers into her world, chronicling the experiences that have shaped her from her childhood to her years as an executive and her time spent at the world''s most famous address.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800', 3, 2, 'AVAILABLE');

-- Verify the insert
SELECT COUNT(*) as total_books FROM books;
SELECT genre, COUNT(*) as count FROM books GROUP BY genre ORDER BY genre;
