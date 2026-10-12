import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Users, Heart, ShoppingBag, Eye, Trash2 } from 'lucide-react';
import { buyers as initial } from '../../data/adminMockData.js';
import { BuyerDetailModal } from '../../components/admin/BuyerDetailModal.jsx';
import { AdminConfirmDeleteModal } from '../../components/admin/AdminConfirmDeleteModal.jsx';

export const BuyersPage = () => {
    const [search, setSearch] = useState('');
    const [items, setItems] = useState(initial);
    const [viewing, setViewing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const filtered = useMemo(() => items.filter((b) => [b.name, b.email].some((f) => f.toLowerCase().includes(search.trim().toLowerCase()))), [items, search]);

    return (
        <div className="space-y-6">
            <Helmet><title>Buyers | Admin</title></Helmet>
            <div className="animate-fadeInUp">
                <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900"><Users size={22} className="text-[#001f3f]" /> Buyers</h1>
                <p className="text-sm text-slate-500">Registered buyers and their engagement.</p>
            </div>

            <div className="animate-fadeInUp flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                <Search size={16} className="text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search buyers..." className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
            </div>

            <div className="animate-fadeInUp overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Purchases</th><th className="px-5 py-3">Wishlist</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map((b) => (
                            <tr key={b.id} className="transition hover:bg-slate-50">
                                <td className="px-5 py-3.5 font-semibold text-slate-900">{b.name}</td>
                                <td className="px-5 py-3.5 text-slate-500"><p>{b.email}</p><p className="text-xs">{b.phone}</p></td>
                                <td className="px-5 py-3.5"><span className="flex items-center gap-1 font-semibold text-slate-900"><ShoppingBag size={13} className="text-[#001f3f]" /> {b.purchases.length}</span></td>
                                <td className="px-5 py-3.5"><span className="flex items-center gap-1 text-slate-600"><Heart size={13} className="text-red-400" /> {b.wishlist.length}</span></td>
                                <td className="px-5 py-3.5 text-slate-400">{b.joined}</td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => setViewing(b)} className="rounded-full p-1.5 text-slate-400 hover:bg-[#e6f2ff] hover:text-[#001f3f]"><Eye size={15} /></button>
                                        <button onClick={() => setDeleting(b)} className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {viewing && <BuyerDetailModal buyer={viewing} onClose={() => setViewing(null)} />}
            {deleting && (
                <AdminConfirmDeleteModal
                    itemName={deleting.name}
                    onCancel={() => setDeleting(null)}
                    onConfirm={() => { setItems((prev) => prev.filter((b) => b.id !== deleting.id)); setDeleting(null); }}
                />
            )}
        </div>
    );
};