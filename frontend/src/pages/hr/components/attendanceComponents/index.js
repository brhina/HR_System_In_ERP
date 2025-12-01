// Attendance Components Library
export { default as AttendanceCards } from './AttendanceCards';
export { default as AttendanceViews } from './AttendanceViews';
export { default as LeaveManagement } from './LeaveManagement';
export { default as AttendanceAnalytics } from './AttendanceAnalytics';
export { default as AttendanceHeader } from './AttendanceHeader';
export { default as NetworkStatusAlert } from './NetworkStatusAlert';
export { default as AttendanceStats } from './AttendanceStats';
export { default as AttendanceViewToggle } from './AttendanceViewToggle';
export { default as AttendanceErrorState } from './AttendanceErrorState';
export { default as AttendanceContent, RecentAttendanceCards } from './AttendanceContent';
export { default as AttendanceModals } from './AttendanceModals';
export { default as AttendanceEditForm } from './AttendanceEditForm';
export { default as AttendanceRecordForm } from './AttendanceRecordForm';
export { default as WorkScheduleManagement } from './WorkScheduleManagement';
export { default as BreakManagement } from './BreakManagement';
export { default as AttendanceRegularization } from './AttendanceRegularization';
export { default as HolidayManagement } from './HolidayManagement';
export { default as AttendanceQuickActions } from './AttendanceQuickActions';

// Re-export individual components for easier imports
export {
  AttendanceCard,
  CheckInOutCard,
  AttendanceStatsCard,
} from './AttendanceCards';

export {
  AttendanceTable,
  AttendanceCalendar,
} from './AttendanceViews';

export {
  LeaveRequestCard,
  LeaveRequestForm,
  LeaveRequestTable,
} from './LeaveManagement';
