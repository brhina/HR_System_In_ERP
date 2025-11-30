import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Star, 
  Edit3,
  ArrowLeft,
  MapPin,
  Building
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../../../../components/ui/Button';
import { cn } from '../../../../lib/utils';
import CandidateDocumentsSection from './CandidateDocumentsSection';
import { recruitmentUtils } from '../../../../api/recruitmentApi';
import { 
  useCandidateDocuments, 
  useUploadCandidateDocument, 
  useAddCandidateDocument, 
  useRemoveCandidateDocument 
} from '../../hooks/useRecruitment';

/**
 * Candidate Detail View Component
 * Displays comprehensive candidate information including documents
 */
const CandidateDetailView = ({ 
  candidate, 
  onEdit, 
  onClose,
  isLoading = false,
  asModal = false
}) => {
  // Fetch documents using React Query
  const { data: documents = [], isLoading: isLoadingDocuments, refetch: refetchDocuments } = useCandidateDocuments(candidate?.id);
  
  // Document mutations
  const uploadDocumentMutation = useUploadCandidateDocument();
  const addDocumentMutation = useAddCandidateDocument();
  const removeDocumentMutation = useRemoveCandidateDocument();

  const handleFileUpload = async (files) => {
    try {
      for (const file of files) {
        // Upload file first
        const uploadResult = await uploadDocumentMutation.mutateAsync({ 
          candidateId: candidate.id, 
          file 
        });
        
        // Then add document record
        if (uploadResult.data?.fileUrl) {
          await addDocumentMutation.mutateAsync({
            candidateId: candidate.id,
            data: {
              name: file.name,
              fileUrl: uploadResult.data.fileUrl,
              documentType: getDocumentType(file.name)
            }
          });
        }
      }
      refetchDocuments();
    } catch (error) {
      console.error('Error uploading documents:', error);
    }
  };

  const handleRemoveFile = async (file) => {
    try {
      await removeDocumentMutation.mutateAsync({
        candidateId: candidate.id,
        documentId: file.id
      });
      refetchDocuments();
    } catch (error) {
      console.error('Error removing document:', error);
    }
  };

  const handlePreviewFile = (file) => {
    // Preview functionality handled by CandidateDocumentsSection
  };

  const handleDownloadFile = (file) => {
    if (file.fileUrl) {
      const link = document.createElement('a');
      link.href = file.fileUrl;
      link.download = file.name;
      link.click();
    }
  };

  const getDocumentType = (fileName) => {
    const name = fileName.toLowerCase();
    if (name.includes('resume') || name.includes('cv')) return 'RESUME';
    if (name.includes('cover')) return 'COVER_LETTER';
    if (name.includes('portfolio')) return 'PORTFOLIO';
    if (name.includes('certificate') || name.includes('cert')) return 'CERTIFICATE';
    return 'OTHER';
  };

  if (!candidate) return null;

  const stageInfo = recruitmentUtils.INTERVIEW_STAGES[candidate.stage];

  const content = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {asModal && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {candidate.firstName} {candidate.lastName}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                `bg-${stageInfo?.color}-100 text-${stageInfo?.color}-800`
              )}>
                {stageInfo?.label}
              </span>
              {candidate.score && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {candidate.score}/100
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => onEdit(candidate.id)}
            disabled={isLoading}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Candidate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-blue-600" />
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{candidate.email}</span>
              </div>
              {candidate.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{candidate.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Application Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Application Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  Applied: {recruitmentUtils.formatDate(candidate.createdAt)}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {candidate.jobPosting?.title || 'Unknown Position'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {candidate.jobPosting?.department?.name || 'Unknown Department'}
                </span>
              </div>
            </div>
          </div>

          {/* Score and Feedback */}
          {(candidate.score || candidate.feedback) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-blue-600" />
                Evaluation
              </h3>
              <div className="space-y-3">
                {candidate.score && (
                  <div className="flex items-center space-x-3">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Score: {candidate.score}/100
                    </span>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      `bg-${recruitmentUtils.getScoreColor(candidate.score)}-100 text-${recruitmentUtils.getScoreColor(candidate.score)}-800`
                    )}>
                      {recruitmentUtils.getScoreLabel(candidate.score)}
                    </span>
                  </div>
                )}
                {candidate.feedback && (
                  <div>
                    <p className="text-sm text-gray-700">
                      {candidate.feedback}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Documents */}
        <div className="lg:col-span-2">
          <CandidateDocumentsSection
            candidateId={candidate.id}
            uploadedFiles={[]}
            existingFiles={documents}
            onFileUpload={handleFileUpload}
            onRemoveFile={handleRemoveFile}
            onPreviewFile={handlePreviewFile}
            onDownloadFile={handleDownloadFile}
            isLoading={isLoadingDocuments}
          />
        </div>
      </div>
    </>
  );

  if (asModal) {
    return (
      <div className="p-6">
        {content}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      {content}
    </motion.div>
  );
};

export default CandidateDetailView;
