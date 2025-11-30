import {
  Users,
  Calendar,
  Briefcase,
  BarChart3,
  Settings,
  FileText,
  Clock,
  UserCheck,
  UserPlus,
  TrendingUp,
  Shield,
  LogOut,
  Building,
} from 'lucide-react';

/**
 * Navigation Configuration
 * Defines the main navigation items with permissions based on actual project structure
 */
export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    permission: null,
    description: 'Overview and analytics',
    category: 'main',
  },
  {
    name: 'Employees',
    href: '/employees',
    icon: Users,
    permission: 'employee:read',
    description: 'Manage team members',
    category: 'hr',
    subItems: [
      {
        name: 'All Employees',
        href: '/employees',
        icon: Users,
        permission: 'employee:read',
      },
      {
        name: 'Add Employee',
        href: '/employees/new',
        icon: UserPlus,
        permission: 'employee:create',
      },
    ],
  },
  {
    name: 'Attendance',
    href: '/attendance',
    icon: Calendar,
    permission: 'attendance:read',
    description: 'Track attendance and time',
    category: 'hr',
    subItems: [
      {
        name: 'Attendance Records',
        href: '/attendance',
        icon: Calendar,
        permission: 'attendance:read',
      },
      {
        name: 'Leave Requests',
        href: '/attendance/leave',
        icon: Clock,
        permission: 'attendance:read',
      },
    ],
  },
  {
    name: 'Recruitment',
    href: '/recruitment',
    icon: Briefcase,
    permission: 'recruitment:read',
    description: 'Hiring and recruitment process',
    category: 'hr',
    subItems: [
      {
        name: 'Job Postings',
        href: '/recruitment',
        icon: Briefcase,
        permission: 'recruitment:read',
      },
      {
        name: 'Candidates',
        href: '/recruitment/candidates',
        icon: UserCheck,
        permission: 'recruitment:read',
      },
      {
        name: 'Interviews',
        href: '/recruitment/interviews',
        icon: Calendar,
        permission: 'recruitment:read',
      },
    ],
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: TrendingUp,
    permission: 'employee:read', // Using employee:read as base permission
    description: 'HR analytics and insights',
    category: 'reports',
    subItems: [
      {
        name: 'Employee Analytics',
        href: '/analytics/employees',
        icon: Users,
        permission: 'employee:read',
      },
      {
        name: 'Attendance Analytics',
        href: '/analytics/attendance',
        icon: Calendar,
        permission: 'attendance:read',
      },
      {
        name: 'Recruitment Analytics',
        href: '/analytics/recruitment',
        icon: Briefcase,
        permission: 'recruitment:read',
      },
    ],
  },
  // {
  //   name: 'Reports',
  //   href: '/reports',
  //   icon: FileText,
  //   permission: 'employee:read', // Using employee:read as base permission
  //   description: 'Generate HR reports',
  //   category: 'reports',
  //   subItems: [
  //     {
  //       name: 'Employee Reports',
  //       href: '/reports/employees',
  //       icon: Users,
  //       permission: 'employee:read',
  //     },
  //     {
  //       name: 'Attendance Reports',
  //       href: '/reports/attendance',
  //       icon: Calendar,
  //       permission: 'attendance:read',
  //     },
  //     {
  //       name: 'Recruitment Reports',
  //       href: '/reports/recruitment',
  //       icon: Briefcase,
  //       permission: 'recruitment:read',
  //     },
  //   ],
  // },
  {
    name: 'Administration',
    href: '/admin',
    icon: Shield,
    permission: 'admin:manage_users',
    description: 'System administration',
    category: 'admin',
    subItems: [
      {
        name: 'User Management',
        href: '/admin/users',
        icon: Users,
        permission: 'admin:manage_users',
      },
      {
        name: 'Role & Permissions',
        href: '/admin/roles',
        icon: Shield,
        permission: 'admin:manage_users',
      },
      {
        name: 'System Settings',
        href: '/admin/settings',
        icon: Settings,
        permission: 'admin:manage_system',
      },
      {
        name: 'Departments',
        href: '/admin/departments',
        icon: Building,
        permission: 'employee:update',
      },
      {
        name: 'Manager Assignment',
        href: '/admin/managers',
        icon: UserCheck,
        permission: 'employee:update',
      },
    ],
  },
];

/**
 * Filter navigation items based on user permissions
 * @param {Array} permissions - User permissions array
 * @param {Object} user - User object
 * @returns {Array} Filtered navigation items with filtered subItems
 */
export const filterNavigationByPermissions = (permissions = [], user = null) => {
  return NAVIGATION_ITEMS.filter(item => {
    // If no user or permissions not loaded, show all items
    if (!user || !permissions || permissions.length === 0) {
      return true;
    }
    
    // If item has no permission requirement, show it
    if (!item.permission) {
      return true;
    }
    
    // Otherwise filter by permissions
    return permissions.includes(item.permission);
  }).map(item => {
    // If item has subItems, filter them too
    if (item.subItems && item.subItems.length > 0) {
      const filteredSubItems = item.subItems.filter(subItem => {
        // If no user or permissions not loaded, show all subItems
        if (!user || !permissions || permissions.length === 0) {
          return true;
        }
        
        // If subItem has no permission requirement, show it
        if (!subItem.permission) {
          return true;
        }
        
        // Otherwise filter by permissions
        return permissions.includes(subItem.permission);
      });
      
      return {
        ...item,
        subItems: filteredSubItems
      };
    }
    
    return item;
  }).filter(item => {
    // Remove items that have no visible subItems (if they have subItems)
    if (item.subItems && item.subItems.length === 0) {
      return false;
    }
    return true;
  });
};

/**
 * Get navigation items by category
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered navigation items
 */
export const getNavigationByCategory = (category) => {
  return NAVIGATION_ITEMS.filter(item => item.category === category);
};

/**
 * Get all available categories
 * @returns {Array} Array of category names
 */
export const getNavigationCategories = () => {
  const categories = [...new Set(NAVIGATION_ITEMS.map(item => item.category))];
  return categories.filter(Boolean);
};

/**
 * Check if user has access to any navigation item
 * @param {Array} permissions - User permissions array
 * @param {Object} user - User object
 * @returns {boolean} Whether user has access to any navigation
 */
export const hasNavigationAccess = (permissions = [], user = null) => {
  const filteredItems = filterNavigationByPermissions(permissions, user);
  return filteredItems.length > 0;
};

/**
 * Get navigation item by href
 * @param {string} href - Navigation href
 * @returns {Object|null} Navigation item or null
 */
export const getNavigationByHref = (href) => {
  return NAVIGATION_ITEMS.find(item => item.href === href) || null;
};

export default NAVIGATION_ITEMS;
