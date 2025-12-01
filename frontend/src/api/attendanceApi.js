import apiClient from './axiosClient';

// Attendance API Service
export const attendanceApi = {
  // Basic Attendance Operations
  listAttendance: (params = {}) => {
    return apiClient.get('/hr/attendance', { params });
  },

  recordAttendance: (data) => {
    return apiClient.post('/hr/attendance', data);
  },

  updateAttendance: (id, data) => {
    return apiClient.put(`/hr/attendance/${id}`, data);
  },

  getAttendanceByEmployee: (employeeId, params = {}) => {
    return apiClient.get(`/hr/attendance/employee/${employeeId}`, { params });
  },

  // Digital Check-in/out Operations (Enhanced with location)
  checkIn: async (employeeId, data = {}) => {
    // Get user's location if available
    let locationData = {};
    if (navigator.geolocation && !data.latitude && !data.longitude) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      } catch (error) {
        console.warn('Geolocation not available:', error);
      }
    }
    
    return apiClient.post(`/hr/attendance/employee/${employeeId}/check-in`, {
      ...data,
      ...locationData,
    });
  },

  checkOut: async (employeeId, data = {}) => {
    // Get user's location if available
    let locationData = {};
    if (navigator.geolocation && !data.latitude && !data.longitude) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      } catch (error) {
        console.warn('Geolocation not available:', error);
      }
    }
    
    return apiClient.post(`/hr/attendance/employee/${employeeId}/check-out`, {
      ...data,
      ...locationData,
    });
  },

  // Leave Management Operations
  createLeaveRequest: (data) => {
    return apiClient.post('/hr/attendance/leave', data);
  },

  updateLeaveStatus: (leaveId, data) => {
    return apiClient.put(`/hr/attendance/leave/${leaveId}/status`, data);
  },

  listLeaveRequests: (params = {}) => {
    return apiClient.get('/hr/attendance/leave', { params });
  },

  // Analytics Operations
  getAttendanceSummary: (params = {}) => {
    return apiClient.get('/hr/attendance/analytics/summary', { params });
  },

  getAbsenceAnalytics: (params = {}) => {
    return apiClient.get('/hr/attendance/analytics/absence', { params });
  },

  getAdvancedAttendanceSummary: (params = {}) => {
    return apiClient.get('/hr/attendance/analytics/advanced', { params });
  },

  getAttendanceTrends: (params = {}) => {
    return apiClient.get('/hr/attendance/analytics/trends', { params });
  },

  // Work Schedule Management
  getWorkSchedule: (employeeId) => {
    return apiClient.get(`/hr/attendance/schedule/${employeeId}`);
  },

  createWorkSchedule: (data) => {
    return apiClient.post('/hr/attendance/schedule', data);
  },

  updateWorkSchedule: (employeeId, data) => {
    return apiClient.put(`/hr/attendance/schedule/${employeeId}`, data);
  },

  deleteWorkSchedule: (employeeId) => {
    return apiClient.delete(`/hr/attendance/schedule/${employeeId}`);
  },

  // Break Management
  createBreak: (data) => {
    return apiClient.post('/hr/attendance/break', data);
  },

  updateBreak: (id, data) => {
    return apiClient.put(`/hr/attendance/break/${id}`, data);
  },

  deleteBreak: (id) => {
    return apiClient.delete(`/hr/attendance/break/${id}`);
  },

  // Attendance Regularization
  createRegularization: (data) => {
    return apiClient.post('/hr/attendance/regularization', data);
  },

  updateRegularizationStatus: (id, data) => {
    return apiClient.put(`/hr/attendance/regularization/${id}/status`, data);
  },

  listRegularizations: (params = {}) => {
    return apiClient.get('/hr/attendance/regularization', { params });
  },

  // Holiday Management
  createHoliday: (data) => {
    return apiClient.post('/hr/attendance/holiday', data);
  },

  updateHoliday: (id, data) => {
    return apiClient.put(`/hr/attendance/holiday/${id}`, data);
  },

  deleteHoliday: (id) => {
    return apiClient.delete(`/hr/attendance/holiday/${id}`);
  },

  listHolidays: (params = {}) => {
    return apiClient.get('/hr/attendance/holiday', { params });
  },
};

// Attendance Constants
export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
  ON_LEAVE: 'ON_LEAVE',
  EARLY_DEPARTURE: 'EARLY_DEPARTURE',
  HALF_DAY: 'HALF_DAY',
};

export const WORK_LOCATION_TYPE = {
  OFFICE: 'OFFICE',
  REMOTE: 'REMOTE',
  HYBRID: 'HYBRID',
  FIELD: 'FIELD',
};

