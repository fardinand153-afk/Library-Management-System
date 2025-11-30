"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Check } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { signUp } from "@/lib/auth";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const validations = {
        minLength: password.length >= 8,
        hasNumber: /\d/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasUpperCase: /[A-Z]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const isPasswordValid = Object.values(validations).every(Boolean);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!isPasswordValid) {
            setError("Please fulfill all password requirements");
            return;
        }

        setLoading(true);

        try {
            // Always create as STUDENT
            await signUp(email, password, name, 'STUDENT');

            // Redirect to catalog after registration
            router.push('/catalog');
        } catch (err: any) {
            setError(err.message || 'Failed to create account. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="absolute top-4 right-4 z-10">
                <ModeToggle />
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="glass">
                            <CardHeader className="space-y-1 text-center">
                                <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
                                <CardDescription className="text-base">
                                    Join our library community today
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="John Doe"
                                            className="h-11"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
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
                                        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="At least 8 characters"
                                            className="h-11"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                        <div className="space-y-2 text-sm mt-2">
                                            <p className="font-medium text-muted-foreground">Password requirements:</p>
                                            <ul className="space-y-1">
                                                <li className={`flex items-center gap-2 ${validations.minLength ? "text-green-500" : "text-muted-foreground"}`}>
                                                    {validations.minLength ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />}
                                                    At least 8 characters
                                                </li>
                                                <li className={`flex items-center gap-2 ${validations.hasNumber ? "text-green-500" : "text-muted-foreground"}`}>
                                                    {validations.hasNumber ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />}
                                                    At least one number
                                                </li>
                                                <li className={`flex items-center gap-2 ${validations.hasLowerCase ? "text-green-500" : "text-muted-foreground"}`}>
                                                    {validations.hasLowerCase ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />}
                                                    At least one lowercase letter
                                                </li>
                                                <li className={`flex items-center gap-2 ${validations.hasUpperCase ? "text-green-500" : "text-muted-foreground"}`}>
                                                    {validations.hasUpperCase ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />}
                                                    At least one uppercase letter
                                                </li>
                                                <li className={`flex items-center gap-2 ${validations.hasSpecial ? "text-green-500" : "text-muted-foreground"}`}>
                                                    {validations.hasSpecial ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />}
                                                    At least one special character
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Re-enter your password"
                                            className="h-11"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full cursor-pointer h-11 text-base font-semibold"
                                        disabled={loading}
                                    >
                                        {loading ? 'Creating account...' : 'Create Account'}
                                    </Button>
                                </form>
                            </CardContent>
                            <CardFooter className="flex justify-center text-sm">
                                <p className="text-muted-foreground">
                                    Already have an account?{" "}
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto cursor-pointer font-semibold"
                                        onClick={() => router.push('/login')}
                                        disabled={loading}
                                    >
                                        Sign in
                                    </Button>
                                </p>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
