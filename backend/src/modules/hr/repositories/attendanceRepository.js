import { prisma } from "../../../config/db.js";
import { dateRange, startOfDay, endOfDay } from "../../../utils/dateUtils.js";

export function findAttendance({ employeeId, dateFrom, dateTo, status, take, skip } = {}) {
  const where = {
    AND: [
      employeeId ? { employeeId } : {},
      status ? { status } : {},
      dateFrom || dateTo ? { date: dateRange(dateFrom, dateTo) } : {},
    ],
  };
  return prisma.attendance.findMany({ where, take: Number(take) || 50, skip: Number(skip) || 0, orderBy: { date: "desc" } });
}

export function createAttendance(data) {
  return prisma.attendance.create({ data });
}

export function updateAttendance(id, data) {
  return prisma.attendance.update({ where: { id }, data });
}

export function findById(id) {
  return prisma.attendance.findUnique({ where: { id } });
}

// Digital check-in/out with advanced schedule-based detection
export async function checkIn(employeeId, { timestamp, location, latitude, longitude, locationType } = {}) {
  const now = timestamp ? new Date(timestamp) : new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  
  const existing = await prisma.attendance.findFirst({ 
    where: { employeeId, date: { gte: todayStart, lte: todayEnd } },
    include: { employee: { include: { workSchedule: true } } }
  });
  
  // Get work schedule for expected times
  const schedule = existing?.employee?.workSchedule;
  let expectedCheckIn = null;
  let lateByMinutes = null;
  let status = "PRESENT";
  
  if (schedule && schedule.startTime) {
    const [hours, minutes] = schedule.startTime.split(':').map(Number);
    expectedCheckIn = new Date(now);
    expectedCheckIn.setHours(hours, minutes, 0, 0);
    
    const diffMs = now.getTime() - expectedCheckIn.getTime();
    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    
    if (diffMinutes > schedule.gracePeriod) {
      lateByMinutes = diffMinutes;
      status = "LATE";
    }
  }
  
  const updateData = {
    checkIn: now,
    status,
    expectedCheckIn,
    lateByMinutes,
    location: location || undefined,
    latitude: latitude || undefined,
    longitude: longitude || undefined,
    locationType: locationType || undefined,
  };
  
  if (existing) {
    return prisma.attendance.update({ 
      where: { id: existing.id }, 
      data: updateData,
      include: { breaks: true }
    });
  }
  
  return prisma.attendance.create({ 
    data: { 
      employeeId, 
      date: now, 
      ...updateData
    },
    include: { breaks: true }
  });
}

export async function checkOut(employeeId, { timestamp, location, latitude, longitude } = {}) {
  const now = timestamp ? new Date(timestamp) : new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  
  const today = await prisma.attendance.findFirst({ 
    where: { employeeId, date: { gte: todayStart, lte: todayEnd } },
    include: { 
      employee: { include: { workSchedule: true } },
      breaks: true
    }
  });
  
  if (!today) throw new Error("No attendance record found for today");
  
  // Calculate work hours excluding breaks
  let workHours = null;
  let totalHours = null;
  let overtime = null;
  let earlyByMinutes = null;
  
  if (today.checkIn) {
    const checkInTime = new Date(today.checkIn);
    const checkOutTime = now;
    
    // Calculate total time
    const totalMs = checkOutTime.getTime() - checkInTime.getTime();
    totalHours = totalMs / 1000 / 60 / 60;
    
    // Calculate break time
    let breakMinutes = 0;
    if (today.breaks && today.breaks.length > 0) {
      breakMinutes = today.breaks.reduce((total, br) => {
        if (br.endTime) {
          const breakMs = new Date(br.endTime).getTime() - new Date(br.startTime).getTime();
          return total + (breakMs / 1000 / 60);
        }
        return total;
      }, 0);
    }
    
    // Work hours = total hours - break time
    workHours = (totalMs - (breakMinutes * 60 * 1000)) / 1000 / 60 / 60;
    
    // Get expected check-out from schedule
    const schedule = today.employee?.workSchedule;
    if (schedule && schedule.endTime) {
      const [hours, minutes] = schedule.endTime.split(':').map(Number);
      const expectedCheckOut = new Date(now);
      expectedCheckOut.setHours(hours, minutes, 0, 0);
      
      const diffMs = expectedCheckOut.getTime() - checkOutTime.getTime();
      const diffMinutes = Math.floor(diffMs / 1000 / 60);
      
      if (diffMinutes > schedule.gracePeriod) {
        earlyByMinutes = diffMinutes;
        if (today.status === "PRESENT" || today.status === "LATE") {
          // Update status if early departure
        }
      }
      
      // Calculate overtime based on expected work hours
      const expectedWorkHours = schedule.endTime && schedule.startTime 
        ? (() => {
            const [startH, startM] = schedule.startTime.split(':').map(Number);
            const [endH, endM] = schedule.endTime.split(':').map(Number);
            const start = new Date(now);
            start.setHours(startH, startM, 0, 0);
            const end = new Date(now);
            end.setHours(endH, endM, 0, 0);
            return (end.getTime() - start.getTime()) / 1000 / 60 / 60 - (schedule.breakDuration / 60);
          })()
        : 8; // Default 8 hours
      
      overtime = Math.max(0, workHours - expectedWorkHours);
    } else {
      // Fallback: anything beyond 8 hours is overtime
      overtime = Math.max(0, workHours - 8);
    }
  }
  
  const updateData = {
    checkOut: now,
    workHours,
    totalHours,
    overtime,
    earlyByMinutes,
    expectedCheckOut: schedule?.endTime ? (() => {
      const [hours, minutes] = schedule.endTime.split(':').map(Number);
      const expected = new Date(now);
      expected.setHours(hours, minutes, 0, 0);
      return expected;
    })() : undefined,
    location: location || today.location,
    latitude: latitude || today.latitude,
    longitude: longitude || today.longitude,
  };
  
  return prisma.attendance.update({ 
    where: { id: today.id }, 
    data: updateData,
    include: { breaks: true }
  });
}

