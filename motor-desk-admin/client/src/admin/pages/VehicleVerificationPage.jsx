import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { Search, ShieldCheck, Loader2, X, UserCog, Car, Eye, FileText, MapPin } from 'lucide-react';
import { getVehiclesForVerification, getAvailableInspectors, assignInspection, finalVerifyVehicle, getInspectionDetail } from '../../admin/services/adminApi.js';
import { InspectionDetailsModal } from '../components/InspectionDetailsModal.jsx';

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
}).format(value || 0);

const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
}) : 'Not available';

const vehicleStatusBadge = {
    PENDING: 'bg-amber-50 text-amber-700',
    UNDER_VERIFICATION: 'bg-blue-50 text-blue-700',
    APPROVED: 'bg-emerald-50 text-emerald-700',
    REJECTED: 'bg-red-50 text-red-700',
    SOLD: 'bg-purple-50 text-purple-700',
    DRAFT: 'bg-cyan-50 text-cyan-700',
    ARCHIVED: 'bg-slate-100 text-slate-600',
};

const detailFields = [
    ['title', 'Vehicle Title'], ['category', 'Category'], ['brand', 'Brand'], ['model', 'Model'], ['variant', 'Variant'],
    ['registrationNumber', 'Registration Number'], ['vin', 'VIN / Chassis'], ['price', 'Price'],
    ['manufacturingYear', 'Manufacturing Year'], ['registrationYear', 'Registration Year'],
    ['fuelType', 'Fuel Type'], ['transmission', 'Transmission'], ['kmDriven', 'Kilometers Driven'],
    ['ownership', 'Ownership'], ['color', 'Color'], ['seatingCapacity', 'Seating Capacity'],
    ['engineCapacity', 'Engine Capacity'], ['mileage', 'Mileage'], ['vehicleCondition', 'Vehicle Condition'],
    ['engineCondition', 'Engine Condition'], ['tyreCondition', 'Tyre Condition'], ['batteryCondition', 'Battery Condition'],
    ['accidentHistory', 'Accident History'], ['floodDamage', 'Flood Damage'],
    ['sellerType', 'Seller Type'], ['dealerName', 'Dealer Name'], ['country', 'Country'], ['state', 'State'],
    ['sellerName', 'Seller Name'], ['mobileNumber', 'Seller Mobile Number'], ['email', 'Seller Email'],
    ['city', 'City'], ['area', 'Area'], ['pincode', 'Pincode'], ['description', 'Description'],
    ['negotiable', 'Negotiable'], ['emiAvailable', 'EMI Available'], ['rcAvailable', 'RC Available'],
    ['insuranceAvailable', 'Insurance Available'], ['insuranceExpiry', 'Insurance Expiry'],
    ['pollutionCertificate', 'Pollution Certificate'], ['serviceBook', 'Service Book'],
    ['numberOfKeys', 'Number of Keys'], ['loanPending', 'Loan Pending'], ['nocAvailable', 'NOC Available'],
    ['features', 'Features'], ['isFeatured', 'Featured'], ['views', 'Views'], ['rejectReason', 'Reject Reason'],
    ['createdAt', 'Created At'], ['updatedAt', 'Updated At'],
];

const displayValue = (key, value) => {
    if (key === 'price') return formatCurrency(value);
    if (Array.isArray(value)) return value.length ? value.join(', ') : 'None';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (key === 'createdAt' || key === 'updatedAt' || key === 'insuranceExpiry') {
        return new Date(value).toLocaleString('en-IN');
    }
    return String(value);
};

