import React, { useState, useMemo } from 'react';
import { StaffUser, Role } from '../types';
import { EditIcon, TrashIcon, PlusIcon, CloseIcon } from './icons';

const roleColors: Record<Role, string> = {
  [Role.Admin]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  [Role.Support]: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
};

const RoleBadge: React.FC<{ role: Role }> = ({ role }) => (
  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[role]}`}>
    {role}
  </span>
);

const inputStyles = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm";

const StaffModal: React.FC<{ user: StaffUser | null; onClose: () => void; onSave: (user: StaffUser) => void; }> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<StaffUser>>(user || { name: '', email: '', role: Role.Support });
    const isNew = !user;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            alert('Name and Email are required.');
            return;
        }
        onSave({ ...user, ...formData } as StaffUser);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">{isNew ? 'Add Staff User' : 'Edit Staff User'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <CloseIcon className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Full Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} className={inputStyles} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Email</label>
                            <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputStyles} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} className={inputStyles}>
                                {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 mr-2">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700">Save User</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface StaffViewProps {
    staff: StaffUser[];
    onAdd: (user: StaffUser) => void;
    onUpdate: (user: StaffUser) => void;
    onDelete: (id: string) => void;
}

const StaffView: React.FC<StaffViewProps> = ({ staff, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);

  const filteredStaff = useMemo(() => {
    return staff.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staff, searchTerm]);
  
  const handleOpenModal = (user: StaffUser | null) => {
      setEditingUser(user);
      setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
      setEditingUser(null);
      setIsModalOpen(false);
  };

  const handleSave = (user: StaffUser) => {
      if (editingUser) {
          onUpdate(user);
      } else {
          onAdd(user);
      }
      handleCloseModal();
  };

  const handleDelete = (id: string) => {
      if (window.confirm('Are you sure you want to delete this staff member?')) {
          onDelete(id);
      }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Staff Management</h1>
        <button onClick={() => handleOpenModal(null)} className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors shadow-sm">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Staff User
        </button>
      </div>

      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full md:w-1/3 p-2 bg-transparent border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Last Login</th>
                <th scope="col" className="text-right px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredStaff.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><RoleBadge role={user.role} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(user.lastLogin).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => handleOpenModal(user)} className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Edit User">
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(user.id!)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Delete User">
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
      {isModalOpen && <StaffModal user={editingUser} onClose={handleCloseModal} onSave={handleSave} />}
    </div>
  );
};

export default StaffView;