export const BREAK_TYPE = {
  LUNCH: 'LUNCH',
  COFFEE: 'COFFEE',
  PERSONAL: 'PERSONAL',
  OTHER: 'OTHER',
};

export const REGULARIZATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const HOLIDAY_TYPE = {
  PUBLIC: 'PUBLIC',
  COMPANY: 'COMPANY',
  REGIONAL: 'REGIONAL',
};

export const LEAVE_TYPE = {
  SICK: 'SICK',
  VACATION: 'VACATION',
  UNPAID: 'UNPAID',
  MATERNITY: 'MATERNITY',
  PATERNITY: 'PATERNITY',
  OTHER: 'OTHER',
};

export const LEAVE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

// Utility Functions
export const getAttendanceStatusColor = (status) => {
  const colors = {
    [ATTENDANCE_STATUS.PRESENT]: 'bg-green-100 text-green-800',
    [ATTENDANCE_STATUS.ABSENT]: 'bg-red-100 text-red-800',
    [ATTENDANCE_STATUS.LATE]: 'bg-yellow-100 text-yellow-800',
    [ATTENDANCE_STATUS.ON_LEAVE]: 'bg-blue-100 text-blue-800',
    [ATTENDANCE_STATUS.EARLY_DEPARTURE]: 'bg-orange-100 text-orange-800',
    [ATTENDANCE_STATUS.HALF_DAY]: 'bg-purple-100 text-purple-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getLocationTypeColor = (type) => {
  const colors = {
    [WORK_LOCATION_TYPE.OFFICE]: 'bg-blue-100 text-blue-800',
    [WORK_LOCATION_TYPE.REMOTE]: 'bg-green-100 text-green-800',
    [WORK_LOCATION_TYPE.HYBRID]: 'bg-purple-100 text-purple-800',
    [WORK_LOCATION_TYPE.FIELD]: 'bg-orange-100 text-orange-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export const getBreakTypeColor = (type) => {
  const colors = {
    [BREAK_TYPE.LUNCH]: 'bg-orange-100 text-orange-800',
    [BREAK_TYPE.COFFEE]: 'bg-amber-100 text-amber-800',
    [BREAK_TYPE.PERSONAL]: 'bg-blue-100 text-blue-800',
    [BREAK_TYPE.OTHER]: 'bg-gray-100 text-gray-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export const getRegularizationStatusColor = (status) => {
  const colors = {
    [REGULARIZATION_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
    [REGULARIZATION_STATUS.APPROVED]: 'bg-green-100 text-green-800',
    [REGULARIZATION_STATUS.REJECTED]: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getLeaveTypeColor = (type) => {
  const colors = {
    [LEAVE_TYPE.SICK]: 'bg-red-100 text-red-800',
    [LEAVE_TYPE.VACATION]: 'bg-green-100 text-green-800',
    [LEAVE_TYPE.UNPAID]: 'bg-gray-100 text-gray-800',
    [LEAVE_TYPE.MATERNITY]: 'bg-pink-100 text-pink-800',
    [LEAVE_TYPE.PATERNITY]: 'bg-blue-100 text-blue-800',
    [LEAVE_TYPE.OTHER]: 'bg-purple-100 text-purple-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export const getLeaveStatusColor = (status) => {
  const colors = {
    [LEAVE_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
    [LEAVE_STATUS.APPROVED]: 'bg-green-100 text-green-800',
    [LEAVE_STATUS.REJECTED]: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const formatTime = (time) => {
  if (!time) return '--:--';
  return new Date(time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const formatDate = (date) => {
  if (!date) return '--';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '--';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const calculateWorkHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
};

export const calculateOvertime = (workHours, standardHours = 8) => {
  return Math.max(0, workHours - standardHours);
};

export const isLate = (checkIn, expectedTime = '09:00') => {
  if (!checkIn) return false;
  const checkInTime = new Date(checkIn);
  const [hours, minutes] = expectedTime.split(':').map(Number);
  const expectedDateTime = new Date(checkInTime);
  expectedDateTime.setHours(hours, minutes, 0, 0);
  
  return checkInTime > expectedDateTime;
};

export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
};

export const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  const checkDate = new Date(date);
  return today.toDateString() === checkDate.toDateString();
};

export const isCurrentWeek = (date) => {
  if (!date) return false;
  const today = new Date();
  const checkDate = new Date(date);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  return checkDate >= startOfWeek && checkDate <= endOfWeek;
};

export const isCurrentMonth = (date) => {
  if (!date) return false;
  const today = new Date();
  const checkDate = new Date(date);
  return today.getMonth() === checkDate.getMonth() && 
         today.getFullYear() === checkDate.getFullYear();
};

export default attendanceApi;
