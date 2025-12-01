import Joi from "joi";

export const listAttendanceSchema = Joi.object({
  query: Joi.object({
    employeeId: Joi.string().uuid().allow("").optional(),
    dateFrom: Joi.alternatives().try(
      Joi.date(),
      Joi.string().allow("").empty("").default(null)
    ).optional(),
    dateTo: Joi.alternatives().try(
      Joi.date(),
      Joi.string().allow("").empty("").default(null)
    ).optional(),
    status: Joi.string().valid("PRESENT", "ABSENT", "LATE", "ON_LEAVE", "EARLY_DEPARTURE", "HALF_DAY").allow("").optional(),
    take: Joi.number().integer().min(1).max(200).optional(),
    skip: Joi.number().integer().min(0).optional(),
  }).required(),
});

export const listAttendanceByEmployeeSchema = Joi.object({
  params: Joi.object({ employeeId: Joi.string().uuid().required() }).required(),
  query: Joi.object({
    dateFrom: Joi.alternatives().try(
      Joi.date(),
      Joi.string().allow("").empty("").default(null)
    ).optional(),
    dateTo: Joi.alternatives().try(
      Joi.date(),
      Joi.string().allow("").empty("").default(null)
    ).optional(),
    status: Joi.string().valid("PRESENT", "ABSENT", "LATE", "ON_LEAVE", "EARLY_DEPARTURE", "HALF_DAY").allow("").optional(),
    take: Joi.number().integer().min(1).max(200).optional(),
    skip: Joi.number().integer().min(0).optional(),
  }).required(),
});

export const recordAttendanceSchema = Joi.object({
  body: Joi.object({
    employeeId: Joi.string().uuid().required(),
    date: Joi.date().required(),
    status: Joi.string().valid("PRESENT", "ABSENT", "LATE", "ON_LEAVE", "EARLY_DEPARTURE", "HALF_DAY").required(),
    checkIn: Joi.date().optional(),
    checkOut: Joi.date().optional(),
    notes: Joi.string().allow("").optional(),
    location: Joi.string().allow("").optional(),
    overtime: Joi.number().min(0).optional(),
    workHours: Joi.number().min(0).optional(),
  }).required(),
});

export const updateAttendanceSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    employeeId: Joi.string().uuid().optional(),
    date: Joi.date().optional(),
    status: Joi.string().valid("PRESENT", "ABSENT", "LATE", "ON_LEAVE", "EARLY_DEPARTURE", "HALF_DAY").optional(),
    checkIn: Joi.date().optional(),
    checkOut: Joi.date().optional(),
    notes: Joi.string().allow("").optional(),
    location: Joi.string().allow("").optional(),
    overtime: Joi.number().min(0).optional(),
    workHours: Joi.number().min(0).optional(),
  }).min(1).required(),
});


export const createLeaveSchema = Joi.object({
  body: Joi.object({
    employeeId: Joi.string().uuid().required(),
    type: Joi.string().valid("SICK", "VACATION", "UNPAID", "MATERNITY", "PATERNITY", "OTHER").required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
  }).required(),
});

export const updateLeaveStatusSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    status: Joi.string().valid("PENDING", "APPROVED", "REJECTED").required(),
    approvedById: Joi.string().uuid().optional(),
  }).required(),
});

export const listLeaveRequestsSchema = Joi.object({
  query: Joi.object({
    employeeId: Joi.string().uuid().allow("").optional(),
    status: Joi.string().valid("PENDING", "APPROVED", "REJECTED").allow("").optional(),
    from: Joi.alternatives().try(
      Joi.date(),
      Joi.string().allow("").empty("").default(null)
    ).optional(),
    to: Joi.alternatives().try(
      Joi.date(),
      Joi.string().allow("").empty("").default(null)
    ).optional(),
    take: Joi.number().integer().min(1).max(200).optional(),
    skip: Joi.number().integer().min(0).optional(),
  }).required(),
});

export const attendanceSummarySchema = Joi.object({
  query: Joi.object({
    from: Joi.alternatives().try(
      Joi.date(),
      Joi.string().allow("").empty("").default(null)
    ).optional(),
    to: Joi.alternatives().try(
      Joi.date(),
      Joi.string().allow("").empty("").default(null)
    ).optional(),
    departmentId: Joi.string().uuid().allow("").optional(),
  }).required(),
});

export const absenceAnalyticsSchema = Joi.object({
  query: Joi.object({
    from: Joi.alternatives().try(
      Joi.date(),
      Joi.string().allow("").empty("").default(null)
    ).optional(),
    to: Joi.alternatives().try(
      Joi.date(),
      Joi.string().allow("").empty("").default(null)
    ).optional(),
  }).required(),
});

// Enhanced check-in/out with location
export const checkInSchema = Joi.object({
  params: Joi.object({ employeeId: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    timestamp: Joi.date().optional(),
    location: Joi.string().optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    locationType: Joi.string().valid("OFFICE", "REMOTE", "HYBRID", "FIELD").optional(),
  }).required(),
});

export const checkOutSchema = Joi.object({
  params: Joi.object({ employeeId: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    timestamp: Joi.date().optional(),
    location: Joi.string().optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
  }).required(),
});

// Work Schedule Management
export const getWorkScheduleSchema = Joi.object({
  params: Joi.object({ employeeId: Joi.string().uuid().required() }).required(),
});

