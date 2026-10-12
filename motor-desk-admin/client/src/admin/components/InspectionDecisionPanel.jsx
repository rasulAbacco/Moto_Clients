import { useState } from 'react';
import { CheckCircle2, Loader2, XCircle, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const InspectionDecisionPanel = ({ inspection, onDecision, loading }) => {
    const [mode, setMode] = useState(null);
    const [reason, setReason] = useState('');
    const [lastDecision, setLastDecision] = useState(
        inspection.vehicleListing?.status === 'APPROVED'
            ? 'APPROVE'
            : inspection.vehicleListing?.status === 'REJECTED'
                ? 'REJECT'
                : inspection.result === 'NEEDS_CORRECTION'
                    ? 'RECHECK'
                    : null
    );

    if (!inspection) {
        return null;
    }

    const canDecide = inspection.status === 'COMPLETED' || inspection.status === 'RE_VERIFICATION' || inspection.result === 'NEEDS_CORRECTION';

    const submit = async (decision) => {
        if (!canDecide) {
            toast.error('Wait for the inspector to submit the re-verification report');
            return;
        }
        if (decision !== 'APPROVE' && !reason.trim()) {
            toast.error('Reason is required');
            return;
        }
        try {
            await onDecision(decision, reason.trim() || undefined);
            toast.success(
                decision === 'APPROVE'
                    ? 'Vehicle approved'
                    : decision === 'REJECT'
                        ? 'Vehicle rejected'
                        : 'Vehicle sent for re-verification'
            );
            setLastDecision(decision);
            setMode(null);
            setReason('');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update verification');
        }
    };

    return (
        <div className="shrink-0 border-t border-slate-200 bg-white p-4 shadow-lg">
            <div className="mx-auto max-w-7xl">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-slate-900">Admin final verification</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${canDecide ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {canDecide ? 'Inspector submitted report' : 'Waiting for re-verification report'}
                    </span>
                </div>

                {mode ? (
                    <div className="space-y-3">
                        <textarea
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            rows={2}
                            placeholder={mode === 'RECHECK' ? 'Why is re-verification required?' : 'Rejection reason...'}
                            className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-[#001f3f] focus:outline-none"
                        />
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => { setMode(null); setReason(''); }}
                                disabled={loading}
                                className="flex-1 rounded-xl border border-slate-300 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => submit(mode)}
                                disabled={loading}
                                className={`flex-1 cursor-pointer rounded-xl py-2 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${mode === 'RECHECK' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-600 hover:bg-red-700'}`}
                            >
                                {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : `Confirm ${mode === 'RECHECK' ? 'Re-verification' : 'Reject'}`}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                        <button
                            type="button"
                            onClick={() => setMode('RECHECK')}
                            disabled={loading || lastDecision === 'RECHECK'}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-2 border-amber-200 bg-amber-50 py-2 text-sm font-bold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RotateCcw size={15} /> Re-verification
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('REJECT')}
                            disabled={loading || lastDecision === 'REJECT'}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-2 border-red-200 bg-red-50 py-2 text-sm font-bold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <XCircle size={15} /> Reject
                        </button>
                        <button
                            type="button"
                            onClick={() => submit('APPROVE')}
                            disabled={loading || lastDecision === 'APPROVE'}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <CheckCircle2 size={15} /> {lastDecision === 'APPROVE' ? 'Approved' : 'Approve'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};