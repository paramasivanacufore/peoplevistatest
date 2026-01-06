import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiBriefcase } from 'react-icons/fi';
import PositionForm from './PositionForm';
import ConfirmationModal from '../Common/ConfirmationModal';
import { positionAPI } from '../../utils/position/apiUtils';
 
const PositionView = () => {
  const [positions, setPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Active'); // Active, Archived, All
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState(null);
 
  // Load positions from API
  const loadPositions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await positionAPI.getAllPositions();
      setPositions(response.positions || []);
    } catch (error) {
      console.error('Error loading positions:', error);
      setError('Failed to load positions. Please try again.');
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    loadPositions();
  }, []);
 
  useEffect(() => {
    filterPositions();
  }, [searchTerm, filterStatus, positions]);
 
  const filterPositions = () => {
    let filtered = [...positions];
 
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(position =>
        position.position_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
 
    // Filter by status
    if (filterStatus === 'Active') {
      filtered = filtered.filter(position => position.status_id === 1);
    } else if (filterStatus === 'Archived') {
      filtered = filtered.filter(position => position.status_id !== 1);
    }
 
    setFilteredPositions(filtered);
  };
 
  const handleEdit = (position) => {
    setSelectedPosition(position);
    setShowForm(true);
  };
 
  const handleDelete = (positionId) => {
    const position = positions.find(p => p.position_id === positionId);
    setPositionToDelete(position);
    setShowDeleteModal(true);
  };
 
  const confirmDelete = async () => {
    if (!positionToDelete) return;
   
    try {
      await positionAPI.deletePosition(positionToDelete.position_id);
      // Reload positions after deletion
      await loadPositions();
      setShowDeleteModal(false);
      setPositionToDelete(null);
    } catch (error) {
      console.error('Error deleting position:', error);
      alert('Failed to delete position. Please try again.');
    }
  };
 
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPositionToDelete(null);
  };
 
  const handleCreateNew = () => {
    setSelectedPosition(null);
    setShowForm(true);
  };
 
  const handleSavePosition = async (positionData) => {
    try {
      // The API call is handled in the PositionForm component
      // Here we just reload the positions to get the updated data
      await loadPositions();
      setShowForm(false);
      setSelectedPosition(null);
    } catch (error) {
      console.error('Error saving position:', error);
      // Error handling is done in the PositionForm component
    }
  };
 
  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FiBriefcase className="text-blue-600 w-5 h-5" />
              Positions
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">Manage job positions and titles</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <FiPlus className="w-4 h-4" />
            Create Position
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
                placeholder="Search by position name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
 
          {/* Filter Buttons */}
          <div className="flex gap-1">
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
              onClick={() => setFilterStatus('Archived')}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                filterStatus === 'Archived'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Archived
            </button>
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
          </div>
        </div>
 
        {/* Results Count */}
        <div className="mt-2 text-xs text-gray-600">
          Showing {filteredPositions.length} of {positions.length} positions
        </div>
      </div>
 
      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading positions...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <FiBriefcase className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Error loading positions</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={loadPositions}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredPositions.length === 0 ? (
          <div className="p-8 text-center">
            <FiBriefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No positions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'All'
                ? 'Try adjusting your filters'
                : 'Get started by creating a new position'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPositions.map((position) => (
                  <tr key={position.position_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs font-medium text-gray-900">{position.position_name}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${
                        position.status_id === 1
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {position.status_id === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(position)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(position.position_id)}
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
 
      {/* Pagination - Optional */}
      {filteredPositions.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredPositions.length}</span> of{' '}
            <span className="font-medium">{filteredPositions.length}</span> results
          </div>
        </div>
      )}
 
      {/* Position Form Modal */}
      <PositionForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedPosition(null);
        }}
        position={selectedPosition}
        onSave={handleSavePosition}
      />
 
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Position"
        message={`Are you sure you want to delete "${positionToDelete?.position_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};
 
export default PositionView;