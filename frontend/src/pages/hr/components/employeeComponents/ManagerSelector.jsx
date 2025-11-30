import React, { useState, useMemo } from 'react';
import { Search, User, Building, Users } from 'lucide-react';
import { Input } from '../../../../components/ui/Input';
import { cn } from '../../../../lib/utils';

/**
 * Manager Selector Component
 * Reusable component for selecting managers with search and filtering
 */
const ManagerSelector = ({
  value,
  onChange,
  managers = [],
  excludeEmployeeId = null,
  label = 'Manager',
  required = false,
  error,
  disabled = false,
  className = '',
  showEmptyOption = true,
  placeholder = 'Select or search for a manager...'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Filter managers based on search term and exclude self
  const filteredManagers = useMemo(() => {
    let filtered = managers.filter(manager => {
      // Exclude the employee themselves
      if (excludeEmployeeId && manager.id === excludeEmployeeId) {
        return false;
      }
      return true;
    });

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(manager =>
        manager.firstName?.toLowerCase().includes(searchLower) ||
        manager.lastName?.toLowerCase().includes(searchLower) ||
        manager.email?.toLowerCase().includes(searchLower) ||
        manager.jobTitle?.toLowerCase().includes(searchLower) ||
        manager.department?.name?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [managers, searchTerm, excludeEmployeeId]);

  const selectedManager = managers.find(m => m.id === value);

  const handleSelect = (managerId) => {
    onChange(managerId || null);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={cn('relative', className)}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'w-full px-3 py-2 border rounded-lg cursor-pointer flex items-center justify-between',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            error ? 'border-red-500' : 'border-gray-300',
            disabled && 'bg-gray-100 cursor-not-allowed'
          )}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {selectedManager ? (
              <>
                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">
                  {selectedManager.firstName} {selectedManager.lastName}
                </span>
                {selectedManager.jobTitle && (
                  <span className="text-gray-500 text-sm truncate hidden sm:inline">
                    - {selectedManager.jobTitle}
                  </span>
                )}
              </>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search managers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                  autoFocus
                />
              </div>
            </div>

            {/* Manager List */}
            <div className="overflow-y-auto max-h-48">
              {showEmptyOption && (
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className={cn(
                    'w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors',
                    !value && 'bg-blue-50 text-blue-700'
                  )}
                >
                  <span className="text-gray-500">No Manager</span>
                </button>
              )}
              
              {filteredManagers.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No managers found</p>
                  {searchTerm && (
                    <p className="text-xs mt-1">Try a different search term</p>
                  )}
                </div>
              ) : (
                filteredManagers.map((manager) => (
                  <button
                    key={manager.id}
                    type="button"
                    onClick={() => handleSelect(manager.id)}
                    className={cn(
                      'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0',
                      value === manager.id && 'bg-blue-50 text-blue-700'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 font-semibold text-sm">
                          {manager.firstName?.[0]}{manager.lastName?.[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {manager.firstName} {manager.lastName}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {manager.jobTitle}
                          {manager.department?.name && (
                            <span className="ml-2">
                              <Building className="h-3 w-3 inline mr-1" />
                              {manager.department.name}
                            </span>
                          )}
                        </div>
                        {manager.email && (
                          <div className="text-xs text-gray-400 truncate mt-0.5">
                            {manager.email}
                          </div>
                        )}
                      </div>
                      {value === manager.id && (
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ManagerSelector;

