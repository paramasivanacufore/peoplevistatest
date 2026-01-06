import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiClock } from 'react-icons/fi';
import ShiftForm from './ShiftForm';
import ConfirmationModal from '../Common/ConfirmationModal';
import { shiftAPI, formatTime } from '../../utils/shift/apiUtils';

const ShiftView = () => {
  const [shifts, setShifts] = useState([]);
  const [filteredShifts, setFilteredShifts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Active'); // Active, Archived, All
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState(null);

  // Load shifts from API
  const loadShifts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await shiftAPI.getAllShifts();
      setShifts(data);
    } catch (error) {
      console.error('Error loading shifts:', error);
      setError('Failed to load shifts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load shifts on component mount
  useEffect(() => {
    loadShifts();
  }, []);

  // Filter shifts based on search term and filters
  useEffect(() => {
    let filtered = shifts;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(shift =>
        shift.shift_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shift.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus === 'Active') {
      filtered = filtered.filter(shift => shift.is_active);
    } else if (filterStatus === 'Archived') {
      filtered = filtered.filter(shift => !shift.is_active);
    }

    setFilteredShifts(filtered);
  }, [shifts, searchTerm, filterStatus]);

  const handleEdit = (shift) => {
    setSelectedShift(shift);
    setShowForm(true);
  };

  const handleDelete = (shiftId) => {
    const shift = shifts.find(s => s.shift_id === shiftId);
    setShiftToDelete(shift);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!shiftToDelete) return;
    
    try {
      await shiftAPI.deleteShift(shiftToDelete.shift_id);
      await loadShifts();
      setShowDeleteModal(false);
      setShiftToDelete(null);
    } catch (error) {
      console.error('Error deleting shift:', error);
      alert('Failed to delete shift. Please try again.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setShiftToDelete(null);
  };

  const handleCreateNew = () => {
    setSelectedShift(null);
    setShowForm(true);
  };

  const handleSaveShift = () => {
    loadShifts();
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FiClock className="text-blue-600 w-5 h-5" />
              Shift Management
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">Manage work shifts and schedules</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <FiPlus className="w-4 h-4" />
            Create Shift
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
                placeholder="Search by shift name or description..."
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
          Showing {filteredShifts.length} of {shifts.length} shifts
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading shifts...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <FiClock className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Error loading shifts</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={loadShifts}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <FiClock className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No shifts found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'All' 
                ? 'No shifts match your current filters.' 
                : 'Get started by creating your first shift.'}
            </p>
            {!searchTerm && filterStatus === 'All' && (
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Shift
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shift Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Break Duration
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grace Time
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
                {filteredShifts.map((shift) => (
                  <tr key={shift.shift_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs font-medium text-gray-900">{shift.shift_name}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">{formatTime(shift.start_time)}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">{formatTime(shift.end_time)}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">{shift.break_duration} min</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">{shift.grace_time_minutes} min</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(shift.is_active)}`}>
                        {shift.is_active ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(shift)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(shift.shift_id)}
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

      {/* Shift Form Modal */}
      <ShiftForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedShift(null);
        }}
        shift={selectedShift}
        onSave={handleSaveShift}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Shift"
        message={`Are you sure you want to delete "${shiftToDelete?.shift_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default ShiftView;
