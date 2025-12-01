import React from 'react';
import { motion } from 'framer-motion';
import { 
  AttendanceHeader,
  NetworkStatusAlert,
  AttendanceStats,
  AttendanceViewToggle,
  AttendanceErrorState,
  AttendanceContent,
  RecentAttendanceCards,
  AttendanceModals
} from './components/attendanceComponents';
import { useAttendanceLogic } from './hooks/useAttendanceLogic';

/**
 * Refactored Attendance Component
 * Modular attendance management dashboard with separated concerns
 */
const Attendance = () => {
  const {
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
  } = useAttendanceLogic();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <AttendanceHeader
        isOnline={isOnline}
        lastUpdate={lastUpdate}
        isRefreshing={isRefreshing}
        onRefresh={loadAttendanceData}
        onShowRecordModal={() => setShowRecordModal(true)}
        onShowAnalyticsModal={() => setShowAnalyticsModal(true)}
        onShowScheduleModal={user?.employeeId ? () => setShowScheduleModal(true) : null}
        onShowRegularizationModal={user?.employeeId ? () => setShowRegularizationModal(true) : null}
        onShowHolidayModal={() => setShowHolidayModal(true)}
      />

      {/* Network Status Alert */}
      <NetworkStatusAlert isOnline={isOnline} />

      {/* Statistics */}
      <AttendanceStats
        user={user}
        currentEmployeeAttendance={currentEmployeeAttendance}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        loading={loading}
        stats={stats}
      />

      {/* View Toggle */}
      <AttendanceViewToggle
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        attendanceCount={attendance.length}
      />

      {/* Error State */}
      <AttendanceErrorState error={error} />

      {/* Main Content */}
      <AttendanceContent
        viewMode={viewMode}
        attendance={attendance}
        attendanceSummary={attendanceSummary}
        absenceAnalytics={absenceAnalytics}
        onEditAttendance={handleOpenEditModal}
        onDateClick={handleDateClick}
        loading={loading}
        user={user}
        onShowSchedule={user?.employeeId ? () => setShowScheduleModal(true) : null}
        onShowRegularization={user?.employeeId ? () => setShowRegularizationModal(true) : null}
        onShowHoliday={() => setShowHolidayModal(true)}
        onShowAnalytics={() => setShowAnalyticsModal(true)}
        onUpdate={loadAttendanceData}
      />

      {/* Recent Attendance Cards */}
      <RecentAttendanceCards
        attendance={attendance}
        viewMode={viewMode}
        onEditAttendance={handleOpenEditModal}
      />

      {/* Modals */}
      <AttendanceModals
        showRecordModal={showRecordModal}
        showAnalyticsModal={showAnalyticsModal}
        showEditModal={showEditModal}
        showScheduleModal={showScheduleModal}
        showRegularizationModal={showRegularizationModal}
        showHolidayModal={showHolidayModal}
        editingRecord={editingRecord}
        employees={employees}
        employeeId={user?.employeeId}
        employeeName={user ? `${user.firstName} ${user.lastName}` : ''}
        onCloseRecordModal={() => setShowRecordModal(false)}
        onCloseAnalyticsModal={() => setShowAnalyticsModal(false)}
        onCloseEditModal={handleCloseEditModal}
        onCloseScheduleModal={() => setShowScheduleModal(false)}
        onCloseRegularizationModal={() => setShowRegularizationModal(false)}
        onCloseHolidayModal={() => setShowHolidayModal(false)}
        onEditAttendance={handleEditAttendance}
        onRecordAttendance={handleRecordAttendance}
        isEditing={isEditing}
        isRecording={isRecording}
        stats={stats}
        onUpdate={loadAttendanceData}
      />
    </motion.div>
  );
};

export default Attendance;