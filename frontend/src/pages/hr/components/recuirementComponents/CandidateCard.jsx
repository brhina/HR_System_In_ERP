import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  Calendar, 
  Star, 
  CheckCircle, 
  Clock,
  Edit,
  Trash2,
  User,
  Eye
} from 'lucide-react';

import { Button } from '../../../../components/ui/Button';
import { recruitmentUtils } from '../../../../api/recruitmentApi';
import { cn } from '../../../../lib/utils';

/**
 * Candidate Card Component
 * Displays candidate information with stage progression and actions
 */
const CandidateCard = ({ 
  candidate, 
  onUpdateStage, 
  onSetScore, 
  onScheduleInterview, 
  onHire,
  onEdit,
  onDelete,
  onView,
  isLoading = false 
}) => {
  const stageInfo = recruitmentUtils.INTERVIEW_STAGES[candidate.stage];
  const nextStages = recruitmentUtils.getNextStages(candidate.stage);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-soft border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Candidate Header */}
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-700" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {candidate.firstName} {candidate.lastName}
              </h3>
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                `bg-${stageInfo?.color}-100 text-${stageInfo?.color}-800`
              )}>
                {stageInfo?.label}
              </span>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <Mail className="h-4 w-4" />
              <span className="truncate">{candidate.email}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>{candidate.phone}</span>
              </div>
            )}
          </div>
          
          {/* Score and Feedback */}
          {candidate.score && (
            <div className="flex items-center space-x-2 mb-3">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-900">
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
            <div className="mb-3">
              <p className="text-gray-700 text-sm line-clamp-2">
                {candidate.feedback}
              </p>
            </div>
          )}
          
          {/* Application Date */}
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>Applied: {recruitmentUtils.formatDate(candidate.createdAt)}</span>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {/* Stage Progression Buttons */}
        <div className="flex items-center space-x-2">
          {nextStages.map(stage => {
            // HIRED stage should use the hire flow, not stage update
            if (stage === 'HIRED') {
              return (
                <Button
                  key={stage}
                  variant="outline"
                  size="sm"
                  onClick={() => onHire(candidate.id)}
                  disabled={isLoading}
                  className="text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  {recruitmentUtils.getStageLabel(stage)}
                </Button>
              );
            }
            return (
              <Button
                key={stage}
                variant="outline"
                size="sm"
                onClick={() => onUpdateStage({ candidateId: candidate.id, stage })}
                disabled={isLoading}
                className={cn(
                  'text-xs',
                  stage === 'REJECTED' && 'text-red-600 hover:text-red-700 hover:bg-red-50'
                )}
              >
                {recruitmentUtils.getStageLabel(stage)}
              </Button>
            );
          })}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(candidate.id)}
            disabled={isLoading}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSetScore(candidate.id)}
            disabled={isLoading}
            title="Set Score"
          >
            <Star className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onScheduleInterview(candidate.id)}
            disabled={isLoading}
            title="Schedule Interview"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(candidate.id)}
            disabled={isLoading}
            title="Edit Candidate"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          {candidate.stage === 'OFFER' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onHire(candidate.id)}
              disabled={isLoading}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Hire Candidate"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(candidate.id)}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete Candidate"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CandidateCard;
