import React from 'react';
import { motion } from 'framer-motion';
import HolidayManagement from './components/attendanceComponents/HolidayManagement';
import { useState, useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { attendanceApi } from '../../api/attendanceApi';
import { formatDate } from '../../api/attendanceApi';
import { toast } from 'react-hot-toast';

/**
 * HolidaysPage Component
 * Full page for managing company holidays
 */
const HolidaysPage = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      const response = await attendanceApi.listHolidays({ take: 200 });
      setHolidays(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = () => {
    loadHolidays();
  };

  // Group holidays by year
  const holidaysByYear = holidays.reduce((acc, holiday) => {
    const year = new Date(holiday.date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(holiday);
    return acc;
  }, {});

  const sortedYears = Object.keys(holidaysByYear).sort((a, b) => b - a);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Holiday Calendar</h1>
          <p className="text-gray-600">Manage company holidays and public holidays</p>
        </div>
        <Button onClick={() => setShowHolidayModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Holiday
        </Button>
      </div>

      {/* Holidays by Year */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : sortedYears.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-soft border border-gray-200">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No holidays configured</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedYears.map((year) => (
            <motion.div
              key={year}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-soft p-6 border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{year}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {holidaysByYear[year]
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((holiday) => (
                    <div
                      key={holiday.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{holiday.name}</h3>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {holiday.type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(holiday.date)}</span>
                      </div>
                      {holiday.isRecurring && (
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Recurring
                        </span>
                      )}
                      {holiday.description && (
                        <p className="text-sm text-gray-500 mt-2">{holiday.description}</p>
                      )}
                    </div>
                  ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Holiday Management Modal */}
      <HolidayManagement
        isOpen={showHolidayModal}
        onClose={() => setShowHolidayModal(false)}
        onUpdate={handleUpdate}
      />
    </motion.div>
  );
};

export default HolidaysPage;

