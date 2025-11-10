/// <reference types="vite/client" />

import React, { useState, useEffect, useMemo } from 'react';
import { View, Subscriber, StaffUser, SubscriberFilter, SubscriberStatus } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import SubscribersView from './components/SubscribersView';
import StaffView from './components/StaffView';
import SettingsView from './components/SettingsView';
import ProfileView from './components/ProfileView';
import SpecView from './components/SpecView';
import LoginPage from './components/LoginPage';

import { executiveSummary, prioritizedFeatures, mvpDefinition, dataModel, apiSpecification, integrations, securityAndCompliance, roadmap } from './constants/specData';
import { GoogleGenAI } from '@google/genai';

const API_BASE_URL = 'http://localhost:3001/api';

// --- Create an API helper ---
// This will automatically add our token to every request
const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');

    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        // Auto-logout if token is bad
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload(); // Easiest way to reset state
        throw new Error('Session expired');
    }

    return res;
};


const App: React.FC = () => {
    const [view, setView] = useState<View>('dashboard');
    const [collapsed, setCollapsed] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // --- Auth State ---
    const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('token'));
    const [currentUser, setCurrentUser] = useState<StaffUser | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [staff, setStaff] = useState<StaffUser[]>([]);
    const [subscriberFilter, setSubscriberFilter] = useState<SubscriberFilter>('all');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!authToken) {
                setLoading(false);
                return; // Don't fetch data if no token
            }

            setLoading(true);
            setError(null);
            try {
                // Use our new apiFetch helper
                const [subscribersRes, staffRes] = await Promise.all([
                    apiFetch('/subscribers'),
                    apiFetch('/staff')
                ]);

                if (!subscribersRes.ok || !staffRes.ok) {
                    throw new Error('Failed to fetch data from the server.');
                }

                const subscribersData = await subscribersRes.json();
                const staffData = await staffRes.json();

                setSubscribers(subscribersData);
                setStaff(staffData);

                // Re-confirm current user from stored data
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setCurrentUser(JSON.parse(storedUser));
                } else {
                    // This should not happen if login is successful, but good fallback
                    handleLogout();
                }

            } catch (err: any) {
                setError(err.message);
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [authToken]); // <-- Re-run when authToken changes

    useEffect(() => {
        // Theme initialization
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        } else {
            setTheme('light');
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    // --- New Auth Handlers ---
    const handleLogin = (token: string, user: StaffUser) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user)); // Store user details
        setAuthToken(token);
        setCurrentUser(user);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthToken(null);
        setCurrentUser(null);
        setSubscribers([]); // Clear data
        setStaff([]);
    };

    // --- Subscriber Handlers (use apiFetch) ---
    const handleAddSubscriber = async (subscriber: Subscriber) => {
        if (!currentUser) return;

        const subscriberData = {
            ...subscriber,
            createdById: currentUser.id, // This is now set on the backend, but good to have
        };

        try {
            const res = await apiFetch('/subscribers', {
                method: 'POST',
                body: JSON.stringify(subscriberData),
            });
            if (!res.ok) throw new Error('Failed to create subscriber.');

            const newSubscriber = await res.json();
            setSubscribers(prev => [newSubscriber, ...prev]);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleUpdateSubscriber = async (subscriber: Subscriber) => {
        try {
            const res = await apiFetch(`/subscribers/${subscriber.id}`, {
                method: 'PUT',
                body: JSON.stringify(subscriber),
            });
            if (!res.ok) throw new Error('Failed to update subscriber.');

            const updatedSubscriber = await res.json();
            setSubscribers(prev => prev.map(s => s.id === updatedSubscriber.id ? updatedSubscriber : s));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteSubscribers = async (ids: string[]) => {
        try {
            await Promise.all(ids.map(id => 
                apiFetch(`/subscribers/${id}`, {
                    method: 'DELETE',
                })
            ));

            setSubscribers(prev => prev.filter(s => !ids.includes(s.id!)));
        } catch (err: any) {
            setError(`Failed to delete subscribers: ${err.message}`);
        }
    };

    // --- Staff Handlers (use apiFetch) ---
    const handleAddStaff = async (staffMember: StaffUser) => {
        try {
            const res = await apiFetch('/staff', {
                method: 'POST',
                body: JSON.stringify(staffMember),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to add staff member.');
            }

            const newStaff = await res.json();
            setStaff(prev => [newStaff, ...prev]);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleUpdateStaff = async (staffMember: StaffUser) => {
        try {
            const res = await apiFetch(`/staff/${staffMember.id}`, {
                method: 'PUT',
                body: JSON.stringify(staffMember),
            });
            if (!res.ok) throw new Error('Failed to update staff member.');

            const updatedStaff = await res.json();
            setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteStaff = async (id: string) => {
        try {
            const res = await apiFetch(`/staff/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete staff member.');

            setStaff(prev => prev.filter(s => s.id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    };

    // --- Gemini AI Handler ---
    const handleSummarizeNotes = async (notes: string): Promise<string> => {
        if (!notes.trim()) {
            return "No notes provided to summarize.";
        }

        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string });
            const prompt = `Summarize these customer notes for a support agent in one or two sentences. Keep it concise and actionable:\n\n---\n${notes}\n---`;
            const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            });
            return response.text;
        } catch (e) {
            console.error(e);
            const error = e as Error;
            throw new Error(`Failed to connect to the AI service: ${error.message}`);
        }
    };

    const expiringSubscribers = useMemo(() => {
        return subscribers.filter(s => s.status === SubscriberStatus.Expiring);
    }, [subscribers]);

    const renderView = () => {
        // ... (no change here)
        switch (view) {
            case 'dashboard': return <DashboardView 
                                        subscribers={subscribers} 
                                        currentUser={currentUser!}
                                        setView={setView}
                                        setFilter={setSubscriberFilter}
                                    />;
            case 'subscribers': return <SubscribersView 
                                        subscribers={subscribers} 
                                        onAdd={handleAddSubscriber}
                                        onUpdate={handleUpdateSubscriber}
                                        onDelete={handleDeleteSubscribers}
                                        onSummarize={handleSummarizeNotes}
                                        filter={subscriberFilter}
                                        setFilter={setSubscriberFilter}
                                    />;
            case 'staff': return <StaffView 
                                    staff={staff} 
                                    onAdd={handleAddStaff}
                                    onUpdate={handleUpdateStaff}
                                    onDelete={handleDeleteStaff}
                                />;
            case 'settings': return <SettingsView />;
            case 'profile': return <ProfileView currentUser={currentUser!} />;
            case 'productSpec': return <SpecView data={executiveSummary} />;
            case 'mvp': return <SpecView data={{...prioritizedFeatures, ...mvpDefinition, title: "Features & MVP Definition"}} />;
            case 'dataModel': return <SpecView data={dataModel} />;
            case 'api': return <SpecView data={apiSpecification} />;
            case 'integrations': return <SpecView data={integrations} />;
            case 'security': return <SpecView data={securityAndCompliance} />;
            case 'roadmap': return <SpecView data={roadmap} />;
            default: return <DashboardView 
                                subscribers={subscribers} 
                                currentUser={currentUser!}
                                setView={setView}
                                setFilter={setSubscriberFilter}
                            />;
        }
    }

    if (loading && !currentUser) { // Show loading only on initial auth/data load
        return (
            <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
                <div className="text-xl font-medium text-slate-700 dark:text-slate-300">
                    Loading Application...
                </div>
            </div>
        );
    }

    // --- Render Login Page if no token ---
    if (!authToken || !currentUser) {
        return <LoginPage onLogin={handleLogin} setError={(err) => {
            setError(err);
            setTimeout(() => setError(null), 5000); // Clear error after 5s
        }} />;
    }

    // Show error overlay if one exists
    const errorBanner = error ? (
        <div className="fixed top-5 right-5 z-[100] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
        </div>
    ) : null;


    return (
        <div className="dark:bg-slate-900 dark:text-slate-300 text-slate-800">
            {errorBanner}
            <div className="flex h-screen overflow-hidden">
                <Sidebar currentView={view} setView={setView} collapsed={collapsed} setCollapsed={setCollapsed} onLogout={handleLogout} />
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    <Header 
                        toggleSidebar={() => setCollapsed(!collapsed)} 
                        toggleTheme={toggleTheme}
                        theme={theme}
                        currentUser={currentUser}
                        setView={setView}
                        expiringSubscribers={expiringSubscribers}
                        setSubscriberFilter={setSubscriberFilter}
                        onLogout={handleLogout} // <-- Pass the logout handler
                    />
                    <main>
                        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                            {renderView()}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default App;
