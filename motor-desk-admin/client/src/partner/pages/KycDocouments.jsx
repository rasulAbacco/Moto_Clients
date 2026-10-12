import React, { useState, useEffect } from "react";
import {
  FiFileText,
  FiServer,
  FiAlertCircle,
  FiCheckCircle,
  FiHome,
  FiCreditCard,
  FiHash,
  FiShield,
  FiUser,
  FiActivity,
  FiUpload,
  FiGrid,
  FiLock,
  FiMapPin,
  FiPhone,
  FiEye,
  FiXCircle,
  FiAlertOctagon,
} from "react-icons/fi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const KycDocuments = () => {
  const [activeTab, setActiveTab] = useState("submit");
  const [loading, setLoading] = useState(false);
  const [partnerData, setPartnerData] = useState(null);

  const [panFile, setPanFile] = useState(null);
  const [bankFile, setBankFile] = useState(null);

  const [kycForm, setKycForm] = useState({
    bankAccount: "",
    accountName: "",
    bankName: "",
    branch: "",
    ifscCode: "",
    upiId: "",
    panNumber: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("partnerToken");
        const res = await axios.get(`${API_URL}/api/partner/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setPartnerData(data);

        setKycForm({
          bankAccount: data.bankAccount || "",
          accountName: data.accountName || "",
          bankName: data.bankName || "",
          branch: data.branch || "",
          ifscCode: data.ifscCode || "",
          upiId: data.upiId || "",
          panNumber: data.panNumber || "",
        });
      } catch (err) {
        console.error("Failed to load profile context");
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("partnerToken");

      const formData = new FormData();

      Object.keys(kycForm).forEach((key) => {
        formData.append(key, kycForm[key]);
      });

      if (panFile) formData.append("panDocument", panFile);
      if (bankFile) formData.append("bankProofDocument", bankFile);

      const res = await axios.put(
        `${API_URL}/api/partner/kyc-update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // ✅ Update local state with new status from backend (resets to PENDING)
      if (res.data) {
        setPartnerData((prev) => ({
          ...prev,
          kycStatus: res.data.kycStatus || "PENDING",
          hasPanDocument: res.data.hasPanDocument || prev?.hasPanDocument,
          hasBankProofDocument:
            res.data.hasBankProofDocument || prev?.hasBankProofDocument,
        }));
      }

      toast.success("Financial Registry Updated");
      setActiveTab("view");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registry Update Failed");
    } finally {
      setLoading(false);
    }
  };

  const isPanRequired = (partnerData?.totalEarnings || 0) > 30000;

  // Helper for Status Styling
  const getStatusConfig = (status) => {
    switch (status) {
      case "VERIFIED":
        return {
          color: "text-emerald-700",
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          icon: <FiCheckCircle size={12} />,
        };
      case "REJECTED":
        return {
          color: "text-red-700",
          bg: "bg-red-50",
          border: "border-red-200",
          icon: <FiXCircle size={12} />,
        };
      default: // PENDING
        return {
          color: "text-amber-700",
          bg: "bg-amber-50",
          border: "border-amber-200",
          icon: <FiActivity size={12} />,
        };
    }
  };

  const currentStatus = partnerData?.kycStatus || "PENDING";
  const statusConfig = getStatusConfig(currentStatus);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#CBD5E1] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center gap-2">
              <FiShield className="text-[#001F3F]" size={14} />
              <span className="text-black font-bold text-[11px] tracking-[0.2em] uppercase">
                Verification Portal
              </span>
            </div>

            {/* ✅ STATUS BADGE */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} text-[10px] font-bold uppercase tracking-wider`}
            >
              {statusConfig.icon}
              {currentStatus}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#001F3F] tracking-tight">
            KYC & Settlements
          </h1>
        </div>

        <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("submit")}
            className={`px-5 py-2.5 text-[11px] font-bold uppercase rounded-md transition-all duration-200 ${
              activeTab === "submit"
                ? "bg-[#001F3F] text-white shadow-sm"
                : "text-slate-500 hover:text-black hover:bg-white/50"
            }`}
          >
            Update Registry
          </button>
          <button
            onClick={() => setActiveTab("view")}
            className={`px-5 py-2.5 text-[11px] font-bold uppercase rounded-md transition-all duration-200 ${
              activeTab === "view"
                ? "bg-[#001F3F] text-white shadow-sm"
                : "text-slate-500 hover:text-black hover:bg-white/50"
            }`}
          >
            Active Ledger
          </button>
        </div>
      </div>

      {/* --- Tab: Update Registry (Form) --- */}
      {activeTab === "submit" ? (
        <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 md:p-8 shadow-sm">
          {/* ✅ REJECTION ALERT */}
          {currentStatus === "REJECTED" && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <FiAlertOctagon
                className="text-red-600 mt-0.5 flex-shrink-0"
                size={18}
              />
              <div>
                <h4 className="text-[11px] font-bold text-red-800 uppercase tracking-widest mb-1">
                  Action Required: Submission Rejected
                </h4>
                <p className="text-xs text-red-700 leading-relaxed">
                  Your previous KYC details did not meet compliance standards.
                  Please review the information below and re-upload the required
                  documents to proceed.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Banking Details Grid */}
            <div>
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
                <FiCreditCard className="text-[#001F3F]" size={14} />
                <h3 className="text-[11px] font-bold text-black uppercase tracking-widest">
                  Settlement Matrix
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <KycInput
                  icon={<FiHash />}
                  label="Bank Account Number"
                  value={kycForm.bankAccount}
                  onChange={(e) =>
                    setKycForm({ ...kycForm, bankAccount: e.target.value })
                  }
                />
                <KycInput
                  icon={<FiUser />}
                  label="Account Holder Name"
                  value={kycForm.accountName}
                  onChange={(e) =>
                    setKycForm({ ...kycForm, accountName: e.target.value })
                  }
                />
                <KycInput
                  icon={<FiServer />}
                  label="Bank Name"
                  value={kycForm.bankName}
                  onChange={(e) =>
                    setKycForm({ ...kycForm, bankName: e.target.value })
                  }
                />
                <KycInput
                  icon={<FiMapPin />}
                  label="Branch"
                  value={kycForm.branch}
                  onChange={(e) =>
                    setKycForm({ ...kycForm, branch: e.target.value })
                  }
                />
                <KycInput
                  icon={<FiGrid />}
                  label="IFSC Code"
                  value={kycForm.ifscCode}
                  onChange={(e) =>
                    setKycForm({ ...kycForm, ifscCode: e.target.value })
                  }
                />
                <KycInput
                  icon={<FiPhone />}
                  label="UPI ID"
                  value={kycForm.upiId}
                  onChange={(e) =>
                    setKycForm({ ...kycForm, upiId: e.target.value })
                  }
                />
              </div>
            </div>

            {/* PAN Section with Conditional Warning */}
            <div
              className={`p-6 rounded-xl border-2 transition-all ${
                isPanRequired
                  ? "bg-amber-50 border-amber-200"
                  : "bg-[#F8FAFC] border-[#E2E8F0]"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FiShield className="text-[#001F3F]" size={14} />
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#001F3F]">
                    Identity Protocol (PAN)
                  </label>
                </div>
                {isPanRequired && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                    <FiAlertCircle size={10} /> Mandatory
                  </span>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <KycInput
                  icon={<FiHash />}
                  label="PAN Number"
                  value={kycForm.panNumber}
                  onChange={(e) =>
                    setKycForm({ ...kycForm, panNumber: e.target.value })
                  }
                  required={isPanRequired}
                />

                <div className="mt-6">
                  <FileUpload
                    label="Upload PAN Document (JPG/PNG/PDF)"
                    onChange={(e) => setPanFile(e.target.files[0])}
                    fileName={panFile?.name}
                  />
                </div>
              </div>

              {isPanRequired && (
                <div className="mt-4 flex items-start gap-2 text-[10px] text-amber-800 bg-amber-100/50 p-3 rounded border border-amber-200">
                  <FiAlertCircle className="mt-0.5 flex-shrink-0" />
                  <p>
                    PAN details are mandatory as your total earnings have
                    exceeded the ₹30,000 compliance threshold.
                  </p>
                </div>
              )}
            </div>

            {/* Bank Proof Upload */}
            <div className="bg-[#F8FAFC] p-6 rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center gap-2 mb-4">
                <FiFileText className="text-[#001F3F]" size={14} />
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#001F3F]">
                  Banking Proof
                </label>
              </div>
              <FileUpload
                label="Upload Cancelled Cheque or Passbook (JPG/PNG/PDF)"
                onChange={(e) => setBankFile(e.target.files[0])}
                fileName={bankFile?.name}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#001F3F] text-white py-4 rounded-xl font-bold uppercase text-[11px] tracking-widest hover:bg-[#002b59] transition-all shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FiActivity className="animate-spin" /> Syncing Protocol...
                  </>
                ) : (
                  <>
                    <FiCheckCircle /> Update Financial Registry
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* --- Tab: Active Financial Vault (View) --- */
        <div className="space-y-6">
          {/* ✅ OVERALL STATUS CARD */}
          <div
            className={`p-6 rounded-xl border-2 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm ${
              currentStatus === "VERIFIED"
                ? "bg-emerald-50 border-emerald-200"
                : currentStatus === "REJECTED"
                  ? "bg-red-50 border-red-200"
                  : "bg-white border-[#CBD5E1]"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-4 rounded-full ${currentStatus === "VERIFIED" ? "bg-emerald-100 text-emerald-600" : currentStatus === "REJECTED" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}
              >
                {currentStatus === "VERIFIED" ? (
                  <FiCheckCircle size={24} />
                ) : currentStatus === "REJECTED" ? (
                  <FiXCircle size={24} />
                ) : (
                  <FiActivity size={24} />
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Compliance Status
                </p>
                <h2 className="text-xl font-bold text-[#001F3F]">
                  {currentStatus}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  {currentStatus === "VERIFIED" &&
                    "Your account is fully verified and eligible for payouts."}
                  {currentStatus === "PENDING" &&
                    "Your documents are under administrative review."}
                  {currentStatus === "REJECTED" &&
                    "Please update your information to resolve compliance issues."}
                </p>
              </div>
            </div>
            {currentStatus !== "VERIFIED" && (
              <button
                onClick={() => setActiveTab("submit")}
                className="px-6 py-3 bg-[#001F3F] text-white rounded-lg text-[11px] font-bold uppercase hover:bg-[#002b59] transition-colors shadow-md"
              >
                Update Details
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Identity Card (PAN) */}
            <div className="md:col-span-1 bg-white border border-[#CBD5E1] rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="bg-[#001F3F] p-4 flex justify-between items-center">
                <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                  Identity Protocol
                </span>
                <FiShield className="text-white/50" size={16} />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                  <FiUser size={20} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  PAN Number
                </p>
                <p className="text-lg font-mono font-bold text-[#001F3F] tracking-wide">
                  {kycForm.panNumber || (
                    <span className="text-slate-300 text-sm">—</span>
                  )}
                </p>
                {kycForm.panNumber && (
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100">
                    <FiCheckCircle size={10} /> Registered
                  </div>
                )}
              </div>
            </div>

            {/* Banking Matrix */}
            <div className="md:col-span-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
                <FiCreditCard className="text-[#001F3F]" size={14} />
                <h3 className="text-[11px] font-bold text-black uppercase tracking-widest">
                  Settlement Matrix
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <VaultItem
                  icon={<FiServer />}
                  label="Banking Institution"
                  value={kycForm.bankName}
                />
                <VaultItem
                  icon={<FiUser />}
                  label="Account Holder"
                  value={kycForm.accountName}
                />
                <VaultItem
                  icon={<FiHash />}
                  label="Account Protocol"
                  value={kycForm.bankAccount}
                  mask
                />
                <VaultItem
                  icon={<FiGrid />}
                  label="IFSC Code"
                  value={kycForm.ifscCode}
                />
                <VaultItem
                  icon={<FiMapPin />}
                  label="Branch Office"
                  value={kycForm.branch}
                />
                <VaultItem
                  icon={<FiPhone />}
                  label="UPI Endpoint"
                  value={kycForm.upiId}
                />
              </div>
            </div>
          </div>

          {/* Documents Status Footer */}
          <div className="bg-white border border-[#CBD5E1] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                <FiFileText size={18} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-black uppercase tracking-widest">
                  Document Registry
                </p>
                <p className="text-[10px] text-slate-500">
                  Securely stored in compliance vault
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  PAN Card
                </p>
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                  {partnerData?.hasPanDocument ? "Uploaded" : "Pending"}{" "}
                  {partnerData?.hasPanDocument && <FiCheckCircle size={10} />}
                </p>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  Bank Proof
                </p>
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                  {partnerData?.hasBankProofDocument ? "Uploaded" : "Pending"}{" "}
                  {partnerData?.hasBankProofDocument && (
                    <FiCheckCircle size={10} />
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Styled Components ---

const KycInput = ({ icon, label, value, onChange, required }) => (
  <div>
    <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
      {icon}
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      className="w-full bg-white border border-[#CBD5E1] rounded-lg px-4 py-3 text-[13px] font-bold text-[#001F3F] placeholder:text-slate-300 focus:outline-none focus:border-[#001F3F] focus:ring-1 focus:ring-[#001F3F] transition-all"
    />
  </div>
);

const FileUpload = ({ label, onChange, fileName }) => (
  <div className="w-full">
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
      {label}
    </label>
    <div className="relative group">
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={onChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="border-2 border-dashed border-slate-200 group-hover:border-[#001F3F] rounded-lg p-4 flex items-center gap-3 transition-colors bg-slate-50 group-hover:bg-white">
        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#001F3F] transition-colors shadow-sm">
          <FiUpload size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-[#001F3F] truncate">
            {fileName || "Click to upload document"}
          </p>
          <p className="text-[9px] text-slate-400 font-medium">
            JPG, PNG or PDF (Max 5MB)
          </p>
        </div>
      </div>
    </div>
  </div>
);

const VaultItem = ({ icon, label, value, mask }) => {
  let displayValue = value || "—";
  if (mask && value && value.length > 4) {
    displayValue = value;
  }

  return (
    <div className="flex justify-between items-start group">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-slate-400 group-hover:text-[#001F3F] transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">
            {label}
          </p>
        </div>
      </div>
      <p className="text-sm font-bold text-[#001F3F] font-mono tracking-wide text-right">
        {displayValue}
      </p>
    </div>
  );
};

export default KycDocuments;
