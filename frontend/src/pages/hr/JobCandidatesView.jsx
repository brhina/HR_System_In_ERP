import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Plus,
  Users,
  Calendar,
  XCircle
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useJobPosting } from './hooks/useRecruitment';
import { useCandidateManagement } from './hooks/useCandidateManagement';
import { recruitmentUtils } from '../../api/recruitmentApi';
import CandidateCard from './components/recuirementComponents/CandidateCard';
import CandidateForm from './components/recuirementComponents/CandidateForm';
import CandidateDetailView from './components/recuirementComponents/CandidateDetailView';
import CandidateFilters from './components/recuirementComponents/CandidateFilters';
import ScoreModal from './components/employeeComponents/employee/ScoreModal';
import HireModal from './components/employeeComponents/employee/HireModal';
import InterviewScheduler from './components/recuirementComponents/InterviewScheduler';

/**
 * Job Candidates View Component
 * Displays all candidates for a specific job posting
 */
const JobCandidatesView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Fetch job posting
  const { data: jobPosting, isLoading: isLoadingJob, error: jobError } = useJobPosting(id);
  
  // Use candidate management hook
  const candidateManagement = useCandidateManagement({ jobId: id });
  
  const {
    candidates: filteredCandidates,
    allCandidates: candidates,
    interviewers,
    isLoading: isLoadingCandidates,
    error: candidatesError,
    searchTerm,
    setSearchTerm,
    stageFilter,
    setStageFilter,
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
    selectedCandidate,
    setSelectedCandidate,
    editingCandidate,
    setEditingCandidate,
    viewingCandidate,
    setViewingCandidate,
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
    isCreatingCandidate,
    isUpdatingStage,
    isSettingScore,
    isHiring,
    isSchedulingInterview,
  } = candidateManagement;
  
  // Group candidates by stage for filter display
  const candidatesByStage = useMemo(() => {
    const groups = {};
    filteredCandidates.forEach(candidate => {
      if (!groups[candidate.stage]) {
        groups[candidate.stage] = [];
      }
      groups[candidate.stage].push(candidate);
    });
    return groups;
  }, [filteredCandidates]);
  
  const isLoading = isLoadingJob || isLoadingCandidates;
  const hasError = jobError || candidatesError;
  
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-soft p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (hasError || !jobPosting) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Posting Not Found</h2>
        <p className="text-gray-600 mb-4">The job posting you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/recruitment')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Recruitment
        </Button>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/recruitment')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recruitment
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Candidates for {jobPosting.title}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{candidates.length} total candidates</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Posted: {recruitmentUtils.formatDate(jobPosting.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <Button onClick={() => setShowCandidateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>
      
      {/* Filters */}
      <CandidateFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        stageFilter={stageFilter}
        onStageFilterChange={setStageFilter}
        enableJobFilter={false}
        candidatesByStage={candidatesByStage}
      />
      
      {/* Candidates Grid */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Candidates Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || stageFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding candidates to this job posting'
            }
          </p>
          {!searchTerm && stageFilter === 'all' && (
            <Button onClick={() => setShowCandidateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Candidate
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <AnimatePresence>
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
                isLoading={isLoading}
              />
            ))}
          </AnimatePresence>
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
        jobId={id}
        candidate={editingCandidate}
        isLoading={isCreatingCandidate}
      />
      
      <ScoreModal
        isOpen={showScoreModal}
        onClose={() => {
          setShowScoreModal(false);
          setSelectedCandidate(null);
        }}
        onSubmit={handleSaveScore}
        candidate={selectedCandidate}
        isLoading={isSettingScore}
      />
      
      <HireModal
        isOpen={showHireModal}
        onClose={() => {
          setShowHireModal(false);
          setSelectedCandidate(null);
        }}
        onSubmit={handleHireSubmit}
        candidate={selectedCandidate}
        jobPosting={jobPosting}
        isLoading={isHiring}
      />
      
      <InterviewScheduler
        isOpen={showInterviewModal}
        onClose={() => {
          setShowInterviewModal(false);
          setSelectedCandidate(null);
        }}
        onSubmit={handleInterviewSubmit}
        candidate={selectedCandidate}
        interviewers={interviewers}
        isLoading={isSchedulingInterview}
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
                handleEditCandidate(candidateId);
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

export default JobCandidatesView;
