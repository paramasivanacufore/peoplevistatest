import React from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const RoleAssignments = ({
  permission,
  permissionIndex,
  roles,
  formData,
  errors,
  onAdd,
  onRemove,
  onChange,
}) => {
  return (
    <div className="mb-4 mt-4 pt-4 border-t">
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-semibold text-gray-700">
          Section 2 — Role Permissions <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={() => onAdd(permissionIndex)}
          className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
        >
          <FiPlus /> Add Role
        </button>
      </div>

      {errors[`permission_${permissionIndex}_roles`] && (
        <p className="text-red-500 text-xs mb-2">
          {errors[`permission_${permissionIndex}_roles`]}
        </p>
      )}

      {permission.role_assignments.map((role, rIdx) => {
        const selectedRole = roles?.find((r) => r.role_id === role.role_id);
        return (
          <div key={rIdx} className="bg-white border rounded p-4 mb-3 hover:shadow-sm transition">
            {/* Header row: Role + Actions */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select
                  value={role.role_id || ''}
                  onChange={(e) =>
                    onChange(permissionIndex, rIdx, 'role_id', e.target.value ? parseInt(e.target.value) : '')
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors[`permission_${permissionIndex}_role_${rIdx}`]
                      ? 'border-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Select Role</option>
                  {roles?.length > 0 ? (
                    roles.map((r) => (
                      <option key={r.role_id} value={r.role_id}>
                        {r.role_name} {r.role_level ? `(Level ${r.role_level})` : ''}
                      </option>
                    ))
                  ) : (
                    <option disabled>No roles</option>
                  )}
                </select>
                {errors[`permission_${permissionIndex}_role_${rIdx}`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`permission_${permissionIndex}_role_${rIdx}`]}</p>
                )}
              </div>

              {/* Remove button - always visible */}
              <button
                type="button"
                onClick={() => onRemove(permissionIndex, rIdx)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-2 ml-2 transition"
                title="Remove this role assignment"
              >
                <FiTrash2 size={18} />
              </button>
            </div>

            {/* Permission info + Allowed status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Permission Assigned</label>
                <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700 font-mono">
                  {formData.module_key || 'module'}.{permission.permission_key || 'permission'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Access Status</label>
                <div className="flex items-center h-10 px-3 border border-gray-300 rounded-lg bg-gray-50">
                  <input
                    type="checkbox"
                    checked={role.allowed}
                    onChange={(e) => onChange(permissionIndex, rIdx, 'allowed', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`ml-2 text-sm font-medium ${role.allowed ? 'text-green-600' : 'text-red-600'}`}>
                    {role.allowed ? '✓ Granted' : '✗ Denied'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <input
                  type="text"
                  value={role.description || ''}
                  onChange={(e) => onChange(permissionIndex, rIdx, 'description', e.target.value)}
                  placeholder="Optional note"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Summary line */}
            {selectedRole && (
              <div className="mt-2 text-xs text-gray-500">
                <span>{selectedRole.role_name}</span>
                <span className="mx-2">→</span>
                <span className="font-mono">{formData.module_key}.{permission.permission_key}</span>
                <span className="mx-2">→</span>
                <span className="font-medium">{role.allowed ? 'Allowed' : 'Blocked'}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RoleAssignments;
