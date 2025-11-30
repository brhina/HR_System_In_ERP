import { prisma } from "../../../config/db.js";
import { dateRange } from "../../../utils/dateUtils.js";

export async function findMany({ q, departmentId, status, take, skip }) {
  const where = {
    AND: [
      q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      departmentId ? { departmentId } : {},
      status ? { status } : {},
    ],
  };
  return prisma.employee.findMany({ where, take, skip, orderBy: { createdAt: "desc" } });
}

export function findById(id) {
  return prisma.employee.findUnique({ 
    where: { id },
    include: {
      department: { select: { id: true, name: true } },
      manager: { select: { id: true, firstName: true, lastName: true } }
    }
  });
}

export function findDepartmentById(id) {
  return prisma.department.findUnique({ where: { id } });
}

export function findDepartmentByName(name) {
  return prisma.department.findFirst({ where: { name } });
}

export function findAllDepartments() {
  return prisma.department.findMany({ 
    orderBy: { name: 'asc' },
    include: {
      employees: {
        select: { id: true }
      }
    }
  });
}

export function createDepartment(data) {
  return prisma.department.create({ data });
}

export function updateDepartment(id, data) {
  return prisma.department.update({ where: { id }, data });
}

export function deleteDepartment(id) {
  return prisma.department.delete({ where: { id } });
}

export function findEmployeesByDepartment(departmentId) {
  return prisma.employee.findMany({ where: { departmentId } });
}

export function findAllSkills() {
  return prisma.skill.findMany({ orderBy: { name: 'asc' } });
}

export function findSkillById(id) {
  return prisma.skill.findUnique({ where: { id } });
}

export function findSkillAssignment(employeeId, skillId) {
  return prisma.skillAssignment.findFirst({ 
    where: { employeeId, skillId } 
  });
}

export function findManyForManagerSelection() {
  return prisma.employee.findMany({ 
    select: { id: true, firstName: true, lastName: true, email: true, jobTitle: true },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
  });
}

export function create(data) {
  return prisma.employee.create({ data });
}

export function updateById(id, data) {
  return prisma.employee.update({ where: { id }, data });
}

export function deleteById(id) {
  return prisma.employee.delete({ where: { id } });
}

// Directory search: by name/email/title/department
export function searchDirectory({ q, departmentId, take = 20, skip = 0 } = {}) {
  const where = {
    AND: [
      q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { jobTitle: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      departmentId ? { departmentId } : {},
    ],
  };
  return prisma.employee.findMany({
    where,
    include: { department: true, manager: { select: { id: true, firstName: true, lastName: true } } },
    take,
    skip,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}

// Org chart: fetch tree up to depth using recursive expansion in app layer
export async function getOrgChart({ rootId, depth = 2 }) {
  const root = rootId ? await prisma.employee.findUnique({ 
    where: { id: rootId },
    include: { department: { select: { id: true, name: true } } }
  }) : null;
  
  // If rootId is provided but employee doesn't exist, throw error
  if (rootId && !root) {
    const error = new Error(`Employee with ID ${rootId} not found`);
    error.statusCode = 404;
    error.code = 'EMPLOYEE_NOT_FOUND';
    throw error;
  }
  
  const topManagers = await prisma.employee.findMany({ 
    where: { managerId: null },
    include: { department: { select: { id: true, name: true } } }
  });
  const seeds = root ? [root] : topManagers;

  async function loadChildren(node, level) {
    if (level >= depth) return { ...node, subordinates: [] };
    const subs = await prisma.employee.findMany({ 
      where: { managerId: node.id }, 
      orderBy: { lastName: "asc" },
      include: { department: { select: { id: true, name: true } } }
    });
    const children = await Promise.all(subs.map((s) => loadChildren(s, level + 1)));
    return { ...node, subordinates: children };
  }

  const trees = await Promise.all(seeds.map((n) => loadChildren(n, 0)));
  return trees;
}

// Skills
export function listEmployeeSkills(employeeId) {
  return prisma.skillAssignment.findMany({
    where: { employeeId },
    include: { 
      skill: { 
        include: { 
          skillLevels: { orderBy: { level: 'asc' } } 
        } 
      },
      assessedBy: { 
        select: { id: true, firstName: true, lastName: true, email: true } 
      }
    },
    orderBy: { level: "desc" },
  });
}

export function addEmployeeSkill(employeeId, { skillId, level, evidence, notes, assessedBy }) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.skillAssignment.findFirst({
      where: { employeeId, skillId }
    });
    
    if (existing) {
      return tx.skillAssignment.update({
        where: { id: existing.id },
        data: {
          level,
          evidence,
          notes,
          assessedById: assessedBy,
          assessedAt: assessedBy ? new Date() : null,
          isSelfAssessed: !assessedBy,
          lastUpdated: new Date()
        }
      });
    } else {
      return tx.skillAssignment.create({
        data: {
          employeeId,
          skillId,
          level,
          evidence,
          notes,
          assessedById: assessedBy,
          assessedAt: assessedBy ? new Date() : null,
          isSelfAssessed: !assessedBy
        }
      });
    }
  });
}

