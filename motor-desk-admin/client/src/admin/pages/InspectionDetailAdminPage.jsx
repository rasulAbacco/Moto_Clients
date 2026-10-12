import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, XCircle, Loader2, FileText, Camera, User } from 'lucide-react';
import { getInspectionDetail, finalVerifyVehicle } from '../../admin/services/adminApi.js';

export const InspectionDetailAdminPage = () => {
    const { inspectionId: id } = useParams();
    const navigate = useNavigate();
    const [inspection, setInspection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rejectReason, setRejectReason] = useState('');
    const [decisionMode, setDecisionMode] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await getInspectionDetail(id);
            setInspection(res.data?.data);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchDetail(); }, [id]);

    const handleDecision = async (decision) => {
        if (decision !== 'APPROVE' && !rejectReason.trim()) return toast.error('Reason is required');
        setSubmitting(true);
        try {
            await finalVerifyVehicle(id, { decision, reason: decision !== 'APPROVE' ? rejectReason : undefined });
            toast.success(decision === 'APPROVE' ? 'Vehicle approved' : decision === 'RECHECK' ? 'Vehicle sent for re-inspection' : 'Vehicle rejected');
            fetchDetail();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to finalize');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#001f3f]" /></div>;
    if (!inspection) return <div className="flex h-64 items-center justify-center text-sm text-red-500">Inspection not found.</div>;

    const sellerProfile = inspection.seller?.sellerProfile;
    const sellerImages = inspection.vehicleListing?.images || [];
    const inspectionPhotos = inspection.photos || [];

    return (
        <div className="space-y-6 text-slate-900">
            <Helmet><title>{inspection.inspectionNo} | Admin</title></Helmet>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <button onClick={() => navigate(-1)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><ArrowLeft size={16} /></button>
                <div>
                    <p className="font-mono text-xs text-[#001f3f]">{inspection.inspectionNo}</p>
                    <h1 className="text-lg font-bold text-slate-900">{inspection.vehicleListing?.title}</h1>
                </div>
                <span className="ml-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{inspection.status}</span>
            </div>

            {inspection.status === 'COMPLETED' && inspection.vehicleListing?.status === 'UNDER_VERIFICATION' && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-base font-bold text-slate-900">Final Decision</h2>
                    {decisionMode ? (
                        <div className="space-y-3">
                            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder={decisionMode === 'RECHECK' ? 'Why is re-inspection required?' : 'Rejection reason...'} className="w-full rounded-xl border-2 border-red-200 bg-red-50/50 px-3.5 py-2.5 text-sm focus:border-red-400 focus:outline-none" />
                            <div className="flex gap-2">
                                <button onClick={() => { setDecisionMode(null); setRejectReason(''); }} className="flex-1 rounded-lg border-2 border-slate-200 py-2.5 text-sm font-bold text-slate-600">Cancel</button>
                                <button onClick={() => handleDecision(decisionMode)} disabled={submitting} className={`flex-1 rounded-lg py-2.5 text-sm font-bold text-white disabled:opacity-60 ${decisionMode === 'RECHECK' ? 'bg-amber-500' : 'bg-red-500'}`}>Confirm {decisionMode === 'RECHECK' ? 'Re-inspection' : 'Reject'}</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={() => setDecisionMode('RECHECK')} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-amber-200 py-2.5 text-sm font-bold text-amber-700 hover:bg-amber-50"><Loader2 size={15} /> Re-inspect</button>
                            <button onClick={() => setDecisionMode('REJECT')} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-red-200 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"><XCircle size={15} /> Reject</button>
                            <button onClick={() => handleDecision('APPROVE')} disabled={submitting} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
                                {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} Approve Vehicle
                            </button>
                        </div>
                    )}
                </div>
            )}

            {inspection.checklist && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900"><CheckCircle2 size={16} className="text-[#001f3f]" /> Checklist</h2>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {['sellerVerified', 'documentsVerified', 'vehicleIdentityVerified', 'exteriorVerified', 'interiorVerified', 'mechanicalVerified', 'testDriveCompleted', 'locationVerified', 'photosCompleted'].map((k) => (
                            <div key={k} className={`rounded-lg px-3 py-2 text-xs font-semibold ${inspection.checklist[k] ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                {inspection.checklist[k] ? '✓' : '○'} {k.replace(/([A-Z])/g, ' $1')}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
                    <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900"><User size={16} className="text-[#001f3f]" /> Seller verification</h2>
                    <div className="flex items-center gap-3">
                        {sellerProfile?.profileImage || inspection.seller?.avatar ? <img src={sellerProfile?.profileImage || inspection.seller.avatar} alt={sellerProfile?.ownerName || 'Seller'} className="h-12 w-12 rounded-full object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f2ff] text-sm font-bold text-[#001f3f]">{(sellerProfile?.ownerName || inspection.seller?.fullName || 'S')[0]}</span>}
                        <div className="min-w-0"><p className="truncate text-sm font-bold">{sellerProfile?.ownerName || inspection.seller?.fullName || 'Seller'}</p><p className="text-xs text-slate-500">Profile: {sellerProfile?.verificationStatus?.replace('_', ' ') || 'Not submitted'}</p></div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {sellerProfile?.documents?.map((document) => <a key={document.id} href={document.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-[#001f3f] hover:bg-slate-50"><FileText size={13} /> {document.type}</a>)}
                        {!sellerProfile?.documents?.length && <p className="text-xs text-slate-400">No seller documents submitted.</p>}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                    <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900"><Camera size={16} className="text-[#001f3f]" /> Seller-uploaded vehicle images ({sellerImages.length})</h2>
                    {sellerImages.length > 0 ? <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{sellerImages.map((imageUrl, index) => <a key={`${imageUrl}-${index}`} href={imageUrl} target="_blank" rel="noreferrer" className="aspect-square overflow-hidden rounded-lg border border-slate-200"><img src={imageUrl} className="h-full w-full object-cover" alt={`Seller vehicle upload ${index + 1}`} /></a>)}</div> : <p className="text-sm text-slate-400">No images were submitted by the seller.</p>}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900"><Camera size={16} className="text-[#001f3f]" /> Inspector-submitted verification images ({inspectionPhotos.length})</h2>
                {inspectionPhotos.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                        {inspectionPhotos.map((photo) => (
                            <a key={photo.id} href={photo.imageUrl} target="_blank" rel="noreferrer" className="aspect-square overflow-hidden rounded-lg border border-slate-200">
                                <img src={photo.imageUrl} className="h-full w-full object-cover" alt="Inspector verification upload" />
                            </a>
                        ))}
                    </div>
                ) : <p className="text-sm text-slate-400">The inspector has not submitted verification images yet.</p>}
            </div>
        </div>
    );
};