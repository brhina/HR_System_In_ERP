import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { useRecruitmentDetail } from './hooks/useRecruitment';
import { 
  JobPostingHeader,
  CandidatesSection,
  CandidateForm,
  ScoreModal,
  InterviewScheduler,
  HireModal,
  ShareLinkModal
} from './components/recuirementComponents';


/**
 * Main Recruitment Detail Component
 * Refactored to use modular components for better maintainability
 */
const RecruitmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Modal states
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Selected items
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [editingCandidate, setEditingCandidate] = useState(null);
  
  // Fetch recruitment data
  const {
    jobPosting,
    candidates,
    interviewers,
    isLoading,
    hasError,
    refetchAll,
    createCandidate,
    updateCandidateStage,
    setCandidateScore,
    hireCandidate,
    scheduleInterview,
    isCreatingCandidate,
    isUpdatingStage,
    isSettingScore,
    isHiring,
    isSchedulingInterview,
  } = useRecruitmentDetail(id);
  
  // Event handlers
  const handleCreateCandidate = async ({ jobId, data }) => {
    try {
      await createCandidate({ jobId, data });
      setShowCandidateForm(false);
      refetchAll();
    } catch (error) {
      console.error('Error creating candidate:', error);
    }
  };
  
  const handleUpdateStage = async ({ candidateId, stage }) => {
    try {
      await updateCandidateStage({ candidateId, stage });
      refetchAll();
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
      await setCandidateScore({ candidateId, score, feedback });
      setShowScoreModal(false);
      setSelectedCandidate(null);
      refetchAll();
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
      await hireCandidate({ candidateId: selectedCandidate.id, data: hireData });
      setShowHireModal(false);
      setSelectedCandidate(null);
      refetchAll();
    } catch (error) {
      console.error('Error hiring candidate:', error);
    }
  };
  
  const handleScheduleInterview = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    setSelectedCandidate(candidate);
    setShowInterviewScheduler(true);
  };
  
  const handleInterviewSubmit = async (interviewData) => {
    try {
      await scheduleInterview(interviewData);
      setShowInterviewScheduler(false);
      setSelectedCandidate(null);
      refetchAll();
    } catch (error) {
      console.error('Error scheduling interview:', error);
    }
  };
  
  const handleEditCandidate = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    setEditingCandidate(candidate);
    setShowCandidateForm(true);
  };
  
  const handleDeleteCandidate = async (candidateId) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      // TODO: Implement delete candidate functionality
      console.log('Delete candidate:', candidateId);
    }
  };
  
  const handleBack = () => {
    navigate('/recruitment');
  };
  
  const handleEditJob = () => {
    // TODO: Navigate to job editing page
    console.log('Edit job:', jobPosting.id);
  };
  
  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleLinkGenerated = (updatedJob) => {
    // Refetch job posting to get updated publicToken
    refetchAll();
  };
  
  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log('Download job details');
  };
  
  const handleArchive = () => {
    if (window.confirm('Are you sure you want to archive this job posting?')) {
      // TODO: Implement archive functionality
      console.log('Archive job posting');
    }
  };
  
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
        <Button onClick={handleBack}>
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
      {/* Job Posting Header */}
      <JobPostingHeader
        jobPosting={jobPosting}
        candidatesCount={candidates.length}
        onBack={handleBack}
        onEdit={handleEditJob}
        onShare={handleShare}
        onDownload={handleDownload}
        onArchive={handleArchive}
        isLoading={isLoading}
      />
      
      {/* Job Description */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{jobPosting.description}</p>
        </div>
      </div>
      
      {/* Candidates Section */}
      <CandidatesSection
        candidates={candidates}
        onAddCandidate={() => setShowCandidateForm(true)}
        onUpdateStage={handleUpdateStage}
        onSetScore={handleSetScore}
        onScheduleInterview={handleScheduleInterview}
        onHire={handleHire}
        onEditCandidate={handleEditCandidate}
        onDeleteCandidate={handleDeleteCandidate}
        isLoading={isLoading}
      />
      
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
      
      <InterviewScheduler
        isOpen={showInterviewScheduler}
        onClose={() => {
          setShowInterviewScheduler(false);
          setSelectedCandidate(null);
        }}
        onSubmit={handleInterviewSubmit}
        candidate={selectedCandidate}
        interviewers={interviewers}
        isLoading={isSchedulingInterview}
      />
      
      <HireModal
        isOpen={showHireModal}
        onClose={() => {
          setShowHireModal(false);
          setSelectedCandidate(null);
        }}
        onSubmit={handleHireSubmit}
        candidate={selectedCandidate}
        departments={[]} // TODO: Fetch departments
        managers={[]} // TODO: Fetch managers
        isLoading={isHiring}
      />

      <ShareLinkModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        jobPosting={jobPosting}
        onLinkGenerated={handleLinkGenerated}
      />
    </motion.div>
  );
};

export default RecruitmentDetail;