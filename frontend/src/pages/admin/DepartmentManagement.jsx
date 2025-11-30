import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, Plus, Edit, Trash2, Search, Users, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { employeeApi } from '../../api/employeeApi';
import toast from 'react-hot-toast';
import useEmployeeStore from '../../stores/useEmployeeStore';

/**
 * Department Management Component
 * Allows admins to create, update, and delete departments
 */
const DepartmentManagement = () => {
  const { departments, fetchDepartments } = useEmployeeStore();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setIsLoading(true);
    try {
      await fetchDepartments();
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (department = null) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({ name: department.name });
    } else {
      setEditingDepartment(null);
      setFormData({ name: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDepartment(null);
    setFormData({ name: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Department name is required');
      return;
    }

    setIsLoading(true);
    try {
      if (editingDepartment) {
        await employeeApi.updateDepartment(editingDepartment.id, formData);
        toast.success('Department updated successfully');
      } else {
        await employeeApi.createDepartment(formData);
        toast.success('Department created successfully');
      }
      await loadDepartments();
      handleCloseModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save department';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setIsLoading(true);
    try {
      await employeeApi.deleteDepartment(deleteConfirm.id);
      toast.success('Department deleted successfully');
      await loadDepartments();
      setDeleteConfirm(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete department';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Building className="h-6 w-6 mr-2 text-blue-600" />
            Department Management
          </h1>
          <p className="text-gray-600 mt-1">Create and manage organizational departments</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Departments List */}
      {isLoading && !departments.length ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No departments found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepartments.map((department) => (
            <motion.div
              key={department.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {department.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{department.employees?.length || 0} employee{department.employees?.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleOpenModal(department)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit department"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(department)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete department"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingDepartment ? 'Edit Department' : 'Create Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              placeholder="Enter department name"
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
            >
              {editingDepartment ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Department"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
              </p>
              {deleteConfirm?.employees?.length > 0 && (
                <p className="text-sm text-red-600 mt-2">
                  This department has {deleteConfirm.employees.length} employee(s). 
                  You must reassign or remove all employees before deleting this department.
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              loading={isLoading}
              disabled={deleteConfirm?.employees?.length > 0}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;

