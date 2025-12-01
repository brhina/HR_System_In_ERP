import * as service from "../services/attendanceService.js";
import { response } from "../../../utils/response.js";

export async function listAttendance(req, res, next) {
  try {
    const data = await service.listAttendance(req.query);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function listAttendanceByEmployee(req, res, next) {
  try {
    const data = await service.listAttendance({ employeeId: req.params.employeeId, ...req.query });
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function recordAttendance(req, res, next) {
  try {
    console.log('Received attendance data:', req.body);
    const record = await service.recordAttendanceWithGuards(req.body);
    res.status(201).json(response.success(record));
  } catch (err) {
    next(err);
  }
}

export async function updateAttendance(req, res, next) {
  try {
    console.log('Updating attendance:', req.params.id, req.body);
    const record = await service.updateAttendanceWithGuards(req.params.id, req.body);
    res.json(response.success(record));
  } catch (err) {
    next(err);
  }
}

// Check-in/out for digital/biometric readiness
export async function checkIn(req, res, next) {
  try {
    const record = await service.checkInWithGuards(req.params.employeeId, req.body);
    res.status(201).json(response.success(record));
  } catch (err) {
    next(err);
  }
}

export async function checkOut(req, res, next) {
  try {
    const record = await service.checkOutWithGuards(req.params.employeeId, req.body);
    res.json(response.success(record));
  } catch (err) {
    next(err);
  }
}

// Leave management
export async function createLeaveRequest(req, res, next) {
  try {
    const created = await service.createLeaveRequestWithGuards(req.body);
    res.status(201).json(response.success(created));
  } catch (err) {
    next(err);
  }
}

export async function updateLeaveStatus(req, res, next) {
  try {
    const updated = await service.updateLeaveStatusWithGuards(req.params.id, req.body.status, req.body.approvedById);
    res.json(response.success(updated));
  } catch (err) {
    next(err);
  }
}

export async function listLeaveRequests(req, res, next) {
  try {
    const data = await service.listLeaveRequests(req.query);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

// Analytics
export async function getAttendanceSummary(req, res, next) {
  try {
    const data = await service.getAttendanceSummary(req.query);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function getAbsenceAnalytics(req, res, next) {
  try {
    const data = await service.getAbsenceAnalytics(req.query);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

// Work Schedule Management
export async function getWorkSchedule(req, res, next) {
  try {
    const data = await service.getWorkSchedule(req.params.employeeId);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function createWorkSchedule(req, res, next) {
  try {
    const data = await service.createWorkScheduleWithGuards(req.body);
    res.status(201).json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function updateWorkSchedule(req, res, next) {
  try {
    const data = await service.updateWorkScheduleWithGuards(req.params.employeeId, req.body);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function deleteWorkSchedule(req, res, next) {
  try {
    await service.deleteWorkScheduleWithGuards(req.params.employeeId);
    res.json(response.success({ message: 'Work schedule deleted successfully' }));
  } catch (err) {
    next(err);
  }
}

// Break Management
export async function createBreak(req, res, next) {
  try {
    const data = await service.createBreakWithGuards(req.body);
    res.status(201).json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function updateBreak(req, res, next) {
  try {
    const data = await service.updateBreakWithGuards(req.params.id, req.body);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function deleteBreak(req, res, next) {
  try {
    await service.deleteBreakWithGuards(req.params.id);
    res.json(response.success({ message: 'Break deleted successfully' }));
  } catch (err) {
    next(err);
  }
}

// Attendance Regularization
export async function createRegularization(req, res, next) {
  try {
    const data = await service.createRegularizationWithGuards(req.body);
    res.status(201).json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function updateRegularizationStatus(req, res, next) {
  try {
    const data = await service.updateRegularizationStatusWithGuards(
      req.params.id,
      req.body.status,
      req.body.approvedById,
      req.body.rejectedReason
    );
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function listRegularizations(req, res, next) {
  try {
    const data = await service.listRegularizations(req.query);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

// Holiday Management
export async function createHoliday(req, res, next) {
  try {
    const data = await service.createHolidayWithGuards(req.body);
    res.status(201).json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function updateHoliday(req, res, next) {
  try {
    const data = await service.updateHolidayWithGuards(req.params.id, req.body);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function deleteHoliday(req, res, next) {
  try {
    await service.deleteHolidayWithGuards(req.params.id);
    res.json(response.success({ message: 'Holiday deleted successfully' }));
  } catch (err) {
    next(err);
  }
}

export async function listHolidays(req, res, next) {
  try {
    const data = await service.listHolidays(req.query);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

// Enhanced Analytics
export async function getAdvancedAttendanceSummary(req, res, next) {
  try {
    const data = await service.getAdvancedAttendanceSummary(req.query);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function getAttendanceTrends(req, res, next) {
  try {
    const data = await service.getAttendanceTrends(req.query);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}