// Leave management
export function createLeaveRequest({ employeeId, type, startDate, endDate }) {
  return prisma.leaveRequest.create({ data: { employeeId, type, startDate: new Date(startDate), endDate: new Date(endDate) } });
}

export function findLeaveRequestById(id) {
  return prisma.leaveRequest.findUnique({ where: { id } });
}

export function updateLeaveStatus(id, status, approvedById) {
  return prisma.leaveRequest.update({ where: { id }, data: { status, approvedById: approvedById || null } });
}

export function listLeaveRequests({ employeeId, status, from, to, take = 50, skip = 0 } = {}) {
  const where = {
    AND: [employeeId ? { employeeId } : {}, status ? { status } : {}, from || to ? { appliedAt: dateRange(from, to) } : {}],
  };
  
  // Convert string parameters to integers
  const takeInt = parseInt(take, 10);
  const skipInt = parseInt(skip, 10);
  
  return prisma.leaveRequest.findMany({ 
    where, 
    take: takeInt, 
    skip: skipInt, 
    orderBy: { appliedAt: "desc" } 
  });
}

// Analytics
export async function getAttendanceSummary({ from, to, departmentId } = {}) {
  const where = { AND: [from || to ? { date: dateRange(from, to) } : {}] };
  const records = await prisma.attendance.findMany({ where, include: { employee: departmentId ? { select: { departmentId: true } } : false } });
  const total = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const onLeave = records.filter((r) => r.status === "ON_LEAVE").length;
  return { total, present, absent, late, onLeave };
}

export async function getAbsenceAnalytics({ from, to } = {}) {
  const where = { AND: [from || to ? { date: dateRange(from, to) } : {}] };
  const byEmployee = await prisma.attendance.groupBy({ by: ["employeeId"], where, _count: { _all: true } });
  return { byEmployee };
}

// Work Schedule Management
export function getWorkSchedule(employeeId) {
  return prisma.workSchedule.findUnique({ 
    where: { employeeId },
    include: { employee: { select: { id: true, firstName: true, lastName: true } } }
  });
}

export function createWorkSchedule(data) {
  return prisma.workSchedule.create({ data });
}

export function updateWorkSchedule(employeeId, data) {
  return prisma.workSchedule.update({ where: { employeeId }, data });
}

export function deleteWorkSchedule(employeeId) {
  return prisma.workSchedule.delete({ where: { employeeId } });
}

// Break Management
export function createBreak(data) {
  return prisma.attendanceBreak.create({ data });
}

export function updateBreak(id, data) {
  return prisma.attendanceBreak.update({ where: { id }, data });
}

export function deleteBreak(id) {
  return prisma.attendanceBreak.delete({ where: { id } });
}

export function getBreaksByAttendance(attendanceId) {
  return prisma.attendanceBreak.findMany({ 
    where: { attendanceId },
    orderBy: { startTime: 'asc' }
  });
}

// Attendance Regularization
export function createRegularization(data) {
  return prisma.attendanceRegularization.create({ data });
}

export function findRegularizationById(id) {
  return prisma.attendanceRegularization.findUnique({ 
    where: { id },
    include: { 
      employee: { select: { id: true, firstName: true, lastName: true } },
      approvedBy: { select: { id: true, firstName: true, lastName: true } }
    }
  });
}

export function updateRegularizationStatus(id, status, approvedById, rejectedReason = null) {
  const updateData = {
    status,
    approvedById: approvedById || null,
    approvedAt: status !== 'PENDING' ? new Date() : null,
    rejectedReason: rejectedReason || null,
  };
  return prisma.attendanceRegularization.update({ 
    where: { id }, 
    data: updateData
  });
}