const VehicleDetailModal = ({ vehicle, onClose, onAssign }) => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-2 backdrop-blur-sm sm:p-5">
        <div className="relative my-auto flex max-h-[96vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between bg-[#001f3f] px-5 py-4 text-white sm:px-7">
                <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Vehicle Verification</p><h2 className="truncate text-lg font-bold sm:text-2xl">{vehicle.title}</h2></div>
                <button onClick={onClose} aria-label="Close vehicle details" className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"><X size={21} /></button>
            </div>
            <div className="grid min-h-0 overflow-y-auto lg:grid-cols-[1.4fr_1fr]">
                <div className="space-y-6 p-4 sm:p-7">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {(vehicle.images || []).map((image, index) => <a key={`${image}-${index}`} href={image} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"><img src={image} alt={`${vehicle.title} ${index + 1}`} className="aspect-[4/3] w-full object-cover transition hover:scale-105" /></a>)}
                        {!vehicle.images?.length && <div className="col-span-full flex h-36 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">No vehicle images uploaded</div>}
                    </div>
                    <section><h3 className="mb-3 flex items-center gap-2 text-base font-bold"><Car size={17} className="text-[#001f3f]" /> Vehicle information</h3><div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">{detailFields.map(([key, label]) => vehicle[key] !== null && vehicle[key] !== undefined && vehicle[key] !== '' && <div key={key} className="border-b border-slate-100 pb-2"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-0.5 break-words text-sm font-medium text-slate-800">{displayValue(key, vehicle[key])}</p></div>)}</div></section>
                    <section><h3 className="mb-3 flex items-center gap-2 text-base font-bold"><FileText size={17} className="text-[#001f3f]" /> Documents</h3><div className="flex flex-wrap gap-3">{[['rcFront', 'RC document'], ['insuranceDocument', 'Insurance document']].map(([key, label]) => vehicle[key] && <a key={key} href={vehicle[key]} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#001f3f] hover:bg-slate-50"><FileText size={14} /> {label}</a>)}{(vehicle.documents || []).map((doc, index) => <a key={`${doc}-${index}`} href={doc} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#001f3f] hover:bg-slate-50"><FileText size={14} /> Document {index + 1}</a>)}{!vehicle.rcFront && !vehicle.insuranceDocument && !vehicle.documents?.length && <p className="text-sm text-slate-400">No documents uploaded.</p>}</div></section>
                </div>
                <aside className="border-t border-slate-200 bg-slate-50 p-4 sm:p-7 lg:border-l lg:border-t-0">
                    <h3 className="mb-3 flex items-center gap-2 text-base font-bold"><UserCog size={17} className="text-[#001f3f]" /> Seller details</h3>
                    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm"><p className="font-bold">{vehicle.seller?.fullName || vehicle.sellerName || 'Seller'}</p><p className="text-slate-600">{vehicle.seller?.email || vehicle.email || 'No email'}</p><p className="text-slate-600">{vehicle.seller?.phone || vehicle.mobileNumber || 'No phone'}</p><p className="flex items-center gap-1.5 text-slate-600"><MapPin size={14} /> {[vehicle.city, vehicle.state, vehicle.pincode].filter(Boolean).join(', ') || 'Location unavailable'}</p></div>
                    <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-blue-700">Current listing status</p><p className="mt-1 text-lg font-bold text-slate-900">{vehicle.status}</p><p className="mt-1 text-xs text-slate-500">Inspection status: {vehicle.fieldInspections?.[0]?.status || 'Not assigned'}</p></div>
                    <button onClick={onAssign} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#001f3f] px-4 py-3 text-sm font-bold text-white hover:bg-[#002a55]"><UserCog size={16} /> Assign Field Inspector</button>
                </aside>
            </div>
        </div>
    </div>
);

const AssignModal = ({ vehicle, onClose, onAssigned }) => {
    const [inspectors, setInspectors] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [scheduledDate, setScheduledDate] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        getAvailableInspectors().then((res) => setInspectors(res.data?.data || [])).finally(() => setLoading(false));
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedId) return toast.error('Please select an inspector');
        setSubmitting(true);
        try {
            await assignInspection({
                vehicleListingId: vehicle.id,
                inspectorId: selectedId,
                priority,
                scheduledDate: scheduledDate || undefined,
                description,
            });
            toast.success('Inspector assigned — notifications sent');
            onAssigned();
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to assign inspection');
        } finally {
            setSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-2 sm:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="animate-fadeInUp relative my-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between bg-gradient-to-r from-[#001f3f] to-[#003d7a] px-5 py-4">
                    <div className="flex items-center gap-2 text-white">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15"><UserCog size={15} /></span>
                        <div><p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200">Assign Inspector</p><h3 className="truncate text-sm font-bold">{vehicle.title}</h3></div>
                    </div>
                    <button onClick={onClose} className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"><X size={16} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-5">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Select Field Inspector *</label>
                        {loading ? (
                            <div className="flex h-11 items-center justify-center rounded-lg border border-slate-200"><Loader2 size={15} className="animate-spin text-[#001f3f]" /></div>
                        ) : (
                            <select required value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full rounded-lg border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-[#001f3f] focus:outline-none">
                                <option value="">-- choose inspector --</option>
                                {inspectors.map((i) => (
                                    <option key={i.id} value={i.id}>{i.fullName} ({i.activeWorkload} active)</option>
                                ))}
                            </select>
                        )}
                        {!loading && inspectors.length === 0 && <p className="mt-1 text-xs text-red-500">No field inspectors available. Create one first.</p>}
                    </div>
                    <div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Verification description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Add instructions or verification notes for the inspector..." className="w-full resize-y rounded-lg border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-[#001f3f] focus:outline-none" /></div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Priority</label>
                        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded-lg border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-[#001f3f] focus:outline-none">
                            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Scheduled Date</label>
                        <input type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="w-full rounded-lg border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-[#001f3f] focus:outline-none" />
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 rounded-lg border-2 border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={submitting} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#001f3f] py-2.5 text-sm font-bold text-white transition hover:bg-[#002a55] disabled:opacity-60">
                            {submitting ? <Loader2 size={15} className="animate-spin" /> : 'Assign & Notify'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export const VehicleVerificationPage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [assigning, setAssigning] = useState(null);
    const [viewing, setViewing] = useState(null);
    const [status, setStatus] = useState('ALL');
    const [decisionLoading, setDecisionLoading] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res = await getVehiclesForVerification({ search: search || undefined, status });
            setVehicles(res.data?.data?.vehicles || []);
            setTotal(res.data?.data?.total || 0);
        } catch (err) {
            toast.error('Failed to load vehicles' + (err?.response?.data?.message || ''));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(fetchVehicles, 300);
        return () => clearTimeout(debounce);
    }, [search, status]);

    const openVehicle = async (vehicle) => {
        const inspection = vehicle.fieldInspections?.[0];
        if (!inspection?.id) {
            setViewing(vehicle);
            return;
        }

        setViewLoading(true);
        try {
            const response = await getInspectionDetail(inspection.id);
            const inspectionDetail = response.data?.data;
            setViewing({
                ...vehicle,
                fieldInspections: inspectionDetail ? [inspectionDetail] : vehicle.fieldInspections,
            });
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to load inspection details');
        } finally {
            setViewLoading(false);
        }
    };

    const handleVerificationDecision = async (inspectionId, decision, reason) => {
        setDecisionLoading(true);
        try {
            await finalVerifyVehicle(inspectionId, { decision, reason });
            toast.success('Verification status updated');
            setViewing((currentVehicle) => currentVehicle ? {
                ...currentVehicle,
                status: decision === 'APPROVE' ? 'APPROVED' : decision === 'REJECT' ? 'REJECTED' : 'UNDER_VERIFICATION',
                fieldInspections: currentVehicle.fieldInspections?.map((inspection, index) => index === 0
                    ? { ...inspection, status: decision === 'RECHECK' ? 'RE_VERIFICATION' : decision === 'REJECT' ? 'REJECTED' : inspection.status, result: decision === 'RECHECK' ? 'NEEDS_CORRECTION' : inspection.result, correctionReason: decision === 'RECHECK' ? reason : inspection.correctionReason }
                    : inspection),
                rejectReason: decision === 'REJECT' ? reason : currentVehicle.rejectReason,
            } : null);
            fetchVehicles();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Verification update failed');
        } finally {
            setDecisionLoading(false);
        }
    };

    return (
        <div className="space-y-6 text-slate-900">
            <Helmet><title>Vehicle Verification | Admin</title></Helmet>

            <div className="animate-fadeInUp relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#001f3f] via-[#002a55] to-[#003d7a] p-6 shadow-lg shadow-[#001f3f]/20">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200"><ShieldCheck size={13} /> Verification Queue</p>
                <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Vehicles Awaiting Verification</h1>
                <p className="mt-1 text-sm text-white/70">Assign a field inspector to verify each listing before approval.</p>
            </div>

            <div className="animate-fadeInUp flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                <Search size={16} className="text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vehicle..." className="w-full max-w-xs bg-transparent text-sm focus:outline-none" />
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="UNDER_VERIFICATION">Under Verification</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="SOLD">Sold</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                </select>
                <span className="ml-auto rounded-full bg-[#e6f2ff] px-3 py-1.5 text-xs font-bold text-[#001f3f]">{total} listings</span>
            </div>

            <div className="animate-fadeInUp overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex h-56 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" /></div>
                ) : vehicles.length === 0 ? (
                    <div className="flex h-56 flex-col items-center justify-center gap-2 text-slate-400"><Car size={24} /><p className="text-sm font-medium">No pending vehicles.</p></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1050px] text-left text-sm">
                            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-3.5">Vehicle name</th>
                                    <th className="px-5 py-3.5">Seller name</th>
                                    <th className="px-5 py-3.5">Submitted by seller</th>
                                    <th className="px-5 py-3.5">Accepted by inspector</th>
                                    <th className="px-5 py-3.5">Inspector</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {vehicles.map((v) => {
                                    const latestInspection = v.fieldInspections?.[0];
                                    const inspectionStatus = latestInspection?.status || v.status;
                                    return (
                                        <tr key={v.id} className="transition hover:bg-slate-50">
                                            <td className="px-5 py-4">
                                                <div className="flex min-w-[220px] items-center gap-3">
                                                    {v.images?.[0] ? <img src={v.images[0]} className="h-11 w-11 rounded-lg object-cover" alt="" /> : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e6f2ff] text-lg">🚘</span>}
                                                    <div className="min-w-0"><p className="truncate font-bold text-slate-900">{v.title}</p><p className="text-xs text-slate-500">{formatCurrency(v.price)}</p></div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-slate-700">{v.seller?.fullName || v.sellerName || 'Not available'}</td>
                                            <td className="px-5 py-4 whitespace-nowrap text-slate-600">{formatDate(v.createdAt)}</td>
                                            <td className="px-5 py-4 whitespace-nowrap text-slate-600">{formatDate(latestInspection?.acceptedAt)}</td>
                                            <td className="px-5 py-4 font-semibold text-slate-700">
                                                {latestInspection?.inspector?.fullName || 'Not assigned'}
                                                {latestInspection?.status && <span className="ml-1 font-medium text-slate-500">({latestInspection.status.replace('_', ' ')})</span>}
                                            </td>
                                            <td className="px-5 py-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${vehicleStatusBadge[v.status] || 'bg-slate-100 text-slate-600'}`}>{v.status?.replace('_', ' ') || 'Not available'}</span></td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openVehicle(v)} disabled={viewLoading} aria-label={`View ${v.title}`} className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-[#001f3f]/30 hover:text-[#001f3f] disabled:cursor-wait disabled:opacity-50"><Eye size={16} /></button>
                                                    {!latestInspection && <button onClick={() => setAssigning(v)} className="whitespace-nowrap cursor-pointer rounded-lg bg-[#001f3f] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#002a55]">Assign Inspector</button>}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {viewing && (viewing.fieldInspections?.[0] ? (
                <InspectionDetailsModal
                    inspection={{ ...viewing.fieldInspections[0], vehicleListing: viewing, seller: viewing.fieldInspections[0].seller || viewing.seller }}
                    onClose={() => setViewing(null)}
                    onDecision={(decision, reason) => handleVerificationDecision(viewing.fieldInspections[0].id, decision, reason)}
                    decisionLoading={decisionLoading}
                />
            ) : (
                <VehicleDetailModal
                    vehicle={viewing}
                    onClose={() => setViewing(null)}
                    onAssign={() => { setAssigning(viewing); setViewing(null); }}
                />
            ))}
            {assigning && <AssignModal vehicle={assigning} onClose={() => setAssigning(null)} onAssigned={fetchVehicles} />}
        </div>
    );
};