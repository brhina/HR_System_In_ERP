import apiClient from './axiosClient';

// Recruitment API Service
export const recruitmentApi = {
  // Job Postings CRUD Operations
  listJobPostings: (params = {}) => {
    return apiClient.get('/hr/recruitment/jobs', { params });
  },

  createJobPosting: (data) => {
    return apiClient.post('/hr/recruitment/jobs', data);
  },

  getJobPostingById: (id) => {
    return apiClient.get(`/hr/recruitment/jobs/${id}`);
  },

  updateJobPosting: (id, data) => {
    return apiClient.put(`/hr/recruitment/jobs/${id}`, data);
  },

  archiveJobPosting: (id) => {
    return apiClient.patch(`/hr/recruitment/jobs/${id}/archive`);
  },

  deleteJobPosting: (id) => {
    return apiClient.delete(`/hr/recruitment/jobs/${id}`);
  },

  // Candidate Operations
  listCandidatesForJob: (jobId, params = {}) => {
    return apiClient.get(`/hr/recruitment/jobs/${jobId}/candidates`, { params });
  },

  createCandidateForJob: (jobId, data) => {
    return apiClient.post(`/hr/recruitment/jobs/${jobId}/candidates`, data);
  },

  updateCandidateStage: (candidateId, stage) => {
    return apiClient.put(`/hr/recruitment/candidates/${candidateId}/stage`, { stage });
  },

  setCandidateScore: (candidateId, score, feedback) => {
    return apiClient.put(`/hr/recruitment/candidates/${candidateId}/score`, { score, feedback });
  },

  deleteCandidate: (candidateId) => {
    return apiClient.delete(`/hr/recruitment/candidates/${candidateId}`);
  },

  hireCandidate: (candidateId, data) => {
    return apiClient.post(`/hr/recruitment/candidates/${candidateId}/hire`, data);
  },

  // Shortlist Operations
  shortlistCandidates: (jobId, candidateIds) => {
    return apiClient.post(`/hr/recruitment/jobs/${jobId}/shortlist`, { candidateIds });
  },

  // Communication Operations
  notifyCandidate: (candidateId, data) => {
    return apiClient.post(`/hr/recruitment/candidates/${candidateId}/notify`, data);
  },

  updateCandidateStatusWithReason: (candidateId, status, reason) => {
    return apiClient.post(`/hr/recruitment/candidates/${candidateId}/status`, { status, reason });
  },

  // Interview Operations
  scheduleInterview: (data) => {
    return apiClient.post('/hr/recruitment/interviews', data);
  },

  updateInterview: (interviewId, data) => {
    return apiClient.put(`/hr/recruitment/interviews/${interviewId}`, data);
  },

  deleteInterview: (interviewId) => {
    return apiClient.delete(`/hr/recruitment/interviews/${interviewId}`);
  },

  listAllInterviews: () => {
    return apiClient.get('/hr/recruitment/interviews');
  },

  listInterviewsForCandidate: (candidateId) => {
    return apiClient.get(`/hr/recruitment/candidates/${candidateId}/interviews`);
  },

  // KPIs and Analytics
  getRecruitmentKpis: () => {
    return apiClient.get('/hr/recruitment/kpis');
  },

  // Offers and Contracts
  generateOfferLetter: (candidateId, data) => {
    return apiClient.post(`/hr/recruitment/offers/${candidateId}`, data);
  },

  createEmploymentContract: (candidateId, data) => {
    return apiClient.post(`/hr/recruitment/contracts/${candidateId}`, data);
  },

  // Onboarding
  createOnboardingChecklist: (candidateId, data) => {
    return apiClient.post(`/hr/recruitment/onboarding/${candidateId}`, data);
  },

  // Candidate Document Operations
  getCandidateDocuments: (candidateId) => {
    return apiClient.get(`/hr/recruitment/candidates/${candidateId}/documents`);
  },

  uploadCandidateDocument: (candidateId, formData) => {
    return apiClient.post(`/hr/recruitment/candidates/${candidateId}/documents/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  addCandidateDocument: (candidateId, data) => {
    return apiClient.post(`/hr/recruitment/candidates/${candidateId}/documents`, data);
  },

  updateCandidateDocument: (candidateId, documentId, data) => {
    return apiClient.put(`/hr/recruitment/candidates/${candidateId}/documents/${documentId}`, data);
  },

  removeCandidateDocument: (candidateId, documentId) => {
    return apiClient.delete(`/hr/recruitment/candidates/${candidateId}/documents/${documentId}`);
  },

  // Public Link Operations
  generatePublicLink: (jobId) => {
    return apiClient.post(`/hr/recruitment/jobs/${jobId}/generate-link`);
  },

  getPublicJobPosting: (token) => {
    return apiClient.get(`/hr/recruitment/public/jobs/${token}`);
  },
};

// Utility functions for recruitment data
export const recruitmentUtils = {
  // Interview Stage Management
  INTERVIEW_STAGES: {
    APPLIED: { label: 'Applied', color: 'blue', order: 1 },
    SCREENING: { label: 'Screening', color: 'yellow', order: 2 },
    INTERVIEW: { label: 'Interview', color: 'orange', order: 3 },
    OFFER: { label: 'Offer', color: 'green', order: 4 },
    HIRED: { label: 'Hired', color: 'emerald', order: 5 },
    REJECTED: { label: 'Rejected', color: 'red', order: 6 },
  },

  getStageColor: (stage) => {
    return recruitmentUtils.INTERVIEW_STAGES[stage]?.color || 'gray';
  },

  getStageLabel: (stage) => {
    return recruitmentUtils.INTERVIEW_STAGES[stage]?.label || stage;
  },

  getNextStages: (currentStage) => {
    const transitions = {
      APPLIED: ['SCREENING', 'REJECTED'],
      SCREENING: ['INTERVIEW', 'REJECTED'],
      INTERVIEW: ['OFFER', 'REJECTED'],
      OFFER: ['HIRED', 'REJECTED'],
      REJECTED: [],
      HIRED: [],
    };
    return transitions[currentStage] || [];
  },

  // Job Posting Status
  getJobStatusColor: (isActive) => {
    return isActive ? 'green' : 'gray';
  },

  getJobStatusLabel: (isActive) => {
    return isActive ? 'Active' : 'Archived';
  },

  // Date formatting
  formatDate: (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  formatDateTime: (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Candidate scoring
  getScoreColor: (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  },

  getScoreLabel: (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  },

  // Validation helpers
  validateJobPosting: (data) => {
    const errors = {};
    
    if (!data.title?.trim()) {
      errors.title = 'Job title is required';
    }
    
    if (!data.description?.trim()) {
      errors.description = 'Job description is required';
    }
    
    if (!data.departmentId) {
      errors.departmentId = 'Department is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  validateCandidate: (data) => {
    const errors = {};
    
    if (!data.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!data.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  validateInterview: (data) => {
    const errors = {};
    
    if (!data.candidateId) {
      errors.candidateId = 'Candidate is required';
    }
    
    if (!data.interviewerId) {
      errors.interviewerId = 'Interviewer is required';
    }
    
    if (!data.date) {
      errors.date = 'Interview date is required';
    } else if (new Date(data.date) < new Date()) {
      errors.date = 'Interview date cannot be in the past';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

export default recruitmentApi;
