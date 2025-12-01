import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import useAttendanceStore from '../../../stores/useAttendanceStore';
import useAuthStore from '../../../stores/useAuthStore';
import { ATTENDANCE_STATUS } from '../../../api/attendanceApi';
import { employeeApi } from '../../../api/employeeApi';

/**
 * Custom hook for attendance management logic
 */
export const useAttendanceLogic = () => {
  const [viewMode, setViewMode] = useState('table');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRegularizationModal, setShowRegularizationModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const { user } = useAuthStore();
  const {
    attendance,
    currentEmployeeAttendance,
    attendanceSummary,
    absenceAnalytics,
    loading,
    error,
    fetchAttendance,
    fetchEmployeeAttendance,
    fetchAttendanceSummary,
    fetchAbsenceAnalytics,
    checkIn,
    checkOut,
    recordAttendance,
    updateAttendance,
    getTodayAttendance,
    getCurrentWeekAttendance,
    getCurrentMonthAttendance
  } = useAttendanceStore();

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Auto-refresh every 5 minutes
      if (Date.now() - lastUpdate.getTime() > 5 * 60 * 1000) {
        loadAttendanceData();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [lastUpdate]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadAttendanceData();
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await employeeApi.listEmployees();
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const loadAttendanceData = async () => {
    try {
      setIsRefreshing(true);
      const promises = [
        fetchAttendance({ take: 100 }),
        fetchAttendanceSummary({ from: new Date(new Date().setDate(1)).toISOString() }),
        fetchAbsenceAnalytics({ from: new Date(new Date().setDate(1)).toISOString() })
      ];

      if (user?.employeeId) {
        promises.push(
          fetchEmployeeAttendance(user.employeeId, { 
            dateFrom: new Date(new Date().setDate(1)).toISOString(),
            dateTo: new Date().toISOString()
          })
        );
      }

      await Promise.all(promises);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCheckIn = async (employeeId, data) => {
    try {
      if (!employeeId) {
        toast.error('Unable to check in: No employee ID found');
        return;
      }
      
      await checkIn(employeeId, data);
      await loadAttendanceData();
      toast.success('Checked in successfully!');
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Failed to check in');
    }
  };

  const handleCheckOut = async (employeeId, data) => {
    try {
      if (!employeeId) {
        toast.error('Unable to check out: No employee ID found');
        return;
      }
      
      await checkOut(employeeId, data);
      await loadAttendanceData();
      toast.success('Checked out successfully!');
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error('Failed to check out');
    }
  };

  const handleEditAttendance = async (data) => {
    try {
      setIsEditing(true);
      await updateAttendance(editingRecord.id, {
        ...data,
        checkIn: data.checkIn ? new Date(data.checkIn).toISOString() : null,
        checkOut: data.checkOut ? new Date(data.checkOut).toISOString() : null,
      });
      await loadAttendanceData();
      toast.success('Attendance updated successfully!');
      setShowEditModal(false);
      setEditingRecord(null);
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Failed to update attendance');
    } finally {
      setIsEditing(false);
    }
  };

  const handleOpenEditModal = (record) => {
    setEditingRecord(record);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingRecord(null);
    setIsEditing(false);
  };

  const handleRecordAttendance = async (data) => {
    try {
      setIsRecording(true);
      await recordAttendance(data);
      await loadAttendanceData();
      toast.success('Attendance recorded successfully!');
      setShowRecordModal(false);
    } catch (error) {
      console.error('Error recording attendance:', error);
      toast.error('Failed to record attendance');
    } finally {
      setIsRecording(false);
    }
  };

  const handleDateClick = (date, attendanceRecord) => {
    setSelectedDate(date);
    // You can implement additional logic here, like showing a modal with details
  };

  // Calculate statistics
  const todayAttendance = getTodayAttendance();
  const weekAttendance = getCurrentWeekAttendance();
  const monthAttendance = getCurrentMonthAttendance();

  const stats = {
    presentToday: todayAttendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length,
    absentToday: todayAttendance.filter(a => a.status === ATTENDANCE_STATUS.ABSENT).length,
    lateToday: todayAttendance.filter(a => a.status === ATTENDANCE_STATUS.LATE).length,
    onLeaveToday: todayAttendance.filter(a => a.status === ATTENDANCE_STATUS.ON_LEAVE).length,
    totalEmployees: attendanceSummary?.total || 0,
    attendanceRate: attendanceSummary ? 
      Math.round((attendanceSummary.present / attendanceSummary.total) * 100) : 0,
    avgWorkHours: monthAttendance.length > 0 ? 
      monthAttendance.reduce((sum, a) => {
        if (a.checkIn && a.checkOut) {
          const diffMs = new Date(a.checkOut).getTime() - new Date(a.checkIn).getTime();
          return sum + (diffMs / (1000 * 60 * 60));
        }
        return sum;
      }, 0) / monthAttendance.length : 0,
    punctualityRate: weekAttendance.length > 0 ?
      Math.round((weekAttendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length / weekAttendance.length) * 100) : 0,
    overtimeHours: monthAttendance.reduce((sum, a) => sum + (a.overtime || 0), 0),
    totalWorkDays: monthAttendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length
  };

  return {
    // State
    viewMode,
    selectedDate,
    isRefreshing,
    showRecordModal,
    showAnalyticsModal,
    showEditModal,
    showScheduleModal,
    showRegularizationModal,
    showHolidayModal,
    editingRecord,
    isEditing,
    isRecording,
    isOnline,
    lastUpdate,
    
    // Data
    user,
    attendance,
    currentEmployeeAttendance,
    attendanceSummary,
    absenceAnalytics,
    employees,
    loading,
    error,
    stats,
    
    // Actions
    setViewMode,
    setShowRecordModal,
    setShowAnalyticsModal,
    setShowScheduleModal,
    setShowRegularizationModal,
    setShowHolidayModal,
    loadAttendanceData,
    handleCheckIn,
    handleCheckOut,
    handleEditAttendance,
    handleRecordAttendance,
    handleOpenEditModal,
    handleCloseEditModal,
    handleDateClick,
  };
};

export default useAttendanceLogic;
