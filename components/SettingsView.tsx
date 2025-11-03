import React from 'react';

const SettingsField: React.FC<{ label: string; placeholder: string; type?: string; value: string; }> = ({ label, placeholder, type = "text", value }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <input 
            type={type} 
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            placeholder={placeholder}
            defaultValue={value}
        />
    </div>
);


const SettingsView = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">Settings</h1>
            <div className="space-y-8">
                <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-white">SMS Gateway (Twilio)</h2>
                    <div className="space-y-4">
                        <SettingsField label="Twilio Account SID" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value="AC1234567890abcdef1234567890" />
                        <SettingsField label="Twilio Auth Token" placeholder="••••••••••••••••••••••••••••" type="password" value="abcdef1234567890abcdef1234567890" />
                        <SettingsField label="Twilio Phone Number" placeholder="+15017122661" value="+15551234567"/>
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-white">Payment Gateway (Stripe)</h2>
                    <div className="space-y-4">
                        <SettingsField label="Stripe Public Key" placeholder="pk_test_xxxxxxxxxxxxxxxxxxxxxx" value="pk_test_aAbBcC1234567890" />
                        <SettingsField label="Stripe Secret Key" placeholder="••••••••••••••••••••••••••••" type="password" value="sk_test_aAbBcC1234567890" />
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-white">General Settings</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Owner Timezone</label>
                            <select className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
                                <option>UTC</option>
                                <option selected>Europe/London</option>
                                <option>America/New_York</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button className="bg-sky-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-sky-700 transition-colors shadow-sm">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsView;