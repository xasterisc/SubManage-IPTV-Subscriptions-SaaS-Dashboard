import React, { useState, useMemo, useEffect } from 'react';
import { Subscriber, SubscriberStatus, SubscriberFilter } from '../types';
import { EditIcon, TrashIcon, PlusIcon, PaperAirplaneIcon } from './icons';
import SubscriberModal from './SubscriberModal';

export const statusColors: Record<SubscriberStatus, string> = {
  [SubscriberStatus.Active]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [SubscriberStatus.Expiring]: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  [SubscriberStatus.Expired]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  [SubscriberStatus.Cancelled]: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  [SubscriberStatus.Trial]: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
};

const StatusBadge: React.FC<{ status: SubscriberStatus }> = ({ status }) => (
  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}`}>
    {status}
  </span>
);

interface SubscribersViewProps {
  subscribers: Subscriber[];
  onAdd: (subscriber: Subscriber) => void;
  onUpdate: (subscriber: Subscriber) => void;
  onDelete: (ids: string[]) => void;
  onSummarize: (notes: string) => Promise<string>;
  filter: SubscriberFilter;
  setFilter: (filter: SubscriberFilter) => void;
}

const SubscribersView: React.FC<SubscribersViewProps> = ({ subscribers, onAdd, onUpdate, onDelete, onSummarize, filter, setFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Clear selection when filter or search term changes
    setSelectedIds(new Set());
  }, [filter, searchTerm]);

  const filteredSubscribers = useMemo(() => {
    return subscribers
      .filter(sub => filter === 'all' || sub.status === filter)
      .filter(sub =>
        sub.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [subscribers, searchTerm, filter]);
  
  const handleOpenModal = (subscriber: Subscriber | null) => {
    setEditingSubscriber(subscriber);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setEditingSubscriber(null);
    setIsModalOpen(false);
  };

  const handleSaveSubscriber = (subscriberToSave: Subscriber) => {
    if (editingSubscriber) {
      onUpdate(subscriberToSave);
    } else {
      onAdd(subscriberToSave);
    }
    handleCloseModal();
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} selected subscribers?`)) {
        onDelete(Array.from(selectedIds));
        setSelectedIds(new Set());
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredSubscribers.map(s => s.id!)));
    } else {
      setSelectedIds(new Set());
    }
  }
  
  const isAllSelected = selectedIds.size > 0 && selectedIds.size === filteredSubscribers.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < filteredSubscribers.length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Subscribers</h1>
        <button onClick={() => handleOpenModal(null)} className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors shadow-sm">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Subscriber
        </button>
      </div>

      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row justify-between mb-4 space-y-2 md:space-y-0 md:space-x-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full md:w-1/3 p-2 bg-transparent border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="w-full md:w-auto p-2 bg-transparent border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value as SubscriberFilter)}
          >
            <option value="all">All Statuses</option>
            {Object.values(SubscriberStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        
        {selectedIds.size > 0 && (
          <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-md mb-4 flex justify-between items-center">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <button onClick={handleBulkDelete} className="flex items-center text-sm text-red-600 hover:text-red-800 font-semibold">
              <TrashIcon className="w-4 h-4 mr-1" />
              Delete Selected
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th scope="col" className="px-4 py-3">
                  <input type="checkbox" className="rounded"
                    checked={isAllSelected}
                    // Fix: The ref callback should not return a value. The expression `el && (el.indeterminate = isIndeterminate)` returns a boolean, causing a type error.
                    ref={el => { if (el) el.indeterminate = isIndeterminate }}
                    onChange={e => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Plan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">End Date</th>
                <th scope="col" className="text-right px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredSubscribers.map(sub => (
                <tr key={sub.id} className={`transition-colors ${selectedIds.has(sub.id!) ? 'bg-sky-50 dark:bg-sky-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                  <td className="px-4 py-4">
                    <input type="checkbox" className="rounded"
                      checked={selectedIds.has(sub.id!)}
                      onChange={e => handleSelectOne(sub.id!, e.target.checked)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{sub.fullName}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{sub.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={sub.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{sub.plan}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(sub.endDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-1">
                        <button onClick={() => alert(`Reminder sent to ${sub.fullName}`)} className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Send Reminder">
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleOpenModal(sub)} className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Edit Subscriber">
                            <EditIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => { if (window.confirm('Are you sure?')) onDelete([sub.id!]) }} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Delete Subscriber">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && <SubscriberModal subscriber={editingSubscriber} onClose={handleCloseModal} onSave={handleSaveSubscriber} onSummarize={onSummarize} />}
    </div>
  );
};

export default SubscribersView;