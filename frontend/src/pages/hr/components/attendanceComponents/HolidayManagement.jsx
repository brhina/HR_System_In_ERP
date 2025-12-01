import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { attendanceApi, HOLIDAY_TYPE } from '../../../../api/attendanceApi';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../../../api/attendanceApi';

/**
 * HolidayManagement Component
 * Manage company holidays
 */
export const HolidayManagement = ({ isOpen, onClose, onUpdate }) => {
  const [holidays, setHolidays] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: HOLIDAY_TYPE.PUBLIC,
    isRecurring: false,
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    type: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadHolidays();
    }
  }, [isOpen, filters]);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.type) params.type = filters.type;

      const response = await attendanceApi.listHolidays(params);
      setHolidays(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrors({});

      if (!formData.name) {
        setErrors({ name: 'Holiday name is required' });
        return;
      }
      if (!formData.date) {
        setErrors({ date: 'Date is required' });
        return;
      }

      const data = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      };

      let response;
      if (editingHoliday) {
        response = await attendanceApi.updateHoliday(editingHoliday.id, data);
      } else {
        response = await attendanceApi.createHoliday(data);
      }

      toast.success(`Holiday ${editingHoliday ? 'updated' : 'created'} successfully!`);
      setShowAddModal(false);
      setEditingHoliday(null);
      setFormData({
        name: '',
        date: '',
        type: HOLIDAY_TYPE.PUBLIC,
        isRecurring: false,
        description: '',
      });
      loadHolidays();
      if (onUpdate) onUpdate();
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        setErrors(errorData.errors);
      } else {
        toast.error(errorData?.message || `Failed to ${editingHoliday ? 'update' : 'create'} holiday`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) {
      return;
    }

    try {
      await attendanceApi.deleteHoliday(id);
      toast.success('Holiday deleted successfully!');
      loadHolidays();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to delete holiday');
    }
  };

  const openEditModal = (holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: new Date(holiday.date).toISOString().split('T')[0],
      type: holiday.type,
      isRecurring: holiday.isRecurring,
      description: holiday.description || '',
    });
    setShowAddModal(true);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Holiday Management"
      size="lg"
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
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
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Types</option>
              {Object.values(HOLIDAY_TYPE).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Holiday Button */}
        <Button
          onClick={() => {
            setEditingHoliday(null);
            setFormData({
              name: '',
              date: '',
              type: HOLIDAY_TYPE.PUBLIC,
              isRecurring: false,
              description: '',
            });
            setErrors({});
            setShowAddModal(true);
          }}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Holiday
        </Button>

        {/* Holidays List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : holidays.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No holidays found</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {holidays.map((holiday) => (
              <motion.div
                key={holiday.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">{holiday.name}</h3>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {holiday.type}
                      </span>
                      {holiday.isRecurring && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Recurring
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {formatDate(holiday.date)}
                    </div>
                    {holiday.description && (
                      <p className="text-sm text-gray-500">{holiday.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(holiday)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(holiday.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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

      {/* Add/Edit Holiday Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingHoliday(null);
        }}
        title={editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
        size="md"
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Holiday Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., New Year's Day"
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.date}
              </p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Holiday Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(HOLIDAY_TYPE).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.type === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recurring */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
              Recurring Yearly
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Optional description..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setEditingHoliday(null);
              }}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.date}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : editingHoliday ? 'Update Holiday' : 'Add Holiday'}
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
};

export default HolidayManagement;