export function updateEmployeeSkill(_employeeId, assignmentId, { level, evidence, notes, assessedBy }) {
  return prisma.skillAssignment.update({ 
    where: { id: assignmentId }, 
    data: { 
      level, 
      evidence, 
      notes, 
      assessedById: assessedBy,
      assessedAt: assessedBy ? new Date() : null,
      isSelfAssessed: !assessedBy,
      lastUpdated: new Date()
    } 
  });
}

export function removeEmployeeSkill(_employeeId, assignmentId) {
  return prisma.skillAssignment.delete({ where: { id: assignmentId } });
}

// Enhanced Skills Functions
export function getAllSkills() {
  return prisma.skill.findMany({
    include: { 
      skillLevels: { orderBy: { level: 'asc' } },
      employees: { 
        include: { 
          employee: { 
            select: { id: true, firstName: true, lastName: true, email: true } 
          } 
        } 
      }
    },
    orderBy: { name: 'asc' }
  });
}

// Admin Skills Management Functions
export function findSkillByIdWithDetails(id) {
  return prisma.skill.findUnique({
    where: { id },
    include: {
      skillLevels: { orderBy: { level: 'asc' } },
      _count: {
        select: {
          employees: true,
          jobPostings: true,
          certifications: true,
        }
      }
    }
  });
}

export function findSkillByName(name) {
  return prisma.skill.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } }
  });
}

export function createSkill(data) {
  return prisma.skill.create({
    data: {
      name: data.name,
      description: data.description || null,
      category: data.category || null,
      subcategory: data.subcategory || null,
      isRequired: data.isRequired || false,
    },
    include: {
      skillLevels: true,
    }
  });
}

export function updateSkill(id, data) {
  const updateData = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.category !== undefined) updateData.category = data.category || null;
  if (data.subcategory !== undefined) updateData.subcategory = data.subcategory || null;
  if (data.isRequired !== undefined) updateData.isRequired = data.isRequired;
  
  return prisma.skill.update({
    where: { id },
    data: updateData,
    include: {
      skillLevels: { orderBy: { level: 'asc' } },
    }
  });
}

export function deleteSkill(id) {
  return prisma.$transaction(async (tx) => {
    // Check if skill is being used
    const skillAssignments = await tx.skillAssignment.count({ where: { skillId: id } });
    const jobPostingSkills = await tx.jobPostingSkill.count({ where: { skillId: id } });
    const certificationSkills = await tx.certificationSkill.count({ where: { skillId: id } });
    
    if (skillAssignments > 0 || jobPostingSkills > 0 || certificationSkills > 0) {
      const error = new Error('Cannot delete skill: it is being used by employees, job postings, or certifications');
      error.statusCode = 400;
      error.code = 'SKILL_IN_USE';
      throw error;
    }
    
    // Delete skill levels first
    await tx.skillLevel.deleteMany({ where: { skillId: id } });
    
    // Then delete the skill
    return tx.skill.delete({ where: { id } });
  });
}

