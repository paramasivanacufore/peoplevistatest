import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import CompanyFormModal from "./CompanyFormModal";
import { toast } from "react-hot-toast";
import { companyAPI } from "../../utils/registrationForms/api";
import "../../styles/tableDesign.css";
import {
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import ConfirmationModal from "../../components/Common/ConfirmationModal";
import DataTable from "../../components/Common/DataTable";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin7Line } from "react-icons/ri";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReinstateConfirm, setShowReinstateConfirm] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [companyToReinstate, setCompanyToReinstate] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const columns = [
    { key: "company_name", label: "Company Name" },
    { key: "industry_type", label: "Industry Type" },
    { key: "website", label: "Website" },
    { key: "email", label: "Email" },
    { key: "country", label: "Country" },
    { key: "actions", label: "Actions" },
  ];

  // Fetch all companies
  const fetchCompanies = async () => {
    try {
      const data = await companyAPI.getAll();
      setCompanies(data);
      // console.log("companydata",data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Filter logic
  const filteredCompanies = companies
    .filter((company) => {
      const matchesSearch =
        company.company_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        company.website_url
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const statusText = company.status_id === 1 ? "Active" : "Archived";
      const matchesStatus =
        statusFilter === "All" || statusText === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Recently added first
      if (a.created_at && b.created_at) {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      // fallback if created_at not available
      return b.company_id - a.company_id;
    });

  const totalItems = filteredCompanies.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPaginationRange = (current, total) => {
    const delta = 1; // pages around current
    const range = [];
    const rangeWithDots = [];
    let last;

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (last) {
        if (i - last === 2) {
          rangeWithDots.push(last + 1);
        } else if (i - last > 2) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      last = i;
    }

    return rangeWithDots;
  };

  useEffect(() => {
    setCurrentPage(1); // reset page when filter/search changes
  }, [searchQuery, statusFilter]);
  // Archive company
  const handleDelete = (companyId) => {
    setCompanyToDelete(companyId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await companyAPI.delete(companyToDelete);
      toast.success("Company archived successfully");
      setShowDeleteConfirm(false);
      fetchCompanies();
    } catch (error) {
      toast.error("Error archiving company: " + error.message);
    }
  };

  // Reinstate company
  const handleReinstate = (companyId) => {
    setCompanyToReinstate(companyId);
    setShowReinstateConfirm(true);
  };

  const confirmReinstate = async () => {
    try {
      const formData = new FormData();
      formData.append("status_id", 1);
      await companyAPI.update(companyToReinstate, formData);
      toast.success("Company reinstated successfully");
      setShowReinstateConfirm(false);
      fetchCompanies();
    } catch (error) {
      toast.error("Error reinstating company: " + error.message);
    }
  };

  // Cancel handlers
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setCompanyToDelete(null);
  };
  const cancelReinstate = () => {
    setShowReinstateConfirm(false);
    setCompanyToReinstate(null);
  };

  // Modal handlers
  const handleCreateCompany = () => {
    setEditingCompanyId(null);
    setShowCompanyModal(true);
  };
  const handleEdit = (id) => {
    setEditingCompanyId(id);
    setShowCompanyModal(true);
  };
  const handleCloseModal = () => {
    setShowCompanyModal(false);
    setEditingCompanyId(null);
  };
  const handleModalSuccess = () => {
    fetchCompanies();
  };

  // Loading & error handling
  if (loading)
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading companies...</div>
        </div>
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout pageTitle="Companies List">
      <div style={{ background: "#e9eff5" }} className="topcontainer">
        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-center mb-3 gap-4">
          {/* SEARCH */}
          <div className="ui-search">
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ui-search-input"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* STATUS TABS */}
            <div className="ui-tabs">
              {["Active", "Archived", "All"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`ui-tab ${
                    statusFilter === status ? "active" : ""
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* ADD COMPANY */}
            <button onClick={handleCreateCompany} className="ui-primary-btn">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Company
            </button>
          </div>
        </div>

        {/* TABLE */}
        <DataTable
          className="font-custom"
          columns={columns}
          data={paginatedCompanies}
          renderRow={(company) => {
            const statusText = company.status_id === 1 ? "Active" : "Archived";

            return (
              <tr key={company.company_id} className="ui-row">
                <td className="ui-td">{company.company_name}</td>
                <td className="ui-td">{company.industry_type}</td>
                <td className="ui-td">
                  {company.website_url ? (
                    <a
                      href={company.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ui-link"
                    >
                      {company.website_url}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="ui-td">{company.email || "-"}</td>
                <td className="ui-td">{company.country || "-"}</td>

                <td className="ui-td">
                  <div className="flex items-center gap-3">
                    {statusText === "Archived" ? (
                      <button
                        onClick={() => handleReinstate(company.company_id)}
                        className="ui-icon-btn reinstate"
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(company.company_id)}
                          className="ui-icon-btn edit"
                        >
                            <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(company.company_id)}
                          className="ui-icon-btn delete"
                        >
                         <RiDeleteBin7Line size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          }}
          pagination={
            totalItems > 0 && (
              <div className="ui-pagination font-custom">
                <div className="ui-pagination-info">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                  {totalItems} results
                </div>

                <div className="ui-pagination-controls">
                  <button
                    className="ui-page-btn"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    Previous
                  </button>

                  {getPaginationRange(currentPage, totalPages).map(
                    (page, index) =>
                      page === "..." ? (
                        <span
                          key={`dots-${index}`}
                          className="px-2 text-slate-400"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={page}
                          className={`ui-page-btn ${
                            currentPage === page ? "active" : ""
                          }`}
                          onClick={() => goToPage(page)}
                        >
                          {page}
                        </button>
                      )
                  )}

                  <button
                    className="ui-page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )
          }
        />

        {/* MODAL (UNCHANGED) */}
        <CompanyFormModal
          isOpen={showCompanyModal}
          onClose={handleCloseModal}
          companyId={editingCompanyId}
          onSuccess={handleModalSuccess}
        />
        {/* ARCHIVE CONFIRM MODAL */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Archive Company"
          message="Are you sure you want to archive this company?"
          confirmText="Archive"
          cancelText="Cancel"
          type="danger"
        />

        {/* REINSTATE CONFIRM MODAL */}
        <ConfirmationModal
          isOpen={showReinstateConfirm}
          onClose={cancelReinstate}
          onConfirm={confirmReinstate}
          title="Reinstate Company"
          message="Do you want to reinstate this company?"
          confirmText="Reinstate"
          cancelText="Cancel"
          type="info"
        />
      </div>
    </DashboardLayout>
  );
};

export default Companies;
