import React, { useMemo } from 'react';
import { Subscriber, SubscriberStatus, StaffUser, View, SubscriberFilter } from '../types';
import { statusColors } from './SubscribersView'; // Import from SubscribersView

interface DashboardViewProps {
  subscribers: Subscriber[];
  currentUser: StaffUser;
  setView: (view: View) => void;
  setFilter: (filter: SubscriberFilter) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; onClick?: () => void; }> = ({ title, value, icon, color, onClick }) => {
    const cardClasses = "p-5 rounded-lg shadow-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all duration-200";
    const clickableClasses = "hover:shadow-md hover:-translate-y-1 cursor-pointer";

    const content = (
        <>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
                <span className="text-2xl">{icon}</span>
            </div>
            <div className="mt-4">
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            </div>
        </>
    );

    if (onClick) {
        return <button onClick={onClick} className={`${cardClasses} ${clickableClasses} text-left`}>{content}</button>
    }
    return <div className={cardClasses}>{content}</div>;
};

const StatusBadge: React.FC<{ status: SubscriberStatus }> = ({ status }) => (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}`}>
      {status}
    </span>
);

const DashboardView: React.FC<DashboardViewProps> = ({ subscribers, currentUser, setView, setFilter }) => {
    const stats = useMemo(() => {
        const counts = {
            [SubscriberStatus.Active]: 0,
            [SubscriberStatus.Expiring]: 0,
            [SubscriberStatus.Expired]: 0,
            [SubscriberStatus.Cancelled]: 0,
            [SubscriberStatus.Trial]: 0,
        };
        subscribers.forEach(s => {
            if (counts[s.status] !== undefined) {
                counts[s.status]++;
            }
        });

        const mrr = subscribers.reduce((total, sub) => {
            if (sub.status === SubscriberStatus.Active || sub.status === SubscriberStatus.Expiring || sub.status === SubscriberStatus.Trial) {
                 switch (sub.plan) {
                    case '1m': return total + 12.99;
                    case '3m': return total + (35.00 / 3);
                    case '6m': return total + (65.00 / 6);
                    case '12m': return total + (99.99 / 12);
                    default: return total;
                }
            }
            return total;
        }, 0);

        return { mrr, ...counts };
    }, [subscribers]);

    const subscribersToWatch = useMemo(() => {
        return subscribers
            .filter(s => s.status === SubscriberStatus.Expiring || s.status === SubscriberStatus.Expired)
            .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
            .slice(0, 5);
    }, [subscribers]);

    const handleCardClick = (filter: SubscriberFilter) => {
        setFilter(filter);
        setView('subscribers');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome back, {currentUser.name.split(' ')[0]}!</h1>
                <p className="text-slate-500 dark:text-slate-400">Here's a snapshot of your business today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Monthly Revenue" value={`$${stats.mrr.toFixed(2)}`} icon="💰" color="bg-sky-100 dark:bg-sky-900" />
                <StatCard title="Active" value={stats.Active} icon="✅" color="bg-green-100 dark:bg-green-900" onClick={() => handleCardClick(SubscriberStatus.Active)} />
                <StatCard title="Expiring Soon" value={stats.Expiring} icon="⏳" color="bg-amber-100 dark:bg-amber-900" onClick={() => handleCardClick(SubscriberStatus.Expiring)} />
                <StatCard title="Expired" value={stats.Expired} icon="❌" color="bg-red-100 dark:bg-red-900" onClick={() => handleCardClick(SubscriberStatus.Expired)} />
                <StatCard title="On Trial" value={stats.Trial} icon="🧪" color="bg-indigo-100 dark:bg-indigo-900" onClick={() => handleCardClick(SubscriberStatus.Trial)} />
            </div>
            
            <div className="grid grid-cols-1 gap-6">
                <div className="p-5 rounded-lg shadow-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-700 dark:text-white mb-4">Subscribers to Watch</h2>
                    {subscribersToWatch.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {subscribersToWatch.map(sub => (
                                        <tr key={sub.id}>
                                            <td className="py-3 pr-3 whitespace-nowrap">
                                                <div className="font-medium text-slate-900 dark:text-white">{sub.fullName}</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">{sub.email}</div>
                                            </td>
                                            <td className="py-3 px-3 whitespace-nowrap"><StatusBadge status={sub.status} /></td>
                                            <td className="py-3 px-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                Expires on {new Date(sub.endDate).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 pl-3 whitespace-nowrap text-right">
                                                <button onClick={() => handleCardClick(sub.status)} className="text-sm font-medium text-sky-600 hover:text-sky-800">View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center py-8 text-slate-500 dark:text-slate-400">No subscribers need immediate attention. Great job!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardView;