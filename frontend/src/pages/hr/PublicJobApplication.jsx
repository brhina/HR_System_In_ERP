import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Upload, Loader2, FileText, X, Briefcase, MapPin, Users } from 'lucide-react';
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
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
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

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Validate file
  const validateFile = (file) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a PDF or Word document';
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setErrors(prev => ({ ...prev, resume: error }));
        return;
      }
      setResumeFile(file);
      setErrors(prev => ({ ...prev, resume: undefined }));
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setErrors(prev => ({ ...prev, resume: error }));
        return;
      }
      setResumeFile(file);
      setErrors(prev => ({ ...prev, resume: undefined }));
    }
  };

  // Remove file
  const handleRemoveFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrors(prev => ({ ...prev, resume: undefined }));
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 mx-auto text-primary-600 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Loading job details...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !jobPosting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border border-red-100"
        >
          <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error?.response?.data?.message || 'The job posting you are looking for does not exist or is no longer available.'}
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Go to Homepage
          </Button>
        </motion.div>
      </div>
    );
  }

  // Success state (after submission)
  if (submitApplication.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="text-center max-w-md mx-auto p-10 bg-white rounded-2xl shadow-2xl border border-green-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="h-20 w-20 mx-auto text-green-500 mb-6" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Application Submitted!</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Thank you for applying to <strong className="text-primary-600">{jobPosting.title}</strong>. We have received your application and will review it shortly.
          </p>
          <Button onClick={() => window.location.href = '/'} className="px-8">
            Close
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Briefcase className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">{jobPosting.title}</h1>
          <div className="flex items-center justify-center gap-4 text-gray-600">
            {jobPosting.department?.name && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="text-lg font-medium">{jobPosting.department.name}</span>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Job Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary-600" />
                Job Description
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                  {jobPosting.description}
                </p>
              </div>
            </div>
            
            {/* Required Skills */}
            {jobPosting.skills && jobPosting.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-3">
                  {jobPosting.skills.map((jobSkill) => (
                    <motion.span
                      key={jobSkill.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-4 py-2 bg-gradient-to-r from-primary-100 to-primary-50 text-primary-800 rounded-full text-sm font-semibold border border-primary-200 shadow-sm"
                    >
                      {jobSkill.skill.name}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Application Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-8 h-fit"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Apply for this Position</h2>
              <p className="text-gray-600 mb-6">Fill out the form below to submit your application</p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <FormField label="First Name" error={errors.firstName} required>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    error={errors.firstName}
                    className="h-11"
                  />
                </FormField>

                <FormField label="Last Name" error={errors.lastName} required>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    error={errors.lastName}
                    className="h-11"
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
                    className="h-11"
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
                    className="h-11"
                  />
                </FormField>

                <FormField label="Resume" error={errors.resume} required>
                  <div className="space-y-3">
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative flex items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                        isDragging
                          ? 'border-primary-500 bg-primary-50 scale-105'
                          : resumeFile
                          ? 'border-green-300 bg-green-50'
                          : errors.resume
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50'
                      }`}
                    >
                      <label className="flex flex-col items-center justify-center w-full py-8 px-4 cursor-pointer">
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                        />
                        {resumeFile ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-3">
                              <FileText className="w-10 h-10 text-green-600" />
                              <div className="text-left">
                                <p className="text-sm font-semibold text-gray-900">{resumeFile.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(resumeFile.size)}</p>
                              </div>
                              <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="ml-2 p-1 rounded-full hover:bg-red-100 transition-colors"
                                aria-label="Remove file"
                              >
                                <X className="w-5 h-5 text-red-600" />
                              </button>
                            </div>
                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              File uploaded successfully
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <div className={`p-4 rounded-full mb-3 ${isDragging ? 'bg-primary-100' : 'bg-gray-100'}`}>
                              <Upload className={`w-8 h-8 ${isDragging ? 'text-primary-600' : 'text-gray-500'}`} />
                            </div>
                            <p className="mb-1 text-sm font-semibold text-gray-700">
                              {isDragging ? 'Drop your resume here' : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {errors.resume && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        {errors.resume}
                      </p>
                    )}
                  </div>
                </FormField>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold mt-6"
                  disabled={isSubmitting || submitApplication.isLoading}
                  loading={isSubmitting || submitApplication.isLoading}
                >
                  {isSubmitting || submitApplication.isLoading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PublicJobApplication;

