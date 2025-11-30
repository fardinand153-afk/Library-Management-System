"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getBooks, getProfiles, getActiveTransactions, getTransactions } from "@/lib/supabase";
import { BookOpen, Users, TrendingUp, AlertCircle, ArrowRight, Library, UserCheck, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

type RecentTransaction = {
    id: string;
    borrow_date: string;
    status: string;
    profiles: { name: string };
    books: { title: string };
};

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalBooks: 0,
        availableBooks: 0,
        totalUsers: 0,
        activeLoans: 0,
    });
    const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [books, users, activeTransactions, allTransactions] = await Promise.all([
                getBooks(),
                getProfiles(),
                getActiveTransactions(),
                getTransactions(),
            ]);

            setStats({
                totalBooks: books.length,
                availableBooks: books.filter(b => b.status === 'AVAILABLE').length,
                totalUsers: users.length,
                activeLoans: activeTransactions.length,
            });

            setRecentTransactions((allTransactions as any).slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: "Total Books",
            value: stats.totalBooks,
            icon: BookOpen,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            borderColor: "border-blue-500/20",
            description: "Books in library",
        },
        {
            title: "Available",
            value: stats.availableBooks,
            icon: CheckCircle2,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
            borderColor: "border-green-500/20",
            description: "Ready to borrow",
        },
        {
            title: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
            borderColor: "border-purple-500/20",
            description: "Registered users",
        },
        {
            title: "Active Loans",
            value: stats.activeLoans,
            icon: TrendingUp,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
            borderColor: "border-orange-500/20",
            description: "Currently borrowed",
        },
    ];

    const quickActions = [
        {
            title: "Manage Books",
            description: "Add, edit, or remove books from the library",
            href: "/admin/books",
            icon: Library,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Manage Users",
            description: "View and update user information and roles",
            href: "/admin/users",
            icon: UserCheck,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
        {
            title: "View Transactions",
            description: "Track all borrowing and return activities",
            href: "/admin/transactions",
            icon: Clock,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground text-lg">
                    Welcome to the Library Management System
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="h-12 w-12 bg-primary/20 rounded-full" />
                        <p className="text-muted-foreground">Loading dashboard...</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statCards.map((stat, index) => (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className={`border ${stat.borderColor} hover:shadow-lg transition-all duration-300`}>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <div className="space-y-1">
                                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                                {stat.title}
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                                        </div>
                                        <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-4xl font-bold ${stat.color}`}>{stat.value}</div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Quick Actions - Takes 2 columns */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {quickActions.map((action) => (
                                        <Link key={action.title} href={action.href}>
                                            <motion.div
                                                whileHover={{ y: -4 }}
                                                className="p-6 border rounded-xl hover:border-primary/50 transition-all duration-300 cursor-pointer group h-full"
                                            >
                                                <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                                    <action.icon className={`w-6 h-6 ${action.color}`} />
                                                </div>
                                                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                                                    {action.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    {action.description}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span>Go to page</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </motion.div>
                                        </Link>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Activity - Takes 1 column */}
                        <div>
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="text-xl">Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {recentTransactions.length === 0 ? (
                                        <p className="text-center py-8 text-muted-foreground text-sm">
                                            No recent transactions
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {recentTransactions.map((transaction) => (
                                                <div
                                                    key={transaction.id}
                                                    className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                                                >
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${transaction.status === 'ACTIVE'
                                                            ? 'bg-blue-500/10'
                                                            : 'bg-green-500/10'
                                                        }`}>
                                                        {transaction.status === 'ACTIVE' ? (
                                                            <Clock className="w-4 h-4 text-blue-500" />
                                                        ) : (
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {transaction.profiles.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {transaction.books.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {format(new Date(transaction.borrow_date), 'MMM dd, yyyy')}
                                                        </p>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${transaction.status === 'ACTIVE'
                                                            ? 'bg-blue-500/10 text-blue-500'
                                                            : 'bg-green-500/10 text-green-500'
                                                        }`}>
                                                        {transaction.status}
                                                    </span>
                                                </div>
                                            ))}
                                            <Link href="/admin/transactions">
                                                <Button variant="outline" className="w-full mt-2 cursor-pointer">
                                                    View All Transactions
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* System Status */}
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">System Status: Operational</h3>
                                        <p className="text-sm text-muted-foreground">
                                            All systems running smoothly • Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
