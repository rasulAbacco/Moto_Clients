import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Loader2, Eye, FileText, Clock } from 'lucide-react';
import { getAllSellers, markSellerUnderReview } from '../../admin/services/adminApi.js';

const statusBadge = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    UNDER_REVIEW: 'bg-blue-50 text-blue-700 border-blue-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
}) : 'Not available';

export const SellerManagementPage = () => {
    const navigate = useNavigate();
    const [sellers, setSellers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [markingId, setMarkingId] = useState(null);

    const handleUnderReview = async (event, sellerId) => {
        event.stopPropagation();
        setMarkingId(sellerId);
        try {
            await markSellerUnderReview(sellerId);
            const res = await getAllSellers({ search: search || undefined, status: status || undefined });
            setSellers(res.data?.data?.sellers || []);
            setTotal(res.data?.data?.total || 0);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to update seller status');
        } finally {
            setMarkingId(null);
        }
    };

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await getAllSellers({ search: search || undefined, status: status || undefined });
                if (!cancelled) {
                    setSellers(res.data?.data?.sellers || []);
                    setTotal(res.data?.data?.total || 0);
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) setError(err?.response?.data?.message || 'Failed to load sellers');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        const debounce = setTimeout(fetchData, 300);
        return () => { cancelled = true; clearTimeout(debounce); };
    }, [search, status]);

    return (
        <div className="space-y-6 text-slate-900">
            <Helmet><title>Sellers | Admin</title></Helmet>

            <div className="animate-fadeInUp relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#001f3f] via-[#002a55] to-[#003d7a] p-6 shadow-lg shadow-[#001f3f]/20">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                    <Users size={13} /> Seller Oversight
                </p>
                <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Manage Sellers</h1>
                <p className="mt-1 text-sm text-white/70">Review registrations, documents, and verification status.</p>
            </div>

            <div className="animate-fadeInUp flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 transition focus-within:border-[#001f3f]/30 focus-within:bg-white">
                    <Search size={16} className="shrink-0 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, business, email, or phone..." className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
                </div>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:border-[#001f3f]/30 focus:outline-none">
                    <option value="">All statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
                <span className="w-fit rounded-full bg-[#e6f2ff] px-3 py-1.5 text-xs font-bold text-[#001f3f]">{total} sellers</span>
            </div>

            <div className="animate-fadeInUp overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex h-56 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" /></div>
                ) : error ? (
                    <div className="flex h-56 items-center justify-center text-sm text-red-500">{error}</div>
                ) : sellers.length === 0 ? (
                    <div className="flex h-56 flex-col items-center justify-center gap-2 text-slate-400">
                        <Users size={24} /><p className="text-sm font-medium">No sellers found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1050px] text-left text-sm">
                            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-3.5">Seller name</th>
                                    <th className="px-5 py-3.5">Business name</th>
                                    <th className="px-5 py-3.5">Profile submitted</th>
                                    <th className="px-5 py-3.5">Contact</th>
                                    <th className="px-5 py-3.5">Details</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sellers.map((s) => (
                                    <tr key={s.id} className="transition hover:bg-slate-50">
                                        <td className="px-5 py-4">
                                            <div className="flex min-w-[180px] items-center gap-3">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#001f3f] to-[#003366] text-sm font-bold text-white">{(s.ownerName || 'S')[0].toUpperCase()}</span>
                                                <span className="font-bold text-slate-900">{s.ownerName || 'Not available'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-slate-700">{s.businessName || 'Not available'}</td>
                                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(s.submittedAt)}</td>
                                        <td className="px-5 py-4"><p className="text-slate-700">{s.user?.email || 'No email'}</p><p className="mt-0.5 text-xs text-slate-500">{s.user?.phone || 'No phone'}</p></td>
                                        <td className="px-5 py-4 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><FileText size={13} /> {s.documents?.length || 0} documents</span><span className="mt-1 block">{s._count?.vehicleListings || 0} vehicle listings</span></td>
                                        <td className="px-5 py-4"><span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge[s.verificationStatus] || statusBadge.PENDING}`}>{s.verificationStatus?.replace('_', ' ') || 'PENDING'}</span></td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => navigate(`/admin/sellers/${s.id}`)} aria-label={`View ${s.ownerName}`} className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-[#001f3f]/30 hover:text-[#001f3f]"><Eye size={15} /></button>
                                                {s.verificationStatus === 'PENDING' && <button type="button" onClick={(event) => handleUnderReview(event, s.id)} disabled={markingId === s.id} className="flex shrink-0 items-center gap-1 rounded-lg border border-blue-200 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50"><Clock size={13} /> {markingId === s.id ? 'Updating' : 'Mark Review'}</button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};