import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  UserPlus, 
  Search, 
  Building, 
  Mail, 
  Phone,
  TrendingUp,
  UserCheck,
  UserX,
  Edit,
  ArrowRight
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { queryKeys } from '../../lib/react-query';
import employeeApi from '../../api/employeeApi';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';
import ManagerSelector from './components/employeeComponents/ManagerSelector';

/**
 * Manager Management Page
 * Lists all managers and their teams, allows assigning/removing managers
 */
const ManagerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);

  const queryClient = useQueryClient();

  // Fetch all employees (managers are employees with subordinates)
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: queryKeys.employees.list({ take: 1000 }),
    queryFn: async () => {
      const response = await employeeApi.listEmployees({ take: 1000 });
      return response.data.data || [];
    },
  });

  // Fetch managers list (all active employees can be managers)
  const { data: managers = [], isLoading: isLoadingManagers } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      const response = await employeeApi.listManagers();
      return response.data.data || [];
    },
  });

  // Assign manager mutation
  const assignManagerMutation = useMutation({
    mutationFn: async ({ employeeId, managerId }) => {
      await employeeApi.assignManager(employeeId, managerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      toast.success('Manager assigned successfully');
      setShowAssignModal(false);
      setSelectedEmployee(null);
      setSelectedManager(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to assign manager');
    },
  });

  // Group employees by manager
  const employeesByManager = useMemo(() => {
    const groups = {
      unassigned: [],
    };

    employees.forEach(employee => {
      if (employee.managerId) {
        if (!groups[employee.managerId]) {
          groups[employee.managerId] = [];
        }
        groups[employee.managerId].push(employee);
      } else {
        groups.unassigned.push(employee);
      }
    });

    return groups;
  }, [employees]);

  // Get managers with their team counts
  // A manager is an employee who has at least one subordinate OR is in the managers list
  const managersWithTeams = useMemo(() => {
    // Get all employees who have subordinates (they are managers)
    const employeesWithSubordinates = employees.filter(emp => {
      const subordinates = employeesByManager[emp.id] || [];
      return subordinates.length > 0;
    });

    // Combine with the managers list from API (which includes all active employees)
    const allManagers = [...new Map([
      ...employeesWithSubordinates.map(m => [m.id, m]),
      ...managers.map(m => [m.id, m])
    ]).values()];

    return allManagers.map(manager => ({
      ...manager,
      teamSize: employeesByManager[manager.id]?.length || 0,
      team: employeesByManager[manager.id] || [],
    }));
  }, [employees, managers, employeesByManager]);

  // Filter managers
  const filteredManagers = useMemo(() => {
    if (!searchTerm) return managersWithTeams;

    const searchLower = searchTerm.toLowerCase();
    return managersWithTeams.filter(manager =>
      manager.firstName?.toLowerCase().includes(searchLower) ||
      manager.lastName?.toLowerCase().includes(searchLower) ||
      manager.email?.toLowerCase().includes(searchLower) ||
      manager.jobTitle?.toLowerCase().includes(searchLower) ||
      manager.department?.name?.toLowerCase().includes(searchLower)
    );
  }, [managersWithTeams, searchTerm]);

  const unassignedCount = employeesByManager.unassigned?.length || 0;

  const handleAssignManager = (employee) => {
    setSelectedEmployee(employee);
    setSelectedManager(employee.managerId || null);
    setShowAssignModal(true);
  };

  const handleSubmitAssignment = () => {
    if (!selectedEmployee) return;
    assignManagerMutation.mutate({
      employeeId: selectedEmployee.id,
      managerId: selectedManager || null,
    });
  };

  const handleRemoveManager = (employee) => {
    if (window.confirm(`Remove manager from ${employee.firstName} ${employee.lastName}?`)) {
      assignManagerMutation.mutate({
        employeeId: employee.id,
        managerId: null,
      });
    }
  };

  if (isLoadingEmployees || isLoadingManagers) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-soft p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manager Management</h1>
          <p className="text-gray-600 mt-1">
            Manage organizational hierarchy and team assignments
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Managers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {managersWithTeams.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {employees.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unassigned</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {unassignedCount}
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <UserX className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search managers by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Managers List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredManagers.map((manager) => (
          <motion.div
            key={manager.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-soft border border-gray-200 p-6 hover:shadow-medium transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-semibold">
                    {manager.firstName?.[0]}{manager.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {manager.firstName} {manager.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{manager.jobTitle}</p>
                  {manager.department && (
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Building className="h-3 w-3 mr-1" />
                      {manager.department.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {manager.email}
              </div>
              {manager.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {manager.phone}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {manager.teamSize} {manager.teamSize === 1 ? 'Team Member' : 'Team Members'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // TODO: Navigate to manager detail view
                    console.log('View manager details:', manager.id);
                  }}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Unassigned Employees Section */}
      {unassignedCount > 0 && (
        <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Employees Without Managers ({unassignedCount})
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {employeesByManager.unassigned.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-700 font-semibold text-sm">
                      {employee.firstName?.[0]}{employee.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{employee.jobTitle}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAssignManager(employee)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Assign
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assign Manager Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedEmployee(null);
          setSelectedManager(null);
        }}
        title="Assign Manager"
      >
        {selectedEmployee && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Employee</p>
              <p className="font-semibold text-gray-900">
                {selectedEmployee.firstName} {selectedEmployee.lastName}
              </p>
              <p className="text-sm text-gray-600">{selectedEmployee.jobTitle}</p>
            </div>

            <ManagerSelector
              value={selectedManager}
              onChange={setSelectedManager}
              managers={managers}
              excludeEmployeeId={selectedEmployee.id}
              label="Select Manager"
              required={false}
              showEmptyOption={true}
            />

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedEmployee(null);
                  setSelectedManager(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitAssignment}
                disabled={assignManagerMutation.isPending}
                isLoading={assignManagerMutation.isPending}
              >
                Assign Manager
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default ManagerManagement;

