import React from 'react';
import { StaffUser } from '../types';

interface ProfileViewProps {
    currentUser: StaffUser;
}

const ProfileField: React.FC<{ label: string; value: string; type?: string; id: string; }> = ({ label, value, type = 'text', id }) => (
    <div>
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">{label}</label>
        <input
            type={type}
            id={id}
            defaultValue={value}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent py-3 px-5 font-medium outline-none transition focus:border-sky-500 active:border-sky-500"
        />
    </div>
);

const ProfileView: React.FC<ProfileViewProps> = ({ currentUser }) => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">My Profile</h1>
            <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
                <div className="flex flex-col gap-9">
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                        <div className="border-b border-slate-200 dark:border-slate-700 py-4 px-6">
                            <h3 className="font-medium text-slate-900 dark:text-white">Personal Information</h3>
                        </div>
                        <div className="p-6">
                            <div className="mb-5 flex flex-col gap-6 xl:flex-row">
                                <div className="w-full xl:w-1/2">
                                    <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">Full Name</label>
                                    <input
                                        type="text"
                                        defaultValue={currentUser.name}
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent py-3 px-5 font-medium outline-none transition focus:border-sky-500 active:border-sky-500"
                                    />
                                </div>
                                <div className="w-full xl:w-1/2">
                                    <p className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">Role</p>
                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-600/20">{currentUser.role}</span>
                                </div>
                            </div>

                            <ProfileField label="Email Address" value={currentUser.email} id="email" />

                            <div className="flex justify-end mt-6">
                                <button className="bg-sky-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-sky-700 transition-colors shadow-sm">
                                    Update Info
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-9">
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                        <div className="border-b border-slate-200 dark:border-slate-700 py-4 px-6">
                            <h3 className="font-medium text-slate-900 dark:text-white">Change Password</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <ProfileField label="Current Password" type="password" id="currentPassword" value="••••••••" />
                            <ProfileField label="New Password" type="password" id="newPassword" value="" />
                            <ProfileField label="Confirm New Password" type="password" id="confirmPassword" value="" />
                            
                            <div className="flex justify-end mt-6">
                                <button className="bg-sky-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-sky-700 transition-colors shadow-sm">
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;