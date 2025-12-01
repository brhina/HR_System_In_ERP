import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Send,
  X,
  Eye,
  Check,
  X as XIcon
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { attendanceApi, REGULARIZATION_STATUS, getRegularizationStatusColor } from '../../../../api/attendanceApi';
import { toast } from 'react-hot-toast';
import { formatDate, formatTime } from '../../../../api/attendanceApi';

/**
 * AttendanceRegularization Component
 * Request and manage attendance corrections
 */
export const AttendanceRegularization = ({ employeeId, isOpen, onClose, onUpdate }) => {
  const [regularizations, setRegularizations] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRegularization, setSelectedRegularization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    requestedCheckIn: '',
    requestedCheckOut: '',
    reason: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && employeeId) {
      loadRegularizations();
    }
  }, [isOpen, employeeId]);

  const loadRegularizations = async () => {
    try {
      setLoading(true);
      const response = await attendanceApi.listRegularizations({
        employeeId,
        take: 50,
      });
      setRegularizations(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to load regularizations');
    } finally {
      setLoading(false);
    }
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
        employeeId,
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
      if (onUpdate) onUpdate();
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

  const handleApproveReject = async (id, status, rejectedReason = null) => {
    try {
      setSubmitting(true);
      await attendanceApi.updateRegularizationStatus(id, {
        status,
        rejectedReason,
      });
      toast.success(`Regularization ${status.toLowerCase()} successfully!`);
      setShowDetailsModal(false);
      loadRegularizations();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} regularization`);
    } finally {
      setSubmitting(false);
    }
  };

  const openDetailsModal = (regularization) => {
    setSelectedRegularization(regularization);
    setShowDetailsModal(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Attendance Regularization"
        size="lg"
      >
        <div className="space-y-4">
          {/* Request New Regularization Button */}
          <Button
            onClick={() => {
              setFormData({
                date: new Date().toISOString().split('T')[0],
                requestedCheckIn: '',
                requestedCheckOut: '',
                reason: '',
              });
              setErrors({});
              setShowRequestModal(true);
            }}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Request Regularization
          </Button>

          {/* Regularizations List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : regularizations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No regularization requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {regularizations.map((reg) => (
                <motion.div
                  key={reg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openDetailsModal(reg)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRegularizationStatusColor(reg.status)}`}>
                          {reg.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatDate(reg.date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{reg.reason}</p>
                      {reg.requestedCheckIn && (
                        <div className="mt-2 text-xs text-gray-500">
                          Check-in: {formatTime(reg.requestedCheckIn)}
                          {reg.requestedCheckOut && ` | Check-out: ${formatTime(reg.requestedCheckOut)}`}
                        </div>
                      )}
                    </div>
                    <Eye className="h-5 w-5 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Request Regularization Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
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
              onClick={() => setShowRequestModal(false)}
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

      {/* Details Modal */}
      {selectedRegularization && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRegularization(null);
          }}
          title="Regularization Details"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getRegularizationStatusColor(selectedRegularization.status)}`}>
                {selectedRegularization.status}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Date:</span>
              <span className="ml-2 text-sm text-gray-600">{formatDate(selectedRegularization.date)}</span>
            </div>
            {selectedRegularization.requestedCheckIn && (
              <div>
                <span className="text-sm font-medium text-gray-700">Requested Check-in:</span>
                <span className="ml-2 text-sm text-gray-600">{formatTime(selectedRegularization.requestedCheckIn)}</span>
              </div>
            )}
            {selectedRegularization.requestedCheckOut && (
              <div>
                <span className="text-sm font-medium text-gray-700">Requested Check-out:</span>
                <span className="ml-2 text-sm text-gray-600">{formatTime(selectedRegularization.requestedCheckOut)}</span>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-gray-700">Reason:</span>
              <p className="mt-1 text-sm text-gray-600">{selectedRegularization.reason}</p>
            </div>
            {selectedRegularization.rejectedReason && (
              <div>
                <span className="text-sm font-medium text-gray-700">Rejection Reason:</span>
                <p className="mt-1 text-sm text-red-600">{selectedRegularization.rejectedReason}</p>
              </div>
            )}
            {selectedRegularization.approvedBy && (
              <div>
                <span className="text-sm font-medium text-gray-700">Approved By:</span>
                <span className="ml-2 text-sm text-gray-600">
                  {selectedRegularization.approvedBy.firstName} {selectedRegularization.approvedBy.lastName}
                </span>
              </div>
            )}

            {/* Action Buttons for Managers */}
            {selectedRegularization.status === REGULARIZATION_STATUS.PENDING && (
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedRegularization(null);
                  }}
                >
                  <XIcon className="h-4 w-4 mr-2" />
                  Close
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    const reason = window.prompt('Please provide a reason for rejection:');
                    if (reason) {
                      handleApproveReject(selectedRegularization.id, REGULARIZATION_STATUS.REJECTED, reason);
                    }
                  }}
                  disabled={submitting}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproveReject(selectedRegularization.id, REGULARIZATION_STATUS.APPROVED)}
                  disabled={submitting}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

export default AttendanceRegularization;

