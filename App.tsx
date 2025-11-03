import React, { useState, useEffect } from 'react';
import { View, Subscriber, StaffUser, SubscriberFilter, SubscriberStatus } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import SubscribersView from './components/SubscribersView';
import StaffView from './components/StaffView';
import SettingsView from './components/SettingsView';
import ProfileView from './components/ProfileView';
import SpecView from './components/SpecView';

import { SUBSCRIBERS_DATA, STAFF_USERS_DATA } from './constants/mockData';
import { executiveSummary, prioritizedFeatures, mvpDefinition, dataModel, apiSpecification, integrations, securityAndCompliance, roadmap } from './constants/specData';
import { GoogleGenAI } from '@google/genai';

const planDurations: { [key: string]: number } = {
    '1m': 30,
    '3m': 90,
    '6m': 180,
    '12m': 365,
};

const calculateEndDate = (startDate: string, plan: '1m' | '3m' | '6m' | '12m'): string => {
    const sDate = new Date(startDate);
    const eDate = new Date(sDate);
    const duration = planDurations[plan] || 30;
    eDate.setDate(eDate.getDate() + duration);
    return eDate.toISOString();
};


const App: React.FC = () => {
    const [view, setView] = useState<View>('dashboard');
    const [collapsed, setCollapsed] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const [subscribers, setSubscribers] = useState<Subscriber[]>(SUBSCRIBERS_DATA);
    const [staff, setStaff] = useState<StaffUser[]>(STAFF_USERS_DATA);
    const [subscriberFilter, setSubscriberFilter] = useState<SubscriberFilter>('all');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const currentUser = STAFF_USERS_DATA[0];

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

    // --- Subscriber Handlers ---
    const handleAddSubscriber = (subscriber: Subscriber) => {
        const endDate = calculateEndDate(subscriber.startDate, subscriber.plan);
        const newSubscriber: Subscriber = {
            ...subscriber,
            id: `sub_${Date.now()}`,
            endDate,
            createdBy: currentUser.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            communications: [],
            payments: [],
        };
        setSubscribers(prev => [newSubscriber, ...prev]);
    };

    const handleUpdateSubscriber = (subscriber: Subscriber) => {
        const endDate = calculateEndDate(subscriber.startDate, subscriber.plan);
        const updatedSubscriber = {
            ...subscriber,
            endDate,
            updatedAt: new Date().toISOString(),
        };
        setSubscribers(prev => prev.map(s => s.id === updatedSubscriber.id ? updatedSubscriber : s));
    };
    
    const handleDeleteSubscribers = (ids: string[]) => {
        setSubscribers(prev => prev.filter(s => !ids.includes(s.id!)));
    };
    
    // --- Staff Handlers ---
    const handleAddStaff = (staffMember: StaffUser) => {
        const newStaff: StaffUser = {
            ...staffMember,
            id: `user_${Date.now()}`,
            avatar: `https://i.pravatar.cc/150?u=${staffMember.email}`,
            lastLogin: new Date().toISOString(),
        };
        setStaff(prev => [newStaff, ...prev]);
    };

    const handleUpdateStaff = (staffMember: StaffUser) => {
        setStaff(prev => prev.map(s => s.id === staffMember.id ? staffMember : s));
    };
    
    const handleDeleteStaff = (id: string) => {
        setStaff(prev => prev.filter(s => s.id !== id));
    };

    // --- Gemini AI Handler ---
    const handleSummarizeNotes = async (notes: string): Promise<string> => {
        if (!notes.trim()) {
            return "No notes provided to summarize.";
        }
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Summarize these customer notes for a support agent in one or two sentences. Keep it concise and actionable:\n\n---\n${notes}\n---`;
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });
            return response.text;
        } catch (e) {
            console.error(e);
            throw new Error("Failed to connect to the AI service. Please check your API key and try again.");
        }
    };


    const renderView = () => {
        if (loading) return <div className="p-10 text-center">Loading data...</div>;
        if (error) return <div className="p-10 text-center text-red-500 bg-red-100 dark:bg-red-900/50 border border-red-500 rounded-lg">{error}</div>;

        switch (view) {
            case 'dashboard': return <DashboardView 
                                        subscribers={subscribers} 
                                        currentUser={currentUser}
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
            case 'profile': return <ProfileView currentUser={currentUser} />;
            case 'productSpec': return <SpecView data={executiveSummary} />;
            case 'mvp': return <SpecView data={{...prioritizedFeatures, ...mvpDefinition, title: "Features & MVP Definition"}} />;
            case 'dataModel': return <SpecView data={dataModel} />;
            case 'api': return <SpecView data={apiSpecification} />;
            case 'integrations': return <SpecView data={integrations} />;
            case 'security': return <SpecView data={securityAndCompliance} />;
            case 'roadmap': return <SpecView data={roadmap} />;
            default: return <DashboardView 
                                subscribers={subscribers} 
                                currentUser={currentUser}
                                setView={setView}
                                setFilter={setSubscriberFilter}
                             />;
        }
    }

    return (
        <div className="dark:bg-slate-900 dark:text-slate-300 text-slate-800">
            <div className="flex h-screen overflow-hidden">
                <Sidebar currentView={view} setView={setView} collapsed={collapsed} setCollapsed={setCollapsed} />
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    <Header 
                        toggleSidebar={() => setCollapsed(!collapsed)} 
                        toggleTheme={toggleTheme}
                        theme={theme}
                        currentUser={currentUser}
                        setView={setView}
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