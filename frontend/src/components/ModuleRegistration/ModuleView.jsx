import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiPackage, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../Common/ConfirmationModal';
import { moduleRegistrationAPI } from '../../utils/moduleRegistration/apiUtils';
import { toast } from 'react-toastify';

const ModuleView = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // All, Active, Inactive
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    status_id: 1
  });

  // Load modules from API
  const loadModules = async () => {
    setLoading(true);
    setError(null);
    try {
      const modulesData = await moduleRegistrationAPI.getAllModules();
      setModules(modulesData || []);
    } catch (error) {
      console.error('Error loading modules:', error);
      setError('Failed to load modules. Please try again.');
      toast.error('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  useEffect(() => {
    filterModules();
  }, [searchTerm, filterStatus, modules]);

  const filterModules = () => {
    let filtered = [...modules];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(module =>
        module.module_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (filterStatus === 'Active') {
      filtered = filtered.filter(module => module.status_id === 1);
    } else if (filterStatus === 'Inactive') {
      filtered = filtered.filter(module => module.status_id === 0);
    }

    setFilteredModules(filtered);
  };

  const handleEdit = (module) => {
    setModuleToEdit(module);
    setEditFormData({
      name: module.name,
      description: module.description || '',
      status_id: module.status_id
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await moduleRegistrationAPI.updateModule(moduleToEdit.module_id, editFormData);
      toast.success(result.message || 'Module updated successfully');
      setShowEditModal(false);
      setModuleToEdit(null);
      await loadModules();
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error(error.message || 'Failed to update module');
    }
  };

  const handleDelete = (moduleId) => {
    const module = modules.find(m => m.module_id === moduleId);
    setModuleToDelete(module);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!moduleToDelete) return;
    
    try {
      const result = await moduleRegistrationAPI.deleteModule(moduleToDelete.module_id);
      toast.success(result.message || 'Module deleted successfully');
      await loadModules();
      setShowDeleteModal(false);
      setModuleToDelete(null);
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error(error.message || 'Failed to delete module');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setModuleToDelete(null);
  };

  const handleCreateNew = () => {
    navigate('/module-registration');
  };

  const getStatusBadge = (statusId) => {
    return statusId === 1
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FiPackage className="text-blue-600 w-5 h-5" />
              Module Management
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">View and manage system modules</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <FiPlus className="w-4 h-4" />
            Register Module
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by module key, name, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilterStatus('All')}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                filterStatus === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('Active')}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                filterStatus === 'Active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('Inactive')}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                filterStatus === 'Inactive'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-2 text-xs text-gray-600">
          Showing {filteredModules.length} of {modules.length} modules
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading modules...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <FiPackage className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Error loading modules</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={loadModules}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="p-8 text-center">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No modules found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'All'
                ? 'Try adjusting your filters'
                : 'Get started by registering a new module'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module Key
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredModules.map((module) => (
                  <tr key={module.module_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs font-medium text-gray-900">{module.module_key}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs font-medium text-gray-900">{module.name}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs text-gray-900 max-w-xs truncate" title={module.description || ''}>
                        {module.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">{module.permissions_count || 0}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusBadge(module.status_id)}`}>
                        {module.status_id === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">{formatDate(module.created_at)}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(module)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(module.module_id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Edit Module</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setModuleToEdit(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module Key
                  </label>
                  <input
                    type="text"
                    value={moduleToEdit?.module_key || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Module key cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editFormData.status_id}
                    onChange={(e) => setEditFormData({ ...editFormData, status_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setModuleToEdit(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Update Module
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Module"
        message={`Are you sure you want to delete "${moduleToDelete?.name}"? This will permanently delete the module and all associated permissions, role assignments, and scopes. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default ModuleView;

