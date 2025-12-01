import React from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import AttendanceEditForm from './AttendanceEditForm';
import AttendanceRecordForm from './AttendanceRecordForm';
import WorkScheduleManagement from './WorkScheduleManagement';
import AttendanceRegularization from './AttendanceRegularization';
import HolidayManagement from './HolidayManagement';

/**
 * AttendanceModals Component
 * Contains all modal dialogs for attendance management
 */
export const AttendanceModals = ({ 
  showRecordModal, 
  showAnalyticsModal, 
  showEditModal,
  showScheduleModal,
  showRegularizationModal,
  showHolidayModal,
  editingRecord,
  employees,
  employeeId,
  employeeName,
  onCloseRecordModal, 
  onCloseAnalyticsModal, 
  onCloseEditModal,
  onCloseScheduleModal,
  onCloseRegularizationModal,
  onCloseHolidayModal,
  onEditAttendance,
  onRecordAttendance,
  isEditing,
  isRecording,
  stats,
  onUpdate
}) => {
  return (
    <>
      {/* Record Attendance Modal */}
      <AttendanceRecordForm
        isOpen={showRecordModal}
        onClose={onCloseRecordModal}
        onSubmit={onRecordAttendance}
        employees={employees}
        isLoading={isRecording}
      />

      {/* Analytics Modal */}
      <Modal
        isOpen={showAnalyticsModal}
        onClose={onCloseAnalyticsModal}
        title="Attendance Analytics"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">This Month</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Employees:</span>
                  <span className="text-sm font-medium">{stats.totalEmployees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Present Today:</span>
                  <span className="text-sm font-medium">{stats.presentToday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Absent Today:</span>
                  <span className="text-sm font-medium">{stats.absentToday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Late Today:</span>
                  <span className="text-sm font-medium">{stats.lateToday}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Attendance Rate:</span>
                  <span className="text-sm font-medium">{stats.attendanceRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Punctuality Rate:</span>
                  <span className="text-sm font-medium">{stats.punctualityRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Work Hours:</span>
                  <span className="text-sm font-medium">{stats.avgWorkHours.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Overtime Hours:</span>
                  <span className="text-sm font-medium">{stats.overtimeHours.toFixed(1)}h</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onCloseAnalyticsModal}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Attendance Modal */}
      <AttendanceEditForm
        isOpen={showEditModal}
        onClose={onCloseEditModal}
        onSubmit={onEditAttendance}
        attendanceRecord={editingRecord}
        isLoading={isEditing}
      />

      {/* Work Schedule Modal */}
      {showScheduleModal && employeeId && (
        <WorkScheduleManagement
          isOpen={showScheduleModal}
          onClose={onCloseScheduleModal}
          employeeId={employeeId}
          employeeName={employeeName}
        />
      )}

      {/* Regularization Modal */}
      {showRegularizationModal && employeeId && (
        <AttendanceRegularization
          isOpen={showRegularizationModal}
          onClose={onCloseRegularizationModal}
          employeeId={employeeId}
          onUpdate={onUpdate}
        />
      )}

      {/* Holiday Management Modal */}
      {showHolidayModal && (
        <HolidayManagement
          isOpen={showHolidayModal}
          onClose={onCloseHolidayModal}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
};

export default AttendanceModals;
