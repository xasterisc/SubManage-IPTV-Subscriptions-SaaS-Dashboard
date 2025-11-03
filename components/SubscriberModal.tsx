import React, { useState } from 'react';
import { Subscriber, SubscriberStatus } from '../types';
import { CloseIcon, SparklesIcon } from './icons';

interface SubscriberModalProps {
    subscriber: Subscriber | null;
    onClose: () => void;
    onSave: (subscriber: Subscriber) => void;
    onSummarize: (notes: string) => Promise<string>;
}

const inputStyles = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm";


const SubscriberModal: React.FC<SubscriberModalProps> = ({ subscriber, onClose, onSave, onSummarize }) => {
    const [formData, setFormData] = useState<Partial<Subscriber>>(
        subscriber || {
            fullName: '',
            email: '',
            phoneNumber: '',
            plan: '1m',
            status: SubscriberStatus.Active,
            notes: '',
            startDate: new Date().toISOString().split('T')[0],
        }
    );
    const [isSummarizing, setIsSummarizing] = useState(false);

    const isNew = !subscriber;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName || !formData.email) {
            alert('Full Name and Email are required.');
            return;
        }

        const saveData = { ...subscriber, ...formData } as Subscriber;
        onSave(saveData);
    };

    const handleSummarizeClick = async () => {
        setIsSummarizing(true);
        try {
            const summary = await onSummarize(formData.notes || '');
            setFormData(prev => ({...prev, notes: summary }));
        } catch (error: any) {
            console.error("Failed to summarize notes:", error);
            alert(`Could not generate summary: ${error.message}`);
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">{isNew ? 'Add New Subscriber' : 'Edit Subscriber'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <CloseIcon className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                            <input name="fullName" value={formData.fullName} onChange={handleChange} className={inputStyles} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                            <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputStyles} required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                            <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={inputStyles} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Plan</label>
                                <select name="plan" value={formData.plan} onChange={handleChange} className={inputStyles}>
                                    <option value="1m">1 Month</option>
                                    <option value="3m">3 Months</option>
                                    <option value="6m">6 Months</option>
                                    <option value="12m">12 Months</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Start Date</label>
                                <input name="startDate" type="date" value={formData.startDate?.split('T')[0]} onChange={handleChange} className={inputStyles} />
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className={inputStyles}>
                                {Object.values(SubscriberStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className={inputStyles} />
                            <div className="mt-2 text-right">
                                <button
                                    type="button"
                                    onClick={handleSummarizeClick}
                                    disabled={isSummarizing || !formData.notes}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <SparklesIcon className={`-ml-0.5 mr-2 h-4 w-4 ${isSummarizing ? 'animate-spin' : ''}`} />
                                    {isSummarizing ? 'Summarizing...' : 'Summarize with AI'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 mr-2">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700">Save Subscriber</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SubscriberModal;