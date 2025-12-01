import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  FileText, 
  Coffee,
  Settings,
  MapPin,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import BreakManagement from './BreakManagement';
import { attendanceApi } from '../../../../api/attendanceApi';
import { toast } from 'react-hot-toast';

/**
 * AttendanceQuickActions Component
 * Quick access buttons for common attendance actions
 */
export const AttendanceQuickActions = ({ 
  attendanceRecord, 
  onUpdate,
  onShowSchedule,
  onShowRegularization,
  onShowHoliday,
  onShowAnalytics
}) => {
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breaks, setBreaks] = useState(attendanceRecord?.breaks || []);

  const handleBreakUpdate = async () => {
    try {
      if (attendanceRecord?.id) {
        // Reload breaks
        const response = await attendanceApi.listAttendance({
          employeeId: attendanceRecord.employeeId,
          dateFrom: attendanceRecord.date,
          dateTo: attendanceRecord.date
        });
        const updated = response.data?.data?.[0];
        if (updated) {
          setBreaks(updated.breaks || []);
        }
      }
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating breaks:', error);
    }
  };

  if (!attendanceRecord) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-soft p-4 border border-gray-200"
      >
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {attendanceRecord.checkIn && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBreakModal(true)}
              className="w-full"
              title="Manage Breaks"
            >
              <Coffee className="h-4 w-4 mr-1" />
              Breaks
              {breaks.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {breaks.length}
                </span>
              )}
            </Button>
          )}
          
          {onShowSchedule && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowSchedule}
              className="w-full"
              title="View Work Schedule"
            >
              <Clock className="h-4 w-4 mr-1" />
              Schedule
            </Button>
          )}

          {onShowRegularization && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowRegularization}
              className="w-full"
              title="Request Regularization"
            >
              <FileText className="h-4 w-4 mr-1" />
              Regularize
            </Button>
          )}

          {onShowHoliday && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowHoliday}
              className="w-full"
              title="View Holidays"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Holidays
            </Button>
          )}

          {onShowAnalytics && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowAnalytics}
              className="w-full"
              title="View Analytics"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Analytics
            </Button>
          )}

          {attendanceRecord.locationType && (
            <div className="col-span-2 md:col-span-4 mt-2 p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-600">
                  Location: {attendanceRecord.locationType}
                  {attendanceRecord.location && ` - ${attendanceRecord.location}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Break Management Modal */}
      {attendanceRecord.id && (
        <BreakManagement
          attendanceId={attendanceRecord.id}
          breaks={breaks}
          isOpen={showBreakModal}
          onClose={() => setShowBreakModal(false)}
          onUpdate={handleBreakUpdate}
        />
      )}
    </>
  );
};

export default AttendanceQuickActions;

