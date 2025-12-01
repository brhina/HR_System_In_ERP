import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { ATTENDANCE_STATUS, WORK_LOCATION_TYPE } from '../../../../api/attendanceApi';

/**
 * AttendanceEditForm Component
 * Form for editing attendance records with validation and real-time feedback
 */
export const AttendanceEditForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  attendanceRecord, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    date: '',
    checkIn: '',
    checkOut: '',
    status: ATTENDANCE_STATUS.PRESENT,
    notes: '',
    location: '',
    locationType: WORK_LOCATION_TYPE.OFFICE,
    overtime: 0,
    workHours: 0
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Initialize form data when attendance record changes
  useEffect(() => {
    if (attendanceRecord) {
      setFormData({
        date: attendanceRecord.date ? new Date(attendanceRecord.date).toISOString().split('T')[0] : '',
        checkIn: attendanceRecord.checkIn ? new Date(attendanceRecord.checkIn).toISOString().slice(0, 16) : '',
        checkOut: attendanceRecord.checkOut ? new Date(attendanceRecord.checkOut).toISOString().slice(0, 16) : '',
        status: attendanceRecord.status || ATTENDANCE_STATUS.PRESENT,
        notes: attendanceRecord.notes || '',
        location: attendanceRecord.location || '',
        locationType: attendanceRecord.locationType || WORK_LOCATION_TYPE.OFFICE,
        overtime: attendanceRecord.overtime || 0,
        workHours: attendanceRecord.workHours || 0
      });
    }
  }, [attendanceRecord]);

  // Validation rules
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'date':
        if (!value) {
          newErrors.date = 'Date is required';
        } else if (new Date(value) > new Date()) {
          newErrors.date = 'Date cannot be in the future';
        } else {
          delete newErrors.date;
        }
        break;
      
      case 'checkIn':
        if (value && formData.checkOut && new Date(value) >= new Date(formData.checkOut)) {
          newErrors.checkIn = 'Check-in time must be before check-out time';
        } else {
          delete newErrors.checkIn;
        }
        break;
      
      case 'checkOut':
        if (value && formData.checkIn && new Date(value) <= new Date(formData.checkIn)) {
          newErrors.checkOut = 'Check-out time must be after check-in time';
        } else {
          delete newErrors.checkOut;
        }
        break;
      
      case 'overtime':
        if (value < 0) {
          newErrors.overtime = 'Overtime cannot be negative';
        } else {
          delete newErrors.overtime;
        }
        break;
      
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Validate field if it has been touched
    if (touched[name]) {
      validateField(name, newValue);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate all fields
    const isValid = Object.keys(formData).every(key => validateField(key, formData[key]));
    
    if (isValid) {
      // Calculate work hours if both check-in and check-out are provided
      let workHours = 0;
      if (formData.checkIn && formData.checkOut) {
        const diffMs = new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime();
        workHours = diffMs / (1000 * 60 * 60); // Convert to hours
      }

      const submitData = {
        ...formData,
        workHours,
        // Convert date strings to ISO format
        date: new Date(formData.date).toISOString(),
        checkIn: formData.checkIn ? new Date(formData.checkIn).toISOString() : null,
        checkOut: formData.checkOut ? new Date(formData.checkOut).toISOString() : null,
      };

      onSubmit(submitData);
    }
  };

  const handleClose = () => {
    setFormData({
      date: '',
      checkIn: '',
      checkOut: '',
      status: ATTENDANCE_STATUS.PRESENT,
      notes: '',
      location: '',
      overtime: 0
    });
    setErrors({});
    setTouched({});
    onClose();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case ATTENDANCE_STATUS.PRESENT:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case ATTENDANCE_STATUS.ABSENT:
        return <XCircle className="h-4 w-4 text-red-600" />;
      case ATTENDANCE_STATUS.LATE:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case ATTENDANCE_STATUS.ON_LEAVE:
        return <CalendarIcon className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ATTENDANCE_STATUS.PRESENT:
        return 'border-green-200 bg-green-50';
      case ATTENDANCE_STATUS.ABSENT:
        return 'border-red-200 bg-red-50';
      case ATTENDANCE_STATUS.LATE:
        return 'border-yellow-200 bg-yellow-50';
      case ATTENDANCE_STATUS.ON_LEAVE:
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Attendance Record"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Info */}
        {attendanceRecord?.employee && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <h3 className="font-medium text-gray-900">
                  {attendanceRecord.employee.firstName} {attendanceRecord.employee.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  {attendanceRecord.employee.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-2" />
            Date
          </label>
          <Input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.date ? 'border-red-300 focus:border-red-500' : ''}
            required
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.date}
            </p>
          )}
        </div>

        {/* Time Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Check-in */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 inline mr-2" />
              Check-in Time
            </label>
            <Input
              type="datetime-local"
              name="checkIn"
              value={formData.checkIn}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.checkIn ? 'border-red-300 focus:border-red-500' : ''}
            />
            {errors.checkIn && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.checkIn}
              </p>
            )}
          </div>

          {/* Check-out */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 inline mr-2" />
              Check-out Time
            </label>
            <Input
              type="datetime-local"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.checkOut ? 'border-red-300 focus:border-red-500' : ''}
            />
            {errors.checkOut && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.checkOut}
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CheckCircle className="h-4 w-4 inline mr-2" />
            Status
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.values(ATTENDANCE_STATUS).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.status === status
                    ? getStatusColor(status)
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {getStatusIcon(status)}
                  <span className="text-sm font-medium capitalize">
                    {status.replace('_', ' ').toLowerCase()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Location
            </label>
            <Input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Office address, Remote, Client site..."
            />
          </div>

          {/* Location Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Location Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(WORK_LOCATION_TYPE).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, locationType: type }))}
                  className={`p-2 rounded-lg border-2 transition-all text-sm ${
                    formData.locationType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overtime and Work Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Overtime */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 inline mr-2" />
              Overtime Hours
            </label>
            <Input
              type="number"
              name="overtime"
              value={formData.overtime}
              onChange={handleChange}
              onBlur={handleBlur}
              min="0"
              step="0.5"
              className={errors.overtime ? 'border-red-300 focus:border-red-500' : ''}
            />
            {errors.overtime && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.overtime}
              </p>
            )}
          </div>

          {/* Work Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 inline mr-2" />
              Work Hours
            </label>
            <Input
              type="number"
              name="workHours"
              value={formData.workHours}
              onChange={handleChange}
              onBlur={handleBlur}
              min="0"
              step="0.5"
              placeholder="Auto-calculated if check-in/out provided"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Additional notes about this attendance record..."
          />
        </div>

        {/* Work Hours Display */}
        {formData.checkIn && formData.checkOut && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                Calculated Work Hours: {(
                  (new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / 
                  (1000 * 60 * 60)
                ).toFixed(2)} hours
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || Object.keys(errors).length > 0}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AttendanceEditForm;
