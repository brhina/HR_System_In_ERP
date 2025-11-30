import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  Settings, 
  Building,
  UserCheck,
  BarChart3,
  CheckCircle,
  Activity,
  Database,
  Server,
  TrendingUp,
  ArrowRight,
  Tag
} from 'lucide-react';
import { useAdminStore } from '../../stores/useAdminStore';
import useAuthStore from '../../stores/useAuthStore';
import useEmployeeStore from '../../stores/useEmployeeStore';

/**
 * AdminDashboard Component
 * Overview dashboard with links to dedicated admin pages
 */
const AdminDashboard = () => {
  const { user: currentUser, permissions, roles } = useAuthStore();
  const {
    users,
    roles: availableRoles,
    permissions: availablePermissions,
    isLoading,
    fetchUsers,
    fetchRoles,
    fetchPermissions,
  } = useAdminStore();
  
  const { departments, fetchDepartments } = useEmployeeStore();

  // Check permissions
  const canManageUsers = permissions?.includes('admin:manage_users') || 
                        roles?.includes('super_admin') || 
                        roles?.includes('admin');
  const canManageSystem = permissions?.includes('admin:manage_system') || 
                         roles?.includes('super_admin') || 
                         roles?.includes('admin');
  const canManageEmployees = permissions?.includes('employee:update') || 
                            roles?.includes('super_admin') || 
                            roles?.includes('admin');

  // Load initial data
  useEffect(() => {
    if (canManageUsers || canManageSystem) {
      loadAllData();
    }
  }, [canManageUsers, canManageSystem]);

  useEffect(() => {
    if (canManageEmployees) {
      fetchDepartments();
    }
  }, [canManageEmployees]);

  const loadAllData = async () => {
    try {
      const promises = [];
      
      if (canManageUsers) {
        promises.push(
          fetchUsers({ page: 1, limit: 20 }),
          fetchRoles(),
          fetchPermissions()
        );
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  if (!canManageUsers && !canManageSystem && !canManageEmployees) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      change: `${users.filter(u => u.isActive).length} active`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/admin/users',
      permission: canManageUsers
    },
    {
      title: 'Roles',
      value: availableRoles.length,
      change: `${availablePermissions.length} permissions`,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/admin/roles',
      permission: canManageUsers
    },
    {
      title: 'Departments',
      value: departments.length,
      change: 'Organizational units',
      icon: Building,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/admin/departments',
      permission: canManageEmployees
    },
    {
      title: 'System Health',
      value: 'Healthy',
      change: 'All systems operational',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/admin/settings',
      permission: canManageSystem
    }
  ];

  const adminCards = [
    {
      title: 'User Management',
      description: 'Manage system users, roles, and permissions',
      icon: Users,
      link: '/admin/users',
      color: 'blue',
      permission: canManageUsers
    },
    {
      title: 'Role & Permissions',
      description: 'Configure roles and their associated permissions',
      icon: Shield,
      link: '/admin/roles',
      color: 'purple',
      permission: canManageUsers
    },
    {
      title: 'Department Management',
      description: 'Create and manage organizational departments',
      icon: Building,
      link: '/admin/departments',
      color: 'green',
      permission: canManageEmployees
    },
    {
      title: 'Manager Assignment',
      description: 'Assign managers to employees',
      icon: UserCheck,
      link: '/admin/managers',
      color: 'indigo',
      permission: canManageEmployees
    },
    {
      title: 'Skills Management',
      description: 'Create and manage the skills catalog',
      icon: Tag,
      link: '/admin/skills',
      color: 'orange',
      permission: canManageSystem
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings and preferences',
      icon: Settings,
      link: '/admin/settings',
      color: 'gray',
      permission: canManageSystem
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview and quick access to administrative functions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.filter(stat => stat.permission).map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-soft p-6 hover:shadow-md transition-shadow"
            >
              <Link to={stat.link} className="block">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-2">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Admin Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Administrative Functions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.filter(card => card.permission).map((card, index) => {
            const Icon = card.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600',
              purple: 'bg-purple-100 text-purple-600',
              green: 'bg-green-100 text-green-600',
              indigo: 'bg-indigo-100 text-indigo-600',
              gray: 'bg-gray-100 text-gray-600'
            };
            
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={card.link}>
                  <div className="bg-white rounded-xl shadow-soft p-6 hover:shadow-md transition-all hover:scale-105 cursor-pointer h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-soft p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Server className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">API Server</p>
              <p className="text-sm text-green-600">Running</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Database className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Database</p>
              <p className="text-sm text-green-600">Connected</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Security</p>
              <p className="text-sm text-green-600">Protected</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
