import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Search, User, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import WorkScheduleManagement from './components/attendanceComponents/WorkScheduleManagement';
import { attendanceApi } from '../../api/attendanceApi';
import { employeeApi } from '../../api/employeeApi';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../stores/useAuthStore';

/**
 * WorkSchedulePage Component
 * Full page for managing work schedules
 */
const WorkSchedulePage = () => {
  const { user } = useAuthStore();
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeApi.listEmployees();
      const employeesList = response.data?.data || [];
      setEmployees(employeesList);
      
      // Load schedules for all employees
      const schedulePromises = employeesList.map(async (emp) => {
        try {
          const scheduleResponse = await attendanceApi.getWorkSchedule(emp.id);
          return { employee: emp, schedule: scheduleResponse.data?.data || null };
        } catch (error) {
          return { employee: emp, schedule: null };
        }
      });
      
      const schedulesData = await Promise.all(schedulePromises);
      setSchedules(schedulesData);
    } catch (error) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedules = schedules.filter(({ employee }) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      employee.firstName.toLowerCase().includes(searchLower) ||
      employee.lastName.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.jobTitle.toLowerCase().includes(searchLower)
    );
  });

  const handleOpenSchedule = (employee) => {
    setSelectedEmployee(employee);
    setShowScheduleModal(true);
  };

  const handleCloseSchedule = () => {
    setShowScheduleModal(false);
    setSelectedEmployee(null);
    loadEmployees(); // Reload to get updated schedules
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Schedule Management</h1>
          <p className="text-gray-600">Manage employee work schedules and working hours</p>
        </div>
        <Button onClick={() => {
          if (user?.employeeId) {
            const employee = employees.find(e => e.id === user.employeeId);
            if (employee) {
              handleOpenSchedule(employee);
            }
          }
        }}>
          <Plus className="h-4 w-4 mr-2" />
          {user?.employeeId ? 'My Schedule' : 'Add Schedule'}
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-soft p-4 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search employees by name, email, or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Schedules List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-soft border border-gray-200">
          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No schedules found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchedules.map(({ employee, schedule }) => (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-soft p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleOpenSchedule(employee)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{employee.jobTitle}</p>
                  </div>
                </div>
                {schedule ? (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    Configured
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    Not Set
                  </span>
                )}
              </div>

              {schedule && (
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Start Time:</span>
                    <span className="font-medium text-gray-900">{schedule.startTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">End Time:</span>
                    <span className="font-medium text-gray-900">{schedule.endTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Break Duration:</span>
                    <span className="font-medium text-gray-900">{schedule.breakDuration} min</span>
                  </div>
                  {schedule.isFlexible && (
                    <div className="flex items-center space-x-1 text-xs text-blue-600">
                      <Calendar className="h-3 w-3" />
                      <span>Flexible Hours</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenSchedule(employee);
                  }}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {schedule ? 'Edit Schedule' : 'Set Schedule'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Schedule Management Modal */}
      {selectedEmployee && (
        <WorkScheduleManagement
          isOpen={showScheduleModal}
          onClose={handleCloseSchedule}
          employeeId={selectedEmployee.id}
          employeeName={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
        />
      )}
    </motion.div>
  );
};

export default WorkSchedulePage;