export function listSkillsWithFilters({ category, subcategory, search, isRequired } = {}) {
  const where = {
    AND: [
      category ? { category } : {},
      subcategory ? { subcategory } : {},
      typeof isRequired === 'boolean' ? { isRequired } : {},
      search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      } : {},
    ]
  };
  
  return prisma.skill.findMany({
    where,
    include: {
      skillLevels: { orderBy: { level: 'asc' } },
      _count: {
        select: {
          employees: true,
          jobPostings: true,
        }
      }
    },
    orderBy: { name: 'asc' }
  });
}

export function getSkillsByCategory(category) {
  return prisma.skill.findMany({
    where: { category },
    include: { 
      skillLevels: { orderBy: { level: 'asc' } },
      employees: { 
        include: { 
          employee: { 
            select: { id: true, firstName: true, lastName: true, email: true } 
          } 
        } 
      }
    },
    orderBy: { name: 'asc' }
  });
}

export function getSkillGapAnalysis(employeeId, jobPostingId) {
  return prisma.$transaction(async (tx) => {
    // Get employee skills
    const employeeSkills = await tx.skillAssignment.findMany({
      where: { employeeId },
      include: { skill: true }
    });

    // Get job posting required skills
    const jobSkills = await tx.jobPostingSkill.findMany({
      where: { jobPostingId },
      include: { skill: true }
    });

    // Analyze gaps
    const gaps = [];
    const strengths = [];

    for (const jobSkill of jobSkills) {
      const employeeSkill = employeeSkills.find(es => es.skillId === jobSkill.skillId);
      
      if (!employeeSkill) {
        gaps.push({
          skill: jobSkill.skill,
          requiredLevel: jobSkill.minLevel,
          currentLevel: 0,
          gap: jobSkill.minLevel,
          isRequired: jobSkill.required
        });
      } else if (employeeSkill.level < jobSkill.minLevel) {
        gaps.push({
          skill: jobSkill.skill,
          requiredLevel: jobSkill.minLevel,
          currentLevel: employeeSkill.level,
          gap: jobSkill.minLevel - employeeSkill.level,
          isRequired: jobSkill.required
        });
      } else {
        strengths.push({
          skill: jobSkill.skill,
          requiredLevel: jobSkill.minLevel,
          currentLevel: employeeSkill.level,
          surplus: employeeSkill.level - jobSkill.minLevel
        });
      }
    }

    return {
      gaps: gaps.sort((a, b) => b.gap - a.gap),
      strengths: strengths.sort((a, b) => b.surplus - a.surplus),
      matchPercentage: Math.round(((jobSkills.length - gaps.length) / jobSkills.length) * 100)
    };
  });
}

export function getSkillAnalytics() {
  return prisma.$transaction(async (tx) => {
    const totalSkills = await tx.skill.count();
    const skillsByCategory = await tx.skill.groupBy({
      by: ['category'],
      _count: { category: true }
    });

    const skillAssignments = await tx.skillAssignment.groupBy({
      by: ['level'],
      _count: { level: true }
    });

    const topSkills = await tx.skill.findMany({
      include: {
        _count: {
          select: { employees: true }
        }
      },
      orderBy: {
        employees: { _count: 'desc' }
      },
      take: 10
    });

    return {
      totalSkills,
      skillsByCategory,
      skillLevelDistribution: skillAssignments,
      topSkills: topSkills.map(skill => ({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        employeeCount: skill._count.employees
      }))
    };
  });
}

