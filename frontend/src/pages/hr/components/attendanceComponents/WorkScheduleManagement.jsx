import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  Save, 
  Edit, 
  Trash2, 
  Plus, 
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { attendanceApi } from '../../../../api/attendanceApi';
import { toast } from 'react-hot-toast';

/**
 * WorkScheduleManagement Component
 * Manage employee work schedules
 */
export const WorkScheduleManagement = ({ employeeId, employeeName, onClose, isOpen }) => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    startTime: '09:00',
    endTime: '18:00',
    breakDuration: 60,
    workingDays: [1, 2, 3, 4, 5], // Monday to Friday
    isFlexible: false,
    gracePeriod: 15,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && employeeId) {
      loadSchedule();
    }
  }, [isOpen, employeeId]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const response = await attendanceApi.getWorkSchedule(employeeId);
      if (response.data?.data) {
        const sched = response.data.data;
        setSchedule(sched);
        setFormData({
          startTime: sched.startTime || '09:00',
          endTime: sched.endTime || '18:00',
          breakDuration: sched.breakDuration || 60,
          workingDays: sched.workingDays || [1, 2, 3, 4, 5],
          isFlexible: sched.isFlexible || false,
          gracePeriod: sched.gracePeriod || 15,
          timezone: sched.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load work schedule');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrors({});

      const data = {
        employeeId,
        ...formData,
      };

      let response;
      if (schedule) {
        response = await attendanceApi.updateWorkSchedule(employeeId, data);
      } else {
        response = await attendanceApi.createWorkSchedule(data);
      }

      toast.success('Work schedule saved successfully!');
      setSchedule(response.data?.data);
      if (onClose) onClose();
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        setErrors(errorData.errors);
      } else {
        toast.error(errorData?.message || 'Failed to save work schedule');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this work schedule?')) {
      return;
    }

    try {
      setSaving(true);
      await attendanceApi.deleteWorkSchedule(employeeId);
      toast.success('Work schedule deleted successfully!');
      setSchedule(null);
      if (onClose) onClose();
    } catch (error) {
      toast.error('Failed to delete work schedule');
    } finally {
      setSaving(false);
    }
  };

  const toggleWorkingDay = (day) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day].sort()
    }));
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Work Schedule - ${employeeName || 'Employee'}`}
      size="lg"
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Working Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                Start Time
              </label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                End Time
              </label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Break Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Break Duration (minutes)
            </label>
            <Input
              type="number"
              min="0"
              max="480"
              value={formData.breakDuration}
              onChange={(e) => setFormData(prev => ({ ...prev, breakDuration: parseInt(e.target.value) || 0 }))}
            />
          </div>

          {/* Working Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Working Days
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {dayNames.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleWorkingDay(index)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.workingDays.includes(index)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium">{day.slice(0, 3)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grace Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grace Period (minutes)
            </label>
            <Input
              type="number"
              min="0"
              max="120"
              value={formData.gracePeriod}
              onChange={(e) => setFormData(prev => ({ ...prev, gracePeriod: parseInt(e.target.value) || 0 }))}
            />
            <p className="mt-1 text-sm text-gray-500">
              Allowed late arrival time before marking as late
            </p>
          </div>

          {/* Flexible Hours */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFlexible"
              checked={formData.isFlexible}
              onChange={(e) => setFormData(prev => ({ ...prev, isFlexible: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isFlexible" className="text-sm font-medium text-gray-700">
              Flexible Working Hours
            </label>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <Input
              type="text"
              value={formData.timezone}
              onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
              placeholder="UTC"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {schedule && (
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={saving}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Schedule
              </Button>
            )}
            <div className="flex items-center space-x-3 ml-auto">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Schedule'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default WorkScheduleManagement;

