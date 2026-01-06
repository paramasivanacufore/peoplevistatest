import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import ShiftFormModal from "./ShiftFormModal";
import { toast } from "react-hot-toast";
import "../../styles/tableDesign.css";
import ConfirmationModal from "../../components/Common/ConfirmationModal";
import DataTable from "../../components/Common/DataTable";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin7Line } from "react-icons/ri";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import getPaginationRange from "../../utils/pagination";
import { shiftAPI } from "../../utils/shift/apiUtils";

const ShiftsList = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [showReinstateConfirm, setShowReinstateConfirm] = useState(false);
  const [shiftToReinstate, setShiftToReinstate] = useState(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const columns = [
    { key: "shift_name", label: "Shift Name" },
    { key: "timings", label: "Timings" },
    { key: "break_duration", label: "Break (min)" },
    { key: "grace_time_minutes", label: "Grace (min)" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  const fetchShifts = async () => {
    try {
      const res = await shiftAPI.getAll();
      setShifts(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const filtered = shifts
    .filter((s) => s.shift_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((s) => {
      const statusText = s.status_id === 1 ? "Active" : "Archived";
      return statusFilter === "All" || statusText === statusFilter;
    })
    .sort((a, b) => (a.shift_id < b.shift_id ? 1 : -1));

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToPage = (p) => { if (p >= 1 && p <= totalPages) setCurrentPage(p); };

  useEffect(() => setCurrentPage(1), [searchQuery, statusFilter]);

  const handleDelete = (id) => { setShiftToDelete(id); setShowDeleteConfirm(true); };
  const confirmDelete = async () => {
    try {
      await shiftAPI.delete(shiftToDelete);
      toast.success("Shift archived");
      setShowDeleteConfirm(false);
      fetchShifts();
    } catch (err) { toast.error("Error archiving shift: " + err.message); }
  };

  const handleReinstate = (id) => { setShiftToReinstate(id); setShowReinstateConfirm(true); };
  const confirmReinstate = async () => {
    try {
      await shiftAPI.update(shiftToReinstate, { status_id: 1 });
      toast.success("Shift reinstated");
      setShowReinstateConfirm(false);
      fetchShifts();
    } catch (err) { toast.error("Error reinstating shift: " + err.message); }
  };

  const handleEdit = (id) => { setEditingShiftId(id); setShowShiftModal(true); };
  const handleCreate = () => { setEditingShiftId(null); setShowShiftModal(true); };
  const closeModal = () => { setShowShiftModal(false); setEditingShiftId(null); };
  const onModalSuccess = () => fetchShifts();

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-64"><div className="text-lg text-gray-600">Loading shifts...</div></div>
    </DashboardLayout>
  );
  if (error) return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-64"><div className="text-lg text-red-600">Error: {error}</div></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout pageTitle="Shifts List">
      <div style={{ background: "#e9eff5" }} className="topcontainer">
        <div className="flex flex-wrap justify-between items-center mb-3 gap-4">
          <div className="ui-search">
            <input type="text" placeholder="Search shifts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="ui-search-input" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="ui-tabs">{["Active","Archived","All"].map((s)=> (
              <button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1); }} className={`ui-tab ${statusFilter===s?"active":""}`}>{s}</button>
            ))}</div>
            <button onClick={handleCreate} className="ui-primary-btn">
                  <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>Create Shift</button>
          </div>
        </div>

        <DataTable columns={columns} data={paginated} renderRow={(s) => (
          <tr key={s.shift_id} className="ui-row">
            <td className="ui-td">{s.shift_name}</td>
            <td className="ui-td">{s.start_time} - {s.end_time}</td>
            <td className="ui-td">{s.break_duration ?? 0}</td>
            <td className="ui-td">{s.grace_time_minutes ?? 0}</td>
            <td className="ui-td"><span className={`px-3 py-1 rounded-full text-sm font-medium ${s.status_id===1?"bg-green-100 text-green-800":"bg-gray-100 text-gray-800"}`}>{s.status || (s.status_id===1?"Active":"Archived")}</span></td>
            <td className="ui-td">
              <div className="flex items-center gap-3">
                {s.status_id !== 1 ? (
                  <button onClick={() => handleReinstate(s.shift_id)} className="ui-icon-btn reinstate"><ArrowPathIcon className="w-5 h-5" /></button>
                ) : (
                  <>
                    <button onClick={() => handleEdit(s.shift_id)} className="ui-icon-btn edit"><FiEdit size={18} /></button>
                    <button onClick={() => handleDelete(s.shift_id)} className="ui-icon-btn delete"><RiDeleteBin7Line size={18} /></button>
                  </>
                )}
              </div>
            </td>
          </tr>
        )} pagination={
          totalItems > 0 && (
            <div className="ui-pagination font-custom">
              <div className="ui-pagination-info">Showing {(currentPage-1)*itemsPerPage+1} to {Math.min(currentPage*itemsPerPage, totalItems)} of {totalItems} results</div>
              <div className="ui-pagination-controls">
                <button className="ui-page-btn" disabled={currentPage===1} onClick={()=>goToPage(currentPage-1)}>Previous</button>
                {getPaginationRange(currentPage, totalPages).map((page, idx) => page === "..." ? (
                  <span key={`dots-${idx}`} className="px-2 text-slate-400">…</span>
                ) : (
                  <button key={page} className={`ui-page-btn ${currentPage===page?"active":""}`} onClick={()=>goToPage(page)}>{page}</button>
                ))}
                <button className="ui-page-btn" disabled={currentPage===totalPages} onClick={()=>goToPage(currentPage+1)}>Next</button>
              </div>
            </div>
          )
        } />

        <ShiftFormModal isOpen={showShiftModal} onClose={closeModal} shiftId={editingShiftId} onSuccess={onModalSuccess} />

        <ConfirmationModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={confirmDelete} title="Archive Shift" message="Are you sure you want to archive this shift?" confirmText="Archive" cancelText="Cancel" type="danger" />

        <ConfirmationModal isOpen={showReinstateConfirm} onClose={() => setShowReinstateConfirm(false)} onConfirm={confirmReinstate} title="Reinstate Shift" message="Are you sure you want to reinstate this shift?" confirmText="Reinstate" cancelText="Cancel" type="success" />
      </div>
    </DashboardLayout>
  );
};

export default ShiftsList;
