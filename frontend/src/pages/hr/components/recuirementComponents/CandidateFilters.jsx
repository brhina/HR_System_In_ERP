import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../../../../components/ui/Input';
import { recruitmentUtils } from '../../../../api/recruitmentApi';

/**
 * Reusable Candidate Filters Component
 * Provides search and filter functionality for candidates
 */
const CandidateFilters = ({
  searchTerm,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  jobFilter,
  onJobFilterChange,
  jobPostings = [],
  enableJobFilter = false,
  candidatesByStage = {},
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-soft border border-gray-200 p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={stageFilter}
            onChange={(e) => onStageFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Stages</option>
            {Object.entries(recruitmentUtils.INTERVIEW_STAGES).map(([stage, info]) => (
              <option key={stage} value={stage}>
                {info.label} {candidatesByStage[stage] ? `(${candidatesByStage[stage].length})` : ''}
              </option>
            ))}
          </select>
          
          {enableJobFilter && (
            <select
              value={jobFilter}
              onChange={(e) => onJobFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Jobs</option>
              {jobPostings.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      
      {/* Filter indicators */}
      {(searchTerm || stageFilter !== 'all' || (enableJobFilter && jobFilter !== 'all')) && (
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">Active filters:</span>
          {searchTerm && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{searchTerm}"
            </span>
          )}
          {stageFilter !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Stage: {recruitmentUtils.getStageLabel(stageFilter)}
            </span>
          )}
          {enableJobFilter && jobFilter !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Job: {jobPostings.find(j => j.id === jobFilter)?.title || 'Unknown'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidateFilters;

