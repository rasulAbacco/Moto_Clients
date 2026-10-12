import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    ArrowLeft, User, Phone, Mail, MapPin, FileText, Car, Loader2, Clock, CheckCircle2, XCircle, Eye,
} from 'lucide-react';
import { approveSellerProfile, getSellerDetail, markSellerUnderReview, verifySellerDocument } from '../../admin/services/adminApi.js';

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
}).format(value || 0);

const statusBadge = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    UNDER_REVIEW: 'bg-blue-50 text-blue-700 border-blue-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

const vehicleStatusBadge = {
    PENDING: 'bg-amber-50 text-amber-700',
    APPROVED: 'bg-emerald-50 text-emerald-700',
    REJECTED: 'bg-red-50 text-red-700',
    SOLD: 'bg-purple-50 text-purple-700',
    DRAFT: 'bg-cyan-50 text-cyan-700',
    ARCHIVED: 'bg-slate-100 text-slate-600',
};

const Row = ({ icon: Icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-0">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e6f2ff] text-[#001f3f]"><Icon size={14} /></span>
            <div className="min-w-0"><p className="text-xs font-semibold text-slate-400">{label}</p><p className="mt-0.5 truncate text-sm font-medium text-slate-800">{value}</p></div>
        </div>
    );
};

const VehicleDetailsModal = ({ vehicle, seller, onClose }) => {
    const fields = [
        ['category', 'Category'], ['brand', 'Brand'], ['model', 'Model'], ['variant', 'Variant'],
        ['registrationNumber', 'Registration Number'], ['vin', 'VIN / Chassis'], ['price', 'Price'],
        ['manufacturingYear', 'Manufacturing Year'], ['registrationYear', 'Registration Year'],
        ['fuelType', 'Fuel Type'], ['transmission', 'Transmission'], ['kmDriven', 'Kilometers Driven'],
        ['ownership', 'Ownership'], ['color', 'Color'], ['seatingCapacity', 'Seating Capacity'],
        ['engineCapacity', 'Engine Capacity'], ['mileage', 'Mileage'], ['vehicleCondition', 'Vehicle Condition'],
        ['accidentHistory', 'Accident History'], ['floodDamage', 'Flood Damage'], ['engineCondition', 'Engine Condition'],
        ['tyreCondition', 'Tyre Condition'], ['batteryCondition', 'Battery Condition'], ['sellerType', 'Seller Type'],
        ['dealerName', 'Dealer Name'], ['country', 'Country'], ['state', 'State'], ['city', 'City'],
        ['area', 'Area'], ['pincode', 'Pincode'], ['negotiable', 'Negotiable'], ['emiAvailable', 'EMI Available'],
        ['rcAvailable', 'RC Available'], ['insuranceAvailable', 'Insurance Available'], ['insuranceExpiry', 'Insurance Expiry'],
        ['pollutionCertificate', 'Pollution Certificate'], ['serviceBook', 'Service Book'], ['numberOfKeys', 'Number of Keys'],
        ['loanPending', 'Loan Pending'], ['nocAvailable', 'NOC Available'], ['features', 'Features'], ['description', 'Description'],
    ];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-2 backdrop-blur-sm sm:p-5">
            <div className="relative my-auto flex max-h-[96vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex shrink-0 items-center justify-between bg-[#001f3f] px-5 py-4 text-white sm:px-7">
                    <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Vehicle Details</p><h2 className="truncate text-lg font-bold sm:text-2xl">{vehicle.title}</h2></div>
                    <button onClick={onClose} aria-label="Close vehicle details" className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"><XCircle size={21} /></button>
                </div>
                <div className="min-h-0 overflow-y-auto p-4 sm:p-7">
                    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{(vehicle.images || []).map((image, index) => <a key={`${image}-${index}`} href={image} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"><img src={image} alt={`${vehicle.title} ${index + 1}`} className="aspect-[4/3] w-full object-cover" /></a>)}{!vehicle.images?.length && <div className="col-span-full flex h-36 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">No images uploaded</div>}</div>
                            <section><h3 className="mb-3 flex items-center gap-2 text-base font-bold"><Car size={17} className="text-[#001f3f]" /> Listing information</h3><div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">{fields.map(([key, label]) => { const value = vehicle[key]; if (value === null || value === undefined || value === '') return null; return <div key={key} className="border-b border-slate-100 pb-2"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-0.5 break-words text-sm font-medium text-slate-800">{key === 'price' ? formatCurrency(value) : Array.isArray(value) ? value.join(', ') : String(value)}</p></div>; })}</div></section>
                            <section><h3 className="mb-3 flex items-center gap-2 text-base font-bold"><FileText size={17} className="text-[#001f3f]" /> Documents</h3><div className="flex flex-wrap gap-3">{[['rcFront', 'RC document'], ['insuranceDocument', 'Insurance document']].map(([key, label]) => vehicle[key] && <a key={key} href={vehicle[key]} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#001f3f] hover:bg-slate-50"><FileText size={14} /> {label}</a>)}{(vehicle.documents || []).map((doc, index) => <a key={`${doc}-${index}`} href={doc} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#001f3f] hover:bg-slate-50"><FileText size={14} /> Document {index + 1}</a>)}{!vehicle.rcFront && !vehicle.insuranceDocument && !vehicle.documents?.length && <p className="text-sm text-slate-400">No documents uploaded.</p>}</div></section>
                        </div>
                        <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5"><h3 className="mb-3 flex items-center gap-2 text-base font-bold"><User size={17} className="text-[#001f3f]" /> Seller details</h3><div className="space-y-2 text-sm"><p className="font-bold">{seller.ownerName || vehicle.sellerName || 'Seller'}</p><p className="text-slate-600">{seller.user?.email || vehicle.email || 'No email'}</p><p className="text-slate-600">{seller.user?.phone || vehicle.mobileNumber || 'No phone'}</p><p className="text-slate-600">{[seller.address, seller.city, seller.state, seller.pincode].filter(Boolean).join(', ') || 'No address'}</p></div><div className="mt-5 rounded-lg bg-white p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Listing status</p><p className="mt-1 font-bold text-slate-900">{vehicle.status}</p>{vehicle.fieldInspections?.[0] && <p className="mt-2 text-xs text-slate-500">Inspection: {vehicle.fieldInspections[0].status} · {vehicle.fieldInspections[0].inspector?.fullName || 'Unassigned'}</p>}</div></aside>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const SellerDetailPage = () => {
    const { sellerId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [approving, setApproving] = useState(false);
    const [documentActionId, setDocumentActionId] = useState(null);
    const [documentReason, setDocumentReason] = useState('');
    const [documentSubmitting, setDocumentSubmitting] = useState(false);
    const [viewingVehicle, setViewingVehicle] = useState(null);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await getSellerDetail(sellerId);
            setData(res.data?.data);
        } catch (err) {
            toast.error('Failed to load seller detail', err?.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDetail(); }, [sellerId]);

    const handleUnderReview = async () => {
        setMarking(true);
        try {
            await markSellerUnderReview(sellerId);
            toast.success('Seller marked as Under Review');
            fetchDetail();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update status');
        } finally {
            setMarking(false);
        }
    };

    const handleApproveProfile = async () => {
        setApproving(true);
        try {
            await approveSellerProfile(sellerId);
            toast.success('Seller profile approved and seller notified');
            fetchDetail();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to approve seller profile');
        } finally {
            setApproving(false);
        }
    };

    const handleDocumentDecision = async (documentId, decision) => {
        if (decision === 'REJECT' && !documentReason.trim()) return toast.error('Document rejection reason required');
        setDocumentSubmitting(true);
        try {
            await verifySellerDocument(documentId, { decision, reason: decision === 'REJECT' ? documentReason : undefined });
            toast.success(decision === 'VERIFY' ? 'Document verified' : 'Document rejected and seller notified');
            setDocumentActionId(null);
            setDocumentReason('');
            fetchDetail();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update document');
        } finally {
            setDocumentSubmitting(false);
        }
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#001f3f]" /></div>;
    if (!data) return <div className="flex h-64 items-center justify-center text-sm text-red-500">Seller not found.</div>;

    const { profile, vehicleListings } = data;

    return (
        <div className="space-y-6 text-slate-900">
            <Helmet><title>{profile.ownerName} | Admin</title></Helmet>

            <div className="animate-fadeInUp flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <button onClick={() => navigate(-1)} className="mt-0.5 rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><ArrowLeft size={16} /></button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">{profile.ownerName} {profile.businessName && `— ${profile.businessName}`}</h1>
                        <span className={`mt-1 inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge[profile.verificationStatus] || statusBadge.PENDING}`}>
                            {profile.verificationStatus?.replace('_', ' ')}
                        </span>
                    </div>
                </div>
                {profile.verificationStatus !== 'APPROVED' && <div className="flex flex-wrap gap-2">{profile.verificationStatus === 'PENDING' && <button onClick={handleUnderReview} disabled={marking || approving} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60">{marking ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />} Mark Under Review</button>}<button onClick={handleApproveProfile} disabled={marking || approving} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60">{approving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} Approve Seller Profile</button></div>}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
                    <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900"><User size={16} className="text-[#001f3f]" /> Seller Info</h2>
                    <Row icon={Phone} label="Phone" value={profile.user?.phone} />
                    <Row icon={Mail} label="Email" value={profile.user?.email} />
                    <Row icon={MapPin} label="Address" value={[profile.address, profile.city, profile.state, profile.pincode].filter(Boolean).join(', ')} />
                    <Row icon={FileText} label="GST Number" value={profile.gstNumber} />
                    <Row icon={FileText} label="PAN Number" value={profile.panNumber} />
                </div>

                <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                    <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900"><FileText size={16} className="text-[#001f3f]" /> Documents ({profile.documents?.length || 0})</h2>
                    {profile.documents?.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {profile.documents.map((doc) => (
                                <div key={doc.id} className="overflow-hidden rounded-xl border border-slate-200 text-center">
                                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="block transition hover:opacity-80"><img src={doc.fileUrl} alt={doc.type} className="h-20 w-full object-cover" /><p className="p-2 text-xs font-semibold text-slate-600">{doc.type}</p></a>
                                    <span className={`mb-2 inline-block rounded-full px-2 py-1 text-[10px] font-bold ${doc.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' : doc.status === 'REJECTED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{doc.status}</span>
                                    {documentActionId === doc.id ? <div className="space-y-2 border-t border-slate-100 p-2"><textarea value={documentReason} onChange={(event) => setDocumentReason(event.target.value)} rows={2} placeholder="Rejection reason..." className="w-full rounded border border-red-200 p-1.5 text-xs" /><div className="flex gap-1"><button onClick={() => { setDocumentActionId(null); setDocumentReason(''); }} className="flex-1 rounded border border-slate-200 py-1 text-xs font-semibold">Cancel</button><button onClick={() => handleDocumentDecision(doc.id, 'REJECT')} disabled={documentSubmitting} className="flex-1 rounded bg-red-500 py-1 text-xs font-semibold text-white disabled:opacity-60">Reject</button></div></div> : <div className="flex gap-1 border-t border-slate-100 p-2"><button onClick={() => handleDocumentDecision(doc.id, 'VERIFY')} disabled={documentSubmitting} className="flex-1 rounded bg-emerald-600 py-1 text-xs font-semibold text-white disabled:opacity-60">Verify</button><button onClick={() => { setDocumentActionId(doc.id); setDocumentReason(''); }} disabled={documentSubmitting} className="flex-1 rounded border border-red-200 py-1 text-xs font-semibold text-red-600 disabled:opacity-60">Reject</button></div>}
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-slate-400">No documents uploaded.</p>}
                </div>
            </div>

            <div className="animate-fadeInUp overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50 p-5">
                    <h2 className="flex items-center gap-2 text-base font-bold text-slate-900"><Car size={16} className="text-[#001f3f]" /> Vehicle Listings ({vehicleListings?.length || 0})</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {vehicleListings?.length === 0 ? (
                        <p className="p-6 text-center text-sm text-slate-400">No listings yet.</p>
                    ) : (
                        vehicleListings.map((v) => (
                            <div key={v.id} className="flex items-center gap-3 p-4">
                                {v.images?.[0] ? <img src={v.images[0]} className="h-11 w-11 rounded-lg object-cover" alt="" /> : <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e6f2ff]">🚘</span>}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-900">{v.title}</p>
                                    <p className="text-xs text-slate-500">{formatCurrency(v.price)}</p>
                                </div>
                                {v.fieldInspections?.[0] && (
                                    <span className="hidden text-xs text-slate-400 sm:block">Inspector: {v.fieldInspections[0].inspector?.fullName || '—'}</span>
                                )}
                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${vehicleStatusBadge[v.status] || 'bg-slate-100 text-slate-600'}`}>{v.status}</span>
                                <button onClick={() => setViewingVehicle(v)} aria-label={`View ${v.title}`} className="shrink-0 rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:border-[#001f3f]/20 hover:text-[#001f3f]"><Eye size={14} /></button>
                            </div>
                        ))
                    )}
                </div>
            </div>
            {viewingVehicle && <VehicleDetailsModal vehicle={viewingVehicle} seller={profile} onClose={() => setViewingVehicle(null)} />}
        </div>
    );
};