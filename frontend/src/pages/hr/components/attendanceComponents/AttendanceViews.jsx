import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Filter, 
  Search, 
  Download, 
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { Table } from '../../../../components/ui/Table';
import { 
  ATTENDANCE_STATUS, 
  WORK_LOCATION_TYPE,
  formatTime, 
  formatDate, 
  formatDateTime,
  calculateWorkHours,
  calculateOvertime,
  isLate,
  getAttendanceStatusColor,
  getLocationTypeColor
} from '../../../../api/attendanceApi';

/**
 * AttendanceTable Component
 * Displays attendance records in a table format with filtering and actions
 */
export const AttendanceTable = ({ 
  attendance, 
  onEdit, 
  onDelete, 
  loading = false,
  showActions = true,
  showEmployee = true 
}) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = !filters.search || 
      `${record.employee?.firstName} ${record.employee?.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
      record.employee?.email?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || record.status === filters.status;
    
    const matchesDateFrom = !filters.dateFrom || new Date(record.date) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(record.date) <= new Date(filters.dateTo);
    
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const handleSelectRow = (recordId) => {
    setSelectedRows(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredAttendance.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredAttendance.map(record => record.id));
    }
  };

  const columns = [
    ...(showEmployee ? [{
      key: 'employee',
      label: 'Employee',
      render: (record) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {record.employee?.firstName} {record.employee?.lastName}
            </p>
            <p className="text-xs text-gray-500">{record.employee?.email}</p>
          </div>
        </div>
      ),
    }] : []),
    {
      key: 'date',
      label: 'Date',
      render: (record) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{formatDate(record.date)}</p>
          <p className="text-xs text-gray-500">
            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (record) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceStatusColor(record.status)}`}>
          {record.status.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'checkIn',
      label: 'Check In',
      render: (record) => (
        <div>
          <p className="text-sm text-gray-900">
            {record.checkIn ? formatTime(record.checkIn) : '--:--'}
          </p>
          {record.checkIn && isLate(record.checkIn) && (
            <p className="text-xs text-yellow-600 font-medium">Late</p>
          )}
        </div>
      ),
    },
    {
      key: 'checkOut',
      label: 'Check Out',
      render: (record) => (
        <p className="text-sm text-gray-900">
          {record.checkOut ? formatTime(record.checkOut) : '--:--'}
        </p>
      ),
    },
    {
      key: 'workHours',
      label: 'Work Hours',
      render: (record) => {
        const workHours = record.workHours || calculateWorkHours(record.checkIn, record.checkOut);
        const overtime = record.overtime || calculateOvertime(workHours);
        
        return (
          <div>
            <p className="text-sm text-gray-900">{workHours.toFixed(2)}h</p>
            {overtime > 0 && (
              <p className="text-xs text-orange-600 font-medium">+{overtime.toFixed(2)}h OT</p>
            )}
            {record.breaks && record.breaks.length > 0 && (
              <p className="text-xs text-blue-600 font-medium">{record.breaks.length} break(s)</p>
            )}
          </div>
        );
      },
    },
    {
      key: 'location',
      label: 'Location',
      render: (record) => (
        <div>
          {record.locationType && (
            <span className={`px-2 py-1 rounded text-xs font-medium ${getLocationTypeColor(record.locationType)}`}>
              {record.locationType}
            </span>
          )}
          {record.location && (
            <p className="text-xs text-gray-500 mt-1 truncate max-w-[150px]" title={record.location}>
              {record.location}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      render: (record) => (
        <div className="space-y-1">
          {record.lateByMinutes && record.lateByMinutes > 0 && (
            <p className="text-xs text-yellow-600 font-medium">
              Late by {record.lateByMinutes} min
            </p>
          )}
          {record.earlyByMinutes && record.earlyByMinutes > 0 && (
            <p className="text-xs text-orange-600 font-medium">
              Early by {record.earlyByMinutes} min
            </p>
          )}
          {record.isRegularized && (
            <p className="text-xs text-blue-600 font-medium">
              Regularized
            </p>
          )}
        </div>
      ),
    },
    ...(showActions ? [{
      key: 'actions',
      label: 'Actions',
      render: (record) => (
        <div className="flex items-center space-x-2">
          {record.breaks && record.breaks.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              title="View Breaks"
              className="text-blue-600 hover:text-blue-700"
            >
              <Coffee className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(record)}
            title="Edit Attendance"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(record.id)}
            title="Delete Attendance"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="bg-white rounded-xl shadow-soft border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
            <p className="text-sm text-gray-600">
              {filteredAttendance.length} of {attendance.length} records
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsFilterModalOpen(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by employee name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table
          data={filteredAttendance}
          columns={columns}
          loading={loading}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          selectedRows={selectedRows}
          emptyMessage="No attendance records found"
        />
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedRows.length} record{selectedRows.length > 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                Bulk Edit
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Attendance Records"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value={ATTENDANCE_STATUS.PRESENT}>Present</option>
              <option value={ATTENDANCE_STATUS.ABSENT}>Absent</option>
              <option value={ATTENDANCE_STATUS.LATE}>Late</option>
              <option value={ATTENDANCE_STATUS.ON_LEAVE}>On Leave</option>
              <option value={ATTENDANCE_STATUS.EARLY_DEPARTURE}>Early Departure</option>
              <option value={ATTENDANCE_STATUS.HALF_DAY}>Half Day</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date From
            </label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date To
            </label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setFilters({ search: '', status: '', dateFrom: '', dateTo: '' })}
            >
              Clear Filters
            </Button>
            <Button onClick={() => setIsFilterModalOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/**
 * AttendanceCalendar Component
 * Calendar view for attendance records
 */
export const AttendanceCalendar = ({ attendance, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAttendanceForDate = (date) => {
    if (!date) return null;
    return attendance.find(record => 
      new Date(record.date).toDateString() === date.toDateString()
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ATTENDANCE_STATUS.PRESENT:
        return 'bg-green-100 text-green-800';
      case ATTENDANCE_STATUS.ABSENT:
        return 'bg-red-100 text-red-800';
      case ATTENDANCE_STATUS.LATE:
        return 'bg-yellow-100 text-yellow-800';
      case ATTENDANCE_STATUS.ON_LEAVE:
        return 'bg-blue-100 text-blue-800';
      case ATTENDANCE_STATUS.EARLY_DEPARTURE:
        return 'bg-orange-100 text-orange-800';
      case ATTENDANCE_STATUS.HALF_DAY:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth(-1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth(1)}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const attendanceRecord = getAttendanceForDate(day);
          
          return (
            <div
              key={index}
              className={`
                aspect-square flex flex-col items-center justify-center text-sm cursor-pointer
                hover:bg-gray-50 rounded-lg transition-colors
                ${day ? 'text-gray-900' : 'text-gray-300'}
                ${day && day.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''}
              `}
              onClick={() => day && onDateClick(day, attendanceRecord)}
            >
              {day && (
                <>
                  <span className="font-medium">{day.getDate()}</span>
                  {attendanceRecord && (
                    <div className={`w-2 h-2 rounded-full mt-1 ${getStatusColor(attendanceRecord.status).split(' ')[0]}`} />
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default {
  AttendanceTable,
  AttendanceCalendar,
};
