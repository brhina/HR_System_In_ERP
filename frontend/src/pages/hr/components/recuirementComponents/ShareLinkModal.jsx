import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { recruitmentApi } from '../../../../api/recruitmentApi';

/**
 * Share Link Modal Component
 * Allows users to generate and copy public application links for job postings
 */
const ShareLinkModal = ({ isOpen, onClose, jobPosting, onLinkGenerated }) => {
  const [publicLink, setPublicLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen && jobPosting) {
      // If job posting already has a public token, generate the link
      if (jobPosting.publicToken) {
        const link = `${window.location.origin}/apply/${jobPosting.publicToken}`;
        setPublicLink(link);
      } else {
        // Generate token if it doesn't exist
        generatePublicLink();
      }
    }
  }, [isOpen, jobPosting]);

  const generatePublicLink = async () => {
    if (!jobPosting?.id) return;
    
    setIsGenerating(true);
    try {
      const response = await recruitmentApi.generatePublicLink(jobPosting.id);
      const updatedJob = response.data.data;
      const link = `${window.location.origin}/apply/${updatedJob.publicToken}`;
      setPublicLink(link);
      
      if (onLinkGenerated) {
        onLinkGenerated(updatedJob);
      }
      
      toast.success('Public link generated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate public link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!publicLink) return;
    
    try {
      await navigator.clipboard.writeText(publicLink);
      setIsCopied(true);
      toast.success('Link copied to clipboard!');
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleClose = () => {
    setPublicLink('');
    setIsCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Share2 className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Share Job Posting</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Share this link with candidates to allow them to apply for <strong>{jobPosting?.title}</strong>
            </p>
          </div>

          {isGenerating ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 text-primary-600 animate-spin mr-2" />
              <span className="text-gray-600">Generating public link...</span>
            </div>
          ) : publicLink ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={publicLink}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                />
              <Button
                onClick={copyToClipboard}
                variant={isCopied ? "success" : "primary"}
                size="sm"
                className="flex-shrink-0"
                disabled={!publicLink}
              >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This link allows anyone to apply for this position without logging in. 
                  Share it via email, social media, or job boards.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No public link available</p>
              <Button onClick={generatePublicLink} loading={isGenerating}>
                Generate Public Link
              </Button>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShareLinkModal;

