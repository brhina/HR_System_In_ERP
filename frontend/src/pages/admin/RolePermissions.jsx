import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Edit, Trash2, Key, Users, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAdminStore } from '../../stores/useAdminStore';
import useAuthStore from '../../stores/useAuthStore';
import toast from 'react-hot-toast';

/**
 * RolePermissions Component
 * Role and permissions management dashboard
 */
const RolePermissions = () => {
  const { user: currentUser, permissions, roles } = useAuthStore();
  const {
    roles: availableRoles,
    permissions: availablePermissions,
    isLoading,
    error,
    fetchRoles,
    fetchPermissions,
    createRole,
    updateRole,
    deleteRole,
    createPermission,
    assignPermissionToRole,
    removePermissionFromRole,
    clearError,
  } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('roles'); // 'roles' or 'permissions'
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editingPermission, setEditingPermission] = useState(null);
  const [roleFormData, setRoleFormData] = useState({ name: '', description: '' });
  const [permissionFormData, setPermissionFormData] = useState({ 
    name: '', 
    description: '', 
    resource: '', 
    action: '' 
  });
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPermissionAssignment, setShowPermissionAssignment] = useState(false);

  const canManageUsers = permissions?.includes('admin:manage_users') || 
                        roles?.includes('super_admin') || 
                        roles?.includes('admin');

  useEffect(() => {
    if (canManageUsers) {
      loadData();
    }
  }, [canManageUsers]);

  const loadData = async () => {
    try {
      await Promise.all([fetchRoles(), fetchPermissions()]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await updateRole(editingRole.id, roleFormData);
        toast.success('Role updated successfully');
      } else {
        await createRole(roleFormData);
        toast.success('Role created successfully');
      }
      await loadData();
      setShowRoleModal(false);
      setEditingRole(null);
      setRoleFormData({ name: '', description: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save role');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    
    try {
      await deleteRole(roleId);
      toast.success('Role deleted successfully');
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete role');
    }
  };

  const handleCreatePermission = async (e) => {
    e.preventDefault();
    try {
      await createPermission(permissionFormData);
      toast.success('Permission created successfully');
      await loadData();
      setShowPermissionModal(false);
      setPermissionFormData({ name: '', description: '', resource: '', action: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create permission');
    }
  };

  const handleAssignPermission = async (roleId, permissionId) => {
    try {
      await assignPermissionToRole(roleId, permissionId);
      toast.success('Permission assigned successfully');
      await loadData();
      setSelectedRole(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign permission');
    }
  };

  const handleRemovePermission = async (roleId, permissionId) => {
    try {
      await removePermissionFromRole(roleId, permissionId);
      toast.success('Permission removed successfully');
      await loadData();
      setSelectedRole(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove permission');
    }
  };

  const openEditRole = (role) => {
    setEditingRole(role);
    setRoleFormData({ name: role.name, description: role.description || '' });
    setShowRoleModal(true);
  };

  const filteredRoles = availableRoles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPermissions = availablePermissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.resource?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!canManageUsers) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-500">
          You don't have permission to manage roles and permissions.
        </p>
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
          <h1 className="text-2xl font-bold text-gray-900">Role & Permissions</h1>
          <p className="text-gray-600">Manage user roles and their permissions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => {
              if (activeTab === 'roles') {
                setEditingRole(null);
                setRoleFormData({ name: '', description: '' });
                setShowRoleModal(true);
              } else {
                setPermissionFormData({ name: '', description: '', resource: '', action: '' });
                setShowPermissionModal(true);
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {activeTab === 'roles' ? 'Role' : 'Permission'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Roles ({availableRoles.length})
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Key className="h-4 w-4 inline mr-2" />
            Permissions ({availablePermissions.length})
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-soft p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                    <p className="text-sm text-gray-500">{role.description || 'No description'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedRole(role);
                      setShowPermissionAssignment(true);
                    }}
                    title="Manage permissions"
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditRole(role)}
                    title="Edit role"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteRole(role.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete role"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Permissions:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {role.permissions?.length || 0}
                  </span>
                </div>
                
                <div>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions?.slice(0, 3).map((permission) => (
                      <span
                        key={permission.id || permission.permissionId}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {permission.permission?.name || permission.name}
                      </span>
                    ))}
                    {role.permissions?.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPermissions.map((permission) => (
            <motion.div
              key={permission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-soft p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">{permission.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{permission.description || 'No description'}</p>
                  <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                    <span>{permission.resource}</span>
                    <span>•</span>
                    <span>{permission.action}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setEditingRole(null);
          setRoleFormData({ name: '', description: '' });
        }}
        title={editingRole ? 'Edit Role' : 'Create Role'}
      >
        <form onSubmit={handleCreateRole} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Name *
            </label>
            <Input
              type="text"
              value={roleFormData.name}
              onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
              placeholder="Enter role name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={roleFormData.description}
              onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
              placeholder="Enter role description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowRoleModal(false);
                setEditingRole(null);
                setRoleFormData({ name: '', description: '' });
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              {editingRole ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Permission Assignment Modal */}
      <Modal
        isOpen={showPermissionAssignment}
        onClose={() => {
          setShowPermissionAssignment(false);
          setSelectedRole(null);
        }}
        title={`Manage Permissions - ${selectedRole?.name}`}
      >
        {selectedRole && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Permissions
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedRole.permissions?.length > 0 ? (
                  selectedRole.permissions.map((permission) => (
                    <div
                      key={permission.id || permission.permissionId}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm font-medium">
                        {permission.permission?.name || permission.name}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemovePermission(
                          selectedRole.id,
                          permission.permissionId || permission.permission?.id
                        )}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No permissions assigned</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Permissions
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availablePermissions
                  .filter(permission => 
                    !selectedRole.permissions?.some(
                      p => (p.permissionId || p.permission?.id) === permission.id
                    )
                  )
                  .map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <span className="text-sm font-medium">{permission.name}</span>
                        <p className="text-xs text-gray-500">{permission.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssignPermission(selectedRole.id, permission.id)}
                      >
                        Assign
                      </Button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPermissionAssignment(false);
                  setSelectedRole(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Permission Modal */}
      <Modal
        isOpen={showPermissionModal}
        onClose={() => {
          setShowPermissionModal(false);
          setPermissionFormData({ name: '', description: '', resource: '', action: '' });
        }}
        title="Create Permission"
      >
        <form onSubmit={handleCreatePermission} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permission Name *
            </label>
            <Input
              type="text"
              value={permissionFormData.name}
              onChange={(e) => setPermissionFormData({ ...permissionFormData, name: e.target.value })}
              placeholder="e.g., employee:read"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={permissionFormData.description}
              onChange={(e) => setPermissionFormData({ ...permissionFormData, description: e.target.value })}
              placeholder="Enter permission description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource *
              </label>
              <Input
                type="text"
                value={permissionFormData.resource}
                onChange={(e) => setPermissionFormData({ ...permissionFormData, resource: e.target.value })}
                placeholder="e.g., employee"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action *
              </label>
              <Input
                type="text"
                value={permissionFormData.action}
                onChange={(e) => setPermissionFormData({ ...permissionFormData, action: e.target.value })}
                placeholder="e.g., read"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowPermissionModal(false);
                setPermissionFormData({ name: '', description: '', resource: '', action: '' });
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default RolePermissions;
