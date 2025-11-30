import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruitmentApi } from '../../../api/recruitmentApi';
import employeeApi from '../../../api/employeeApi';
import { queryKeys } from '../../../lib/react-query';
import toast from 'react-hot-toast';

/**
 * Reusable hook for candidate management
 * Handles common candidate operations, filtering, and state management
 */
export const useCandidateManagement = (options = {}) => {
  const {
    jobId = null, // If provided, fetch candidates for specific job; otherwise fetch all
    enableJobFilter = false, // Enable job filtering in global view
  } = options;

  const queryClient = useQueryClient();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [showCandidateDetail, setShowCandidateDetail] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [viewingCandidate, setViewingCandidate] = useState(null);

  // Fetch candidates
  const { data: candidates = [], isLoading: isLoadingCandidates, error: candidatesError, refetch: refetchCandidates } = useQuery({
    queryKey: jobId 
      ? queryKeys.recruitment.candidates.list(jobId)
      : queryKeys.recruitment.candidates.all,
    queryFn: async () => {
      if (jobId) {
        // Fetch candidates for specific job
        const response = await recruitmentApi.listCandidatesForJob(jobId);
        return response.data.data || [];
      } else {
        // Fetch all candidates across all jobs
        const jobsResponse = await recruitmentApi.listJobPostings();
        const jobs = jobsResponse.data.data || [];
        
        const allCandidates = [];
        for (const job of jobs) {
          try {
            const candidatesResponse = await recruitmentApi.listCandidatesForJob(job.id);
            const jobCandidates = (candidatesResponse.data.data || []).map(candidate => ({
              ...candidate,
              jobPosting: job,
              jobPostingId: job.id
            }));
            allCandidates.push(...jobCandidates);
          } catch (error) {
            console.warn(`Failed to fetch candidates for job ${job.id}:`, error);
          }
        }
        return allCandidates;
      }
    },
    enabled: jobId !== null || !jobId, // Always enabled
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch job postings for filtering (only in global view)
  const { data: jobPostings = [] } = useQuery({
    queryKey: queryKeys.recruitment.jobPostings.all,
    queryFn: async () => {
      const response = await recruitmentApi.listJobPostings();
      return response.data.data || [];
    },
    enabled: enableJobFilter && !jobId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch interviewers
  const { data: interviewers = [] } = useQuery({
    queryKey: queryKeys.employees.managers,
    queryFn: async () => {
      const response = await employeeApi.listManagers();
      return response.data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const createCandidateMutation = useMutation({
    mutationFn: ({ jobId: candidateJobId, data }) => recruitmentApi.createCandidateForJob(candidateJobId || jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.all });
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.list(jobId) });
      }
      toast.success('Candidate added successfully');
      setShowCandidateForm(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add candidate');
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ candidateId, stage }) => {
      // Prevent trying to set HIRED through stage update
      if (stage === 'HIRED') {
        throw new Error('Cannot mark candidate as HIRED through stage update. Please use the "Hire Candidate" button to create an employee record.');
      }
      return recruitmentApi.updateCandidateStage(candidateId, stage);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.all });
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.list(jobId) });
      }
      toast.success(`Candidate moved to ${variables.stage} stage`);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update candidate stage';
      toast.error(errorMessage);
    },
  });

  const setScoreMutation = useMutation({
    mutationFn: ({ candidateId, score, feedback }) => recruitmentApi.setCandidateScore(candidateId, score, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.all });
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.list(jobId) });
      }
      toast.success('Candidate score updated successfully');
      setShowScoreModal(false);
      setSelectedCandidate(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update candidate score');
    },
  });

  const hireMutation = useMutation({
    mutationFn: ({ candidateId, data }) => recruitmentApi.hireCandidate(candidateId, data),
    onSuccess: () => {
      // Invalidate all recruitment-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.kpis });
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.list(jobId) });
      }
      
      // Invalidate all employee queries to ensure the new employee appears in the list
      queryClient.invalidateQueries({ queryKey: ['employees'] }); // This will invalidate all employee queries
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.list() });
      
      // Also invalidate any employee list queries with different parameters
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          return Array.isArray(query.queryKey) && 
                 query.queryKey.length >= 2 &&
                 query.queryKey[0] === 'employees' && 
                 query.queryKey[1] === 'list';
        }
      });
      
      toast.success('Candidate hired successfully and added to employee list');
      setShowHireModal(false);
      setSelectedCandidate(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to hire candidate');
    },
  });

  const scheduleInterviewMutation = useMutation({
    mutationFn: (interviewData) => recruitmentApi.scheduleInterview(interviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.interviews.all });
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.list(jobId) });
      }
      toast.success('Interview scheduled successfully');
      setShowInterviewModal(false);
      setSelectedCandidate(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to schedule interview');
    },
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: (candidateId) => recruitmentApi.deleteCandidate(candidateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.all });
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.list(jobId) });
      }
      toast.success('Candidate deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete candidate');
    },
  });

  // Filtered candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const matchesSearch = !searchTerm || 
        `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStage = stageFilter === 'all' || candidate.stage === stageFilter;
      const matchesJob = !enableJobFilter || jobFilter === 'all' || candidate.jobPostingId === jobFilter;
      
      return matchesSearch && matchesStage && matchesJob;
    });
  }, [candidates, searchTerm, stageFilter, jobFilter, enableJobFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = candidates.length;
    const scored = candidates.filter(c => c.score !== null && c.score !== undefined).length;
    const averageScore = scored > 0 
      ? Math.round(candidates.reduce((sum, c) => sum + (c.score || 0), 0) / scored)
      : 0;
    const hired = candidates.filter(c => c.stage === 'HIRED').length;
    
    return { total, scored, averageScore, hired };
  }, [candidates]);

  // Event handlers
  const handleCreateCandidate = async ({ jobId: candidateJobId, data }) => {
    try {
      const result = await createCandidateMutation.mutateAsync({ jobId: candidateJobId || jobId, data });
      return result; // Return the result so CandidateForm can access the candidate ID
    } catch (error) {
      console.error('Error creating candidate:', error);
      throw error; // Re-throw so CandidateForm can handle it
    }
  };

  const handleUpdateStage = async ({ candidateId, stage }) => {
    try {
      await updateStageMutation.mutateAsync({ candidateId, stage });
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  const handleSetScore = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    setSelectedCandidate(candidate);
    setShowScoreModal(true);
  };

  const handleSaveScore = async ({ candidateId, score, feedback }) => {
    try {
      await setScoreMutation.mutateAsync({ candidateId, score, feedback });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const handleHire = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    setSelectedCandidate(candidate);
    setShowHireModal(true);
  };

  const handleHireSubmit = async (hireData) => {
    try {
      await hireMutation.mutateAsync({ candidateId: selectedCandidate.id, data: hireData });
    } catch (error) {
      console.error('Error hiring candidate:', error);
    }
  };

  const handleScheduleInterview = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    setSelectedCandidate(candidate);
    setShowInterviewModal(true);
  };

  const handleInterviewSubmit = async (interviewData) => {
    try {
      await scheduleInterviewMutation.mutateAsync(interviewData);
    } catch (error) {
      console.error('Error scheduling interview:', error);
    }
  };

  const handleEditCandidate = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    setEditingCandidate(candidate);
    setShowCandidateForm(true);
  };

  const handleViewCandidate = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    setViewingCandidate(candidate);
    setShowCandidateDetail(true);
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      deleteCandidateMutation.mutate(candidateId);
    }
  };

  return {
    // Data
    candidates: filteredCandidates,
    allCandidates: candidates,
    jobPostings,
    interviewers,
    stats,
    
    // Loading states
    isLoading: isLoadingCandidates,
    error: candidatesError,
    
    // Filter state
    searchTerm,
    setSearchTerm,
    stageFilter,
    setStageFilter,
    jobFilter,
    setJobFilter,
    
    // Modal states
    showCandidateForm,
    setShowCandidateForm,
    showCandidateDetail,
    setShowCandidateDetail,
    showScoreModal,
    setShowScoreModal,
    showHireModal,
    setShowHireModal,
    showInterviewModal,
    setShowInterviewModal,
    
    // Selected items
    selectedCandidate,
    setSelectedCandidate,
    editingCandidate,
    setEditingCandidate,
    viewingCandidate,
    setViewingCandidate,
    
    // Handlers
    handleCreateCandidate,
    handleUpdateStage,
    handleSetScore,
    handleSaveScore,
    handleHire,
    handleHireSubmit,
    handleScheduleInterview,
    handleInterviewSubmit,
    handleEditCandidate,
    handleViewCandidate,
    handleDeleteCandidate,
    
    // Mutations (for loading states)
    isCreatingCandidate: createCandidateMutation.isPending,
    isUpdatingStage: updateStageMutation.isPending,
    isSettingScore: setScoreMutation.isPending,
    isHiring: hireMutation.isPending,
    isSchedulingInterview: scheduleInterviewMutation.isPending,
    isDeletingCandidate: deleteCandidateMutation.isPending,
    
    // Refetch
    refetchCandidates,
  };
};

