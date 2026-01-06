const API_BASE_URL = `${import.meta.env.VITE_API_local_Backend_URL}/api`;
const AUTH_BASE_URL = `${import.meta.env.VITE_API_local_Backend_URL}/auth`;


// Auth API
export const authAPI = {
  checkUsername: async (username) => {
    try {
      const response = await fetch(
        `${AUTH_BASE_URL}/check-username/${encodeURIComponent(username)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to check username");
      }

      return await response.json();
    } catch (error) {
      console.error("Error checking username:", error);
      throw error;
    }
  },
};

// Company API
export const companyAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch companies");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching companies:", error);
      throw error;
    }
  },

  getById: async (companyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch company");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching company:", error);
      throw error;
    }
  },

  create: async (formData) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/companies/create`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create company");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating company:", error);
      throw error;
    }
  },

  // update: async (companyId, formData) => {
  //   try {
  //     const backendUrl =
  //       import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
  //     const response = await fetch(`${backendUrl}/api/companies/${companyId}`, {
  //       method: "PUT",
  //       credentials: "include",
  //       body: formData,
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || JSON.stringify(errorData));
  //     }

  //     return await response.json();
  //   } catch (error) {
  //     console.error("Error updating company:", error);
  //     throw error;
  //   }
  // },

  update: async (companyId, formData) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";

      const response = await fetch(`${backendUrl}/api/companies/${companyId}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw an object containing message and errors for frontend
        throw {
          message: data.message || "Failed to update company",
          errors: data.errors || {},
        };
      }

      return data;
    } catch (error) {
      console.error("Error updating company:", error);
      // Ensure error has message property
      throw {
        message: error.message || "Failed to update company",
        errors: error.errors || {},
      };
    }
  },

  delete: async (companyId) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(
        `${backendUrl}/api/companies/delete/${companyId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete company");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting company:", error);
      throw error;
    }
  },
};

// Branch API
export const branchAPI = {
  getAll: async () => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/branch/getall`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch branches");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching branches:", error);
      throw error;
    }
  },

  getById: async (branchId) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/branch/${branchId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch branch");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching branch:", error);
      throw error;
    }
  },

  getByCompany: async (companyId) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(
        `${backendUrl}/api/branch/companies/${companyId}/branches`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Failed to fetch branches by company"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching branches by company:", error);
      throw error;
    }
  },

  create: async (formData) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/branch/create`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create branch");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating branch:", error);
      throw error;
    }
  },

  update: async (branchId, formData) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(
        `${backendUrl}/api/branch/update/${branchId}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update branch");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating branch:", error);
      throw error;
    }
  },

  delete: async (branchId) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/branch/${branchId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete branch");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting branch:", error);
      throw error;
    }
  },

  reinstate: async (branchId) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(
        `${backendUrl}/api/branch/${branchId}/reinstate`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to reinstate branch");
      }

      return await response.json();
    } catch (error) {
      console.error("Error reinstating branch:", error);
      throw error;
    }
  },
};

// Department API
export const departmentAPI = {
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.company_id) {
        queryParams.append("company_id", filters.company_id);
      }
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const url = `${backendUrl}/api/departments${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch departments");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  },
  // ⭐⭐⭐ NEW FUNCTION: GET DEPARTMENTS BY COMPANY + BRANCH
  getByBranch: async (companyId, branchId) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";

      const response = await fetch(
        `${backendUrl}/api/departments/by-company-branch?company_id=${companyId}&branch_id=${branchId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch departments");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching departments by branch:", error);
      throw error;
    }
  },
  getById: async (departmentId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/departments/${departmentId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch department");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching department:", error);
      throw error;
    }
  },

  getMainDepartments: async (companyId) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(
        `${backendUrl}/api/departments/main_departments?company_id=${companyId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch main departments");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching main departments:", error);
      throw error;
    }
  },

  createMain: async (formData) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/departments/main`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create main department");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating main department:", error);
      throw error;
    }
  },

  createSub: async (formData) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/departments/sub`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create sub department");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating sub department:", error);
      throw error;
    }
  },

  update: async (departmentId, formData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/departments/${departmentId}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update department");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating department:", error);
      throw error;
    }
  },

  delete: async (departmentId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/departments/${departmentId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete department");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting department:", error);
      throw error;
    }
  },
};

