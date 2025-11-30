import apiClient from '../api/axiosClient';

// Employee API Service
export const employeeApi = {
  // Basic CRUD Operations
  listEmployees: (params = {}) => {
    return apiClient.get('/hr/employees', { params });
  },

  createEmployee: (data) => {
    return apiClient.post('/hr/employees', data);
  },

  getEmployeeById: (id) => {
    return apiClient.get(`/hr/employees/${id}`);
  },

  updateEmployee: (id, data) => {
    return apiClient.put(`/hr/employees/${id}`, data);
  },

  deleteEmployee: (id) => {
    return apiClient.delete(`/hr/employees/${id}`);
  },

  // Department Operations
  listDepartments: () => {
    return apiClient.get('/hr/employees/departments');
  },

  createDepartment: (data) => {
    return apiClient.post('/hr/employees/departments', data);
  },

  updateDepartment: (id, data) => {
    return apiClient.put(`/hr/employees/departments/${id}`, data);
  },

  deleteDepartment: (id) => {
    return apiClient.delete(`/hr/employees/departments/${id}`);
  },

  // Manager Operations
  listManagers: () => {
    return apiClient.get('/hr/employees/managers');
  },

  assignManager: (employeeId, managerId) => {
    return apiClient.post(`/hr/employees/${employeeId}/assign-manager`, { managerId });
  },

  // Skills Operations
  listAllSkills: () => {
    return apiClient.get('/hr/employees/skills');
  },

  getEmployeeSkills: (employeeId) => {
    return apiClient.get(`/hr/employees/${employeeId}/skills`);
  },

  addEmployeeSkill: (employeeId, data) => {
    return apiClient.post(`/hr/employees/${employeeId}/skills`, data);
  },

  updateEmployeeSkill: (employeeId, assignmentId, data) => {
    return apiClient.put(`/hr/employees/${employeeId}/skills/${assignmentId}`, data);
  },

  removeEmployeeSkill: (employeeId, assignmentId) => {
    return apiClient.delete(`/hr/employees/${employeeId}/skills/${assignmentId}`);
  },

  // Enhanced Skills Functions
  getAllSkills: () => {
    return apiClient.get('/hr/employees/skills/all');
  },

  getSkillsByCategory: (category) => {
    return apiClient.get(`/hr/employees/skills/category/${category}`);
  },

  getSkillGapAnalysis: (employeeId, jobPostingId) => {
    return apiClient.get(`/hr/employees/${employeeId}/skills/gap-analysis/${jobPostingId}`);
  },

  getSkillAnalytics: () => {
    return apiClient.get('/hr/employees/skills/analytics');
  },

  getSkillRecommendations: (employeeId) => {
    return apiClient.get(`/hr/employees/${employeeId}/skill-recommendations`);
  },

  // Certifications Operations
  getEmployeeCertifications: (employeeId) => {
    return apiClient.get(`/hr/employees/${employeeId}/certifications`);
  },

  addEmployeeCertification: (employeeId, data) => {
    return apiClient.post(`/hr/employees/${employeeId}/certifications`, data);
  },

  removeEmployeeCertification: (employeeId, certId) => {
    return apiClient.delete(`/hr/employees/${employeeId}/certifications/${certId}`);
  },
  uploadEmployeeCertificationFile: (employeeId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/hr/employees/${employeeId}/certifications/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Documents Operations
  getEmployeeDocuments: (employeeId) => {
    return apiClient.get(`/hr/employees/${employeeId}/documents`);
  },

  addEmployeeDocument: (employeeId, data) => {
    return apiClient.post(`/hr/employees/${employeeId}/documents`, data);
  },

  removeEmployeeDocument: (employeeId, docId) => {
    return apiClient.delete(`/hr/employees/${employeeId}/documents/${docId}`);
  },
  
  // Document file upload
  uploadEmployeeDocumentFile: (employeeId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/hr/employees/${employeeId}/documents/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Evaluations Operations
  getEmployeeEvaluations: (employeeId) => {
    return apiClient.get(`/hr/employees/${employeeId}/evaluations`);
  },

  addEmployeeEvaluation: (employeeId, data) => {
    return apiClient.post(`/hr/employees/${employeeId}/evaluations`, data);
  },

  // Career Progression Operations
  promoteEmployee: (employeeId, data) => {
    return apiClient.post(`/hr/employees/${employeeId}/promote`, data);
  },

  transferEmployee: (employeeId, data) => {
    return apiClient.post(`/hr/employees/${employeeId}/transfer`, data);
  },

  getCareerProgressionHistory: (employeeId) => {
    return apiClient.get(`/hr/employees/${employeeId}/career-progression`);
  },

  getPendingCareerProgressions: () => {
    return apiClient.get('/hr/employees/career-progression/pending');
  },

  approveCareerProgression: (progressionId, data) => {
    return apiClient.post(`/hr/employees/career-progression/${progressionId}/approve`, data);
  },

  getCareerProgressionAnalytics: (params = {}) => {
    return apiClient.get('/hr/employees/career-progression/analytics', { params });
  },

  // Probation Operations
  startProbation: (employeeId, data) => {
    return apiClient.post(`/hr/employees/${employeeId}/probation/start`, data);
  },

  endProbation: (employeeId, data) => {
    return apiClient.post(`/hr/employees/${employeeId}/probation/end`, data);
  },

  // Offboarding Operations
  offboardEmployee: (employeeId, data) => {
    return apiClient.post(`/hr/employees/${employeeId}/offboard`, data);
  },

  // Directory and Org Chart Operations
  searchDirectory: (params = {}) => {
    return apiClient.get('/hr/employees/directory/search', { params });
  },

  getOrgChart: (params = {}) => {
    return apiClient.get('/hr/employees/org-chart', { params });
  },
};

// Employee Types and Interfaces
export const EMPLOYMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PROBATION: 'PROBATION',
  TERMINATED: 'TERMINATED',
  RESIGNED: 'RESIGNED',
};

export const JOB_TYPE = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERN: 'INTERN',
};

