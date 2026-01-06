export const INITIAL_FORM_STATE = {
  module_key: '',
  name: '',
  description: '',
  status_id: 1,
  permissions: [
    {
      permission_key: '',
      permission_type: ['view'],
      permission_description: '',
      role_assignments: [
        { role_id: '', allowed: true, description: '' },
      ],
      scopes: [
        {
          scope_type: 'GLOBAL',
          branch_id: '',
          department_id: '',
          emp_id: '',
          description: '',
        },
      ],
    },
  ],
};

export const PERMISSION_TYPES = ['view', 'add', 'update', 'delete'];

export const SCOPE_TYPES = ['GLOBAL', 'BRANCH', 'DEPARTMENT', 'EMPLOYEE'];

export const INPUT_BASE_CLASSES = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2';
export const INPUT_ERROR_CLASSES = 'border-red-500';
export const INPUT_SUCCESS_CLASSES = 'border-gray-300 focus:ring-blue-500';
