import React, { useState } from 'react';
import { StaffUser } from '../types'; // Import StaffUser

interface LoginPageProps {
    onLogin: (token: string, user: StaffUser) => void;
    setError: (error: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, setError }) => {
    const [email, setEmail] = useState('emirhan.baruch@submanage.com'); // Pre-fill for demo
    const [password, setPassword] = useState('password_placeholder_123'); // Pre-fill for demo
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(''); // Clear previous errors

        try {
            const res = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // On success, call the onLogin prop from App.tsx
            onLogin(data.token, data.user);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-slate-800">
                <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
                    SubManage Login
                </h1>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-2 font-bold text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:opacity-50"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
