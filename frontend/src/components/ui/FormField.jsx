import React from 'react';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';

/**
 * Form Field Component
 * Reusable form field with icon, label, and error handling
 */
const FormField = ({
  name,
  label,
  placeholder,
  type = 'text',
  icon: Icon,
  required = false,
  register,
  error,
  className,
  children,
  ...props
}) => {
  // If children are provided, render them (for controlled inputs)
  if (children) {
    return (
      <div className={cn('space-y-1', className)}>
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          )}
          {children}
        </div>
        
        {error && (
          <p className="text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  }

  // Otherwise, render Input with register (for react-hook-form)
  return (
    <div className={cn('space-y-1', className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}
        
        <Input
          type={type}
          placeholder={placeholder}
          className={cn(
            Icon && 'pl-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
          )}
          {...(register ? register(name) : {})}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Select Field Component
 * Reusable select field with label and error handling
 */
const SelectField = ({
  name,
  label,
  options = [],
  required = false,
  register,
  error,
  className,
  ...props
}) => {
  return (
    <div className={cn('space-y-1', className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        className={cn(
          'w-full px-3 py-2 border border-gray-300 rounded-lg',
          'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'transition-colors duration-200',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
        )}
        {...register(name)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Textarea Field Component
 * Reusable textarea field with label and error handling
 */
const TextareaField = ({
  name,
  label,
  placeholder,
  required = false,
  rows = 3,
  register,
  error,
  className,
  ...props
}) => {
  return (
    <div className={cn('space-y-1', className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <textarea
        rows={rows}
        placeholder={placeholder}
        className={cn(
          'w-full px-3 py-2 border border-gray-300 rounded-lg',
          'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'transition-colors duration-200 resize-vertical',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
        )}
        {...register(name)}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Checkbox Field Component
 * Reusable checkbox field with label and error handling
 */
const CheckboxField = ({
  name,
  label,
  description,
  register,
  error,
  className,
  ...props
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          className={cn(
            'mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded',
            'focus:ring-blue-500 focus:ring-2',
            error && 'border-red-500'
          )}
          {...register(name)}
          {...props}
        />
        
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
          {description && (
            <p className="text-xs text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * File Upload Field Component
 * Reusable file upload field with drag and drop support
 */
const FileUploadField = ({
  name,
  label,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  onFileChange,
  error,
  className,
  ...props
}) => {
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate file sizes
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        console.warn(`File ${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
        return false;
      }
      return true;
    });
    
    if (onFileChange) {
      onFileChange(validFiles);
    }
  };

  return (
    <div className={cn('space-y-1', className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          id={`file-upload-${name}`}
          {...props}
        />
        
        <label
          htmlFor={`file-upload-${name}`}
          className="cursor-pointer block"
        >
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {accept && `Accepted formats: ${accept}`}
          </p>
          <p className="text-xs text-gray-500">
            Max size: {maxSize / (1024 * 1024)}MB
          </p>
        </label>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

export {
  FormField,
  SelectField,
  TextareaField,
  CheckboxField,
  FileUploadField
};
