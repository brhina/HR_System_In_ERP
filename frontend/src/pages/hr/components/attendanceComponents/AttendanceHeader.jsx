import React from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw,
  Plus,
  BarChart3,
  Wifi,
  WifiOff,
  Calendar,
  Clock,
  FileText,
  Settings
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

/**
 * AttendanceHeader Component
 * Header section with title, network status, and action buttons
 */
export const AttendanceHeader = ({ 
  isOnline, 
  lastUpdate, 
  isRefreshing, 
  onRefresh, 
  onShowRecordModal, 
  onShowAnalyticsModal,
  onShowScheduleModal,
  onShowRegularizationModal,
  onShowHolidayModal
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div>
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <span className="text-xs text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>
        <p className="text-gray-600">Track and manage employee attendance with real-time updates</p>
      </div>
      <div className="flex items-center space-x-2 flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isRefreshing}
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button onClick={onShowRecordModal} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Record
        </Button>
        <Button variant="outline" onClick={onShowAnalyticsModal} size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Button>
        {onShowScheduleModal && (
          <Button variant="outline" onClick={onShowScheduleModal} size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        )}
        {onShowRegularizationModal && (
          <Button variant="outline" onClick={onShowRegularizationModal} size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Regularize
          </Button>
        )}
        {onShowHolidayModal && (
          <Button variant="outline" onClick={onShowHolidayModal} size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Holidays
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default AttendanceHeader;
