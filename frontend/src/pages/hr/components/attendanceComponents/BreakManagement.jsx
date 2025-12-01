import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Coffee, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { attendanceApi, BREAK_TYPE, getBreakTypeColor } from '../../../../api/attendanceApi';
import { toast } from 'react-hot-toast';
import { formatTime } from '../../../../api/attendanceApi';

/**
 * BreakManagement Component
 * Manage breaks for an attendance record
 */
export const BreakManagement = ({ attendanceId, breaks = [], onUpdate, isOpen, onClose }) => {
  const [localBreaks, setLocalBreaks] = useState(breaks);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBreak, setEditingBreak] = useState(null);
  const [formData, setFormData] = useState({
    type: BREAK_TYPE.LUNCH,
    startTime: '',
    endTime: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalBreaks(breaks);
  }, [breaks]);

  const handleAddBreak = async () => {
    try {
      setSaving(true);
      const data = {
        attendanceId,
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
      };

      await attendanceApi.createBreak(data);
      toast.success('Break added successfully!');
      setShowAddModal(false);
      setFormData({
        type: BREAK_TYPE.LUNCH,
        startTime: '',
        endTime: '',
        notes: '',
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to add break');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBreak = async (id) => {
    try {
      setSaving(true);
      const data = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
      };

      await attendanceApi.updateBreak(id, data);
      toast.success('Break updated successfully!');
      setEditingBreak(null);
      setFormData({
        type: BREAK_TYPE.LUNCH,
        startTime: '',
        endTime: '',
        notes: '',
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to update break');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBreak = async (id) => {
    if (!window.confirm('Are you sure you want to delete this break?')) {
      return;
    }

    try {
      await attendanceApi.deleteBreak(id);
      toast.success('Break deleted successfully!');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to delete break');
    }
  };

  const openEditModal = (breakRecord) => {
    setEditingBreak(breakRecord.id);
    setFormData({
      type: breakRecord.type,
      startTime: new Date(breakRecord.startTime).toISOString().slice(0, 16),
      endTime: breakRecord.endTime ? new Date(breakRecord.endTime).toISOString().slice(0, 16) : '',
      notes: breakRecord.notes || '',
    });
    setShowAddModal(true);
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return null;
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    return Math.floor(diffMs / (1000 * 60)); // Duration in minutes
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Break Management"
        size="lg"
      >
        <div className="space-y-4">
          {/* Add Break Button */}
          <Button
            onClick={() => {
              setEditingBreak(null);
              setFormData({
                type: BREAK_TYPE.LUNCH,
                startTime: new Date().toISOString().slice(0, 16),
                endTime: '',
                notes: '',
              });
              setShowAddModal(true);
            }}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Break
          </Button>

          {/* Breaks List */}
          {localBreaks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Coffee className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No breaks recorded</p>
            </div>
          ) : (
            <div className="space-y-3">
              {localBreaks.map((breakRecord) => {
                const duration = calculateDuration(breakRecord.startTime, breakRecord.endTime);
                return (
                  <motion.div
                    key={breakRecord.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getBreakTypeColor(breakRecord.type)}`}>
                            {breakRecord.type}
                          </span>
                          {duration && (
                            <span className="text-sm text-gray-600">
                              {duration} min
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Start: {formatTime(breakRecord.startTime)}</span>
                          </div>
                          {breakRecord.endTime && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>End: {formatTime(breakRecord.endTime)}</span>
                            </div>
                          )}
                          {breakRecord.notes && (
                            <p className="text-sm text-gray-500 mt-2">{breakRecord.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(breakRecord)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteBreak(breakRecord.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
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

      {/* Add/Edit Break Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingBreak(null);
        }}
        title={editingBreak ? 'Edit Break' : 'Add Break'}
        size="md"
      >
        <div className="space-y-4">
          {/* Break Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Break Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(BREAK_TYPE).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.type === type
                      ? getBreakTypeColor(type)
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <Input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              required
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time (optional)
            </label>
            <Input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Additional notes about this break..."
            />
          </div>

          {/* Duration Display */}
          {formData.startTime && formData.endTime && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Duration: {calculateDuration(formData.startTime, formData.endTime)} minutes
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setEditingBreak(null);
              }}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={() => editingBreak ? handleUpdateBreak(editingBreak) : handleAddBreak()}
              disabled={saving || !formData.startTime}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : editingBreak ? 'Update Break' : 'Add Break'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BreakManagement;

