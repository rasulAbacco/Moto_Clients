import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BuyerSidebar } from './BuyerSidebar.jsx';
import { BuyerNavbar } from './BuyerNavbar.jsx';

const titleMap = {
    '/buyer/dashboard': 'Dashboard',
    '/buyer/dashboard/wishlist': 'Wishlist',
    '/buyer/dashboard/inquiries': 'My Inquiries',
    '/buyer/dashboard/orders': 'Orders',
    '/buyer/dashboard/notifications': 'Notifications',
    '/buyer/dashboard/profile': 'Profile',
    '/buyer/dashboard/settings': 'Settings',
};

export const BuyerLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const title = titleMap[location.pathname] || 'Buyer';

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] text-slate-900">
            <BuyerSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
            <div className="lg:pl-[260px]">
                <BuyerNavbar title={title} breadcrumb="Buyer" onOpenSidebar={() => setMobileOpen(true)} />
                <main className="p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};