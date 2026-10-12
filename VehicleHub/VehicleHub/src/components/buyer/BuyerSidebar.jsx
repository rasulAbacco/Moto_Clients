import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Heart, MessageSquare, ShoppingBag, Search, Bell,
    UserCircle, Settings, LogOut, Sparkles, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const groups = [
    {
        label: 'MAIN',
        items: [{ label: 'Dashboard', to: '/buyer/dashboard', icon: LayoutDashboard, end: true }],
    },
    {
        label: 'MY ACTIVITY',
        items: [
            { label: 'Wishlist', to: '/buyer/dashboard/wishlist', icon: Heart },
            { label: 'My Inquiries', to: '/buyer/dashboard/inquiries', icon: MessageSquare },
            { label: 'Orders', to: '/buyer/dashboard/orders', icon: ShoppingBag },
        ],
    },
    {
        label: 'DISCOVER',
        items: [{ label: 'Browse Vehicles', to: '/search', icon: Search }],
    },
    {
        label: 'COMMUNICATION',
        items: [{ label: 'Notifications', to: '/buyer/dashboard/notifications', icon: Bell }],
    },
    {
        label: 'ACCOUNT',
        items: [
            { label: 'Profile', to: '/buyer/dashboard/profile', icon: UserCircle },
            { label: 'Settings', to: '/buyer/dashboard/settings', icon: Settings },
        ],
    },
];

export const BuyerSidebar = ({ mobileOpen, onCloseMobile }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const linkClasses = ({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
            ? 'bg-gradient-to-r from-[#001f3f] to-[#002a55] text-white shadow-md shadow-[#001f3f]/20'
            : 'text-slate-600 hover:translate-x-0.5 hover:bg-slate-50 hover:text-slate-900'
        }`;

    const content = (
        <div className="flex h-full flex-col bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#001f3f] to-[#003d7a] text-white shadow-md shadow-[#001f3f]/20 transition-transform duration-300 hover:rotate-6">
                        <Sparkles size={16} />
                    </div>
                    <span className="text-sm font-bold tracking-wide text-slate-900">BUYER</span>
                </div>
                <button onClick={onCloseMobile} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 lg:hidden">
                    <X size={18} />
                </button>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
                {groups.map((group) => (
                    <div key={group.label}>
                        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{group.label}</p>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink key={item.to} to={item.to} end={item.end} className={linkClasses} onClick={onCloseMobile}>
                                        <Icon size={17} className="shrink-0" />
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="border-t border-slate-100 p-3">
                <button
                    onClick={() => { logout?.(); window.location.replace('/'); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-red-700"
                >
                    <LogOut size={17} /> Logout
                </button>
            </div>
        </div>
    );

    return (
        <>
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-slate-200 lg:block">
                {content}
            </aside>
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCloseMobile} />
                    <aside className="absolute inset-y-0 left-0 w-[260px] shadow-2xl">{content}</aside>
                </div>
            )}
        </>
    );
};