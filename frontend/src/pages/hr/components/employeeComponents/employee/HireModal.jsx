import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Building, 
  DollarSign, 
  Calendar, 
  FileText,
  Save,
  X,
  CheckCircle
} from 'lucide-react';

import { Button } from '../../../../../components/ui/Button';
import { Modal } from '../../../../../components/ui/Modal';
import { Input } from '../../../../../components/ui/Input';
import { recruitmentUtils } from '../../../../../api/recruitmentApi';
import { cn } from '../../../../../lib/utils';
import { useQuery } from '@tanstack/react-query';
import employeeApi from '../../../../../api/employeeApi';
import ManagerSelector from '../ManagerSelector';

/**
 * Hire Modal Component-
 * Handles the hiring process for candidates
 */
const HireModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  candidate,
  jobPosting,
  departments = [],
  managers: propManagers = [],
  isLoading = false 
}) => {
  // Fetch managers if not provided
  const { data: fetchedManagers = [] } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      const response = await employeeApi.listManagers();
      return response.data.data || [];
    },
    enabled: isOpen && propManagers.length === 0,
  });

  const managers = propManagers.length > 0 ? propManagers : fetchedManagers;

  const [formData, setFormData] = useState({
    candidateId: '',
    jobType: 'FULL_TIME',
    salary: '',
    managerId: '',
    startDate: '',
    departmentId: '',
    contractType: 'PERMANENT',
    probationPeriod: 90,
    benefits: '',
    notes: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (candidate) {
      setFormData(prev => ({
        ...prev,
        candidateId: candidate.id,
        startDate: new Date().toISOString().split('T')[0],
        departmentId: jobPosting?.departmentId || prev.departmentId,
      }));
    }
  }, [candidate, jobPosting]);
  
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.salary || formData.salary <= 0) {
      newErrors.salary = 'Salary is required and must be greater than 0';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    // Manager is optional, so no validation needed
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const hireData = {
        ...formData,
        salary: Number(formData.salary),
        probationPeriod: Number(formData.probationPeriod),
      };
      await onSubmit(hireData);
      onClose();
    } catch (error) {
      console.error('Error hiring candidate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Hire Candidate: ${candidate?.firstName} ${candidate?.lastName}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employment Details */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Employment Details</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type *
              </label>
              <select
                value={formData.jobType}
                onChange={(e) => handleChange('jobType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Type
              </label>
              <select
                value={formData.contractType}
                onChange={(e) => handleChange('contractType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="PERMANENT">Permanent</option>
                <option value="TEMPORARY">Temporary</option>
                <option value="FIXED_TERM">Fixed Term</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => handleChange('departmentId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="">Select department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            
            <ManagerSelector
              value={formData.managerId}
              onChange={(managerId) => handleChange('managerId', managerId || '')}
              managers={managers}
              label="Manager"
              required={false}
              error={errors.managerId}
              disabled={isSubmitting}
              showEmptyOption={true}
            />
          </div>
        </div>
        
        {/* Compensation */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Compensation</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Salary *
              </label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={formData.salary}
                onChange={(e) => handleChange('salary', e.target.value)}
                placeholder="50000"
                className={errors.salary && 'border-red-500'}
                disabled={isSubmitting}
              />
              {errors.salary && (
                <p className="text-sm text-red-600 mt-1">{errors.salary}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Probation Period (days)
              </label>
              <Input
                type="number"
                min="0"
                max="365"
                value={formData.probationPeriod}
                onChange={(e) => handleChange('probationPeriod', e.target.value)}
                placeholder="90"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Benefits Package
            </label>
            <textarea
              value={formData.benefits}
              onChange={(e) => handleChange('benefits', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              placeholder="Health insurance, dental, vision, 401k, etc."
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        {/* Start Date */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Start Date</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employment Start Date *
            </label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={errors.startDate && 'border-red-500'}
              disabled={isSubmitting}
            />
            {errors.startDate && (
              <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>
            )}
          </div>
        </div>
        
        {/* Additional Notes */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              placeholder="Any additional notes about the hiring decision..."
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Hire Candidate
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default HireModal;
