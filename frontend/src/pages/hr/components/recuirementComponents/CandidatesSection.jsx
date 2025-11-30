import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Filter, 
  Search,
  TrendingUp,
  Calendar,
  Star
} from 'lucide-react';

import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import CandidateCard from './CandidateCard';
import { recruitmentUtils } from '../../../../api/recruitmentApi';

/**
 * Candidates Section Component
 * Manages candidate display, filtering, and actions
 */
const CandidatesSection = ({ 
  candidates = [],
  onAddCandidate,
  onUpdateStage,
  onSetScore,
  onScheduleInterview,
  onHire,
  onEditCandidate,
  onDeleteCandidate,
  onViewCandidate,
  isLoading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  
  // Filter candidates based on search and filters
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      // Search filter
      const matchesSearch = !searchTerm || 
        `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Stage filter
      const matchesStage = stageFilter === 'all' || candidate.stage === stageFilter;
      
      // Score filter
      const matchesScore = scoreFilter === 'all' || 
        (scoreFilter === 'excellent' && candidate.score >= 80) ||
        (scoreFilter === 'good' && candidate.score >= 60 && candidate.score < 80) ||
        (scoreFilter === 'fair' && candidate.score >= 40 && candidate.score < 60) ||
        (scoreFilter === 'poor' && candidate.score < 40);
      
      return matchesSearch && matchesStage && matchesScore;
    });
  }, [candidates, searchTerm, stageFilter, scoreFilter]);
  
  // Group candidates by stage for analytics
  const candidatesByStage = useMemo(() => {
    const groups = {};
    candidates.forEach(candidate => {
      if (!groups[candidate.stage]) {
        groups[candidate.stage] = [];
      }
      groups[candidate.stage].push(candidate);
    });
    return groups;
  }, [candidates]);
  
  // Calculate statistics
  const stats = useMemo(() => {
    const total = candidates.length;
    const scored = candidates.filter(c => c.score !== null && c.score !== undefined).length;
    const averageScore = scored > 0 
      ? Math.round(candidates.reduce((sum, c) => sum + (c.score || 0), 0) / scored)
      : 0;
    
    return { total, scored, averageScore };
  }, [candidates]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-soft border border-gray-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Candidates</h2>
          <p className="text-sm text-gray-600">
            {filteredCandidates.length} of {candidates.length} candidates
          </p>
        </div>
        
        <Button onClick={onAddCandidate} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>
      
      {/* Statistics */}
      {candidates.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Candidates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.scored}</div>
            <div className="text-sm text-gray-600">Scored</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.averageScore}</div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
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
            {Object.entries(recruitmentUtils.INTERVIEW_STAGES).map(([stage, info]) => (
              <option key={stage} value={stage}>
                {info.label} ({candidatesByStage[stage]?.length || 0})
              </option>
            ))}
          </select>
          
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Scores</option>
            <option value="excellent">Excellent (80+)</option>
            <option value="good">Good (60-79)</option>
            <option value="fair">Fair (40-59)</option>
            <option value="poor">Poor (&lt;40)</option>
          </select>
        </div>
      </div>
      
      {/* Candidates Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
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
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {candidates.length === 0 ? 'No Candidates Yet' : 'No Candidates Found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {candidates.length === 0 
              ? 'Get started by adding candidates to this job posting'
              : 'Try adjusting your search or filters'
            }
          </p>
          {candidates.length === 0 && (
            <Button onClick={onAddCandidate}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Candidate
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
                onUpdateStage={onUpdateStage}
                onSetScore={onSetScore}
                onScheduleInterview={onScheduleInterview}
                onHire={onHire}
                onEdit={onEditCandidate}
                onDelete={onDeleteCandidate}
                onView={onViewCandidate}
                isLoading={isLoading}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default CandidatesSection;
