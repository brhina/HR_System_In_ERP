import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { queryKeys } from '../../lib/react-query';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Users,
  Building,
  Calendar,
  Mail,
  Phone,
} from 'lucide-react';

import apiClient from '../../api/axiosClient';
import useEmployeeStore from '../../stores/useEmployeeStore';
import useAuthStore from '../../stores/useAuthStore';
import { formatDate, getInitials, getEmploymentStatusColor } from '../../api/employeeApi';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const EmployeeCard = ({ employee, onEdit, onDelete, onView }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-soft p-6 hover:shadow-medium transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-primary-700">
              {getInitials(employee.firstName + ' ' + employee.lastName)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {employee.firstName} {employee.lastName}
            </h3>
            <p className="text-sm text-gray-600">{employee.jobTitle}</p>
            <p className="text-sm text-gray-500">{employee.department?.name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={cn(
            'px-2 py-1 text-xs font-medium rounded-full',
            getEmploymentStatusColor(employee.status)
          )}>
            {employee.status}
          </span>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-medium border border-gray-200 py-1 z-50"
                >
                  <button
                    onClick={() => {
                      setShowActions(false);
                      onView(employee.id);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Eye className="mr-3 h-4 w-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setShowActions(false);
                      onEdit(employee.id);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="mr-3 h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowActions(false);
                      onDelete(employee.id);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="mr-3 h-4 w-4" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center text-gray-600">
          <Mail className="h-4 w-4 mr-2" />
          {employee.email}
        </div>
        <div className="flex items-center text-gray-600">
          <Phone className="h-4 w-4 mr-2" />
          {employee.phone || 'N/A'}
        </div>
        <div className="flex items-center text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          {formatDate(employee.hireDate)}
        </div>
        <div className="flex items-center text-gray-600">
          <Building className="h-4 w-4 mr-2" />
          {employee.jobType}
        </div>
        {employee.candidate && (
          <div className="flex items-center text-blue-600 text-xs mt-2">
            <Users className="h-3 w-3 mr-1" />
            Hired from Recruitment
          </div>
        )}
      </div>
    </motion.div>
  );
};

const EmployeeList = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [hiredFromCandidateFilter, setHiredFromCandidateFilter] = useState('all'); // 'all', 'true', 'false'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employeesData, isLoading } = useQuery({
    queryKey: queryKeys.employees.list({ 
      search: searchTerm, 
      status: statusFilter, 
      department: departmentFilter,
      fromCandidate: hiredFromCandidateFilter 
    }),
    enabled: isAuthenticated && !!user,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (departmentFilter !== 'all') params.append('departmentId', departmentFilter);
      if (hiredFromCandidateFilter !== 'all') params.append('fromCandidate', hiredFromCandidateFilter);
      
      const response = await apiClient.get(`/hr/employees?${params.toString()}`);
      return response.data.data;
    },
    staleTime: 0, // Always fetch fresh data to ensure new employees appear immediately
  });

  // Fetch departments for filter
  const { data: departments } = useQuery({
    queryKey: queryKeys.departments.list,
    enabled: isAuthenticated && !!user,
    queryFn: async () => {
      const response = await apiClient.get('/hr/employees/departments');
      return response.data.data;
    },
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId) => {
      await apiClient.delete(`/hr/employees/${employeeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.list() });
      toast.success('Employee deleted successfully');
      setShowDeleteModal(false);
      setSelectedEmployee(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    },
  });

  const employees = employeesData || [];
  const totalEmployees = employees.length;

  const handleEdit = (employeeId) => {
    window.location.href = `/employees/${employeeId}/edit`;
  };

  const handleView = (employeeId) => {
    window.location.href = `/employees/${employeeId}`;
  };

  const handleDelete = (employeeId) => {
    setSelectedEmployee(employeeId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedEmployee) {
      deleteEmployeeMutation.mutate(selectedEmployee);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = !searchTerm || 
        employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || employee.departmentId === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [employees, searchTerm, statusFilter, departmentFilter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-soft p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600">
            {totalEmployees} total employees
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/employees/managers">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Manage Managers
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Link to="/employees/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PROBATION">Probation</option>
            <option value="TERMINATED">Terminated</option>
            <option value="RESIGNED">Resigned</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Departments</option>
            {departments?.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          <select
            value={hiredFromCandidateFilter}
            onChange={(e) => setHiredFromCandidateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Employees</option>
            <option value="true">Hired from Candidates</option>
            <option value="false">Direct Hires</option>
          </select>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-lg',
                viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Users className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-2 rounded-lg',
                viewMode === 'table' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding a new employee.'}
          </p>
          {(!searchTerm && statusFilter === 'all' && departmentFilter === 'all') && (
            <div className="mt-6">
              <Link to="/employees/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Employee"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this employee? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="error"
              onClick={confirmDelete}
              loading={deleteEmployeeMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeList;