export function getSkillRecommendations(employeeId) {
  return prisma.$transaction(async (tx) => {
    // Get employee's current skills
    const employeeSkills = await tx.skillAssignment.findMany({
      where: { employeeId },
      include: { skill: true }
    });

    // Get skills in same categories as employee's skills
    const categories = [...new Set(employeeSkills.map(es => es.skill.category))];
    
    // Find skills in same categories that employee doesn't have
    const recommendedSkills = await tx.skill.findMany({
      where: {
        category: { in: categories },
        id: { notIn: employeeSkills.map(es => es.skillId) }
      },
      include: {
        skillLevels: { orderBy: { level: 'asc' } },
        _count: {
          select: { employees: true }
        }
      },
      orderBy: {
        employees: { _count: 'desc' }
      },
      take: 10
    });

    // Get complementary skills (skills that are often paired with employee's skills)
    const complementarySkills = await tx.skill.findMany({
      where: {
        id: { notIn: employeeSkills.map(es => es.skillId) },
        category: { notIn: categories }
      },
      include: {
        skillLevels: { orderBy: { level: 'asc' } },
        _count: {
          select: { employees: true }
        }
      },
      orderBy: {
        employees: { _count: 'desc' }
      },
      take: 5
    });

    return {
      categoryBased: recommendedSkills.map(skill => ({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        subcategory: skill.subcategory,
        description: skill.description,
        popularity: skill._count.employees,
        skillLevels: skill.skillLevels,
        reason: `Popular in ${skill.category} category`
      })),
      complementary: complementarySkills.map(skill => ({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        subcategory: skill.subcategory,
        description: skill.description,
        popularity: skill._count.employees,
        skillLevels: skill.skillLevels,
        reason: `Complements your ${categories.join(', ')} skills`
      }))
    };
  });
}

// Certifications
export function listEmployeeCertifications(employeeId) {
  return prisma.certification.findMany({ where: { employeeId }, orderBy: { issuedAt: "desc" } });
}

export function addEmployeeCertification(employeeId, data) {
  return prisma.certification.create({ data: { ...data, employeeId } });
}

export function removeEmployeeCertification(_employeeId, certId) {
  return prisma.certification.delete({ where: { id: certId } });
}

// Documents
export function listEmployeeDocuments(employeeId) {
  return prisma.employeeDocument.findMany({ where: { employeeId }, orderBy: { uploadedAt: "desc" } });
}

export function addEmployeeDocument(employeeId, data) {
  return prisma.employeeDocument.create({ data: { ...data, employeeId } });
}

export function removeEmployeeDocument(_employeeId, docId) {
  return prisma.employeeDocument.delete({ where: { id: docId } });
}

// Evaluations (probation / performance)
export function listEmployeeEvaluations(employeeId) {
  return prisma.evaluation.findMany({ where: { employeeId }, orderBy: { date: "desc" } });
}

export function addEmployeeEvaluation(employeeId, data) {
  return prisma.evaluation.create({ data: { ...data, employeeId } });
}

// Career progression
export async function promoteEmployee(employeeId, { jobTitle, salary, effectiveDate, reason, approvedBy }) {
  return prisma.$transaction(async (tx) => {
    // Get current employee data
    const employee = await tx.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    // Create career progression record
    const progression = await tx.careerProgression.create({
      data: {
        employeeId,
        type: 'PROMOTION',
        previousJobTitle: employee.jobTitle,
        newJobTitle: jobTitle,
        previousSalary: employee.salary || null,
        newSalary: salary || null,
        effectiveDate: effectiveDate || new Date(),
        reason,
        approvedById: approvedBy,
        status: 'APPROVED'
      }
    });

    // Update employee
    const updatedEmployee = await tx.employee.update({
      where: { id: employeeId },
      data: { 
        jobTitle,
        salary: salary || employee.salary,
        updatedAt: new Date()
      }
    });

    return { employee: updatedEmployee, progression };
  });
}

export async function transferEmployee(employeeId, { departmentId, managerId, reason, effectiveDate, approvedBy }) {
  return prisma.$transaction(async (tx) => {
    // Get current employee data
    const employee = await tx.employee.findUnique({ 
      where: { id: employeeId },
      include: { department: true }
    });
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    // Validate department exists
    const department = await tx.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      throw new Error(`Department with ID ${departmentId} not found`);
    }

    // Validate manager exists if provided
    if (managerId) {
      const manager = await tx.employee.findUnique({ where: { id: managerId } });
      if (!manager) {
        throw new Error(`Manager with ID ${managerId} not found`);
      }
    }

    // Create career progression record
    const progression = await tx.careerProgression.create({
      data: {
        employeeId,
        type: 'TRANSFER',
        previousDepartmentId: employee.departmentId,
        newDepartmentId: departmentId,
        previousManagerId: employee.managerId,
        newManagerId: managerId,
        effectiveDate: effectiveDate || new Date(),
        reason,
        approvedById: approvedBy,
        status: 'APPROVED'
      }
    });

    // Update employee
    const updatedEmployee = await tx.employee.update({
      where: { id: employeeId },
      data: { 
        departmentId,
        managerId,
        updatedAt: new Date()
      }
    });

    return { employee: updatedEmployee, progression };
  });
}

