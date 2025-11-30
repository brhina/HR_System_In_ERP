import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Database, Server, Shield, Bell, Globe, Save, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import useAuthStore from '../../stores/useAuthStore';
import toast from 'react-hot-toast';

/**
 * SystemSettings Component
 * System settings and configuration dashboard
 */
const SystemSettings = () => {
  const { permissions, roles } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'HR Management System',
    timezone: 'UTC+0',
    dateFormat: 'YYYY-MM-DD',
    passwordPolicy: 'Strong',
    sessionTimeout: '8 hours',
    twoFactorAuth: false,
    emailNotifications: true,
    smtpServer: 'smtp.company.com',
    notificationFrequency: 'Real-time',
    databaseType: 'PostgreSQL',
    connectionPool: '10',
    backupFrequency: 'Daily',
  });

  const canManageSystem = permissions?.includes('admin:manage_system') || 
                         roles?.includes('super_admin') || 
                         roles?.includes('admin');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to save settings
      // await adminApi.updateSystemSettings(settings);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    // TODO: Implement API call to fetch current settings
    toast.info('Refreshing settings...');
  };

  if (!canManageSystem) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-500">
          You don't have permission to manage system settings.
        </p>
      </div>
    );
  }

  const settingsCategories = [
    {
      id: 1,
      name: 'General Settings',
      description: 'Basic system configuration',
      icon: Settings,
      settings: [
        { 
          key: 'companyName', 
          label: 'Company Name', 
          type: 'text',
          editable: true 
        },
        { 
          key: 'timezone', 
          label: 'Timezone', 
          type: 'select',
          options: ['UTC+0', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC-5', 'UTC-8'],
          editable: true 
        },
        { 
          key: 'dateFormat', 
          label: 'Date Format', 
          type: 'select',
          options: ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY'],
          editable: true 
        },
      ],
    },
    {
      id: 2,
      name: 'Database Settings',
      description: 'Database connection and configuration',
      icon: Database,
      settings: [
        { 
          key: 'databaseType', 
          label: 'Database Type', 
          type: 'text',
          editable: false 
        },
        { 
          key: 'connectionPool', 
          label: 'Connection Pool', 
          type: 'number',
          editable: true 
        },
        { 
          key: 'backupFrequency', 
          label: 'Backup Frequency', 
          type: 'select',
          options: ['Daily', 'Weekly', 'Monthly'],
          editable: true 
        },
      ],
    },
    {
      id: 3,
      name: 'Security Settings',
      description: 'Security and authentication configuration',
      icon: Shield,
      settings: [
        { 
          key: 'passwordPolicy', 
          label: 'Password Policy', 
          type: 'select',
          options: ['Weak', 'Medium', 'Strong', 'Very Strong'],
          editable: true 
        },
        { 
          key: 'sessionTimeout', 
          label: 'Session Timeout', 
          type: 'select',
          options: ['1 hour', '4 hours', '8 hours', '24 hours'],
          editable: true 
        },
        { 
          key: 'twoFactorAuth', 
          label: 'Two-Factor Auth', 
          type: 'checkbox',
          editable: true 
        },
      ],
    },
    {
      id: 4,
      name: 'Notification Settings',
      description: 'Email and notification preferences',
      icon: Bell,
      settings: [
        { 
          key: 'emailNotifications', 
          label: 'Email Notifications', 
          type: 'checkbox',
          editable: true 
        },
        { 
          key: 'smtpServer', 
          label: 'SMTP Server', 
          type: 'text',
          editable: true 
        },
        { 
          key: 'notificationFrequency', 
          label: 'Notification Frequency', 
          type: 'select',
          options: ['Real-time', 'Hourly', 'Daily', 'Weekly'],
          editable: true 
        },
      ],
    },
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleSave}
            loading={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> System settings API integration is pending. Changes are currently saved locally only.
        </p>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-soft p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Icon className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {category.settings.map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">{setting.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {setting.editable ? (
                        setting.type === 'checkbox' ? (
                          <input
                            type="checkbox"
                            checked={settings[setting.key]}
                            onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        ) : setting.type === 'select' ? (
                          <select
                            value={settings[setting.key]}
                            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {setting.options?.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            type={setting.type || 'text'}
                            value={settings[setting.key]}
                            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                            className="w-32"
                            size="sm"
                          />
                        )
                      ) : (
                        <span className="text-sm text-gray-600">{settings[setting.key]}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SystemSettings;
