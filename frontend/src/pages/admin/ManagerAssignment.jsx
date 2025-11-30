import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Search, Building, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { employeeApi } from '../../api/employeeApi';
import useEmployeeStore from '../../stores/useEmployeeStore';
import toast from 'react-hot-toast';

/**
 * Manager Assignment Component
 * Allows admins to assign managers to employees
 */
const ManagerAssignment = () => {
  const { employees, departments, fetchEmployees, fetchDepartments, fetchManagers } = useEmployeeStore();
  const [isLoading, setIsLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchEmployees(),
        fetchDepartments(),
        loadManagers()
      ]);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadManagers = async () => {
    try {
      const response = await employeeApi.listManagers();
      setManagers(response.data.data || []);
    } catch (error) {
      console.error('Failed to load managers:', error);
    }
  };

  const handleAssignManager = async () => {
    if (!selectedEmployee) return;

    setIsAssigning(true);
    try {
      await employeeApi.assignManager(selectedEmployee.id, selectedManagerId || null);
      toast.success('Manager assigned successfully');
      await fetchEmployees();
      setSelectedEmployee(null);
      setSelectedManagerId('');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to assign manager';
      toast.error(errorMessage);
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || emp.departmentId === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const getManagerName = (managerId) => {
    if (!managerId) return 'No Manager';
    const manager = employees.find(e => e.id === managerId);
    return manager ? `${manager.firstName} ${manager.lastName}` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <UserCheck className="h-6 w-6 mr-2 text-blue-600" />
          Manager Assignment
        </h1>
        <p className="text-gray-600 mt-1">Assign managers to employees</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Department
          </label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No employees found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Manager
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <motion.tr
                    key={employee.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Building className="h-4 w-4 mr-1 text-gray-400" />
                        {employee.department?.name || 'No Department'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getManagerName(employee.managerId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setSelectedManagerId(employee.managerId || '');
                        }}
                      >
                        Assign Manager
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Assign Manager
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Employee: <strong>{selectedEmployee.firstName} {selectedEmployee.lastName}</strong>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Manager
                </label>
                <select
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No Manager</option>
                  {managers
                    .filter(m => m.id !== selectedEmployee.id)
                    .map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.firstName} {manager.lastName} - {manager.jobTitle}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedEmployee(null);
                    setSelectedManagerId('');
                  }}
                  disabled={isAssigning}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignManager}
                  loading={isAssigning}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Assign
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ManagerAssignment;

