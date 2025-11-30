import axiosClient from './axiosClient';

/**
 * Admin API service for user, role, and permission management
 */
export const adminApi = {
  // User Management
  async getAllUsers(params = {}) {
    const response = await axiosClient.get('/auth/users', { params });
    return response.data;
  },

  async updateUserStatus(userId, isActive) {
    const response = await axiosClient.put(`/auth/users/${userId}/status`, { isActive });
    return response.data;
  },

  async deleteUser(userId) {
    const response = await axiosClient.delete(`/auth/users/${userId}`);
    return response.data;
  },

  async assignRoleToUser(userId, roleId) {
    const response = await axiosClient.post('/auth/assign-role', { userId, roleId });
    return response.data;
  },

  async removeRoleFromUser(userId, roleId) {
    const response = await axiosClient.post('/auth/remove-role', { userId, roleId });
    return response.data;
  },

  // Role Management
  async getAllRoles() {
    const response = await axiosClient.get('/auth/roles');
    return response.data;
  },

  async createRole(roleData) {
    const response = await axiosClient.post('/auth/roles', roleData);
    return response.data;
  },

  async updateRole(roleId, roleData) {
    const response = await axiosClient.put(`/auth/roles/${roleId}`, roleData);
    return response.data;
  },

  async deleteRole(roleId) {
    const response = await axiosClient.delete(`/auth/roles/${roleId}`);
    return response.data;
  },

  // Permission Management
  async getAllPermissions() {
    const response = await axiosClient.get('/auth/permissions');
    return response.data;
  },

  async createPermission(permissionData) {
    const response = await axiosClient.post('/auth/permissions', permissionData);
    return response.data;
  },

  async assignPermissionToRole(roleId, permissionId) {
    const response = await axiosClient.post(`/auth/roles/${roleId}/permissions`, { permissionId });
    return response.data;
  },

  async removePermissionFromRole(roleId, permissionId) {
    const response = await axiosClient.delete(`/auth/roles/${roleId}/permissions`, { 
      data: { permissionId } 
    });
    return response.data;
  },

  // System Management
  async createDefaultRolesAndPermissions() {
    const response = await axiosClient.post('/auth/create-default-roles');
    return response.data;
  },

  async cleanExpiredTokens() {
    const response = await axiosClient.post('/auth/clean-expired-tokens');
    return response.data;
  },

  // Skills Management
  async getAllSkills(params = {}) {
    const response = await axiosClient.get('/hr/employees/skills', { params });
    return response.data;
  },

  async getSkillById(skillId) {
    const response = await axiosClient.get(`/hr/employees/skills/${skillId}`);
    return response.data;
  },

  async createSkill(skillData) {
    const response = await axiosClient.post('/hr/employees/skills', skillData);
    return response.data;
  },

  async updateSkill(skillId, skillData) {
    const response = await axiosClient.put(`/hr/employees/skills/${skillId}`, skillData);
    return response.data;
  },

  async deleteSkill(skillId) {
    const response = await axiosClient.delete(`/hr/employees/skills/${skillId}`);
    return response.data;
  },
};

export default adminApi;