export const createWorkScheduleSchema = Joi.object({
  body: Joi.object({
    employeeId: Joi.string().uuid().required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    breakDuration: Joi.number().integer().min(0).max(480).optional(),
    workingDays: Joi.alternatives().try(
      Joi.array().items(Joi.number().integer().min(0).max(6)),
      Joi.array().items(Joi.string().valid("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"))
    ).optional(),
    isFlexible: Joi.boolean().optional(),
    gracePeriod: Joi.number().integer().min(0).max(120).optional(),
    timezone: Joi.string().optional(),
    effectiveFrom: Joi.date().optional(),
    effectiveTo: Joi.date().allow(null).optional(),
  }).required(),
});

export const updateWorkScheduleSchema = Joi.object({
  params: Joi.object({ employeeId: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    breakDuration: Joi.number().integer().min(0).max(480).optional(),
    workingDays: Joi.alternatives().try(
      Joi.array().items(Joi.number().integer().min(0).max(6)),
      Joi.array().items(Joi.string().valid("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"))
    ).optional(),
    isFlexible: Joi.boolean().optional(),
    gracePeriod: Joi.number().integer().min(0).max(120).optional(),
    timezone: Joi.string().optional(),
    effectiveFrom: Joi.date().optional(),
    effectiveTo: Joi.date().allow(null).optional(),
  }).min(1).required(),
});

export const deleteWorkScheduleSchema = Joi.object({
  params: Joi.object({ employeeId: Joi.string().uuid().required() }).required(),
});

// Break Management
export const createBreakSchema = Joi.object({
  body: Joi.object({
    attendanceId: Joi.string().uuid().required(),
    type: Joi.string().valid("LUNCH", "COFFEE", "PERSONAL", "OTHER").optional(),
    startTime: Joi.date().required(),
    endTime: Joi.date().optional(),
    notes: Joi.string().allow("").optional(),
  }).required(),
});

export const updateBreakSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    attendanceId: Joi.string().uuid().optional(),
    type: Joi.string().valid("LUNCH", "COFFEE", "PERSONAL", "OTHER").optional(),
    startTime: Joi.date().optional(),
    endTime: Joi.date().optional(),
    notes: Joi.string().allow("").optional(),
  }).min(1).required(),
});

export const deleteBreakSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
});

// Attendance Regularization
export const createRegularizationSchema = Joi.object({
  body: Joi.object({
    employeeId: Joi.string().uuid().required(),
    date: Joi.date().required(),
    requestedCheckIn: Joi.date().optional(),
    requestedCheckOut: Joi.date().optional(),
    reason: Joi.string().min(10).max(500).required(),
  }).required(),
});

export const updateRegularizationStatusSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    status: Joi.string().valid("PENDING", "APPROVED", "REJECTED").required(),
    approvedById: Joi.string().uuid().optional(),
    rejectedReason: Joi.string().min(10).max(500).optional(),
  }).required(),
});

export const listRegularizationsSchema = Joi.object({
  query: Joi.object({
    employeeId: Joi.string().uuid().allow("").optional(),
    status: Joi.string().valid("PENDING", "APPROVED", "REJECTED").allow("").optional(),
    dateFrom: Joi.alternatives().try(
      Joi.date(),
      Joi.string().allow("").empty("").default(null)
    ).optional(),
    dateTo: Joi.alternatives().try(
      Joi.date(),
      Joi.string().allow("").empty("").default(null)
    ).optional(),
    take: Joi.number().integer().min(1).max(200).optional(),
    skip: Joi.number().integer().min(0).optional(),
  }).required(),
});

// Holiday Management
export const createHolidaySchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    date: Joi.date().required(),
    type: Joi.string().valid("PUBLIC", "COMPANY", "REGIONAL").optional(),
    isRecurring: Joi.boolean().optional(),
    description: Joi.string().max(1000).optional(),
  }).required(),
});

export const updateHolidaySchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    name: Joi.string().min(1).max(200).optional(),
    date: Joi.date().optional(),
    type: Joi.string().valid("PUBLIC", "COMPANY", "REGIONAL").optional(),
    isRecurring: Joi.boolean().optional(),
    description: Joi.string().max(1000).optional(),
  }).min(1).required(),
});

export const deleteHolidaySchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
});

export const listHolidaysSchema = Joi.object({
  query: Joi.object({
    dateFrom: Joi.alternatives().try(
      Joi.date(),
      Joi.string().allow("").empty("").default(null)
    ).optional(),
    dateTo: Joi.alternatives().try(
      Joi.date(),
      Joi.string().allow("").empty("").default(null)
    ).optional(),
    type: Joi.string().valid("PUBLIC", "COMPANY", "REGIONAL").allow("").optional(),
    take: Joi.number().integer().min(1).max(200).optional(),
    skip: Joi.number().integer().min(0).optional(),
  }).required(),
});

// Enhanced Analytics
export const advancedSummarySchema = Joi.object({
  query: Joi.object({
    from: Joi.alternatives().try(
      Joi.date(),
      Joi.string().allow("").empty("").default(null)
    ).optional(),
    to: Joi.alternatives().try(
      Joi.date(),
      Joi.string().allow("").empty("").default(null)
    ).optional(),
    departmentId: Joi.string().uuid().allow("").optional(),
    employeeId: Joi.string().uuid().allow("").optional(),
  }).required(),
});

export const attendanceTrendsSchema = Joi.object({
  query: Joi.object({
    from: Joi.alternatives().try(
      Joi.date(),
      Joi.string().allow("").empty("").default(null)
    ).optional(),
    to: Joi.alternatives().try(
      Joi.date(),
      Joi.string().allow("").empty("").default(null)
    ).optional(),
    employeeId: Joi.string().uuid().allow("").optional(),
    groupBy: Joi.string().valid("day", "week", "month").allow("").optional(),
  }).required(),
});


