import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
  UserCog,
  Plus,
  Loader2,
  Phone,
  Mail,
  Pencil,
  Trash2,
  Eye,
  X,
  ShieldCheck,
  AlertTriangle,
  Car,
} from "lucide-react";

import {
  getAvailableInspectors,
  getInspectorAssignments,
  createFieldInspector,
  updateFieldInspector,
  deleteFieldInspector,
  toggleFieldInspectorStatus,
} from "../../admin/services/adminApi.js";

export const InspectorManagementPage = () => {
  const navigate = useNavigate();

  const [inspectors, setInspectors] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);

  const [editingInspector, setEditingInspector] = useState(null);

  const [deletingInspector, setDeletingInspector] = useState(null);

  const [viewingInspector, setViewingInspector] = useState(null);

  const [viewingAssignments, setViewingAssignments] = useState([]);

  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [togglingId, setTogglingId] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  /* =====================================================
       FETCH INSPECTORS
    ===================================================== */

  const fetchInspectors = async () => {
    setLoading(true);

    try {
      const res = await getAvailableInspectors({ includeInactive: true });

      setInspectors(res.data?.data || []);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load inspectors");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (inspector) => {
    setTogglingId(inspector.id);
    try {
      const response = await toggleFieldInspectorStatus(inspector.id);
      const updatedIsActive = response.data?.data?.isActive ?? !inspector.isActive;

      setInspectors((currentInspectors) =>
        currentInspectors.map((currentInspector) =>
          currentInspector.id === inspector.id
            ? { ...currentInspector, isActive: updatedIsActive }
            : currentInspector,
        ),
      );

      toast.success(`Inspector ${updatedIsActive ? "activated" : "deactivated"}`);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update inspector status");
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    fetchInspectors();
  }, []);

  /* =====================================================
       OPEN CREATE MODAL
    ===================================================== */

  const openCreateModal = () => {
    setEditingInspector(null);

    setForm({
      fullName: "",
      email: "",
      phone: "",
      password: "",
    });

    setShowModal(true);
  };

  /* =====================================================
       OPEN EDIT MODAL
    ===================================================== */

  const openEditModal = (inspector) => {
    setEditingInspector(inspector);

    setForm({
      fullName: inspector.fullName || "",
      email: inspector.email || "",
      phone: inspector.phone || "",
      password: "",
    });

    setShowModal(true);
  };

  /* =====================================================
       CLOSE MODAL
    ===================================================== */

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);

    setEditingInspector(null);

    setForm({
      fullName: "",
      email: "",
      phone: "",
      password: "",
    });
  };

  /* =====================================================
       FORM CHANGE
    ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =====================================================
       CREATE / UPDATE
    ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      toast.error("Enter full name");
      return;
    }

    if (!form.email.trim()) {
      toast.error("Enter email");
      return;
    }

    if (!form.phone.trim()) {
      toast.error("Enter phone number");
      return;
    }

    if (!editingInspector && form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (editingInspector && form.password && form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);

    try {
      if (editingInspector) {
        await updateFieldInspector(editingInspector.id, form);

        toast.success("Field inspector updated successfully");
      } else {
        await createFieldInspector(form);

        toast.success("Field inspector account created");
      }

      closeModal();

      await fetchInspectors();
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
        `Failed to ${editingInspector ? "update" : "create"} inspector`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
       OPEN VIEW MODAL
    ===================================================== */

  const openViewModal = async (inspector) => {
    setViewingInspector(inspector);
    setViewingAssignments([]);
    setShowViewModal(true);
    setLoadingAssignments(true);

    try {
      const res = await getInspectorAssignments(inspector.id);
      setViewingAssignments(res.data?.data?.inspections || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load inspector assignments");
    } finally {
      setLoadingAssignments(false);
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingInspector(null);
    setViewingAssignments([]);
  };

  const openInspectionDetails = (inspectionId) => {
    closeViewModal();
    navigate(`/admin/inspections/${inspectionId}`);
  };

  /* =====================================================
       OPEN DELETE CONFIRMATION
    ===================================================== */

  const openDeleteModal = (inspector) => {
    setDeletingInspector(inspector);

    setShowDeleteModal(true);
  };

  /* =====================================================
       DELETE INSPECTOR
    ===================================================== */

  const handleDelete = async () => {
    if (!deletingInspector) return;

    setDeleting(true);

    try {
      await deleteFieldInspector(deletingInspector.id);

      toast.success("Field inspector deleted permanently");

      setShowDeleteModal(false);

      setDeletingInspector(null);

      await fetchInspectors();
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message || "Failed to delete inspector",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      <Helmet>
        <title>Field Inspectors | Admin</title>
      </Helmet>

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          animate-fadeInUp
          flex flex-col gap-4
          rounded-2xl
          bg-gradient-to-br
          from-[#001f3f]
          via-[#002a55]
          to-[#003d7a]
          p-6
          shadow-lg
          shadow-[#001f3f]/20
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              flex items-center gap-1.5
              text-xs font-semibold
              uppercase tracking-[0.25em]
              text-cyan-200
            "
          >
            <UserCog size={13} />
            Field Team
          </p>

          <h1
            className="
              mt-1
              text-2xl
              font-bold
              text-white
              sm:text-3xl
            "
          >
            Field Inspectors
          </h1>

          <p className="mt-1 text-sm text-white/70">
            Manage your field verification team.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="
            flex items-center
            justify-center
            gap-2
            rounded-xl
            bg-white
            px-4 py-2.5
            text-sm font-bold
            text-[#001f3f]
            shadow-md
            transition
            hover:-translate-y-0.5
            hover:shadow-lg
            cursor-pointer
          "
        >
          <Plus size={16} />
          Add Inspector
        </button>
      </div>

      {/* =================================================
          INSPECTOR TABLE
        ================================================= */}

      <div
        className="
          animate-fadeInUp
          rounded-2xl
          border border-slate-200
          bg-white
          shadow-sm
        "
      >
        {loading ? (
          <div
            className="
              flex
              h-48
              items-center
              justify-center
            "
          >
            <Loader2
              className="
                h-6 w-6
                animate-spin
                text-[#001f3f]
              "
            />
          </div>
        ) : inspectors.length === 0 ? (
          <div
            className="
              flex
              h-48
              flex-col
              items-center
              justify-center
              gap-2
              text-slate-400
            "
          >
            <UserCog size={28} />

            <p className="text-sm">No inspectors yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Inspector</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Active workload</th>
                  <th className="px-5 py-3.5">Account</th>
                  <th className="px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspectors.map((inspector) => (
                  <tr key={inspector.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex min-w-[190px] items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#001f3f] to-[#003d7a] text-sm font-bold text-white">{inspector.fullName?.charAt(0)?.toUpperCase() || "I"}</span>
                        <div><p className="font-bold text-slate-900">{inspector.fullName || "Unnamed inspector"}</p><p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-emerald-600"><ShieldCheck size={11} /> Field Inspector</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><p className="text-slate-700">{inspector.email || "No email"}</p><p className="mt-0.5 text-xs text-slate-500">{inspector.phone || "No phone"}</p></td>
                    <td className="px-5 py-4"><span className="rounded-full bg-[#e6f2ff] px-2.5 py-1 text-xs font-bold text-[#001f3f]">{inspector.activeWorkload || 0} active</span></td>
                    <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${inspector.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}><span className={`h-1.5 w-1.5 rounded-full ${inspector.isActive ? "bg-emerald-500" : "bg-red-500"}`} />{inspector.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => openViewModal(inspector)} title="View Inspector" className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"><Eye size={14} /></button>
                        <button type="button" onClick={() => openEditModal(inspector)} title="Edit Inspector" className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-[#001f3f] hover:bg-[#e6f2ff] hover:text-[#001f3f]"><Pencil size={14} /></button>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={inspector.isActive}
                          onClick={() => handleToggleStatus(inspector)}
                          disabled={togglingId === inspector.id}
                          title={inspector.isActive ? "Deactivate account" : "Activate account"}
                          className={`inline-flex cursor-pointer rounded-full border p-1 transition disabled:cursor-wait disabled:opacity-50 ${inspector.isActive ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100" : "border-red-200 bg-red-50 hover:bg-red-100"}`}
                        >
                          <span className={`relative h-5 w-9 rounded-full transition-colors ${inspector.isActive ? "bg-emerald-500" : "bg-red-500"}`}>
                            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${inspector.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                          </span>
                        </button>
                        <button type="button" onClick={() => openDeleteModal(inspector)} title="Delete Inspector" className="cursor-pointer rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50 hover:text-red-700"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================
          VIEW DETAILS MODAL
      ================================================= */}

      {showViewModal && viewingInspector && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-slate-950/60
            p-4
            backdrop-blur-sm
          "
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeViewModal();
            }
          }}
        >
          <div
            className="
              w-full
              max-w-lg
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-2xl
              animate-fadeInUp
            "
          >
            {/* HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                bg-gradient-to-r
                from-[#001f3f]
                to-[#003d7a]
                px-5
                py-4
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-11 w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-white/15
                    text-base
                    font-bold
                    text-white
                  "
                >
                  {viewingInspector.fullName?.charAt(0)?.toUpperCase() || "I"}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white">
                    {viewingInspector.fullName}
                  </h2>
                  <p className="text-xs text-white/60">Field Inspector</p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeViewModal}
                className="
                  flex
                  h-9 w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-white/70
                  transition
                  hover:bg-white/10
                  hover:text-white
                  cursor-pointer
                "
              >
                <X size={19} />
              </button>
            </div>

            {/* BODY */}

            <div
              className="
                max-h-[calc(100vh-180px)]
                overflow-y-auto
                p-5
                sm:p-6
              "
            >
              {/* DETAILS */}

              <div className="space-y-2.5">
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    bg-slate-50
                    px-3.5
                    py-3
                  "
                >
                  <Mail size={15} className="shrink-0 text-slate-400" />
                  <span className="break-all text-sm text-slate-700">
                    {viewingInspector.email}
                  </span>
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    bg-slate-50
                    px-3.5
                    py-3
                  "
                >
                  <Phone size={15} className="shrink-0 text-slate-400" />
                  <span className="text-sm text-slate-700">
                    {viewingInspector.phone}
                  </span>
                </div>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    border
                    border-slate-100
                    bg-white
                    px-3.5
                    py-3
                  "
                >
                  <span className="text-sm font-medium text-slate-500">
                    Active inspections
                  </span>
                  <span
                    className="
                      rounded-full
                      bg-[#e6f2ff]
                      px-2.5
                      py-1
                      text-xs
                      font-bold
                      text-[#001f3f]
                    "
                  >
                    {viewingAssignments.filter((assignment) =>
                      ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"].includes(
                        assignment.status,
                      ),
                    ).length}
                  </span>
                </div>
              </div>

              {/* ASSIGNED INSPECTIONS */}

              <div className="mt-6">
                <p
                  className="
                    mb-2
                    flex
                    items-center
                    gap-1.5
                    text-xs
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
                >
                  <Car size={13} />
                  Assigned Inspections ({viewingAssignments.length})
                </p>

                {loadingAssignments ? (
                  <div className="flex items-center justify-center rounded-xl border border-slate-200 py-8 text-sm text-slate-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#001f3f]" />
                    Loading assignments...
                  </div>
                ) : viewingAssignments.length ? (
                  <div className="space-y-2">
                    {viewingAssignments.map((assignment) => {
                      const vehicle = assignment.vehicleListing || {};
                      const schedule = assignment.scheduledDate
                        ? new Date(assignment.scheduledDate).toLocaleDateString()
                        : "Not scheduled";
                      const accepted = assignment.acceptedAt
                        ? new Date(assignment.acceptedAt).toLocaleDateString()
                        : "Not accepted";

                      return (
                        <div
                          key={assignment.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => openInspectionDetails(assignment.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              openInspectionDetails(assignment.id);
                            }
                          }}
                          className="
                            cursor-pointer
                            rounded-xl
                            border
                            border-slate-200
                            bg-slate-50
                            px-3.5
                            py-3
                            transition
                            hover:border-[#001f3f]
                            hover:bg-[#e6f2ff]
                            focus:outline-none
                            focus:ring-2
                            focus:ring-[#001f3f]/30
                        "
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {vehicle.title || "Untitled vehicle"}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {assignment.inspectionNo || "Inspection"}
                                {vehicle.city || vehicle.state
                                  ? ` · ${[vehicle.city, vehicle.state].filter(Boolean).join(", ")}`
                                  : ""}
                              </p>
                            </div>

                            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                              {assignment.status || "UNKNOWN"}
                            </span>
                          </div>

                          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                            <span>Priority: <strong className="text-slate-700">{assignment.priority || "-"}</strong></span>
                            <span>Scheduled: <strong className="text-slate-700">{schedule}</strong></span>
                            <span>Accepted: <strong className="text-slate-700">{accepted}</strong></span>
                            <span>Assigned: <strong className="text-slate-700">{assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString() : "-"}</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className="
                      flex
                      flex-col
                      items-center
                      justify-center
                      gap-1.5
                      rounded-xl
                      border
                      border-dashed
                      border-slate-200
                      py-6
                      text-slate-400
                    "
                  >
                    <Car size={20} />
                    <p className="text-xs">No vehicles assigned.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      {showModal && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-slate-950/60
            p-4
            backdrop-blur-sm
          "
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="
              w-full
              max-w-xl
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-2xl
              animate-fadeInUp
            "
          >
            {/* MODAL HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                bg-gradient-to-r
                from-[#001f3f]
                to-[#003d7a]
                px-5
                py-4
              "
            >
              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-white
                  "
                >
                  <UserCog size={18} />

                  <h2 className="text-lg font-bold">
                    {editingInspector
                      ? "Edit Field Inspector"
                      : "Add Field Inspector"}
                  </h2>
                </div>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-white/60
                  "
                >
                  {editingInspector
                    ? "Update inspector account details"
                    : "Create a new field verification account"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="
                  flex
                  h-9 w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-white/70
                  transition
                  hover:bg-white/10
                  hover:text-white
                  disabled:opacity-50
                  cursor-pointer
                "
              >
                <X size={19} />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="
                max-h-[calc(100vh-180px)]
                overflow-y-auto
                p-5
                sm:p-6
              "
            >
              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                "
              >
                {/* FULL NAME */}

                <div className="sm:col-span-2">
                  <label
                    className="
                      mb-1.5
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Full Name
                  </label>

                  <input
                    required
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter inspector full name"
                    className="
                      w-full
                      rounded-xl
                      border-2
                      border-slate-200
                      bg-white
                      px-3.5
                      py-3
                      text-sm
                      outline-none
                      transition
                      focus:border-[#001f3f]
                      focus:ring-4
                      focus:ring-[#001f3f]/10
                    "
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Email
                  </label>

                  <input
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="inspector@example.com"
                    className="
                      w-full
                      rounded-xl
                      border-2
                      border-slate-200
                      px-3.5
                      py-3
                      text-sm
                      outline-none
                      transition
                      focus:border-[#001f3f]
                      focus:ring-4
                      focus:ring-[#001f3f]/10
                    "
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Phone
                  </label>

                  <input
                    required
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="
                      w-full
                      rounded-xl
                      border-2
                      border-slate-200
                      px-3.5
                      py-3
                      text-sm
                      outline-none
                      transition
                      focus:border-[#001f3f]
                      focus:ring-4
                      focus:ring-[#001f3f]/10
                    "
                  />
                </div>

                {/* PASSWORD */}

                <div className="sm:col-span-2">
                  <label
                    className="
                      mb-1.5
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Password
                    {editingInspector && (
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        Leave blank to keep current password
                      </span>
                    )}
                  </label>

                  <input
                    required={!editingInspector}
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={
                      editingInspector
                        ? "Enter new password only if changing it"
                        : "Minimum 8 characters"
                    }
                    className="
                      w-full
                      rounded-xl
                      border-2
                      border-slate-200
                      px-3.5
                      py-3
                      text-sm
                      outline-none
                      transition
                      focus:border-[#001f3f]
                      focus:ring-4
                      focus:ring-[#001f3f]/10
                    "
                  />
                </div>
              </div>

              {/* ACTIONS */}

              <div
                className="
                  mt-6
                  flex
                  flex-col-reverse
                  gap-3
                  border-t
                  border-slate-100
                  pt-5
                  sm:flex-row
                  sm:justify-end
                "
              >
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-600
                    transition
                    hover:bg-slate-50
                    disabled:opacity-50
                    cursor-pointer
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#001f3f]
                    px-5
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    shadow-md
                    transition
                    hover:bg-[#002a55]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    cursor-pointer
                  "
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />

                      {editingInspector ? "Updating..." : "Creating..."}
                    </>
                  ) : editingInspector ? (
                    "Update Inspector"
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          DELETE CONFIRMATION MODAL
      ================================================= */}

      {showDeleteModal && deletingInspector && (
        <div
          className="
            fixed
            inset-0
            z-[110]
            flex
            items-center
            justify-center
            bg-slate-950/70
            p-4
            backdrop-blur-sm
          "
        >
          <div
            className="
              w-full
              max-w-md
              rounded-2xl
              bg-white
              p-6
              shadow-2xl
              animate-fadeInUp
            "
          >
            <div
              className="
                mx-auto
                flex
                h-14 w-14
                items-center
                justify-center
                rounded-full
                bg-red-50
                text-red-600
              "
            >
              <AlertTriangle size={26} />
            </div>

            <h3
              className="
                mt-4
                text-center
                text-lg
                font-bold
                text-slate-900
              "
            >
              Delete Inspector?
            </h3>

            <p
              className="
                mt-2
                text-center
                text-sm
                leading-6
                text-slate-500
              "
            >
              Are you sure you want to permanently delete{" "}
              <span className="font-bold text-slate-800">
                {deletingInspector.fullName}
              </span>
              ?
              <br />
              This action cannot be undone.
            </p>

            <div
              className="
                mt-6
                flex
                flex-col-reverse
                gap-3
                sm:flex-row
                sm:justify-center
              "
            >
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingInspector(null);
                }}
                disabled={deleting}
                className="
                  rounded-xl
                  border
                  border-slate-200
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:bg-slate-50
                  cursor-pointer
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-red-600
                  px-5
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-red-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  cursor-pointer
                "
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};