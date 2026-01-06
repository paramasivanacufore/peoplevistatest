import React from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { SCOPE_TYPES } from './formConstants';

const PermissionScopes = ({
  permission,
  permissionIndex,
  branches,
  departments,
  errors,
  onAdd,
  onRemove,
  onChange,
}) => {
  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-semibold text-gray-700">
          Section 3 — Permission Scope
        </label>
        <button
          type="button"
          onClick={() => onAdd(permissionIndex)}
          className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
        >
          <FiPlus /> Add Scope
        </button>
      </div>

      {permission.scopes.map((scope, sIdx) => (
        <div key={sIdx} className="border rounded p-4 mb-3 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Scope Type
              </label>
              <select
                value={scope.scope_type}
                onChange={(e) =>
                  onChange(permissionIndex, sIdx, 'scope_type', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SCOPE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {scope.scope_type === 'BRANCH' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Branch ID
                </label>
                <select
                  value={scope.branch_id || ''}
                  onChange={(e) =>
                    onChange(
                      permissionIndex,
                      sIdx,
                      'branch_id',
                      e.target.value ? parseInt(e.target.value) : ''
                    )
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors[`permission_${permissionIndex}_scope_${sIdx}_branch`]
                      ? 'border-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Select Branch</option>
                  {branches?.map((b) => (
                    <option key={b.branch_id} value={b.branch_id}>
                      {b.branch_name}
                    </option>
                  ))}
                </select>
                {errors[`permission_${permissionIndex}_scope_${sIdx}_branch`] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors[`permission_${permissionIndex}_scope_${sIdx}_branch`]}
                  </p>
                )}
              </div>
            )}

            {scope.scope_type === 'DEPARTMENT' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Department ID
                </label>
                <select
                  value={scope.department_id || ''}
                  onChange={(e) =>
                    onChange(
                      permissionIndex,
                      sIdx,
                      'department_id',
                      e.target.value ? parseInt(e.target.value) : ''
                    )
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors[`permission_${permissionIndex}_scope_${sIdx}_dept`]
                      ? 'border-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Select Department</option>
                  {departments?.map((d) => (
                    <option key={d.department_id} value={d.department_id}>
                      {d.department_name}
                    </option>
                  ))}
                </select>
                {errors[`permission_${permissionIndex}_scope_${sIdx}_dept`] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors[`permission_${permissionIndex}_scope_${sIdx}_dept`]}
                  </p>
                )}
              </div>
            )}

            {scope.scope_type === 'EMPLOYEE' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Employee ID
                </label>
                <input
                  type="number"
                  value={scope.emp_id || ''}
                  onChange={(e) =>
                    onChange(
                      permissionIndex,
                      sIdx,
                      'emp_id',
                      e.target.value ? parseInt(e.target.value) : ''
                    )
                  }
                  placeholder="Enter Employee ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Description
              </label>
              <input
                type="text"
                value={scope.description || ''}
                onChange={(e) =>
                  onChange(permissionIndex, sIdx, 'description', e.target.value)
                }
                placeholder="Explanation of scope"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              {permission.scopes.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemove(permissionIndex, sIdx)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PermissionScopes;
