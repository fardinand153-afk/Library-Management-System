"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, User, ShieldCheck, Library, AlertCircle } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
    const router = useRouter();
    const [role, setRole] = useState<'STUDENT' | 'LIBRARIAN'>('STUDENT');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const user = await signIn(email, password);

            // Check if user role matches selected role
            if (user.role !== role) {
                setError(`This account is registered as a ${user.role.toLowerCase()}. Please select the correct role.`);
                setLoading(false);
                return;
            }

            // Redirect based on role using window.location for full page reload
            if (user.role === 'LIBRARIAN') {
                window.location.href = '/admin/dashboard';
            } else {
                window.location.href = '/catalog';
            }
        } catch (err: any) {
            setError(err.message || 'Failed to sign in. Please check your credentials.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
            {/* Decorative elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 dark:bg-accent/10 rounded-full blur-3xl" />

            <div className="absolute top-4 right-4 z-10">
                <ModeToggle />
            </div>

            <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10">
                {/* Branding Section */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden md:flex flex-col space-y-6 p-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-4 bg-primary/10 rounded-2xl backdrop-blur-sm">
                            <Library className="w-12 h-12 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">Library</h1>
                            <h2 className="text-3xl font-bold text-primary tracking-tight">Management System</h2>
                        </div>
                    </div>

                    <p className="text-xl text-muted-foreground leading-relaxed">
                        Your gateway to a world of knowledge. Access thousands of books, manage your borrowing history, and explore new titles.
                    </p>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg mt-1">
                                <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Extensive Catalog</h3>
                                <p className="text-sm text-muted-foreground">Browse through our diverse collection of books across all genres</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg mt-1">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Personalized Experience</h3>
                                <p className="text-sm text-muted-foreground">Track your reading history and get personalized recommendations</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg mt-1">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Secure & Reliable</h3>
                                <p className="text-sm text-muted-foreground">Your data is protected with enterprise-grade security</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Login Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full"
                >
                    {/* Mobile branding */}
                    <div className="md:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="p-3 bg-primary/10 rounded-xl backdrop-blur-sm">
                            <Library className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Library</h1>
                            <h2 className="text-xl font-bold text-primary tracking-tight">Management System</h2>
                        </div>
                    </div>

                    <Card className="glass border-0">
                        <CardHeader className="space-y-1 text-center">
                            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
                            <CardDescription className="text-base">
                                Sign in to access your library account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant={role === 'STUDENT' ? 'default' : 'outline'}
                                    className="flex-1 cursor-pointer h-12"
                                    onClick={() => setRole('STUDENT')}
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Student
                                </Button>
                                <Button
                                    type="button"
                                    variant={role === 'LIBRARIAN' ? 'default' : 'outline'}
                                    className="flex-1 cursor-pointer h-12"
                                    onClick={() => setRole('LIBRARIAN')}
                                >
                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                    Librarian
                                </Button>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your.email@example.com"
                                        className="h-11"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                        <button type="button" className="text-xs text-primary hover:underline cursor-pointer">
                                            Forgot password?
                                        </button>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        className="h-11"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full cursor-pointer h-11 text-base font-semibold"
                                    disabled={loading}
                                >
                                    {loading ? 'Signing in...' : `Sign In as ${role === 'STUDENT' ? 'Student' : 'Librarian'}`}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3 text-center text-sm">
                            <p className="text-muted-foreground">
                                Don&apos;t have an account?{" "}
                                <Button
                                    variant="link"
                                    className="p-0 h-auto cursor-pointer font-semibold"
                                    onClick={() => router.push('/register')}
                                    disabled={loading}
                                >
                                    Create one now
                                </Button>
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