// Employee API
export const employeeAPI = {
  getAll: async () => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/employees/getemployees`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch employees");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  },
  // Archive employee
  archive: async (employee_id) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(
        `${backendUrl}/api/employees/${employee_id}/archive`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to archive employee");
      return data;
    } catch (error) {
      console.error("Error archiving employee:", error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";

      const res = await fetch(`${backendUrl}/api/employees/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to fetch employee");

      return await res.json();
    } catch (err) {
      console.error("Error fetching employee:", err);
      throw err;
    }
  },

  create: async (formData) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";

      const response = await fetch(`${backendUrl}/api/employees/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create employee");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating employee:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";

      const res = await fetch(`${backendUrl}/api/employees/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update employee");

      return await res.json();
    } catch (err) {
      console.error("Error updating employee:", err);
      throw err;
    }
  },

  saveTab: async (tabId, formData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/employees/save-tab/${tabId}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to save ${tabId} tab`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error saving ${tabId} tab:`, error);
      throw error;
    }
  },
  // ⭐⭐⭐ NEW FUNCTION: EMPLOYEES BY COMPANY + BRANCH
  getByCompanyAndBranch: async (companyId, branchId) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";

      const response = await fetch(
        `${backendUrl}/api/employees/by-company-branch?company_id=${companyId}&branch_id=${branchId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Failed to fetch employees by company and branch"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching employees by company and branch:", error);
      throw error;
    }
  },

  delete: async (employeeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete employee");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting employee:", error);
      throw error;
    }
  },

  reinstate: async (employeeId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/employees/${employeeId}/reinstate`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to reinstate employee");
      }

      return await response.json();
    } catch (error) {
      console.error("Error reinstating employee:", error);
      throw error;
    }
  },

  getCompanies: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch companies");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching companies:", error);
      throw error;
    }
  },

  getPositions: async () => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/positions/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch positions");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching positions:", error);
      throw error;
    }
  },

  getRoles: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch roles");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  },
};

// Leads API
export const leadsAPI = {
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.lead_status)
        queryParams.append("lead_status", params.lead_status);
      if (params.lead_source)
        queryParams.append("lead_source", params.lead_source);
      if (params.industry) queryParams.append("industry", params.industry);

      const url = `${API_BASE_URL}/crm/leads${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch leads");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching leads:", error);
      throw error;
    }
  },

  getById: async (leadId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/crm/leads/${leadId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch lead");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching lead:", error);
      throw error;
    }
  },

  create: async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/crm/leads`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create lead");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating lead:", error);
      throw error;
    }
  },

  update: async (leadId, formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/crm/leads/${leadId}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update lead");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating lead:", error);
      throw error;
    }
  },

  delete: async (leadId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/crm/leads/${leadId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete lead");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting lead:", error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/crm/leads/stats/summary`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch lead statistics");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching lead statistics:", error);
      throw error;
    }
  },

  import: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/crm/leads/import`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to import leads");
      }

      return await response.json();
    } catch (error) {
      console.error("Error importing leads:", error);
      throw error;
    }
  },
};

// Contacts API
export const contactsAPI = {
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.contact_status)
        queryParams.append("contact_status", params.contact_status);
      if (params.contact_source)
        queryParams.append("contact_source", params.contact_source);
      if (params.industry) queryParams.append("industry", params.industry);

      const url = `${API_BASE_URL}/crm/contacts${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch contacts");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching contacts:", error);
      throw error;
    }
  },

  getById: async (contactId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/crm/contacts/${contactId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch contact");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching contact:", error);
      throw error;
    }
  },

  create: async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/crm/contacts`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create contact");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating contact:", error);
      throw error;
    }
  },

  update: async (contactId, formData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/crm/contacts/${contactId}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update contact");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating contact:", error);
      throw error;
    }
  },

  delete: async (contactId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/crm/contacts/${contactId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete contact");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/crm/contacts/stats/summary`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Failed to fetch contact statistics"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching contact statistics:", error);
      throw error;
    }
  },

  import: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/crm/contacts/import`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to import contacts");
      }

      return await response.json();
    } catch (error) {
      console.error("Error importing contacts:", error);
      throw error;
    }
  },
};

// Positions API
export const positionsAPI = {
  getAll: async () => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/positions/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch positions");
      }

      const result = await response.json();
      console.log("Fetched positions api:", result);

      // RETURN positions array from backend response
      return Array.isArray(result.positions) ? result.positions : [];
    } catch (error) {
      console.error("Error fetching positions:", error);
      return [];
    }
  },

  getById: async (positionId) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";

      const response = await fetch(
        `${backendUrl}/api/positions/${positionId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch position");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching position:", error);
      throw error;
    }
  },

  create: async (formData) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";

      const response = await fetch(`${backendUrl}/api/positions/create`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create position");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating position:", error);
      throw error;
    }
  },

  update: async (positionId, formData) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";

      const response = await fetch(
        `${backendUrl}/api/positions/update/${positionId}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update position");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating position:", error);
      throw error;
    }
  },

  delete: async (positionId) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";

      const response = await fetch(
        `${backendUrl}/api/positions/delete/${positionId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete position");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting position:", error);
      throw error;
    }
  },

  reinstate: async (positionId) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";

      const response = await fetch(
        `${backendUrl}/api/positions/${positionId}/reinstate`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to reinstate position");
      }

      return await response.json();
    } catch (error) {
      console.error("Error reinstating position:", error);
      throw error;
    }
  },
};
