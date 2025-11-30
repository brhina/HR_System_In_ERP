import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Upload, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FormField } from '../../components/ui/FormField';
import apiClient from '../../api/axiosClient';

/**
 * Public Job Application Page
 * Allows external users to apply for jobs via a shareable link
 */
const PublicJobApplication = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resumeUrl: '',
  });
  
  const [resumeFile, setResumeFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch job posting details
  const { data: jobPosting, isLoading, error } = useQuery({
    queryKey: ['publicJobPosting', token],
    queryFn: async () => {
      const response = await apiClient.get(`/hr/recruitment/public/jobs/${token}`);
      return response.data.data;
    },
    enabled: !!token,
    retry: false,
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          resume: 'Please upload a PDF or Word document',
        }));
        return;
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          resume: 'File size must be less than 10MB',
        }));
        return;
      }
      setResumeFile(file);
      setErrors(prev => ({
        ...prev,
        resume: undefined,
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!resumeFile && !formData.resumeUrl) {
      newErrors.resume = 'Please upload your resume or provide a resume URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit application
  const submitApplication = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', data.firstName);
      formDataToSend.append('lastName', data.lastName);
      formDataToSend.append('email', data.email);
      formDataToSend.append('phone', data.phone);
      if (data.resumeUrl) {
        formDataToSend.append('resumeUrl', data.resumeUrl);
      }
      if (resumeFile) {
        formDataToSend.append('resume', resumeFile);
      }
      
      const response = await apiClient.post(
        `/hr/recruitment/public/jobs/${token}/apply`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      setIsSubmitting(false);
      // Show success message
      setTimeout(() => {
        // Could redirect to a thank you page or show success state
      }, 2000);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to submit application';
      toast.error(errorMessage);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    submitApplication.mutate(formData);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto text-primary-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !jobPosting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error?.response?.data?.message || 'The job posting you are looking for does not exist or is no longer available.'}
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  // Success state (after submission)
  if (submitApplication.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg"
        >
          <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for applying to <strong>{jobPosting.title}</strong>. We have received your application and will review it shortly.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Close
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{jobPosting.title}</h1>
          <p className="text-lg text-gray-600">{jobPosting.department?.name}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Job Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{jobPosting.description}</p>
            </div>
            
            {/* Required Skills */}
            {jobPosting.skills && jobPosting.skills.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {jobPosting.skills.map((jobSkill) => (
                    <span
                      key={jobSkill.id}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                    >
                      {jobSkill.skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Application Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Apply for this Position</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="First Name" error={errors.firstName} required>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  error={errors.firstName}
                />
              </FormField>

              <FormField label="Last Name" error={errors.lastName} required>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  error={errors.lastName}
                />
              </FormField>

              <FormField label="Email" error={errors.email} required>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  error={errors.email}
                />
              </FormField>

              <FormField label="Phone" error={errors.phone} required>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  error={errors.phone}
                />
              </FormField>

              <FormField label="Resume" error={errors.resume} required>
                <div className="space-y-2">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  {resumeFile && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {resumeFile.name}
                    </p>
                  )}
                  {errors.resume && (
                    <p className="text-sm text-red-600">{errors.resume}</p>
                  )}
                </div>
              </FormField>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PublicJobApplication;