// Career progression tracking functions
export function getCareerProgressionHistory(employeeId) {
  return prisma.careerProgression.findMany({
    where: { employeeId },
    include: {
      approvedBy: { select: { id: true, firstName: true, lastName: true } },
      employee: { select: { id: true, firstName: true, lastName: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export function getPendingCareerProgressions() {
  return prisma.careerProgression.findMany({
    where: { status: 'PENDING' },
    include: {
      employee: { 
        select: { id: true, firstName: true, lastName: true, jobTitle: true, department: true }
      },
      approvedBy: { select: { id: true, firstName: true, lastName: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function approveCareerProgression(progressionId, { approvedBy, status = 'APPROVED', reason }) {
  return prisma.$transaction(async (tx) => {
    const progression = await tx.careerProgression.findUnique({ where: { id: progressionId } });
    if (!progression) {
      throw new Error(`Career progression with ID ${progressionId} not found`);
    }

    if (progression.status !== 'PENDING') {
      throw new Error(`Career progression is already ${progression.status}`);
    }

    // Update progression status
    const updatedProgression = await tx.careerProgression.update({
      where: { id: progressionId },
      data: {
        status,
        approvedById: approvedBy,
        approvedAt: new Date(),
        reason: reason || progression.reason
      }
    });

    // If approved, apply the changes to the employee
    if (status === 'APPROVED') {
      const updateData = {};
      
      if (progression.type === 'PROMOTION') {
        if (progression.newJobTitle) updateData.jobTitle = progression.newJobTitle;
        if (progression.newSalary) updateData.salary = progression.newSalary;
      } else if (progression.type === 'TRANSFER') {
        if (progression.newDepartmentId) updateData.departmentId = progression.newDepartmentId;
        if (progression.newManagerId !== undefined) updateData.managerId = progression.newManagerId;
      }

      if (Object.keys(updateData).length > 0) {
        await tx.employee.update({
          where: { id: progression.employeeId },
          data: { ...updateData, updatedAt: new Date() }
        });
      }
    }

    return updatedProgression;
  });
}

export function getCareerProgressionAnalytics({ from, to, departmentId } = {}) {
  const where = {
    status: 'APPROVED',
    ...(from || to ? { effectiveDate: dateRange(from, to) } : {}),
    ...(departmentId && { 
      employee: { departmentId }
    })
  };

  return prisma.careerProgression.groupBy({
    by: ['type'],
    where,
    _count: { type: true },
    _avg: { 
      newSalary: true,
      previousSalary: true
    }
  });
}

// Probation lifecycle
export function startProbation(employeeId, { evaluatorId, score, feedback }) {
  return prisma.$transaction([
    prisma.employee.update({ where: { id: employeeId }, data: { status: "PROBATION" } }),
    prisma.evaluation.create({ data: { employeeId, evaluatorId, score, feedback, probation: true } }),
  ]);
}

export function endProbation(employeeId, { status = "ACTIVE", evaluatorId, score, feedback }) {
  return prisma.$transaction([
    prisma.employee.update({ where: { id: employeeId }, data: { status } }),
    prisma.evaluation.create({ data: { employeeId, evaluatorId, score, feedback, probation: false } }),
  ]);
}

// Offboarding
export function offboardEmployee(employeeId, { reason, approvedById }) {
  return prisma.$transaction([
    prisma.employee.update({ where: { id: employeeId }, data: { status: "TERMINATED" } }),
    prisma.employeeDocument.create({ data: { employeeId, name: `Offboarding: ${reason || "N/A"}`, fileUrl: "" } }),
  ]);
}


