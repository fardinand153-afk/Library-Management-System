"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getProfiles, updateProfile, type Profile } from "@/lib/supabase";
import { Search, Edit } from "lucide-react";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingUser, setEditingUser] = useState<Profile | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await getProfiles();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: 'STUDENT' | 'LIBRARIAN') => {
        try {
            await updateProfile(userId, { role: newRole });
            await loadUsers();
            setEditingUser(null);
        } catch (error) {
            console.error('Error updating user role:', error);
            alert('Failed to update user role');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">User Management</h1>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8 text-muted-foreground">Loading...</p>
                    ) : (
                        <div className="space-y-4">
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{user.name}</h3>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Role: <span className="font-medium">{user.role}</span>
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {editingUser?.id === user.id ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant={user.role === 'STUDENT' ? 'default' : 'outline'}
                                                    onClick={() => handleRoleChange(user.id, 'STUDENT')}
                                                    className="cursor-pointer"
                                                >
                                                    Student
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={user.role === 'LIBRARIAN' ? 'default' : 'outline'}
                                                    onClick={() => handleRoleChange(user.id, 'LIBRARIAN')}
                                                    className="cursor-pointer"
                                                >
                                                    Librarian
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setEditingUser(null)}
                                                    className="cursor-pointer"
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setEditingUser(user)}
                                                className="cursor-pointer"
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                Change Role
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
