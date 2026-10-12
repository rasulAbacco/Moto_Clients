import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ClipboardList, Search, Loader2, Eye } from 'lucide-react';
import { getAllInspections, getInspectionDetail, finalVerifyVehicle } from '../../admin/services/adminApi.js';
import { InspectionDetailsModal } from '../components/InspectionDetailsModal.jsx';
import { InspectionDecisionPanel } from '../components/InspectionDecisionPanel.jsx';

const statusBadge = {
    ASSIGNED: 'bg-[#e6f2ff] text-[#001f3f]',
    ACCEPTED: 'bg-blue-50 text-blue-700',
    IN_PROGRESS: 'bg-amber-50 text-amber-700',
    COMPLETED: 'bg-emerald-50 text-emerald-700',
    RE_VERIFICATION: 'bg-blue-50 text-blue-700',
    REJECTED: 'bg-red-50 text-red-700',
    CANCELLED: 'bg-slate-100 text-slate-500',
};

export const InspectionManagementPage = () => {
    const [inspections, setInspections] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [selectedInspection, setSelectedInspection] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [decisionLoading, setDecisionLoading] = useState(false);

    const openInspection = async (inspectionId) => {
        setDetailLoading(true);
        try {
            const res = await getInspectionDetail(inspectionId);
            setSelectedInspection(res.data?.data);
        } catch (error) {
            console.error('Failed to load inspection details', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleDecision = async (decision, reason) => {
        setDecisionLoading(true);
        try {
            await finalVerifyVehicle(selectedInspection.id, { decision, reason });
            setSelectedInspection(null);
            const res = await getAllInspections({ search: search || undefined, status: status || undefined });
            setInspections(res.data?.data?.inspections || []);
            setTotal(res.data?.data?.total || 0);
        } finally {
            setDecisionLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await getAllInspections({ search: search || undefined, status: status || undefined });
                if (!cancelled) {
                    setInspections(res.data?.data?.inspections || []);
                    setTotal(res.data?.data?.total || 0);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        const debounce = setTimeout(fetchData, 300);
        return () => { cancelled = true; clearTimeout(debounce); };
    }, [search, status]);

    return (
        <div className="space-y-6 text-slate-900">
            <Helmet><title>Inspections | Admin</title></Helmet>

            <div className="animate-fadeInUp relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#001f3f] via-[#002a55] to-[#003d7a] p-6 shadow-lg shadow-[#001f3f]/20">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200"><ClipboardList size={13} /> Monitoring</p>
                <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">All Inspections</h1>
                <p className="mt-1 text-sm text-white/70">Track every inspection across your field team.</p>
            </div>

            <div className="animate-fadeInUp flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                    <Search size={16} className="text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-transparent text-sm focus:outline-none" />
                </div>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none">
                    <option value="">All statuses</option>
                    {['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'RE_VERIFICATION', 'REJECTED', 'CANCELLED'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="w-fit rounded-full bg-[#e6f2ff] px-3 py-1.5 text-xs font-bold text-[#001f3f]">{total} total</span>
            </div>

            <div className="animate-fadeInUp overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex h-56 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" /></div>
                ) : (
                    <table className="w-full min-w-[800px] text-left text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-5 py-3.5">Inspection ID</th>
                                <th className="px-5 py-3.5">Vehicle</th>
                                <th className="px-5 py-3.5">Seller</th>
                                <th className="px-5 py-3.5">Inspector</th>
                                <th className="px-5 py-3.5">Status</th>
                                <th className="px-5 py-3.5">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {inspections.map((insp) => (
                                <tr key={insp.id} className="hover:bg-slate-50">
                                    <td className="px-5 py-4 font-mono text-xs text-[#001f3f]">{insp.inspectionNo}</td>
                                    <td className="px-5 py-4 font-semibold text-slate-900">{insp.vehicleListing?.title}</td>
                                    <td className="px-5 py-4 text-slate-500">{insp.seller?.fullName}</td>
                                    <td className="px-5 py-4 text-slate-500">{insp.inspector?.fullName}</td>
                                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge[insp.status]}`}>{insp.status.replace('_', ' ')}</span></td>
                                    <td className="px-5 py-4">
                                        <button onClick={() => openInspection(insp.id)} disabled={detailLoading} className="flex items-center gap-1.5 rounded-full border border-[#001f3f]/20 bg-[#e6f2ff] px-3 py-1.5 text-xs font-semibold text-[#001f3f] hover:bg-[#d5eaff] disabled:opacity-60">
                                            <Eye size={13} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {detailLoading && <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/20"><Loader2 className="h-7 w-7 animate-spin text-[#001f3f]" /></div>}
            {selectedInspection && (
                <InspectionDetailsModal
                    inspection={selectedInspection}
                    onClose={() => setSelectedInspection(null)}
                    onDecision={handleDecision}
                    decisionLoading={decisionLoading}
                />
            )}
        </div>
    );
};