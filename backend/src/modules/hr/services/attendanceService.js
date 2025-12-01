import * as repo from "../repositories/attendanceRepository.js";
import * as employeeRepo from "../repositories/employeeRepository.js";
import { startOfDay, endOfDay } from "../../../utils/dateUtils.js";

export function listAttendance(query) {
  return repo.findAttendance(query);
}

export function recordAttendance(data) {
  return repo.createAttendance(data);
}

export function updateAttendance(id, data) {
  return repo.updateAttendance(id, data);
}

export function checkIn(employeeId, data) {
  return repo.checkIn(employeeId, data);
}

export function checkOut(employeeId, data) {
  return repo.checkOut(employeeId, data);
}

// Leave
export function createLeaveRequest(data) {
  return repo.createLeaveRequest(data);
}

export function updateLeaveStatus(id, status, approvedById) {
  return repo.updateLeaveStatus(id, status, approvedById);
}

export function listLeaveRequests(query) {
  return repo.listLeaveRequests(query);
}

// Analytics
export function getAttendanceSummary(query) {
  return repo.getAttendanceSummary(query);
}

export function getAbsenceAnalytics(query) {
  return repo.getAbsenceAnalytics(query);
}

// Guards aligned with employee and recruitment modules
export async function recordAttendanceWithGuards(payload) {
  const employee = await employeeRepo.findById(payload.employeeId);
  if (!employee) {
    const error = new Error(`Employee with ID ${payload.employeeId} not found`);
    error.statusCode = 404;
    error.code = 'EMPLOYEE_NOT_FOUND';
    throw error;
  }
  if (employee.status === 'TERMINATED' || employee.status === 'INACTIVE') {
    const error = new Error(`Cannot record attendance for ${employee.status} employee`);
    error.statusCode = 400;
    error.code = 'EMPLOYEE_INACTIVE';
    throw error;
  }
  return repo.createAttendance(payload);
}

export async function updateAttendanceWithGuards(id, payload) {
  // Check if attendance record exists
  const existingRecord = await repo.findById(id);
  if (!existingRecord) {
    const error = new Error(`Attendance record with ID ${id} not found`);
    error.statusCode = 404;
    error.code = 'ATTENDANCE_NOT_FOUND';
    throw error;
  }

  // If employeeId is being updated, validate the new employee
  if (payload.employeeId) {
    const employee = await employeeRepo.findById(payload.employeeId);
    if (!employee) {
      const error = new Error(`Employee with ID ${payload.employeeId} not found`);
      error.statusCode = 404;
      error.code = 'EMPLOYEE_NOT_FOUND';
      throw error;
    }
    if (employee.status === 'TERMINATED' || employee.status === 'INACTIVE') {
      const error = new Error(`Cannot update attendance for ${employee.status} employee`);
      error.statusCode = 400;
      error.code = 'EMPLOYEE_INACTIVE';
      throw error;
    }
  }

  return repo.updateAttendance(id, payload);
}

export async function checkInWithGuards(employeeId, data) {
  const employee = await employeeRepo.findById(employeeId);
  if (!employee) {
    const error = new Error(`Employee with ID ${employeeId} not found`);
    error.statusCode = 404;
    error.code = 'EMPLOYEE_NOT_FOUND';
    throw error;
  }
  if (employee.status === 'TERMINATED' || employee.status === 'INACTIVE') {
    const error = new Error(`Cannot check in ${employee.status} employee`);
    error.statusCode = 400;
    error.code = 'EMPLOYEE_INACTIVE';
    throw error;
  }
  return repo.checkIn(employeeId, data);
}

export async function checkOutWithGuards(employeeId, data) {
  const employee = await employeeRepo.findById(employeeId);
  if (!employee) {
    const error = new Error(`Employee with ID ${employeeId} not found`);
    error.statusCode = 404;
    error.code = 'EMPLOYEE_NOT_FOUND';
    throw error;
  }
  return repo.checkOut(employeeId, data);
}

