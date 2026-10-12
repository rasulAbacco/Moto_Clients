import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiX,
  FiUser,
  FiCreditCard,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCheck,
  FiActivity,
  FiShield,
  FiBriefcase,
  FiFileText,
  FiDownload,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const KycDocuments = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [filter, setFilter] = useState("ALL");

  // Secure Preview States
  const [previewBlob, setPreviewBlob] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  useEffect(() => {
    fetchKycData();
  }, [filter]);

  const fetchKycData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const url =
        filter === "ALL"
          ? `${API_URL}/api/admin/partners/kyc`
          : `${API_URL}/api/admin/partners/kyc?status=${filter}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPartners(res.data);
    } catch (err) {
      toast.error("Failed to sync compliance registry");
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Changed axios.patch to axios.put
  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        `${API_URL}/api/admin/partners/kyc/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(
        id === "all"
          ? "Batch verification successful"
          : `Node status updated to ${status}`,
      );
      fetchKycData();
      if (selectedPartner && id !== "all")
        setSelectedPartner({ ...selectedPartner, kycStatus: status });
    } catch (err) {
      toast.error("Update rejected by protocol");
    }
  };

  // FIXED: Secure Fetch with Blob
  const openDocument = async (id, type) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        `${API_URL}/api/admin/partners/kyc/${id}/${type}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );

      const blobUrl = URL.createObjectURL(res.data);
      setPreviewBlob(blobUrl);
      setPreviewType(res.data.type);
    } catch (err) {
      toast.error("Document access denied");
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FiActivity className="text-[#001F3F] animate-pulse text-4xl" />
        <p className="text-black font-bold uppercase tracking-widest text-[11px]">
          Syncing Compliance Data...
        </p>
      </div>
    );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* --- Page Header --- */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#CBD5E1] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FiShield className="text-[#001F3F]" size={14} />
            <span className="text-black font-bold text-[11px] tracking-[0.2em] uppercase">
              Compliance & Audit
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#001F3F] tracking-tight">
            KYC Registry
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Filters */}
          <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-slate-200">
            {["ALL", "PENDING", "VERIFIED", "REJECTED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                  filter === f
                    ? "bg-[#001F3F] text-white shadow-sm"
                    : "text-slate-500 hover:text-black hover:bg-white/50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Batch Action */}
          <button
            onClick={() => handleStatusUpdate("all", "VERIFIED")}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            <FiCheck /> Batch Verify Pending
          </button>
        </div>
      </div>

      {/* --- Registry Workspace --- */}
      <div className="bg-white border border-[#CBD5E1] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1]">
                <th className="py-4 px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Partner Identity
                </th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  PAN Protocol
                </th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  UPI Endpoint
                </th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest text-center">
                  Docs Status
                </th>
                <th className="px-6 text-[11px] font-bold text-black uppercase tracking-widest">
                  Audit Status
                </th>
                <th className="px-6 text-right text-[11px] font-bold text-black uppercase tracking-widest">
                  Inspect
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partners.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-[#F8FAFC] transition-colors group"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#001F3F] text-white flex items-center justify-center font-bold text-xs shadow-inner">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-black leading-none mb-1">
                          {p.name}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500">
                          {p.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6">
                    <code className="bg-[#F0F4F8] px-2.5 py-1 rounded text-[#001F3F] font-bold text-[10px] border border-slate-200">
                      {p.panNumber || "UNAVAILABLE"}
                    </code>
                  </td>
                  <td className="px-6">
                    <span className="text-[10px] font-bold text-[#001F3F] bg-[#F0F4F8] px-2 py-1 rounded border border-[#CBD5E1] font-mono">
                      {p.upiId || "—"}
                    </span>
                  </td>
                  <td className="px-6">
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`text-[9px] font-bold flex items-center gap-1 ${p.hasPanDocument ? "text-emerald-600" : "text-slate-300"}`}
                        >
                          <FiFileText size={10} /> PAN
                        </span>
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${p.hasPanDocument ? "bg-emerald-500" : "bg-slate-200"}`}
                        />
                      </div>
                      <div className="w-px h-4 bg-slate-200"></div>
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`text-[9px] font-bold flex items-center gap-1 ${p.hasBankProofDocument ? "text-emerald-600" : "text-slate-300"}`}
                        >
                          <FiCreditCard size={10} /> BANK
                        </span>
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${p.hasBankProofDocument ? "bg-emerald-500" : "bg-slate-200"}`}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        p.kycStatus === "VERIFIED"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : p.kycStatus === "REJECTED"
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}
                    >
                      {p.kycStatus}
                    </span>
                  </td>
                  <td className="px-6 text-right">
                    <button
                      onClick={() => setSelectedPartner(p)}
                      className="p-2.5 text-slate-400 hover:text-[#001F3F] hover:bg-white border border-transparent hover:border-[#CBD5E1] rounded-lg transition-all"
                    >
                      <FiEye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Compliance Detail Drawer --- */}
      <div
        className={`fixed inset-0 z-40 bg-[#001F3F]/30 backdrop-blur-sm transition-opacity duration-300 ${selectedPartner ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
        onClick={() => setSelectedPartner(null)}
      />

      <div
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[460px] bg-white shadow-2xl border-l border-[#CBD5E1] transform transition-transform duration-500 ease-out ${selectedPartner ? "translate-x-0" : "translate-x-full"}`}
      >
        {selectedPartner && (
          <div className="h-full flex flex-col">
            <div className="p-6 bg-[#F8FAFC] border-b border-[#CBD5E1] flex justify-between items-center">
              <div>
                <span className="text-black font-bold text-[11px] tracking-widest uppercase opacity-50">
                  KYC Verification
                </span>
                <h3 className="text-xl font-bold text-[#001F3F] tracking-tight mt-1">
                  Full Profile Audit
                </h3>
              </div>
              <button
                onClick={() => setSelectedPartner(null)}
                className="p-2 text-slate-400 hover:text-black transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Profile Bio */}
              <div className="flex items-center gap-5 pb-8 border-b border-slate-100">
                <div className="h-16 w-16 bg-[#001F3F] text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg">
                  {selectedPartner.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black">
                    {selectedPartner.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${selectedPartner.kycStatus === "VERIFIED" ? "bg-green-500" : "bg-amber-500"}`}
                    />
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em]">
                      {selectedPartner.kycStatus}
                    </p>
                  </div>
                </div>
              </div>

              {/* Identity Matrix */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <FiBriefcase className="text-[#001F3F]" size={14} />
                    <h4 className="text-[11px] font-bold text-black uppercase tracking-widest">
                      Contact & Identity
                    </h4>
                  </div>
                  {/* Added Document View Button */}
                  {selectedPartner.hasPanDocument && (
                    <button
                      onClick={() => openDocument(selectedPartner.id, "pan")}
                      className="text-[10px] bg-slate-100 hover:bg-[#001F3F] hover:text-white text-slate-600 px-3 py-1 rounded transition-colors flex items-center gap-1 font-bold uppercase tracking-wider"
                    >
                      <FiEye size={10} /> View PAN
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-5">
                  <InfoRow
                    icon={<FiMail />}
                    label="Registry Email"
                    value={selectedPartner.email}
                  />
                  <InfoRow
                    icon={<FiPhone />}
                    label="Verified Phone"
                    value={selectedPartner.phone}
                  />
                  <InfoRow
                    icon={<FiMapPin />}
                    label="Primary Address"
                    value={selectedPartner.address}
                  />
                  <InfoRow
                    icon={<FiUser />}
                    label="Permanent Account Number (PAN)"
                    value={selectedPartner.panNumber || "MISSING"}
                    highlight
                  />
                </div>
              </div>

              {/* Banking & Settlement Matrix */}
              <div className="space-y-6 bg-[#F8FAFC] p-6 rounded-2xl border border-[#CBD5E1]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <FiCreditCard className="text-[#001F3F]" size={14} />
                    <h4 className="text-[11px] font-bold text-black uppercase tracking-widest">
                      Financial Ledger
                    </h4>
                  </div>
                  {/* Added Document View Button */}
                  {selectedPartner.hasBankProofDocument && (
                    <button
                      onClick={() =>
                        openDocument(selectedPartner.id, "bank-proof")
                      }
                      className="text-[10px] bg-white hover:bg-[#001F3F] hover:text-white text-slate-600 border border-slate-300 px-3 py-1 rounded transition-colors flex items-center gap-1 font-bold uppercase tracking-wider shadow-sm"
                    >
                      <FiEye size={10} /> View Proof
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <DetailLine
                    label="Account Holder"
                    value={selectedPartner.accountName}
                  />
                  <DetailLine
                    label="Banking Institution"
                    value={selectedPartner.bankName}
                  />
                  <DetailLine
                    label="Account Protocol"
                    value={selectedPartner.bankAccount}
                  />
                  <DetailLine
                    label="IFSC Code"
                    value={selectedPartner.ifscCode}
                  />
                  <DetailLine
                    label="Branch Office"
                    value={selectedPartner.branch}
                  />
                  <DetailLine
                    label="UPI Endpoint"
                    value={selectedPartner.upiId}
                  />
                </div>
              </div>
            </div>

            {/* Audit Actions */}
            <div className="p-6 bg-[#F8FAFC] border-t border-[#CBD5E1] flex gap-3">
              <button
                onClick={() =>
                  handleStatusUpdate(selectedPartner.id, "VERIFIED")
                }
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-700 shadow-xl active:scale-[0.98] transition"
              >
                <FiCheckCircle size={16} /> Authorize KYC
              </button>
              <button
                onClick={() =>
                  handleStatusUpdate(selectedPartner.id, "REJECTED")
                }
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-red-600 border border-red-200 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-red-50 transition"
              >
                <FiXCircle size={16} /> Reject KYC
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- Secure Document Preview Modal --- */}
      {previewBlob && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-xl relative overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Secure Document Viewer
              </span>
              <button
                onClick={() => {
                  setPreviewBlob(null);
                  setPreviewType(null);
                }}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-slate-500"
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="flex-1 bg-slate-900 overflow-auto flex items-center justify-center">
              {previewType === "application/pdf" ? (
                <iframe
                  src={previewBlob}
                  className="w-full h-full border-0"
                  title="Document Preview"
                />
              ) : (
                <img
                  src={previewBlob}
                  alt="Document Preview"
                  className="max-w-full max-h-full object-contain shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ icon, label, value, highlight }) => (
  <div className="flex items-start gap-4">
    <div className="mt-1 text-slate-400">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
        {label}
      </p>
      <p
        className={`text-[12px] font-bold ${highlight ? "text-[#001F3F] bg-[#F0F4F8] px-2 py-0.5 rounded" : "text-black"}`}
      >
        {value || "—"}
      </p>
    </div>
  </div>
);

const DetailLine = ({ label, value }) => (
  <div className="flex justify-between items-center text-[11px]">
    <span className="text-slate-500 font-bold uppercase tracking-tight">
      {label}
    </span>
    <span className="text-black font-bold uppercase">{value || "—"}</span>
  </div>
);

export default KycDocuments;
