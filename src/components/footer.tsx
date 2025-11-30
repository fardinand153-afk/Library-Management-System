import Link from "next/link";
import { BookOpen, Github, Twitter, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
    return (
        <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 md:px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold tracking-tight">LMS</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Empowering students with seamless access to knowledge. Your gateway to a world of books and learning resources.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Github className="h-5 w-5" />
                                <span className="sr-only">GitHub</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="h-5 w-5" />
                                <span className="sr-only">LinkedIn</span>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold tracking-wider uppercase">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/catalog" className="hover:text-foreground transition-colors">Catalog</Link>
                            </li>
                            <li>
                                <Link href="/browse" className="hover:text-foreground transition-colors">Browse Books</Link>
                            </li>
                            <li>
                                <Link href="/my-books" className="hover:text-foreground transition-colors">My Library</Link>
                            </li>
                            <li>
                                <Link href="/login" className="hover:text-foreground transition-colors">Student Login</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold tracking-wider uppercase">Contact</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>490 Prospect Rd,<br />Prembroke, NC 28372</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4 shrink-0" />
                                <a href="mailto:support@lms.com" className="hover:text-foreground transition-colors">support@lms.com</a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="h-4 w-4 shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter / CTA */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold tracking-wider uppercase">Stay Updated</h3>
                        <p className="text-sm text-muted-foreground">
                            Subscribe to get notified about new arrivals and library events.
                        </p>
                        <div className="flex gap-2">
                            <Input placeholder="Enter your email" className="h-9" />
                            <Button size="sm" className="h-9 cursor-pointer">Subscribe</Button>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                        &copy; 2025 <span className="font-semibold text-foreground">Fardin Islam</span>. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