export async function createLeaveRequestWithGuards(payload) {
  const employee = await employeeRepo.findById(payload.employeeId);
  if (!employee) {
    const error = new Error(`Employee with ID ${payload.employeeId} not found`);
    error.statusCode = 404;
    error.code = 'EMPLOYEE_NOT_FOUND';
    throw error;
  }
  if (payload.startDate > payload.endDate) {
    const error = new Error('startDate must be before endDate');
    error.statusCode = 400;
    error.code = 'INVALID_DATE_RANGE';
    throw error;
  }
  return repo.createLeaveRequest(payload);
}

export async function updateLeaveStatusWithGuards(id, status, approvedById) {
  // Check if leave request exists
  const leaveRequest = await repo.findLeaveRequestById(id);
  if (!leaveRequest) {
    const error = new Error(`Leave request with ID ${id} not found`);
    error.statusCode = 404;
    error.code = 'LEAVE_REQUEST_NOT_FOUND';
    throw error;
  }

  // Validate status transition
  if (leaveRequest.status !== 'PENDING') {
    const error = new Error(`Leave request is already ${leaveRequest.status}`);
    error.statusCode = 400;
    error.code = 'LEAVE_REQUEST_ALREADY_PROCESSED';
    throw error;
  }

  // Validate approver for approval
  if (status === 'APPROVED' && !approvedById) {
    const error = new Error('approvedById is required to approve');
    error.statusCode = 400;
    error.code = 'APPROVER_REQUIRED';
    throw error;
  }

  // Validate approver exists if provided
  if (approvedById) {
    const approver = await employeeRepo.findById(approvedById);
    if (!approver) {
      const error = new Error(`Approver with ID ${approvedById} not found`);
      error.statusCode = 404;
      error.code = 'APPROVER_NOT_FOUND';
      throw error;
    }
  }

  return repo.updateLeaveStatus(id, status, approvedById);
}

// Work Schedule Management
export function getWorkSchedule(employeeId) {
  return repo.getWorkSchedule(employeeId);
}

export async function createWorkScheduleWithGuards(payload) {
  const employee = await employeeRepo.findById(payload.employeeId);
  if (!employee) {
    const error = new Error(`Employee with ID ${payload.employeeId} not found`);
    error.statusCode = 404;
    error.code = 'EMPLOYEE_NOT_FOUND';
    throw error;
  }
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(payload.startTime) || !timeRegex.test(payload.endTime)) {
    const error = new Error('Invalid time format. Use HH:mm format');
    error.statusCode = 400;
    error.code = 'INVALID_TIME_FORMAT';
    throw error;
  }
  
  const existing = await repo.getWorkSchedule(payload.employeeId);
  if (existing) {
    return repo.updateWorkSchedule(payload.employeeId, payload);
  }
  
  return repo.createWorkSchedule(payload);
}

export async function updateWorkScheduleWithGuards(employeeId, payload) {
  const employee = await employeeRepo.findById(employeeId);
  if (!employee) {
    const error = new Error(`Employee with ID ${employeeId} not found`);
    error.statusCode = 404;
    error.code = 'EMPLOYEE_NOT_FOUND';
    throw error;
  }
  
  const existing = await repo.getWorkSchedule(employeeId);
  if (!existing) {
    const error = new Error(`Work schedule for employee ${employeeId} not found`);
    error.statusCode = 404;
    error.code = 'SCHEDULE_NOT_FOUND';
    throw error;
  }
  
  if (payload.startTime || payload.endTime) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (payload.startTime && !timeRegex.test(payload.startTime)) {
      const error = new Error('Invalid startTime format. Use HH:mm format');
      error.statusCode = 400;
      error.code = 'INVALID_TIME_FORMAT';
      throw error;
    }
    if (payload.endTime && !timeRegex.test(payload.endTime)) {
      const error = new Error('Invalid endTime format. Use HH:mm format');
      error.statusCode = 400;
      error.code = 'INVALID_TIME_FORMAT';
      throw error;
    }
  }
  
  return repo.updateWorkSchedule(employeeId, payload);
}

