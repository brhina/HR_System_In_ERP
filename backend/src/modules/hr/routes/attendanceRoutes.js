import { Router } from "express";
import * as controller from "../controllers/attendanceController.js";
import { 
  authenticateToken, 
  requirePermission, 
  requireAnyPermission,
  requireEmployeeAccess,
  requireOwnLeaveAccess 
} from "../../../middlewares/authMiddleware.js";
import { validate } from "../../../middlewares/validationMiddleware.js";
import * as v from "../validations/attendanceValidation.js";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Attendance records - require attendance permissions
router.get("/", requirePermission("attendance:read"), validate(v.listAttendanceSchema), controller.listAttendance);
router.post("/", requirePermission("attendance:create"), validate(v.recordAttendanceSchema), controller.recordAttendance);
router.put("/:id", requirePermission("attendance:update"), validate(v.updateAttendanceSchema), controller.updateAttendance);
router.get("/employee/:employeeId", requireEmployeeAccess(), validate(v.listAttendanceByEmployeeSchema), controller.listAttendanceByEmployee);

// Check-in/out endpoints - allow employees to check-in/out for themselves or require attendance create permission
router.post("/employee/:employeeId/check-in", requireEmployeeAccess(), validate(v.checkInSchema), controller.checkIn);
router.post("/employee/:employeeId/check-out", requireEmployeeAccess(), validate(v.checkOutSchema), controller.checkOut);

// Leave requests - allow employees to create leave requests for themselves or require attendance create permission
router.post("/leave", requireOwnLeaveAccess(), validate(v.createLeaveSchema), controller.createLeaveRequest);
router.put("/leave/:id/status", requireAnyPermission(["admin:manage_users", "admin:manage_system"]), validate(v.updateLeaveStatusSchema), controller.updateLeaveStatus);
router.get("/leave", requirePermission("attendance:read"), validate(v.listLeaveRequestsSchema), controller.listLeaveRequests);

// Analytics - require attendance read permission
router.get("/analytics/summary", requirePermission("attendance:read"), validate(v.attendanceSummarySchema), controller.getAttendanceSummary);
router.get("/analytics/absence", requirePermission("attendance:read"), validate(v.absenceAnalyticsSchema), controller.getAbsenceAnalytics);
router.get("/analytics/advanced", requirePermission("attendance:read"), validate(v.advancedSummarySchema), controller.getAdvancedAttendanceSummary);
router.get("/analytics/trends", requirePermission("attendance:read"), validate(v.attendanceTrendsSchema), controller.getAttendanceTrends);

// Work Schedule Management
router.get("/schedule/:employeeId", requirePermission("attendance:read"), validate(v.getWorkScheduleSchema), controller.getWorkSchedule);
router.post("/schedule", requirePermission("attendance:create"), validate(v.createWorkScheduleSchema), controller.createWorkSchedule);
router.put("/schedule/:employeeId", requirePermission("attendance:update"), validate(v.updateWorkScheduleSchema), controller.updateWorkSchedule);
router.delete("/schedule/:employeeId", requirePermission("attendance:delete"), validate(v.deleteWorkScheduleSchema), controller.deleteWorkSchedule);

// Break Management
router.post("/break", requirePermission("attendance:create"), validate(v.createBreakSchema), controller.createBreak);
router.put("/break/:id", requirePermission("attendance:update"), validate(v.updateBreakSchema), controller.updateBreak);
router.delete("/break/:id", requirePermission("attendance:delete"), validate(v.deleteBreakSchema), controller.deleteBreak);

// Attendance Regularization
router.post("/regularization", requireOwnLeaveAccess(), validate(v.createRegularizationSchema), controller.createRegularization);
router.put("/regularization/:id/status", requireAnyPermission(["admin:manage_users", "admin:manage_system"]), validate(v.updateRegularizationStatusSchema), controller.updateRegularizationStatus);
router.get("/regularization", requirePermission("attendance:read"), validate(v.listRegularizationsSchema), controller.listRegularizations);

// Holiday Management
router.post("/holiday", requireAnyPermission(["admin:manage_users", "admin:manage_system"]), validate(v.createHolidaySchema), controller.createHoliday);
router.put("/holiday/:id", requireAnyPermission(["admin:manage_users", "admin:manage_system"]), validate(v.updateHolidaySchema), controller.updateHoliday);
router.delete("/holiday/:id", requireAnyPermission(["admin:manage_users", "admin:manage_system"]), validate(v.deleteHolidaySchema), controller.deleteHoliday);
router.get("/holiday", requirePermission("attendance:read"), validate(v.listHolidaysSchema), controller.listHolidays);

export default router;


