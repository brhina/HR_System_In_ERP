import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, Save, Loader2 } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { cn } from '../../../../../lib/utils';

/**
 * Form Status Bar Component
 * Shows form status, auto-save indicator, and validation state
 */
const FormStatusBar = ({ 
  formState, 
  onSave, 
  onCancel, 
  className 
}) => {
  const { 
    isSubmitting, 
    isValid, 
    isDirty, 
    hasErrors, 
    submitError, 
    lastSaved, 
    autoSaveEnabled 
  } = formState;

  const getStatusIcon = () => {
    if (isSubmitting) return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    if (hasErrors) return <AlertCircle className="h-4 w-4 text-red-600" />;
    if (isDirty && isValid) return <Save className="h-4 w-4 text-yellow-600" />;
    if (lastSaved) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isSubmitting) return 'Saving...';
    if (hasErrors) return 'Please fix errors';
    if (isDirty && isValid) return 'Unsaved changes';
    if (lastSaved) return `Saved ${lastSaved.toLocaleTimeString()}`;
    return 'All changes saved';
  };

  const getStatusColor = () => {
    if (isSubmitting) return 'text-blue-600';
    if (hasErrors) return 'text-red-600';
    if (isDirty && isValid) return 'text-yellow-600';
    if (lastSaved) return 'text-green-600';
    return 'text-gray-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white border-t border-gray-200 px-6 py-4',
        'flex items-center justify-between',
        className
      )}
    >
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <span className={cn('text-sm font-medium', getStatusColor())}>
          {getStatusText()}
        </span>
        
        {autoSaveEnabled && (
          <span className="text-xs text-gray-500">
            (Auto-save enabled)
          </span>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        
        <Button
          size="sm"
          onClick={onSave}
          disabled={!isValid || isSubmitting || !isDirty}
          loading={isSubmitting}
        >
          Save Changes
        </Button>
      </div>
    </motion.div>
  );
};

/**
 * Form Error Display Component
 * Shows form submission errors and validation errors
 */
const FormErrorDisplay = ({ 
  submitError, 
  validationErrors = {}, 
  className 
}) => {
  const hasErrors = submitError || Object.keys(validationErrors).length > 0;

  if (!hasErrors) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-3', className)}
    >
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Submission Error
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {submitError}
              </p>
            </div>
          </div>
        </div>
      )}

      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Validation Errors
              </h3>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                {(() => {
                  // Flatten nested error objects
                  const flattenErrors = (errors, prefix = '') => {
                    const result = [];
                    for (const [key, value] of Object.entries(errors)) {
                      const fieldName = prefix ? `${prefix}.${key}` : key;
                      
                      if (value && typeof value === 'object') {
                        // Check if it's an error object with a message
                        if ('message' in value && typeof value.message === 'string') {
                          result.push({ field: fieldName, message: value.message });
                        } else if (Array.isArray(value)) {
                          // Handle array of errors
                          value.forEach((error, index) => {
                            if (typeof error === 'string') {
                              result.push({ field: `${fieldName}[${index}]`, message: error });
                            } else if (error?.message) {
                              result.push({ field: `${fieldName}[${index}]`, message: error.message });
                            }
                          });
                        } else {
                          // Recursively flatten nested objects
                          result.push(...flattenErrors(value, fieldName));
                        }
                      } else if (typeof value === 'string') {
                        result.push({ field: fieldName, message: value });
                      }
                    }
                    return result;
                  };
                  
                  const flatErrors = flattenErrors(validationErrors);
                  
                  return flatErrors.map(({ field, message }) => (
                    <li key={field}>
                      • <strong>{field}:</strong> {message}
                    </li>
                  ));
                })()}
              </ul>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

/**
 * Form Loading Skeleton Component
 * Shows loading state for form sections
 */
const FormLoadingSkeleton = ({ sections = 3, className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: sections }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-soft p-6"
        >
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, fieldIndex) => (
                <div key={fieldIndex} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Form Success Message Component
 * Shows success message after form submission
 */
const FormSuccessMessage = ({ 
  message = 'Employee saved successfully!', 
  onClose,
  className 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'bg-green-50 border border-green-200 rounded-lg p-4',
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-green-800">
            Success!
          </h3>
          <p className="text-sm text-green-700 mt-1">
            {message}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-green-600 hover:text-green-800"
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export {
  FormStatusBar,
  FormErrorDisplay,
  FormLoadingSkeleton,
  FormSuccessMessage
};
