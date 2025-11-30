import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Tag,
  Users,
  Briefcase,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FormField } from '../../components/ui/FormField';
import { Modal } from '../../components/ui/Modal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { adminApi } from '../../api/adminApi';
import { queryKeys } from '../../lib/react-query';

/**
 * Skills Management Page
 * Allows admins to create, update, and delete skills
 */
const SkillsManagement = () => {
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    skillId: null,
    skillName: '',
  });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    isRequired: false,
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch skills
  const { data: skills = [], isLoading, error, refetch } = useQuery({
    queryKey: ['adminSkills'],
    queryFn: async () => {
      const response = await adminApi.getAllSkills();
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const createSkillMutation = useMutation({
    mutationFn: adminApi.createSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSkills'] });
      toast.success('Skill created successfully');
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create skill');
    },
  });

  const updateSkillMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateSkill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSkills'] });
      toast.success('Skill updated successfully');
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update skill');
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: adminApi.deleteSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSkills'] });
      toast.success('Skill deleted successfully');
      setDeleteConfirmation({ isOpen: false, skillId: null, skillName: '' });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to delete skill';
      toast.error(errorMessage);
      if (error.response?.data?.code === 'SKILL_IN_USE') {
        toast.error('This skill is being used and cannot be deleted');
      }
    },
  });

  // Filtered skills
  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      const matchesSearch = !searchTerm || 
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || skill.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [skills, searchTerm, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(skills.map(s => s.category).filter(Boolean))];
    return cats.sort();
  }, [skills]);

  // Form handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Skill name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (editingSkill) {
      updateSkillMutation.mutate({ id: editingSkill.id, data: formData });
    } else {
      createSkillMutation.mutate(formData);
    }
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name || '',
      description: skill.description || '',
      category: skill.category || '',
      subcategory: skill.subcategory || '',
      isRequired: skill.isRequired || false,
    });
    setFormErrors({});
    setShowSkillForm(true);
  };

  const handleDelete = (skill) => {
    setDeleteConfirmation({
      isOpen: true,
      skillId: skill.id,
      skillName: skill.name,
    });
  };

  const handleCloseForm = () => {
    setShowSkillForm(false);
    setEditingSkill(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      subcategory: '',
      isRequired: false,
    });
    setFormErrors({});
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.skillId) {
      deleteSkillMutation.mutate(deleteConfirmation.skillId);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Skills</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <Button onClick={() => refetch()}>Try Again</Button>
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
          <h1 className="text-2xl font-bold text-gray-900">Skills Management</h1>
          <p className="text-gray-600 mt-1">Manage the skills catalog for your organization</p>
        </div>
        <Button onClick={() => setShowSkillForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Skills Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Try adjusting your filters'
              : 'Get started by adding your first skill'}
          </p>
          {!searchTerm && categoryFilter === 'all' && (
            <Button onClick={() => setShowSkillForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSkills.map((skill) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{skill.name}</h3>
                  {skill.category && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded">
                      {skill.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(skill)}
                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                    title="Edit skill"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(skill)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete skill"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {skill.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{skill.description}</p>
              )}
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{skill._count?.employees || 0} employees</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Briefcase className="h-3 w-3" />
                  <span>{skill._count?.jobPostings || 0} jobs</span>
                </div>
              </div>
              
              {skill.isRequired && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-xs font-medium text-orange-600">Required Skill</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Skill Form Modal */}
      <Modal
        isOpen={showSkillForm}
        onClose={handleCloseForm}
        size="lg"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingSkill ? 'Edit Skill' : 'Add New Skill'}
            </h2>
            <button
              onClick={handleCloseForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Skill Name" error={formErrors.name} required>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., JavaScript, Project Management"
                error={formErrors.name}
              />
            </FormField>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  formErrors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Brief description of the skill..."
              />
              {formErrors.description && (
                <p className="text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠</span>
                  {formErrors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Category" error={formErrors.category}>
                <Input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Technical, Soft Skills"
                  error={formErrors.category}
                />
              </FormField>

              <FormField label="Subcategory" error={formErrors.subcategory}>
                <Input
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  placeholder="e.g., Programming, Communication"
                  error={formErrors.subcategory}
                />
              </FormField>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRequired"
                name="isRequired"
                checked={formData.isRequired}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isRequired" className="ml-2 text-sm text-gray-700">
                Mark as required skill
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseForm}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createSkillMutation.isPending || updateSkillMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingSkill ? 'Update Skill' : 'Create Skill'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, skillId: null, skillName: '' })}
        onConfirm={handleConfirmDelete}
        title="Delete Skill"
        message={`Are you sure you want to delete "${deleteConfirmation.skillName}"? This action cannot be undone. If the skill is being used by employees or job postings, it cannot be deleted.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteSkillMutation.isPending}
        icon={Trash2}
      />
    </motion.div>
  );
};

export default SkillsManagement;