export function listRegularizations({ employeeId, status, dateFrom, dateTo, take = 50, skip = 0 } = {}) {
  const where = {
    AND: [
      employeeId && employeeId !== '' ? { employeeId } : {},
      status && status !== '' ? { status } : {},
      (dateFrom && dateFrom !== '') || (dateTo && dateTo !== '') ? { date: dateRange(dateFrom, dateTo) } : {},
    ],
  };
  
  return prisma.attendanceRegularization.findMany({
    where,
    take: Number(take) || 50,
    skip: Number(skip) || 0,
    orderBy: { createdAt: 'desc' },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, email: true } },
      approvedBy: { select: { id: true, firstName: true, lastName: true } }
    }
  });
}

// Holiday Management
export function createHoliday(data) {
  return prisma.holiday.create({ data });
}

export function updateHoliday(id, data) {
  return prisma.holiday.update({ where: { id }, data });
}

export function deleteHoliday(id) {
  return prisma.holiday.delete({ where: { id } });
}

export function findHolidayById(id) {
  return prisma.holiday.findUnique({ where: { id } });
}

export function listHolidays({ dateFrom, dateTo, type, take = 100, skip = 0 } = {}) {
  const where = {
    AND: [
      (dateFrom && dateFrom !== '') || (dateTo && dateTo !== '') ? { date: dateRange(dateFrom, dateTo) } : {},
      type && type !== '' ? { type } : {},
    ],
  };
  
  return prisma.holiday.findMany({
    where,
    take: Number(take) || 100,
    skip: Number(skip) || 0,
    orderBy: { date: 'asc' }
  });
}

export function isHoliday(date) {
  const checkDate = new Date(date);
  return prisma.holiday.findFirst({
    where: {
      date: {
        gte: startOfDay(checkDate),
        lte: endOfDay(checkDate)
      }
    }
  });
}

// Enhanced Analytics
export async function getAdvancedAttendanceSummary({ from, to, departmentId, employeeId } = {}) {
  const where = {
    AND: [
      from || to ? { date: dateRange(from, to) } : {},
      employeeId ? { employeeId } : {},
    ],
  };
  
  const records = await prisma.attendance.findMany({ 
    where, 
    include: { 
      employee: departmentId ? { 
        select: { id: true, departmentId: true } 
      } : { select: { id: true } }
    } 
  });
  
  // Filter by department if specified
  const filteredRecords = departmentId 
    ? records.filter(r => r.employee.departmentId === departmentId)
    : records;
  
  const total = filteredRecords.length;
  const present = filteredRecords.filter((r) => r.status === "PRESENT").length;
  const absent = filteredRecords.filter((r) => r.status === "ABSENT").length;
  const late = filteredRecords.filter((r) => r.status === "LATE").length;
  const onLeave = filteredRecords.filter((r) => r.status === "ON_LEAVE").length;
  const earlyDeparture = filteredRecords.filter((r) => r.status === "EARLY_DEPARTURE" || r.earlyByMinutes).length;
  const halfDay = filteredRecords.filter((r) => r.status === "HALF_DAY").length;
  
  // Calculate averages
  const totalWorkHours = filteredRecords
    .filter(r => r.workHours)
    .reduce((sum, r) => sum + r.workHours, 0);
  const avgWorkHours = totalWorkHours / filteredRecords.filter(r => r.workHours).length || 0;
  
  const totalOvertime = filteredRecords
    .filter(r => r.overtime)
    .reduce((sum, r) => sum + r.overtime, 0);
  const avgOvertime = totalOvertime / filteredRecords.filter(r => r.overtime).length || 0;
  
  return { 
    total, 
    present, 
    absent, 
    late, 
    onLeave, 
    earlyDeparture,
    halfDay,
    avgWorkHours: Math.round(avgWorkHours * 100) / 100,
    avgOvertime: Math.round(avgOvertime * 100) / 100,
    totalOvertime: Math.round(totalOvertime * 100) / 100
  };
}

export async function getAttendanceTrends({ from, to, employeeId, groupBy = 'day' } = {}) {
  const where = {
    AND: [
      from || to ? { date: dateRange(from, to) } : {},
      employeeId ? { employeeId } : {},
    ],
  };
  
  const records = await prisma.attendance.findMany({
    where,
    orderBy: { date: 'asc' },
    include: { employee: { select: { id: true, firstName: true, lastName: true } } }
  });
  
  // Group by day, week, or month
  const grouped = {};
  records.forEach(record => {
    const date = new Date(record.date);
    let key;
    
    if (groupBy === 'day') {
      key = date.toISOString().split('T')[0];
    } else if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else if (groupBy === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        present: 0,
        absent: 0,
        late: 0,
        onLeave: 0,
        total: 0
      };
    }
    
    grouped[key][record.status.toLowerCase().replace('_', '')] = (grouped[key][record.status.toLowerCase().replace('_', '')] || 0) + 1;
    grouped[key].total += 1;
  });
  
  return Object.values(grouped);
}


