import { Camera, Car, CheckCircle2, Clock3, ExternalLink, FileText, MapPin, User, X, XCircle } from 'lucide-react';
import { InspectionDecisionPanel } from './InspectionDecisionPanel.jsx';

const text = (item, fallback = 'Not provided') => item === null || item === undefined || item === '' ? fallback : Array.isArray(item) ? item.join(', ') : String(item);
const dateText = (item) => item ? new Date(item).toLocaleString('en-IN') : 'Not recorded';

export const InspectionDetailsModal = ({ inspection, onClose, onDecision, decisionLoading }) => {
    if (!inspection) return null;

    const vehicle = inspection.vehicleListing || {};
    const seller = inspection.seller || {};
    const profile = seller.sellerProfile || {};
    const inspector = inspection.inspector || {};
    const checklist = inspection.checklist || {};
    const checklistItems = ['sellerVerified', 'documentsVerified', 'vehicleIdentityVerified', 'exteriorVerified', 'interiorVerified', 'mechanicalVerified', 'testDriveCompleted', 'locationVerified', 'photosCompleted'];
    const getStatusStyle = (status) => {
        const normalizedStatus = String(status || '').toUpperCase();
        if (['VERIFIED', 'APPROVED', 'PASS', 'PASSED', 'GOOD', 'CLEAR'].includes(normalizedStatus)) {
            return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: status || 'Verified' };
        }
        if (['REJECTED', 'FAIL', 'FAILED', 'POOR', 'NOT_CLEAR'].includes(normalizedStatus)) {
            return { badge: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: status || 'Rejected' };
        }
        return { badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock3, label: status || 'Pending' };
    };
    const vehicleFields = [
        ['Title', vehicle.title], ['Category', vehicle.category], ['Brand', vehicle.brand], ['Model', vehicle.model], ['Variant', vehicle.variant], ['Registration', vehicle.registrationNumber], ['VIN', vehicle.vin], ['Price', vehicle.price ? `₹${vehicle.price}` : null], ['Manufacturing year', vehicle.manufacturingYear], ['Registration year', vehicle.registrationYear], ['Fuel', vehicle.fuelType], ['Transmission', vehicle.transmission], ['KM driven', vehicle.kmDriven], ['Ownership', vehicle.ownership], ['Color', vehicle.color], ['Seating capacity', vehicle.seatingCapacity], ['Engine capacity', vehicle.engineCapacity], ['Mileage', vehicle.mileage], ['Condition', vehicle.vehicleCondition], ['Engine condition', vehicle.engineCondition], ['Tyre condition', vehicle.tyreCondition], ['Battery condition', vehicle.batteryCondition], ['Accident history', vehicle.accidentHistory ? 'Yes' : 'No'], ['Flood damage', vehicle.floodDamage ? 'Yes' : 'No'], ['Features', vehicle.features], ['Seller name', vehicle.sellerName], ['Seller mobile', vehicle.mobileNumber], ['Seller email', vehicle.email], ['Seller type', vehicle.sellerType], ['Dealer name', vehicle.dealerName], ['Country', vehicle.country], ['State', vehicle.state], ['City', vehicle.city], ['Area', vehicle.area], ['Pincode', vehicle.pincode], ['Negotiable', vehicle.negotiable ? 'Yes' : 'No'], ['EMI available', vehicle.emiAvailable ? 'Yes' : 'No'], ['RC available', vehicle.rcAvailable ? 'Yes' : 'No'], ['Insurance available', vehicle.insuranceAvailable ? 'Yes' : 'No'], ['Insurance expiry', dateText(vehicle.insuranceExpiry)], ['Pollution certificate', vehicle.pollutionCertificate ? 'Yes' : 'No'], ['Service book', vehicle.serviceBook ? 'Yes' : 'No'], ['Number of keys', vehicle.numberOfKeys], ['Loan pending', vehicle.loanPending ? 'Yes' : 'No'], ['NOC available', vehicle.nocAvailable ? 'Yes' : 'No'], ['Description', vehicle.description],
    ];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-2 backdrop-blur-sm sm:p-5">
            <div className="relative my-auto flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <header className="flex shrink-0 items-center justify-between bg-[#001f3f] px-5 py-4 text-white sm:px-7">
                    <div className="min-w-0">
                        <p className="font-mono text-xs text-cyan-200">{inspection.inspectionNo}</p>
                        <h2 className="truncate text-lg font-bold sm:text-2xl">{vehicle.title || 'Inspection details'}</h2>
                    </div>
                    <button onClick={onClose} aria-label="Close inspection details" className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white">
                        <X size={21} />
                    </button>
                </header>

                {/* Main Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-7">
                    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
                        <main className="space-y-6">
                            <section>
                                <h3 className="mb-3 flex items-center gap-2 text-base font-bold"><Car size={17} className="text-[#001f3f]" /> Vehicle details</h3>
                                <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-3">
                                    {vehicleFields.map(([label, item]) => item !== null && item !== undefined && item !== '' && (
                                        <div key={label} className="border-b border-slate-100 pb-2">
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                                            <p className="mt-1 break-words text-sm font-medium text-slate-800">{text(item)}</p>
                                        </div>
                                    ))}
                                </div>
                                {/* Seller Uploaded Vehicle Images */}
                                <section>
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 text-base font-bold text-slate-800 mt-5">
                                            <Camera size={17} className="text-[#001f3f]" />
                                            Seller Uploaded Vehicle Images
                                        </h3>

                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                                            {(vehicle.images || []).length} Images
                                        </span>
                                    </div>

                                    {(vehicle.images || []).length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                            {(vehicle.images || []).map((image, index) => (
                                                <a
                                                    key={`seller-image-${index}`}
                                                    href={image}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="group relative overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                                                >
                                                    <img
                                                        src={image}
                                                        alt={`Seller vehicle image ${index + 1}`}
                                                        className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />

                                                    {/* Seller label */}
                                                    <div className="absolute left-2 top-2">
                                                        <span className="rounded-full bg-blue-600 px-2 py-1 text-[9px] font-bold text-white shadow">
                                                            SELLER
                                                        </span>
                                                    </div>

                                                    {/* Image number */}
                                                    <div className="absolute bottom-2 left-2">
                                                        <span className="rounded-full bg-black/70 px-2 py-1 text-[9px] font-semibold text-white">
                                                            Image {index + 1}
                                                        </span>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                                            <Camera className="mx-auto text-slate-400" size={22} />

                                            <p className="mt-2 text-xs font-semibold text-slate-500">
                                                No seller images uploaded
                                            </p>
                                        </div>
                                    )}
                                </section>


                                {/* Field Inspector Uploaded Photos */}
                                <section>
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">
                                            <Camera size={17} className="text-emerald-600" />
                                            Field Inspector Photos
                                        </h3>

                                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                                            {(inspection.photos || []).length} Photos
                                        </span>
                                    </div>

                                    {(inspection.photos || []).length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                            {(inspection.photos || []).map((photo, index) => (
                                                <a
                                                    key={`inspector-photo-${photo.id || index}`}
                                                    href={photo.imageUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="group relative overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                                                >
                                                    <img
                                                        src={photo.imageUrl}
                                                        alt={
                                                            photo.category ||
                                                            `Inspector photo ${index + 1}`
                                                        }
                                                        className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />

                                                    {/* Inspector label */}
                                                    <div className="absolute left-2 top-2">
                                                        <span className="rounded-full bg-emerald-600 px-2 py-1 text-[9px] font-bold text-white shadow">
                                                            INSPECTOR
                                                        </span>
                                                    </div>

                                                    {/* Category */}
                                                    {photo.category && (
                                                        <div className="absolute bottom-2 left-2 right-2">
                                                            <span className="inline-block max-w-full truncate rounded-full bg-black/70 px-2 py-1 text-[9px] font-semibold text-white">
                                                                {photo.category}
                                                            </span>
                                                        </div>
                                                    )}
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                                            <Camera className="mx-auto text-slate-400" size={22} />

                                            <p className="mt-2 text-xs font-semibold text-slate-500">
                                                No inspector photos uploaded
                                            </p>
                                        </div>
                                    )}
                                </section>

                            </section>
                            <section>
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="flex items-center gap-2 text-base font-bold"><FileText size={17} className="text-[#001f3f]" /> Document verification</h3>
                                    <span className="rounded-full bg-[#e6f2ff] px-2.5 py-1 text-[10px] font-bold text-[#001f3f]">{inspection.documents?.length || 0} files</span>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {(inspection.documents || []).map((doc) => (
                                        <div key={doc.id} className="group rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#001f3f]/30 hover:shadow-md">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-2.5">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e6f2ff] text-[#001f3f]"><FileText size={17} /></div>
                                                    <p className="truncate text-sm font-bold text-slate-800">{doc.documentType || 'Document'}</p>
                                                </div>
                                                {(() => { const statusInfo = getStatusStyle(doc.status); const StatusIcon = statusInfo.icon; return <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${statusInfo.badge}`}><StatusIcon size={11} />{statusInfo.label}</span>; })()}
                                            </div>
                                            <p className="mt-3 min-h-8 text-xs leading-5 text-slate-500">{doc.remarks || doc.rejectionReason || 'No remarks added'}</p>
                                            {doc.documentUrl && <a href={doc.documentUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#001f3f] hover:text-blue-700"><ExternalLink size={13} /> Open document</a>}
                                        </div>
                                    ))}
                                    {!inspection.documents?.length && <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-400">No document verification entries.</div>}
                                </div>
                            </section>
                            <section>
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="flex items-center gap-2 text-base font-bold"><Car size={17} className="text-emerald-600" /> Vehicle checks</h3>
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">{inspection.vehicleChecks?.length || 0} checks</span>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {(inspection.vehicleChecks || []).map((check) => (
                                        (() => {
                                            const statusInfo = getStatusStyle(check.status); const StatusIcon = statusInfo.icon; return <div key={check.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 shadow-sm transition hover:border-emerald-300 hover:bg-white hover:shadow-md">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{check.category || 'Vehicle'}</p><p className="mt-1 text-sm font-bold text-slate-800">{check.item || 'Check'}</p></div>
                                                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${statusInfo.badge}`}><StatusIcon size={11} />{statusInfo.label}</span>
                                                </div>
                                                <div className="mt-3 border-t border-slate-200 pt-2 text-xs text-slate-500"><span className="font-semibold text-slate-700">Condition:</span> {text(check.condition)}<p className="mt-1 leading-5"><span className="font-semibold text-slate-700">Remarks:</span> {check.remarks || 'No remarks added'}</p></div>
                                            </div>;
                                        })()
                                    ))}
                                    {!inspection.vehicleChecks?.length && <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-400">No vehicle checks submitted.</div>}
                                </div>
                            </section>
                        </main>
                        <aside className="space-y-5">
                            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <h3 className="mb-3 flex items-center gap-2 text-base font-bold"><User size={17} className="text-[#001f3f]" /> Seller</h3>
                                <p className="font-bold">{text(seller.fullName || profile.ownerName)}</p>
                                <p className="mt-2 text-sm text-slate-600">Mobile: {text(seller.phone || vehicle.mobileNumber)}</p>
                                <p className="text-sm text-slate-600">Email: {text(seller.email || vehicle.email)}</p>
                                <p className="mt-2 text-xs text-slate-500">{[profile.address, profile.city, profile.state, profile.pincode].filter(Boolean).join(', ') || 'Address not provided'}</p>
                                <div className="mt-5 border-t border-slate-200 pt-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Seller Documents
                                        </p>

                                        {profile.documents?.length > 0 && (
                                            <span className="rounded-full bg-[#e6f2ff] px-2.5 py-1 text-[10px] font-bold text-[#001f3f]">
                                                {profile.documents.length} Document
                                                {profile.documents.length > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>

                                    {profile.documents?.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {profile.documents.map((doc, index) => {
                                                const documentUrl = doc.fileUrl;
                                                const documentType = doc.type || 'Document';

                                                const isPdf =
                                                    documentUrl?.toLowerCase().includes('.pdf');

                                                const status = String(
                                                    doc.status || 'PENDING'
                                                ).toUpperCase();

                                                const statusConfig = {
                                                    VERIFIED: {
                                                        label: 'Verified',
                                                        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                                        icon: '✓',
                                                    },
                                                    APPROVED: {
                                                        label: 'Approved',
                                                        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                                        icon: '✓',
                                                    },
                                                    REJECTED: {
                                                        label: 'Rejected',
                                                        badge: 'bg-red-50 text-red-700 border-red-200',
                                                        icon: '×',
                                                    },
                                                    PENDING: {
                                                        label: 'Pending',
                                                        badge: 'bg-amber-50 text-amber-700 border-amber-200',
                                                        icon: '!',
                                                    },
                                                };

                                                const statusInfo =
                                                    statusConfig[status] || statusConfig.PENDING;

                                                return (
                                                    <div
                                                        key={doc.id || index}
                                                        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#001f3f]/20 hover:shadow-md"
                                                    >
                                                        {/* Document preview */}
                                                        <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                                                            {documentUrl && !isPdf ? (
                                                                <img
                                                                    src={documentUrl}
                                                                    alt={documentType}
                                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="flex flex-col items-center justify-center">
                                                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-sm">
                                                                        <FileText size={28} />
                                                                    </div>

                                                                    {isPdf && (
                                                                        <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-red-600">
                                                                            PDF Document
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Status */}
                                                            <span
                                                                className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${statusInfo.badge}`}
                                                            >
                                                                <span>{statusInfo.icon}</span>
                                                                {statusInfo.label}
                                                            </span>
                                                        </div>

                                                        {/* Card content */}
                                                        <div className="p-3">
                                                            <div className="min-w-0">
                                                                <p
                                                                    className="truncate text-sm font-bold text-slate-800"
                                                                    title={documentType}
                                                                >
                                                                    {documentType}
                                                                </p>

                                                                <p className="mt-0.5 truncate text-[11px] text-slate-400">
                                                                    Seller uploaded document
                                                                </p>
                                                            </div>

                                                            {/* Buttons */}
                                                            <div className="mt-3 flex gap-2">
                                                                {documentUrl && (
                                                                    <a
                                                                        href={documentUrl}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#001f3f] px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#003d7a] hover:shadow-md"
                                                                    >
                                                                        <FileText size={14} />
                                                                        Open
                                                                    </a>
                                                                )}


                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
                                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-400">
                                                <FileText size={19} />
                                            </div>

                                            <p className="mt-2 text-xs font-semibold text-slate-500">
                                                No seller documents uploaded
                                            </p>

                                            <p className="mt-1 text-[10px] text-slate-400">
                                                Documents uploaded by the seller will appear here.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>
                            <section className="rounded-xl border border-slate-200 p-4">
                                <h3 className="mb-3 flex items-center gap-2 text-base font-bold"><User size={17} className="text-[#001f3f]" /> Field inspector</h3>
                                <p className="font-bold">{text(inspector.fullName)}</p>
                                <p className="mt-2 text-sm text-slate-600">Mobile: {text(inspector.phone)}</p>
                                <p className="text-sm text-slate-600">Email: {text(inspector.email)}</p>
                                <p className="mt-2 text-xs text-slate-500">Role: {text(inspector.role)} · Account: {inspector.isActive ? 'Active' : 'Inactive'}</p>
                            </section>
                            <section className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Inspection outcome</p>
                                <p className="mt-1 text-lg font-bold text-slate-900">{inspection.status}</p>
                                <p className="mt-2 text-sm text-slate-600">Priority: {inspection.priority}</p>
                                <p className="text-sm text-slate-600">Assigned: {dateText(inspection.assignedAt)}</p>
                                <p className="text-sm text-slate-600">Accepted: {dateText(inspection.acceptedAt)}</p>
                                <p className="text-sm text-slate-600">Completed: {dateText(inspection.completedAt)}</p>
                                <p className="mt-3 text-sm text-slate-700">{inspection.finalNotes || 'No final notes'}</p>
                                {(inspection.rejectionReason || vehicle.rejectReason) && <p className="mt-2 rounded-lg bg-red-50 p-2 text-sm text-red-700"><strong>Reject reason:</strong> {inspection.rejectionReason || vehicle.rejectReason}</p>}
                                {inspection.correctionReason && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-700"><strong>Re-verification reason:</strong> {inspection.correctionReason}</p>}
                            </section>
                            {inspection.checklist && (
                                <section className="rounded-xl border border-slate-200 p-4">
                                    <h3 className="mb-3 flex items-center gap-2 text-base font-bold"><CheckCircle2 size={17} className="text-[#001f3f]" /> Checklist</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {checklistItems.map((item) => (
                                            <div key={item} className={`rounded-lg px-2 py-2 text-xs font-semibold ${checklist[item] ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {checklist[item] ? 'Verified' : 'Not verified'}: {item.replace(/([A-Z])/g, ' $1')}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                            {inspection.location && (
                                <section className="rounded-xl border border-slate-200 p-4">
                                    <h3 className="mb-2 flex items-center gap-2 text-base font-bold"><MapPin size={17} className="text-[#001f3f]" /> Location verification</h3>
                                    <p className="text-sm">Expected: {text(inspection.location.expectedAddress)}</p>
                                    <p className="text-sm">Actual: {text(inspection.location.actualAddress)}</p>
                                    <p className="mt-2 text-xs text-slate-500">Vehicle present: {inspection.location.vehiclePresent ? 'Yes' : 'No'} · Seller present: {inspection.location.sellerPresent ? 'Yes' : 'No'} · Matched: {inspection.location.locationMatched ? 'Yes' : 'No'}</p>
                                </section>
                            )}
                        </aside>
                    </div>
                </div>

                {/* Integrated Decision Panel at the Bottom */}
                {onDecision && (
                    <InspectionDecisionPanel
                        inspection={inspection}
                        onDecision={onDecision}
                        loading={decisionLoading}
                    />
                )}
            </div>
        </div>
    );
};