import React, { useState } from 'react';
import { View } from '../types';
import { DashboardIcon, UsersIcon, DocumentIcon, CogIcon, ChevronDownIcon, BrandIcon, UserCircleIcon, LogoutIcon } from './icons';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const NavItem: React.FC<{
  viewName: View;
  currentView: View;
  setView: (view: View) => void;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}> = ({ viewName, currentView, setView, icon, label, collapsed }) => (
  <li>
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); setView(viewName); }}
      className={`flex items-center p-2 text-base rounded-lg transition-colors duration-200 group ${
        currentView === viewName
          ? 'bg-sky-600 text-white'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
      } ${collapsed ? 'justify-center' : ''}`}
      title={collapsed ? label : undefined}
    >
      {icon}
      <span className={`ml-3 whitespace-nowrap ${collapsed ? 'hidden' : ''}`}>{label}</span>
    </a>
  </li>
);

const NavGroup: React.FC<{
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  children: React.ReactNode;
  currentView: View;
  viewsInGroup: View[];
}> = ({ icon, label, collapsed, children, currentView, viewsInGroup }) => {
    const isActive = viewsInGroup.includes(currentView);
    const [isOpen, setIsOpen] = useState(isActive);

    const handleToggle = () => {
        if (!collapsed) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <li>
            <button
                type="button"
                className={`flex items-center w-full p-2 text-base text-left rounded-lg group transition-colors duration-200 ${
                    isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                } hover:bg-slate-200 dark:hover:bg-slate-700 ${collapsed ? 'justify-center' : ''}`}
                onClick={handleToggle}
                title={collapsed ? label : undefined}
            >
                {icon}
                <span className={`flex-1 ml-3 whitespace-nowrap ${collapsed ? 'hidden' : ''}`}>{label}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${collapsed ? 'hidden' : ''}`} />
            </button>
            <ul className={`py-2 space-y-2 ${!isOpen || collapsed ? 'hidden' : ''}`}>
                {React.Children.map(children, child => 
                    React.isValidElement(child) ? React.cloneElement(child, { collapsed } as any) : child
                )}
            </ul>
        </li>
    )
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, collapsed }) => {
    const specViews: View[] = ['productSpec', 'mvp', 'dataModel', 'api', 'integrations', 'security', 'roadmap'];
  
  return (
    <aside className={`transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`} aria-label="Sidebar">
      <div className="flex flex-col h-screen px-3 py-4 overflow-y-auto bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
        <a href="#" onClick={(e) => { e.preventDefault(); setView('dashboard'); }} className={`flex items-center mb-5 h-10 ${collapsed ? 'justify-center' : 'pl-2.5'}`}>
            <BrandIcon className="w-8 h-8 text-sky-600" />
            <span className={`self-center text-xl font-semibold whitespace-nowrap dark:text-white ml-2 ${collapsed ? 'hidden' : ''}`}>
                SubManage
            </span>
        </a>
        
        <ul className="space-y-2 flex-grow">
            <div className={`px-2 my-2 text-xs font-semibold tracking-widest text-slate-400 uppercase ${collapsed ? 'hidden' : ''}`}>Menu</div>
            <NavItem viewName="dashboard" currentView={currentView} setView={setView} icon={<DashboardIcon className="w-6 h-6" />} label="Dashboard" collapsed={collapsed} />
            <NavItem viewName="subscribers" currentView={currentView} setView={setView} icon={<UsersIcon className="w-6 h-6" />} label="Subscribers" collapsed={collapsed} />
            <NavItem viewName="staff" currentView={currentView} setView={setView} icon={<UserCircleIcon className="w-6 h-6" />} label="Staff" collapsed={collapsed} />

            <NavGroup
                label="Documentation"
                icon={<DocumentIcon className="w-6 h-6" />}
                collapsed={collapsed}
                currentView={currentView}
                viewsInGroup={specViews}
            >
                <NavItem viewName="productSpec" currentView={currentView} setView={setView} icon={<span className="w-6 h-6 text-center">📄</span>} label="Executive Summary" collapsed={false} />
                <NavItem viewName="mvp" currentView={currentView} setView={setView} icon={<span className="w-6 h-6 text-center">🎯</span>} label="Features & MVP" collapsed={false} />
                <NavItem viewName="dataModel" currentView={currentView} setView={setView} icon={<span className="w-6 h-6 text-center">📦</span>} label="Data Model" collapsed={false} />
                <NavItem viewName="api" currentView={currentView} setView={setView} icon={<span className="w-6 h-6 text-center">🔗</span>} label="API Spec" collapsed={false} />
                <NavItem viewName="integrations" currentView={currentView} setView={setView} icon={<span className="w-6 h-6 text-center">🤝</span>} label="Integrations" collapsed={false} />
                <NavItem viewName="security" currentView={currentView} setView={setView} icon={<span className="w-6 h-6 text-center">🛡️</span>} label="Security" collapsed={false} />
                <NavItem viewName="roadmap" currentView={currentView} setView={setView} icon={<span className="w-6 h-6 text-center">🗺️</span>} label="Roadmap" collapsed={false} />
            </NavGroup>
        </ul>

        <div className="mt-auto">
            <ul className="pt-4 mt-4 space-y-2 border-t border-slate-200 dark:border-slate-700">
                <NavItem viewName="settings" currentView={currentView} setView={setView} icon={<CogIcon className="w-6 h-6" />} label="Settings" collapsed={collapsed} />
                <NavItem viewName="profile" currentView={currentView} setView={setView} icon={<UserCircleIcon className="w-6 h-6" />} label="Profile" collapsed={collapsed} />
                 <li>
                    <a href="#" onClick={(e) => e.preventDefault()}
                        className={`flex items-center p-2 text-base rounded-lg transition-colors duration-200 group text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 ${collapsed ? 'justify-center' : ''}`}
                        title={collapsed ? 'Logout' : undefined}
                    >
                       <LogoutIcon className="w-6 h-6" />
                       <span className={`ml-3 whitespace-nowrap ${collapsed ? 'hidden' : ''}`}>Logout</span>
                    </a>
                </li>
            </ul>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;