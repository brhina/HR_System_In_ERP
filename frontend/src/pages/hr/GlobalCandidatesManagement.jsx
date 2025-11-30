import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Filter, 
  Search,
  TrendingUp,
  Calendar,
  Star,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { Modal } from '../../components/ui/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDeleteCandidate } from './hooks/useRecruitment';
import apiClient from '../../api/axiosClient';
import employeeApi from '../../api/employeeApi';
import { queryKeys } from '../../lib/react-query';
import { cn } from '../../lib/utils';
import CandidateCard from './components/recuirementComponents/CandidateCard';
import CandidateForm from './components/recuirementComponents/CandidateForm';
import CandidateDetailView from './components/recuirementComponents/CandidateDetailView';
import ScoreModal from './components/employeeComponents/employee/ScoreModal';
import HireModal from './components/employeeComponents/employee/HireModal';
import InterviewScheduler from './components/recuirementComponents/InterviewScheduler';

/**
 * Global Candidates Management Component
 * Manages all candidates across all job postings
 */
const GlobalCandidatesManagement = () => {
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

  const queryClient = useQueryClient();

  // Fetch all candidates across all jobs by getting all job postings and their candidates
  const { data: candidates = [], isLoading: isLoadingCandidates, error: candidatesError } = useQuery({
    queryKey: queryKeys.recruitment.candidates.all,
    queryFn: async () => {
      // First get all job postings
      const jobsResponse = await apiClient.get('/hr/recruitment/jobs');
      const jobs = jobsResponse.data.data;
      
      // Then get candidates for each job
      const allCandidates = [];
      for (const job of jobs) {
        try {
          const candidatesResponse = await apiClient.get(`/hr/recruitment/jobs/${job.id}/candidates`);
          const jobCandidates = candidatesResponse.data.data.map(candidate => ({
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
    },
  });

  // Fetch all job postings for filtering
  const { data: jobPostings = [] } = useQuery({
    queryKey: queryKeys.recruitment.jobPostings.all,
    queryFn: async () => {
      const response = await apiClient.get('/hr/recruitment/jobs');
      return response.data.data;
    },
  });

  // Fetch available interviewers
  const { data: interviewers = [] } = useQuery({
    queryKey: queryKeys.employees.managers,
    queryFn: async () => {
      const response = await employeeApi.listManagers();
      return response.data.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutations
  const createCandidateMutation = useMutation({
    mutationFn: async ({ jobId, data }) => {
      const response = await apiClient.post(`/hr/recruitment/jobs/${jobId}/candidates`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.all });
      setShowCandidateForm(false);
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ candidateId, stage }) => {
      const response = await apiClient.put(`/hr/recruitment/candidates/${candidateId}/stage`, { stage });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.all });
    },
  });

  const setScoreMutation = useMutation({
    mutationFn: async ({ candidateId, score, feedback }) => {
      const response = await apiClient.put(`/hr/recruitment/candidates/${candidateId}/score`, { score, feedback });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.all });
      setShowScoreModal(false);
      setSelectedCandidate(null);
    },
  });

  const hireMutation = useMutation({
    mutationFn: async ({ candidateId, data }) => {
      const response = await apiClient.post(`/hr/recruitment/candidates/${candidateId}/hire`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.all });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.list() });
      toast.success('Candidate hired successfully and added to employee list');
      setShowHireModal(false);
      setSelectedCandidate(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to hire candidate');
    },
  });

  const scheduleInterviewMutation = useMutation({
    mutationFn: async (interviewData) => {
      const response = await apiClient.post('/hr/recruitment/interviews', interviewData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.all });
      setShowInterviewModal(false);
      setSelectedCandidate(null);
    },
  });

  // Filter candidates
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = !searchTerm || 
      `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = stageFilter === 'all' || candidate.stage === stageFilter;
    const matchesJob = jobFilter === 'all' || candidate.jobPostingId === jobFilter;

    return matchesSearch && matchesStage && matchesJob;
  });

  // Group candidates by stage
  const candidatesByStage = candidates.reduce((groups, candidate) => {
    if (!groups[candidate.stage]) {
      groups[candidate.stage] = [];
    }
    groups[candidate.stage].push(candidate);
    return groups;
  }, {});

  // Calculate statistics
  const stats = {
    total: candidates.length,
    scored: candidates.filter(c => c.score !== null && c.score !== undefined).length,
    averageScore: candidates.length > 0 
      ? Math.round(candidates.reduce((sum, c) => sum + (c.score || 0), 0) / candidates.length)
      : 0,
    hired: candidates.filter(c => c.stage === 'HIRED').length,
  };

  // Event handlers
  const handleCreateCandidate = async ({ jobId, data }) => {
    try {
      await createCandidateMutation.mutateAsync({ jobId, data });
    } catch (error) {
      console.error('Error creating candidate:', error);
    }
  };

  const handleUpdateStage = async ({ candidateId, stage }) => {
    try {
      await updateStageMutation.mutateAsync({ candidateId, stage });
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  const handleSetScore = async ({ candidateId, score, feedback }) => {
    try {
      await setScoreMutation.mutateAsync({ candidateId, score, feedback });
    } catch (error) {
      console.error('Error setting score:', error);
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
      setShowHireModal(false);
      setSelectedCandidate(null);
    } catch (error) {
      console.error('Error hiring candidate:', error);
    }
  };

  const handleScheduleInterview = async (interviewData) => {
    try {
      await scheduleInterviewMutation.mutateAsync(interviewData);
    } catch (error) {
      console.error('Error scheduling interview:', error);
    }
  };

  const handleEditCandidate = (candidate) => {
    setEditingCandidate(candidate);
    setShowCandidateForm(true);
  };

  const handleViewCandidate = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    setViewingCandidate(candidate);
    setShowCandidateDetail(true);
  };

  const deleteCandidateMutation = useDeleteCandidate();

  const handleDeleteCandidate = async (candidateId) => {
    if (window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      deleteCandidateMutation.mutate(candidateId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Candidates</h1>
          <p className="text-gray-600">Manage candidates across all job postings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowCandidateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-3">
            <Users className="h-4 w-4 text-blue-600" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Total Candidates</h3>
              <p className="text-xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-3">
            <Star className="h-4 w-4 text-yellow-600" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Scored</h3>
              <p className="text-xl font-bold text-yellow-600">{stats.scored}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Avg Score</h3>
              <p className="text-xl font-bold text-green-600">{stats.averageScore}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-4 w-4 text-purple-600" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Hired</h3>
              <p className="text-xl font-bold text-purple-600">{stats.hired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Stages</option>
              <option value="APPLIED">Applied</option>
              <option value="SCREENING">Screening</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="HIRED">Hired</option>
              <option value="REJECTED">Rejected</option>
            </select>
            
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Jobs</option>
              {jobPostings.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      {isLoadingCandidates ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-soft">
          <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {candidates.length === 0 ? 'No Candidates Yet' : 'No Candidates Found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {candidates.length === 0 
              ? 'Get started by adding candidates to job postings'
              : 'Try adjusting your search or filters'
            }
          </p>
          {candidates.length === 0 && (
            <Button onClick={() => setShowCandidateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Candidate
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onUpdateStage={handleUpdateStage}
              onSetScore={handleSetScore}
              onScheduleInterview={handleScheduleInterview}
              onHire={handleHire}
              onEdit={handleEditCandidate}
              onView={handleViewCandidate}
              onDelete={handleDeleteCandidate}
              isLoading={false}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CandidateForm
        isOpen={showCandidateForm}
        onClose={() => {
          setShowCandidateForm(false);
          setEditingCandidate(null);
        }}
        onSubmit={handleCreateCandidate}
        jobId={null} // Global view - will need to select job
        candidate={editingCandidate}
        isLoading={createCandidateMutation.isPending}
      />
      
      <ScoreModal
        isOpen={showScoreModal}
        onClose={() => {
          setShowScoreModal(false);
          setSelectedCandidate(null);
        }}
        onSubmit={handleSetScore}
        candidate={selectedCandidate}
        isLoading={setScoreMutation.isPending}
      />
      
      <HireModal
        isOpen={showHireModal}
        onClose={() => {
          setShowHireModal(false);
          setSelectedCandidate(null);
        }}
        onSubmit={handleHireSubmit}
        candidate={selectedCandidate}
        jobPosting={selectedCandidate?.jobPosting}
        departments={[]} // TODO: Fetch departments
        managers={[]} // TODO: Fetch managers
        isLoading={hireMutation.isPending}
      />
      
      <InterviewScheduler
        isOpen={showInterviewModal}
        onClose={() => {
          setShowInterviewModal(false);
          setSelectedCandidate(null);
        }}
        onSubmit={handleScheduleInterview}
        candidate={selectedCandidate}
        interviewers={interviewers}
        isLoading={scheduleInterviewMutation.isPending}
      />

      {/* Candidate Detail View */}
      {showCandidateDetail && viewingCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <CandidateDetailView
              candidate={viewingCandidate}
              onEdit={(candidateId) => {
                setShowCandidateDetail(false);
                setViewingCandidate(null);
                handleEditCandidate(candidates.find(c => c.id === candidateId));
              }}
              onClose={() => {
                setShowCandidateDetail(false);
                setViewingCandidate(null);
              }}
              isLoading={false}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GlobalCandidatesManagement;
