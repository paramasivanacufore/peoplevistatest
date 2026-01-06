import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiBriefcase } from 'react-icons/fi';
import LeaveAllocationForm from './LeaveAllocationForm';
import ConfirmationModal from '../Common/ConfirmationModal';
import { leaveAllocationAPI, formatAllocationPeriod } from '../../utils/leaveAllocation/apiUtils';

const LeaveAllocationView = () => {
  const [rules, setRules] = useState([]);
  const [filteredRules, setFilteredRules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Active'); // Active, Archived, All
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);

  // Load rules from API
  const loadRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await leaveAllocationAPI.getAllRules();
      setRules(response.rules || response || []);
    } catch (error) {
      console.error('Error loading leave allocation rules:', error);
      setError('Failed to load leave allocation rules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  useEffect(() => {
    filterRules();
  }, [searchTerm, filterStatus, rules]);

  const filterRules = () => {
    let filtered = [...rules];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(rule =>
        rule.leave_type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.allocation_period?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.days_allocated?.toString().includes(searchTerm)
      );
    }

    // Filter by status
    if (filterStatus === 'Active') {
      filtered = filtered.filter(rule => rule.is_active === true);
    } else if (filterStatus === 'Archived') {
      filtered = filtered.filter(rule => rule.is_active === false);
    }

    setFilteredRules(filtered);
  };

  const handleEdit = (rule) => {
    setSelectedRule(rule);
    setShowForm(true);
  };

  const handleDelete = (ruleId) => {
    const rule = rules.find(r => r.rule_id === ruleId);
    setRuleToDelete(rule);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!ruleToDelete) return;
    
    try {
      await leaveAllocationAPI.deleteRule(ruleToDelete.rule_id);
      // Reload rules after deletion
      await loadRules();
      setShowDeleteModal(false);
      setRuleToDelete(null);
    } catch (error) {
      console.error('Error deleting leave allocation rule:', error);
      alert('Failed to delete leave allocation rule. Please try again.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setRuleToDelete(null);
  };

  const handleCreateNew = () => {
    setSelectedRule(null);
    setShowForm(true);
  };

  const handleSaveRule = async () => {
    try {
      // The API call is handled in the LeaveAllocationForm component
      // Here we just reload the rules to get the updated data
      await loadRules();
      setShowForm(false);
      setSelectedRule(null);
    } catch (error) {
      console.error('Error saving leave allocation rule:', error);
      // Error handling is done in the LeaveAllocationForm component
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
              Leave Allocation Rules
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">Manage leave allocation rules and policies</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <FiPlus className="w-4 h-4" />
            Create Rule
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
                placeholder="Search by leave type, period, or days..."
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
          Showing {filteredRules.length} of {rules.length} rules
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading leave allocation rules...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <FiBriefcase className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Error loading rules</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={loadRules}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="p-8 text-center">
            <FiBriefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No rules found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'All'
                ? 'Try adjusting your filters'
                : 'Get started by creating a new leave allocation rule'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allocation Period
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Allocated
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carry Forward
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Carry Forward Days
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
                {filteredRules.map((rule) => (
                  <tr key={rule.rule_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs font-medium text-gray-900">{rule.leave_type_name || 'N/A'}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">{formatAllocationPeriod(rule.allocation_period)}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">{rule.days_allocated || 0} days</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${
                        rule.carry_forward
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.carry_forward ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">{rule.max_carry_forward_days || 0} days</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${
                        rule.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.is_active ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(rule)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.rule_id)}
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
      {filteredRules.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredRules.length}</span> of{' '}
            <span className="font-medium">{filteredRules.length}</span> results
          </div>
          {/* Add pagination controls here if needed */}
        </div>
      )}

      {/* Leave Allocation Form Modal */}
      <LeaveAllocationForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedRule(null);
        }}
        rule={selectedRule}
        onSave={handleSaveRule}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Leave Allocation Rule"
        message={`Are you sure you want to delete this leave allocation rule for "${ruleToDelete?.leave_type_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default LeaveAllocationView;

