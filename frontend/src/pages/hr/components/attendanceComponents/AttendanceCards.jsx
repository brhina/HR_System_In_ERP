import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User,
  MapPin,
  Smartphone,
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Coffee,
  FileText
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { 
  ATTENDANCE_STATUS, 
  WORK_LOCATION_TYPE,
  formatTime, 
  formatDate, 
  calculateWorkHours, 
  calculateOvertime,
  isLate,
  getLocationTypeColor
} from '../../../../api/attendanceApi';

/**
 * Enhanced CheckInOutCard Component
 * Quick check-in/out interface with location and device tracking
 */
export const CheckInOutCard = ({ employeeId, currentAttendance, onCheckIn, onCheckOut, loading }) => {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [location, setLocation] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
        }
      );
    }

    // Monitor network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      await onCheckIn(employeeId, { 
        timestamp: new Date().toISOString(),
        location,
        device: 'web',
        userAgent: navigator.userAgent
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setIsCheckingOut(true);
    try {
      await onCheckOut(employeeId, { 
        timestamp: new Date().toISOString(),
        location,
        device: 'web',
        userAgent: navigator.userAgent
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const isCheckedIn = currentAttendance?.checkIn && !currentAttendance?.checkOut;
  const isCheckedOut = currentAttendance?.checkOut;
  const workHours = calculateWorkHours(currentAttendance?.checkIn, currentAttendance?.checkOut);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-soft p-6 border border-gray-200"
    >
      <div className="text-center">
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
          <p className="text-sm text-gray-600">{formatDate(new Date())}</p>
        </div>

        <div className="space-y-3">
          {!isCheckedIn && !isCheckedOut && (
            <div className="space-y-3">
              <Button
                onClick={handleCheckIn}
                disabled={loading || isCheckingIn || !isOnline}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
              >
                {isCheckingIn ? 'Checking In...' : 'Check In'}
              </Button>
              {!isOnline && (
                <p className="text-xs text-red-600">Offline - Check-in unavailable</p>
              )}
            </div>
          )}

          {isCheckedIn && (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Checked In</span>
                </div>
                <p className="text-sm text-green-700">
                  {formatTime(currentAttendance.checkIn)}
                </p>
                {location && (
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    <MapPin className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">Location tracked</span>
                  </div>
                )}
              </div>
              <Button
                onClick={handleCheckOut}
                disabled={loading || isCheckingOut || !isOnline}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
              >
                {isCheckingOut ? 'Checking Out...' : 'Check Out'}
              </Button>
            </div>
          )}

          {isCheckedOut && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <XCircle className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Checked Out</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">
                  In: {formatTime(currentAttendance.checkIn)}
                </p>
                <p className="text-sm text-gray-700">
                  Out: {formatTime(currentAttendance.checkOut)}
                </p>
                <div className="flex items-center justify-center space-x-2 pt-1 border-t border-gray-200">
                  <Activity className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-600">
                    {workHours.toFixed(2)}h worked
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Enhanced AttendanceStatsCard Component
 * Displays attendance statistics with trends and animations
 */
export const AttendanceStatsCard = ({ title, value, icon: Icon, color = 'blue', trend = null, subtitle = null }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    red: 'text-red-600 bg-red-50 border-red-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200',
  };

  const getTrendIcon = () => {
    if (trend === null) return null;
    if (trend > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <Activity className="h-3 w-3 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (trend === null) return 'text-gray-600';
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-soft p-6 border border-gray-200 hover:shadow-medium transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
          )}
          {trend !== null && (
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <p className={`text-xs font-medium ${getTrendColor()}`}>
                {trend > 0 ? '+' : ''}{trend}% from last period
              </p>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Enhanced AttendanceCard Component
 * Displays attendance information with improved design and functionality
 */
export const AttendanceCard = ({ attendance, onEdit, showActions = true }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    status: attendance.status,
    checkIn: attendance.checkIn ? new Date(attendance.checkIn).toISOString().slice(0, 16) : '',
    checkOut: attendance.checkOut ? new Date(attendance.checkOut).toISOString().slice(0, 16) : '',
  });

  const workHours = calculateWorkHours(attendance.checkIn, attendance.checkOut);
  const overtime = calculateOvertime(workHours);
  const isLateArrival = isLate(attendance.checkIn);

  const getStatusIcon = (status) => {
    switch (status) {
      case ATTENDANCE_STATUS.PRESENT:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case ATTENDANCE_STATUS.ABSENT:
        return <XCircle className="h-4 w-4 text-red-600" />;
      case ATTENDANCE_STATUS.LATE:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case ATTENDANCE_STATUS.ON_LEAVE:
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case ATTENDANCE_STATUS.EARLY_DEPARTURE:
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case ATTENDANCE_STATUS.HALF_DAY:
        return <Clock className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ATTENDANCE_STATUS.PRESENT:
        return 'bg-green-100 text-green-800 border-green-200';
      case ATTENDANCE_STATUS.ABSENT:
        return 'bg-red-100 text-red-800 border-red-200';
      case ATTENDANCE_STATUS.LATE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ATTENDANCE_STATUS.ON_LEAVE:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSave = () => {
    onEdit(attendance.id, editData);
    setIsEditModalOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-xl shadow-soft p-6 border border-gray-200 hover:shadow-medium transition-all duration-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon(attendance.status)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {formatDate(attendance.date)}
              </h3>
              <p className="text-sm text-gray-600">
                {attendance.employee?.firstName} {attendance.employee?.lastName}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(attendance.status)}`}>
            {attendance.status.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Check In:</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {attendance.checkIn ? formatTime(attendance.checkIn) : '--:--'}
              {isLateArrival && (
                <span className="ml-2 text-xs text-yellow-600 font-medium">(Late)</span>
              )}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Check Out:</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {attendance.checkOut ? formatTime(attendance.checkOut) : '--:--'}
            </p>
          </div>
        </div>

        {attendance.checkIn && attendance.checkOut && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Work Hours:</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {attendance.workHours ? attendance.workHours.toFixed(2) : workHours.toFixed(2)}h
              </p>
            </div>
            {(attendance.overtime || overtime > 0) && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-gray-600">Overtime:</span>
                </div>
                <p className="text-sm font-medium text-orange-600">
                  {(attendance.overtime || overtime).toFixed(2)}h
                </p>
              </div>
            )}
          </div>
        )}

        {/* Location Information */}
        {(attendance.location || attendance.locationType) && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Location:</span>
            </div>
            {attendance.locationType && (
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-1 ${getLocationTypeColor(attendance.locationType)}`}>
                {attendance.locationType}
              </span>
            )}
            {attendance.location && (
              <p className="text-sm text-gray-700 mt-1">{attendance.location}</p>
            )}
          </div>
        )}

        {/* Additional Details */}
        <div className="space-y-2 mb-4">
          {attendance.lateByMinutes && attendance.lateByMinutes > 0 && (
            <div className="flex items-center space-x-2 text-xs">
              <AlertCircle className="h-3 w-3 text-yellow-600" />
              <span className="text-yellow-600 font-medium">
                Late by {attendance.lateByMinutes} minutes
              </span>
            </div>
          )}
          {attendance.earlyByMinutes && attendance.earlyByMinutes > 0 && (
            <div className="flex items-center space-x-2 text-xs">
              <AlertCircle className="h-3 w-3 text-orange-600" />
              <span className="text-orange-600 font-medium">
                Early departure by {attendance.earlyByMinutes} minutes
              </span>
            </div>
          )}
          {attendance.breaks && attendance.breaks.length > 0 && (
            <div className="flex items-center space-x-2 text-xs">
              <CoffeeIcon className="h-3 w-3 text-blue-600" />
              <span className="text-blue-600 font-medium">
                {attendance.breaks.length} break(s) recorded
              </span>
            </div>
          )}
          {attendance.isRegularized && (
            <div className="flex items-center space-x-2 text-xs">
              <FileText className="h-3 w-3 text-purple-600" />
              <span className="text-purple-600 font-medium">
                Regularized attendance
              </span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit
            </Button>
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Attendance"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={editData.status}
              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={ATTENDANCE_STATUS.PRESENT}>Present</option>
              <option value={ATTENDANCE_STATUS.ABSENT}>Absent</option>
              <option value={ATTENDANCE_STATUS.LATE}>Late</option>
              <option value={ATTENDANCE_STATUS.ON_LEAVE}>On Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check In Time
            </label>
            <Input
              type="datetime-local"
              value={editData.checkIn}
              onChange={(e) => setEditData({ ...editData, checkIn: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check Out Time
            </label>
            <Input
              type="datetime-local"
              value={editData.checkOut}
              onChange={(e) => setEditData({ ...editData, checkOut: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default {
  AttendanceCard,
  CheckInOutCard,
  AttendanceStatsCard,
};