export async function deleteWorkScheduleWithGuards(employeeId) {
  const existing = await repo.getWorkSchedule(employeeId);
  if (!existing) {
    const error = new Error(`Work schedule for employee ${employeeId} not found`);
    error.statusCode = 404;
    error.code = 'SCHEDULE_NOT_FOUND';
    throw error;
  }
  return repo.deleteWorkSchedule(employeeId);
}

// Break Management
export async function createBreakWithGuards(payload) {
  const attendance = await repo.findById(payload.attendanceId);
  if (!attendance) {
    const error = new Error(`Attendance record with ID ${payload.attendanceId} not found`);
    error.statusCode = 404;
    error.code = 'ATTENDANCE_NOT_FOUND';
    throw error;
  }
  
  const breakStart = new Date(payload.startTime);
  const attendanceDate = new Date(attendance.date);
  
  if (breakStart.toDateString() !== attendanceDate.toDateString()) {
    const error = new Error('Break time must be on the same date as attendance');
    error.statusCode = 400;
    error.code = 'INVALID_BREAK_DATE';
    throw error;
  }
  
  if (payload.endTime) {
    const breakEnd = new Date(payload.endTime);
    const durationMs = breakEnd.getTime() - breakStart.getTime();
    payload.duration = Math.floor(durationMs / 1000 / 60);
  }
  
  return repo.createBreak(payload);
}

export async function updateBreakWithGuards(id, payload) {
  const existing = await repo.getBreaksByAttendance(payload.attendanceId || '');
  const breakRecord = existing.find(b => b.id === id);
  
  if (!breakRecord) {
    const error = new Error(`Break with ID ${id} not found`);
    error.statusCode = 404;
    error.code = 'BREAK_NOT_FOUND';
    throw error;
  }
  
  if (payload.endTime) {
    const startTime = payload.startTime ? new Date(payload.startTime) : new Date(breakRecord.startTime);
    const endTime = new Date(payload.endTime);
    const durationMs = endTime.getTime() - startTime.getTime();
    payload.duration = Math.floor(durationMs / 1000 / 60);
  }
  
  return repo.updateBreak(id, payload);
}

export async function deleteBreakWithGuards(id) {
  return repo.deleteBreak(id);
}

