import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiSave, FiRefreshCw } from "react-icons/fi";
import {
  moduleRegistrationAPI,
  formatModuleForAPI,
} from "../../utils/moduleRegistration/apiUtils";
import { validateFormData } from "../../utils/moduleRegistration/validations";
import { INITIAL_FORM_STATE } from "./formConstants";
import MultiselectDropdown from "./MultiselectDropdown";
import { toast } from "react-toastify";
import { useModules } from "../../context/ModuleContext";

const ModuleRegistrationForm = () => {
  const { modules, error, refreshModules } = useModules();
  const [formData, setFormData] = useState({
    module_key: "",
    name: "",
    description: "",
    status_id: 1,
    permissions: [
      {
        permission_key: "",
        permission_type: ["view"],
        permission_description: "",
        role_assignments: [
          {
            role_id: "",
            allowed: true,
            description: "",
          },
        ],
        scopes: [
          {
            scope_type: "GLOBAL",
            branch_id: "",
            department_id: "",
            emp_id: "",
            description: "",
          },
        ],
      },
    ],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load dropdown data (roles + other things you might hook later)
  useEffect(() => {
    const loadDropdownData = async () => {
      setLoadingData(true);
      try {
        const rolesData = await moduleRegistrationAPI.getAllRoles();
        setRoles(Array.isArray(rolesData) ? rolesData : []);
        // If you have other endpoints, fetch them here similarly:
        // const branchesData = await moduleRegistrationAPI.getAllBranches();
        // setBranches(Array.isArray(branchesData) ? branchesData : []);
      } catch (error) {
        console.error("Error loading dropdown data:", error);
        toast.error("Failed to load form data. Please refresh the page.");
      } finally {
        setLoadingData(false);
      }
    };

    loadDropdownData();
  }, []);

  useEffect(() => {
    refreshModules(); // optional manual fetch
  }, []);

  const setFormUpdater = (updater) =>
    setFormData((prev) =>
      typeof updater === "function" ? updater(prev) : updater
    );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleModuleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      const autoKey = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      setFormUpdater((prev) => ({ ...prev, name: value, module_key: autoKey }));
    } else {
      setFormUpdater((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addPermission = () => {
    setFormUpdater((prev) => ({
      ...prev,
      permissions: [
        ...prev.permissions,
        {
          permission_key: "",
          permission_type: ["view"],
          permission_description: "",
          role_assignments: [],
          scopes: [
            {
              scope_type: "GLOBAL",
              branch_id: "",
              department_id: "",
              emp_id: "",
              description: "",
            },
          ],
        },
      ],
    }));
  };

  const removePermission = (index) => {
    setFormUpdater((prev) => ({
      ...prev,
      permissions: prev.permissions.filter((_, i) => i !== index),
    }));
  };

  const handlePermissionChange = (permissionIndex, field, value) => {
    setFormUpdater((prev) => {
      const updated = [...prev.permissions];
      updated[permissionIndex] = {
        ...updated[permissionIndex],
        [field]: value,
      };

      // Update permission_key automatically when permission_type changes
      if (field === "permission_type") {
        const moduleKey = prev.module_key || "";
        // build permission_key (comma separated if multiple)
        updated[permissionIndex].permission_key = value
          .map((v) => `${moduleKey}.${v.toLowerCase()}`)
          .join(", ");
      }

      return { ...prev, permissions: updated };
    });
  };

  // Add / remove role assignments for a permission
  const addRoleAssignment = (permissionIndex) => {
    setFormUpdater((prev) => {
      const perms = [...prev.permissions];
      const perm = perms[permissionIndex] || { role_assignments: [] };
      perm.role_assignments = [
        ...(perm.role_assignments && Array.isArray(perm.role_assignments)
          ? perm.role_assignments
          : []),
        { role_id: "", allowed: false, description: "" },
      ];
      perms[permissionIndex] = perm;
      return { ...prev, permissions: perms };
    });
  };

  const removeRoleAssignment = (permissionIndex, roleIndex) => {
    setFormUpdater((prev) => {
      const perms = [...prev.permissions];
      perms[permissionIndex] = {
        ...perms[permissionIndex],
        role_assignments: perms[permissionIndex].role_assignments.filter(
          (_, i) => i !== roleIndex
        ),
      };
      return { ...prev, permissions: perms };
    });
  };

  // Add / remove scopes (you said you'll move scope later but keep helpers)
  const addScope = (permissionIndex) => {
    setFormUpdater((prev) => {
      const perms = [...prev.permissions];
      perms[permissionIndex] = {
        ...perms[permissionIndex],
        scopes: [
          ...(perms[permissionIndex].scopes || []),
          {
            scope_type: "GLOBAL",
            branch_id: "",
            department_id: "",
            emp_id: "",
            description: "",
          },
        ],
      };
      return { ...prev, permissions: perms };
    });
  };

  const removeScope = (permissionIndex, scopeIndex) => {
    setFormUpdater((prev) => {
      const perms = [...prev.permissions];
      perms[permissionIndex] = {
        ...perms[permissionIndex],
        scopes: perms[permissionIndex].scopes.filter(
          (_, i) => i !== scopeIndex
        ),
      };
      return { ...prev, permissions: perms };
    });
  };

  /**
   * handleRoleAssignmentChange
   *
   * - If field === 'role_id' : fetch role permissions and auto set allowed if role already has this permission.
   * - Otherwise update the role assignment in local form state (allowed, description).
   *
   * NOTE: endpoint used: GET /api/roles/{role_id}/permissions
   * Response shape expected: array of objects with permission_key (e.g. [{ permission_key: "attendance.view" }, ...])
   * Adjust endpoint or parsing if your backend is different.
   */

  
  const handleRoleAssignmentChange = async (
    permissionIndex,
    roleIndex,
    field,
    value
  ) => {
    // Normalize numeric role id
    if (field === "role_id") {
      const selectedRoleId = value ? parseInt(value, 10) : "";

      // update role_id immediately so UI reflects selection
      setFormUpdater((prev) => {
        const perms = [...prev.permissions];
        perms[permissionIndex] = {
          ...perms[permissionIndex],
          role_assignments: perms[permissionIndex].role_assignments.map(
            (r, idx) =>
              idx === roleIndex ? { ...r, role_id: selectedRoleId } : r
          ),
        };
        return { ...prev, permissions: perms };
      });

      if (!selectedRoleId) return;

      try {
        const resp = await fetch(`/api/roles/${selectedRoleId}/permissions`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!resp.ok) {
          console.warn("Failed to fetch role permissions", resp.status);
          return;
        }

        const rolePermissions = await resp.json();

        // ensure permission_key of current permission
        setFormUpdater((prev) => {
          const perms = [...prev.permissions];
          const currentPerm = perms[permissionIndex] || {};
          const permKey = (currentPerm.permission_key || "").trim();

          // rolePermissions may be array of strings or objects - normalize to keys
          const rpKeys = Array.isArray(rolePermissions)
            ? rolePermissions
                .map((x) =>
                  typeof x === "string" ? x : x.permission_key || ""
                )
                .filter(Boolean)
            : [];

          const roleHasThisPermission = rpKeys.includes(permKey);

          perms[permissionIndex] = {
            ...currentPerm,
            role_assignments: (currentPerm.role_assignments || []).map(
              (r, idx) =>
                idx === roleIndex
                  ? {
                      ...r,
                      allowed: !!roleHasThisPermission,
                      role_id: selectedRoleId,
                    }
                  : r
            ),
          };

          return { ...prev, permissions: perms };
        });
      } catch (err) {
        console.error("Error fetching role permissions:", err);
      }

      return;
    }

    // For allowed / description updates
    setFormUpdater((prev) => {
      const perms = [...prev.permissions];
      perms[permissionIndex] = {
        ...perms[permissionIndex],
        role_assignments: perms[permissionIndex].role_assignments.map(
          (r, idx) =>
            idx === roleIndex
              ? { ...r, [field]: field === "allowed" ? Boolean(value) : value }
              : r
        ),
      };
      return { ...prev, permissions: perms };
    });
  };

  const handleScopeChange = (permissionIndex, scopeIndex, field, value) => {
    setFormUpdater((prev) => {
      const perms = [...prev.permissions];
      perms[permissionIndex] = {
        ...perms[permissionIndex],
        scopes: perms[permissionIndex].scopes.map((s, idx) =>
          idx === scopeIndex ? { ...s, [field]: value } : s
        ),
      };
      return { ...prev, permissions: perms };
    });
  };

  const validateForm = () => {
    const err = validateFormData(formData);
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix form errors before submitting");
      return;
    }

    setLoading(true);
    try {
      const formattedData = formatModuleForAPI(formData);
      const result = await moduleRegistrationAPI.registerModule(formattedData);
      toast.success(result.message || "Module registered successfully!");
      resetForm();
    } catch (error) {
      console.error("Error registering module:", error);
      toast.error(
        error.message || "Failed to register module. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading form data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 ">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Module & Permission Registration
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
            >
              <FiRefreshCw /> Reset
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1 — Module Information */}
            <div className="border-b pb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-semibold text-gray-700">
                  Section 1 — Module Information
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleModuleChange}
                    placeholder="e.g., Attendance Management"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.name
                        ? "border-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="module_key"
                    value={formData.module_key}
                    readOnly
                    disabled
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                  {errors.module_key && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.module_key}
                    </p>
                  )}
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Parent Module (optional)
                  </label>
                  <select
                    name="parent_id"
                    value={formData.parent_id}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">No Parent (Main Module)</option>

                    {modules?.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleModuleChange}
                    rows="3"
                    placeholder="Module description..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status_id"
                    value={formData.status_id}
                    onChange={handleModuleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.length > 0 ? (
                      statuses.map((status) => (
                        <option key={status.status_id} value={status.status_id}>
                          {status.status_name ||
                            (status.status === 1 ? "Active" : "Inactive")}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2 — Permissions */}
            <div className="border-b pb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-700">
                  Section 2 — Permissions
                </span>
                <button
                  type="button"
                  onClick={addPermission}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  <FiPlus /> Add Permission
                </button>
              </div>

              {errors.permissions && (
                <p className="text-red-500 text-sm mb-2">
                  {errors.permissions}
                </p>
              )}

              {formData.permissions.map((permission, pIdx) => (
                <div
                  key={pIdx}
                  className="border rounded-lg p-4 mb-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium text-gray-700">
                      Permission {pIdx + 1}
                    </h4>
                    {formData.permissions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePermission(pIdx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Permission Types <span className="text-red-500">*</span>
                      </label>
                      <MultiselectDropdown
                        options={["view", "add", "update", "delete"]}
                        selectedValues={
                          Array.isArray(permission.permission_type)
                            ? permission.permission_type
                            : []
                        }
                        onChange={(selected) =>
                          handlePermissionChange(
                            pIdx,
                            "permission_type",
                            selected
                          )
                        }
                        placeholder="Select permission types..."
                        error={errors[`permission_${pIdx}_type`]}
                      />
                      {errors[`permission_${pIdx}_type`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`permission_${pIdx}_type`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Permission Key <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={permission.permission_key}
                        readOnly
                        disabled
                        onChange={(e) =>
                          handlePermissionChange(
                            pIdx,
                            "permission_key",
                            e.target.value
                          )
                        }
                        placeholder="e.g., attendance.view"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors[`permission_${pIdx}_key`]
                            ? "border-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                      />
                      {errors[`permission_${pIdx}_key`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`permission_${pIdx}_key`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Permission Description
                      </label>
                      <input
                        type="text"
                        value={permission.permission_description}
                        onChange={(e) =>
                          handlePermissionChange(
                            pIdx,
                            "permission_description",
                            e.target.value
                          )
                        }
                        placeholder="Description of this permission"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Role assignments */}
                  {/* <div className="mb-4 mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        Section 2 — Role Permissions{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => addRoleAssignment(pIdx)}
                        className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
                      >
                        <FiPlus /> Add Role Assignment
                      </button>
                    </div>

                    {errors[`permission_${pIdx}_roles`] && (
                      <p className="text-red-500 text-xs mb-2">
                        {errors[`permission_${pIdx}_roles`]}
                      </p>
                    )}

                    {permission.role_assignments.map((role, rIdx) => (
                      <div
                        key={rIdx}
                        className="bg-white border rounded p-3 mb-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Role
                            </label>
                            <select
                              value={role.role_id || ""}
                              onChange={(e) =>
                                handleRoleAssignmentChange(
                                  pIdx,
                                  rIdx,
                                  "role_id",
                                  e.target.value
                                    ? parseInt(e.target.value, 10)
                                    : ""
                                )
                              }
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                errors[`permission_${pIdx}_role_${rIdx}`]
                                  ? "border-red-500"
                                  : "border-gray-300 focus:ring-blue-500"
                              }`}
                            >
                              <option value="">Select Role</option>
                              {roles && roles.length > 0 ? (
                                roles.map((r) => (
                                  <option key={r.role_id} value={r.role_id}>
                                    {r.role_name}{" "}
                                    {r.role_level
                                      ? `(Level ${r.role_level})`
                                      : ""}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>
                                  No roles available
                                </option>
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Permission
                            </label>
                            <select
                              value={role.permission_key || ""}
                              onChange={(e) =>
                                handleRoleAssignmentChange(
                                  pIdx,
                                  rIdx,
                                  "permission_key",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Permission</option>

                              {formData.permissions?.map((permOpt) => (
                                <option
                                  key={permOpt.permission_key}
                                  value={permOpt.permission_key}
                                >
                                  {formData.module_key}.{permOpt.permission_key}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Allowed
                            </label>
                            <div className="flex items-center h-10">
                              <input
                                type="checkbox"
                                checked={!!role.allowed}
                                onChange={(e) =>
                                  handleRoleAssignmentChange(
                                    pIdx,
                                    rIdx,
                                    "allowed",
                                    e.target.checked
                                  )
                                }
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                {role.allowed ? "Granted" : "Denied"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-end">
                            {permission.role_assignments.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeRoleAssignment(pIdx, rIdx)}
                                className="text-red-500 hover:text-red-700 p-2"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={role.description || ""}
                            onChange={(e) =>
                              handleRoleAssignmentChange(
                                pIdx,
                                rIdx,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Optional note for clarity"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div> */}
                </div>
              ))}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave /> {loading ? "Registering..." : "Register Module"}
              </button>
            </div>

            {errors.submit && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModuleRegistrationForm;
