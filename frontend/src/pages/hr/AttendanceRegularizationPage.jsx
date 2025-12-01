import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Send, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { attendanceApi, REGULARIZATION_STATUS, getRegularizationStatusColor } from '../../api/attendanceApi';
import { formatDate, formatTime } from '../../api/attendanceApi';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../stores/useAuthStore';

/**
 * AttendanceRegularizationPage Component
 * Full page for managing attendance regularizations
 */
const AttendanceRegularizationPage = () => {
  const { user } = useAuthStore();
  const [regularizations, setRegularizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    requestedCheckIn: '',
    requestedCheckOut: '',
    reason: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadRegularizations();
  }, [filters]);

  const loadRegularizations = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        employeeId: user?.employeeId, // Filter by current user if not admin
      };
      
      const response = await attendanceApi.listRegularizations(params);
      setRegularizations(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to load regularizations');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = () => {
    loadRegularizations();
  };

  const handleSubmitRequest = async () => {
    try {
      setSubmitting(true);
      setErrors({});

      if (!formData.reason || formData.reason.length < 10) {
        setErrors({ reason: 'Reason must be at least 10 characters' });
        return;
      }

      const data = {
        employeeId: user?.employeeId,
        ...formData,
        date: new Date(formData.date).toISOString(),
        requestedCheckIn: formData.requestedCheckIn ? new Date(formData.requestedCheckIn).toISOString() : null,
        requestedCheckOut: formData.requestedCheckOut ? new Date(formData.requestedCheckOut).toISOString() : null,
      };

      await attendanceApi.createRegularization(data);
      toast.success('Regularization request submitted successfully!');
      setShowRequestModal(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        requestedCheckIn: '',
        requestedCheckOut: '',
        reason: '',
      });
      loadRegularizations();
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        setErrors(errorData.errors);
      } else {
        toast.error(errorData?.message || 'Failed to submit regularization request');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Regularization</h1>
          <p className="text-gray-600">Request and manage attendance corrections</p>
        </div>
        {user?.employeeId && (
          <Button onClick={() => setShowRequestModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Regularization
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Status</option>
              <option value={REGULARIZATION_STATUS.PENDING}>Pending</option>
              <option value={REGULARIZATION_STATUS.APPROVED}>Approved</option>
              <option value={REGULARIZATION_STATUS.REJECTED}>Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              size="sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Regularizations List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : regularizations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-soft border border-gray-200">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No regularization requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {regularizations.map((reg) => (
            <motion.div
              key={reg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-soft p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRegularizationStatusColor(reg.status)}`}>
                      {reg.status}
                    </span>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(reg.date)}</span>
                    </div>
                    {reg.requestedCheckIn && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Check-in: {formatTime(reg.requestedCheckIn)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{reg.reason}</p>
                  {reg.employee && (
                    <p className="text-sm text-gray-500">
                      Employee: {reg.employee.firstName} {reg.employee.lastName}
                    </p>
                  )}
                  {reg.approvedBy && (
                    <p className="text-sm text-gray-500 mt-1">
                      Approved by: {reg.approvedBy.firstName} {reg.approvedBy.lastName}
                    </p>
                  )}
                  {reg.rejectedReason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-800">
                        <strong>Rejection Reason:</strong> {reg.rejectedReason}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {reg.status === REGULARIZATION_STATUS.PENDING && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Awaiting Approval
                    </span>
                  )}
                  {reg.status === REGULARIZATION_STATUS.APPROVED && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {reg.status === REGULARIZATION_STATUS.REJECTED && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Request Regularization Modal */}
      {user?.employeeId && (
        <Modal
          isOpen={showRequestModal}
          onClose={() => {
            setShowRequestModal(false);
            setFormData({
              date: new Date().toISOString().split('T')[0],
              requestedCheckIn: '',
              requestedCheckOut: '',
              reason: '',
            });
            setErrors({});
          }}
          title="Request Attendance Regularization"
          size="md"
        >
          <div className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Date to Regularize
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Requested Check-in */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                Requested Check-in Time
              </label>
              <Input
                type="datetime-local"
                value={formData.requestedCheckIn}
                onChange={(e) => setFormData(prev => ({ ...prev, requestedCheckIn: e.target.value }))}
              />
            </div>

            {/* Requested Check-out */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                Requested Check-out Time
              </label>
              <Input
                type="datetime-local"
                value={formData.requestedCheckOut}
                onChange={(e) => setFormData(prev => ({ ...prev, requestedCheckOut: e.target.value }))}
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-2" />
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Please provide a detailed reason for this regularization request (minimum 10 characters)..."
                required
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.reason}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.reason.length}/500 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRequestModal(false);
                  setFormData({
                    date: new Date().toISOString().split('T')[0],
                    requestedCheckIn: '',
                    requestedCheckOut: '',
                    reason: '',
                  });
                  setErrors({});
                }}
                disabled={submitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRequest}
                disabled={submitting || !formData.reason || formData.reason.length < 10}
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
};

export default AttendanceRegularizationPage;