// Attendance Regularization
export async function createRegularizationWithGuards(payload) {
  const employee = await employeeRepo.findById(payload.employeeId);
  if (!employee) {
    const error = new Error(`Employee with ID ${payload.employeeId} not found`);
    error.statusCode = 404;
    error.code = 'EMPLOYEE_NOT_FOUND';
    throw error;
  }
  
  if (employee.status === 'TERMINATED' || employee.status === 'INACTIVE') {
    const error = new Error(`Cannot create regularization for ${employee.status} employee`);
    error.statusCode = 400;
    error.code = 'EMPLOYEE_INACTIVE';
    throw error;
  }
  
  const regularizationDate = new Date(payload.date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  if (regularizationDate > today) {
    const error = new Error('Cannot regularize future dates');
    error.statusCode = 400;
    error.code = 'FUTURE_DATE_NOT_ALLOWED';
    throw error;
  }
  
  const existing = await repo.listRegularizations({
    employeeId: payload.employeeId,
    status: 'PENDING',
    dateFrom: payload.date,
    dateTo: payload.date
  });
  
  if (existing.length > 0) {
    const error = new Error('A pending regularization already exists for this date');
    error.statusCode = 400;
    error.code = 'DUPLICATE_REGULARIZATION';
    throw error;
  }
  
  return repo.createRegularization(payload);
}

export async function updateRegularizationStatusWithGuards(id, status, approvedById, rejectedReason = null) {
  const regularization = await repo.findRegularizationById(id);
  if (!regularization) {
    const error = new Error(`Regularization with ID ${id} not found`);
    error.statusCode = 404;
    error.code = 'REGULARIZATION_NOT_FOUND';
    throw error;
  }
  
  if (regularization.status !== 'PENDING') {
    const error = new Error(`Regularization is already ${regularization.status}`);
    error.statusCode = 400;
    error.code = 'REGULARIZATION_ALREADY_PROCESSED';
    throw error;
  }
  
  if (status === 'APPROVED' && !approvedById) {
    const error = new Error('approvedById is required to approve regularization');
    error.statusCode = 400;
    error.code = 'APPROVER_REQUIRED';
    throw error;
  }
  
  if (status === 'REJECTED' && !rejectedReason) {
    const error = new Error('rejectedReason is required to reject regularization');
    error.statusCode = 400;
    error.code = 'REJECTION_REASON_REQUIRED';
    throw error;
  }
  
  if (approvedById) {
    const approver = await employeeRepo.findById(approvedById);
    if (!approver) {
      const error = new Error(`Approver with ID ${approvedById} not found`);
      error.statusCode = 404;
      error.code = 'APPROVER_NOT_FOUND';
      throw error;
    }
  }
  
  if (status === 'APPROVED') {
    const regDate = new Date(regularization.date);
    const dateStart = startOfDay(regDate);
    const dateEnd = endOfDay(regDate);
    
    const existingAttendance = await repo.findAttendance({
      employeeId: regularization.employeeId,
      dateFrom: dateStart,
      dateTo: dateEnd
    });
    
    const attendanceData = {
      employeeId: regularization.employeeId,
      date: regularization.date,
      checkIn: regularization.requestedCheckIn,
      checkOut: regularization.requestedCheckOut,
      status: 'PRESENT',
      isRegularized: true,
      regularizationId: id,
      notes: `Regularized: ${regularization.reason}`
    };
    
    if (existingAttendance.length > 0) {
      await repo.updateAttendance(existingAttendance[0].id, attendanceData);
    } else {
      await repo.createAttendance(attendanceData);
    }
  }
  
  return repo.updateRegularizationStatus(id, status, approvedById, rejectedReason);
}

export function listRegularizations(query) {
  return repo.listRegularizations(query);
}

// Holiday Management
export async function createHolidayWithGuards(payload) {
  const holidayDate = new Date(payload.date);
  if (isNaN(holidayDate.getTime())) {
    const error = new Error('Invalid date format');
    error.statusCode = 400;
    error.code = 'INVALID_DATE';
    throw error;
  }
  
  const existing = await repo.isHoliday(payload.date);
  if (existing && existing.name === payload.name) {
    const error = new Error('Holiday with this name and date already exists');
    error.statusCode = 400;
    error.code = 'DUPLICATE_HOLIDAY';
    throw error;
  }
  
  return repo.createHoliday(payload);
}

export async function updateHolidayWithGuards(id, payload) {
  const existing = await repo.findHolidayById(id);
  if (!existing) {
    const error = new Error(`Holiday with ID ${id} not found`);
    error.statusCode = 404;
    error.code = 'HOLIDAY_NOT_FOUND';
    throw error;
  }
  
  return repo.updateHoliday(id, payload);
}

export async function deleteHolidayWithGuards(id) {
  const existing = await repo.findHolidayById(id);
  if (!existing) {
    const error = new Error(`Holiday with ID ${id} not found`);
    error.statusCode = 404;
    error.code = 'HOLIDAY_NOT_FOUND';
    throw error;
  }
  
  return repo.deleteHoliday(id);
}

export function listHolidays(query) {
  return repo.listHolidays(query);
}

export function isHoliday(date) {
  return repo.isHoliday(date);
}

// Enhanced Analytics
export function getAdvancedAttendanceSummary(query) {
  return repo.getAdvancedAttendanceSummary(query);
}

export function getAttendanceTrends(query) {
  return repo.getAttendanceTrends(query);
}


