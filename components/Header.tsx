import React, { useState } from 'react';
import { StaffUser, View, Subscriber, SubscriberFilter, SubscriberStatus } from '../types';
import { SearchIcon, SunIcon, MoonIcon, BellIcon, ChevronDownIcon, MenuIcon, UserCircleIcon, LogoutIcon } from './icons';

interface HeaderProps {
    toggleSidebar: () => void;
    toggleTheme: () => void;
    theme: 'light' | 'dark';
    currentUser: StaffUser;
    setView: (view: View) => void;
    expiringSubscribers: Subscriber[];
    setSubscriberFilter: (filter: SubscriberFilter) => void;
}

const Header: React.FC<HeaderProps> = ({ 
    toggleSidebar, 
    toggleTheme, 
    theme, 
    currentUser, 
    setView,
    expiringSubscribers,
    setSubscriberFilter
}) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const notificationCount = expiringSubscribers.length;

    const handleBellClick = () => {
        setNotificationsOpen(!notificationsOpen);
        setProfileOpen(false);
    };

    const handleProfileClick = () => {
        setProfileOpen(!profileOpen);
        setNotificationsOpen(false);
    };

    const handleNotificationLink = (e: React.MouseEvent, filter: SubscriberFilter) => {
        e.preventDefault();
        setView('subscribers');
        setSubscriberFilter(filter);
        setNotificationsOpen(false);
    };

    return (
        <header className="sticky top-0 z-40 flex w-full bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-grow items-center justify-between px-4 py-2 md:px-6 2xl:px-11">
                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        aria-controls="sidebar"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleSidebar();
                        }}
                        className="p-1.5 lg:p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <div className="hidden sm:block">
                        <form>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <SearchIcon className="w-5 h-5 text-slate-400" />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Type to search..."
                                    className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none"
                                />
                            </div>
                        </form>
                    </div>
                </div>

                <div className="flex items-center gap-3 2xsm:gap-7">
                    <ul className="flex items-center gap-2 2xsm:gap-4">
                        <li>
                            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                                {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                            </button>
                        </li>

                        {/* --- Notification Bell --- */}
                        <li className="relative">
                            <button 
                                onClick={handleBellClick}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <BellIcon className="w-6 h-6" />
                                {notificationCount > 0 && (
                                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                                )}
                            </button>

                            {/* --- Notification Dropdown --- */}
                            {notificationsOpen && (
                                <div className="absolute right-0 mt-4 flex w-72 flex-col rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
                                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                            {notificationCount} Expiring Subscribers
                                        </h4>
                                    </div>
                                    <ul className="flex flex-col gap-3 px-4 py-3 max-h-60 overflow-y-auto">
                                        {notificationCount > 0 ? (
                                            expiringSubscribers.map(sub => (
                                                <li key={sub.id}>
                                                    <a
                                                        href="#"
                                                        onClick={(e) => handleNotificationLink(e, SubscriberStatus.Expiring)}
                                                        className="flex text-sm rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                    >
                                                        <div className="flex-1">
                                                            <p className="font-medium text-slate-800 dark:text-slate-200">{sub.fullName}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                Expires on {new Date(sub.endDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </a>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="p-2 text-sm text-center text-slate-500 dark:text-slate-400">
                                                No subscribers are expiring soon.
                                            </li>
                                        )}
                                    </ul>
                                    <a
                                        href="#"
                                        onClick={(e) => handleNotificationLink(e, SubscriberStatus.Expiring)}
                                        className="block bg-slate-50 dark:bg-slate-700/50 py-2 px-4 text-center text-sm font-medium text-sky-600 dark:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    >
                                        View all expiring
                                    </a>
                                </div>
                            )}
                        </li>
                    </ul>

                    {/* --- Profile Dropdown --- */}
                    <div className="relative">
                        <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-4">
                            <span className="hidden text-right lg:block">
                                <span className="block text-sm font-medium text-slate-900 dark:text-white">{currentUser.name}</span>
                                <span className="block text-xs text-slate-500">{currentUser.role}</span>
                            </span>
                            <img src={currentUser.avatar} alt="User" className="h-10 w-10 rounded-full" />
                            <ChevronDownIcon className={`w-5 h-5 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 mt-4 flex w-60 flex-col rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
                                <ul className="flex flex-col gap-5 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                                    <li>
                                        <a href="#" onClick={(e) => { e.preventDefault(); setView('profile'); setProfileOpen(false); }} className="flex items-center gap-3 text-sm font-medium duration-300 ease-in-out hover:text-sky-500">
                                            <UserCircleIcon className="w-6 h-6"/>
                                            My Profile
                                        </a>
                                    </li>
                                </ul>
                                <button className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-sky-500">
                                    <LogoutIcon className="w-6 h-6"/>
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