export const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
};

export const SKILL_LEVELS = {
  1: 'Beginner',
  2: 'Novice',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

export const CERTIFICATION_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
};

export const CAREER_PROGRESSION_TYPE = {
  PROMOTION: 'PROMOTION',
  TRANSFER: 'TRANSFER',
};

export const CAREER_PROGRESSION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

// Utility Functions
export const getEmploymentStatusColor = (status) => {
  const colors = {
    [EMPLOYMENT_STATUS.ACTIVE]: 'bg-success-100 text-success-800',
    [EMPLOYMENT_STATUS.INACTIVE]: 'bg-gray-100 text-gray-800',
    [EMPLOYMENT_STATUS.PROBATION]: 'bg-warning-100 text-warning-800',
    [EMPLOYMENT_STATUS.TERMINATED]: 'bg-error-100 text-error-800',
    [EMPLOYMENT_STATUS.RESIGNED]: 'bg-secondary-100 text-secondary-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getJobTypeColor = (jobType) => {
  const colors = {
    [JOB_TYPE.FULL_TIME]: 'bg-primary-100 text-primary-800',
    [JOB_TYPE.PART_TIME]: 'bg-secondary-100 text-secondary-800',
    [JOB_TYPE.CONTRACT]: 'bg-warning-100 text-warning-800',
    [JOB_TYPE.INTERN]: 'bg-info-100 text-info-800',
  };
  return colors[jobType] || 'bg-gray-100 text-gray-800';
};

export const getSkillLevelColor = (level) => {
  const colors = {
    1: 'bg-error-100 text-error-800',
    2: 'bg-warning-100 text-warning-800',
    3: 'bg-info-100 text-info-800',
    4: 'bg-primary-100 text-primary-800',
    5: 'bg-success-100 text-success-800',
  };
  return colors[level] || 'bg-gray-100 text-gray-800';
};

export const formatSalary = (salary) => {
  if (!salary) return 'Not specified';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(salary);
};

export const formatDate = (date) => {
  if (!date) return 'Not specified';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'Not specified';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const getYearsOfService = (hireDate) => {
  if (!hireDate) return null;
  const today = new Date();
  const hire = new Date(hireDate);
  let years = today.getFullYear() - hire.getFullYear();
  const monthDiff = today.getMonth() - hire.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < hire.getDate())) {
    years--;
  }
  
  return years;
};

export const isCertificationExpired = (expiresAt) => {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
};

export const isCertificationExpiringSoon = (expiresAt, daysThreshold = 30) => {
  if (!expiresAt) return false;
  const expirationDate = new Date(expiresAt);
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
  return expirationDate <= thresholdDate && expirationDate > new Date();
};

export const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
};

export default employeeApi;
