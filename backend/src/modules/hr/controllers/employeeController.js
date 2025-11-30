import * as service from "../services/employeeService.js";
import { response } from "../../../utils/response.js";
import * as v from "../validations/employeeValidation.js";
import { validate } from "../../../middlewares/validationMiddleware.js";

export async function listEmployees(req, res, next) {
  try {
    const data = await service.listEmployees({ query: req.query });
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function createEmployee(req, res, next) {
  try {
    const created = await service.createEmployee(req.body);
    res.status(201).json(response.success(created));
  } catch (err) {
    next(err);
  }
}

export async function getEmployeeById(req, res, next) {
  try {
    const employee = await service.getEmployeeById(req.params.id);
    if (!employee) return res.status(404).json(response.error("Employee not found", 404));
    res.json(response.success(employee));
  } catch (err) {
    next(err);
  }
}

export async function listDepartments(req, res, next) {
  try {
    const departments = await service.listDepartments();
    res.json(response.success(departments));
  } catch (err) {
    next(err);
  }
}

export async function createDepartment(req, res, next) {
  try {
    const department = await service.createDepartment(req.body);
    res.status(201).json(response.success(department));
  } catch (err) {
    next(err);
  }
}

export async function updateDepartment(req, res, next) {
  try {
    const department = await service.updateDepartment(req.params.id, req.body);
    res.json(response.success(department));
  } catch (err) {
    next(err);
  }
}

export async function deleteDepartment(req, res, next) {
  try {
    await service.deleteDepartment(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function assignManager(req, res, next) {
  try {
    const employee = await service.assignManager(req.params.id, req.body.managerId);
    res.json(response.success(employee));
  } catch (err) {
    next(err);
  }
}

export async function listEmployeesForManagerSelection(req, res, next) {
  try {
    const employees = await service.listEmployeesForManagerSelection();
    res.json(response.success(employees));
  } catch (err) {
    next(err);
  }
}

export async function listAllSkills(req, res, next) {
  try {
    const skills = await service.listAllSkills();
    res.json(response.success(skills));
  } catch (err) {
    next(err);
  }
}

export async function updateEmployeeById(req, res, next) {
  try {
    const updated = await service.updateEmployeeById(req.params.id, req.body);
    res.json(response.success(updated));
  } catch (err) {
    next(err);
  }
}

export async function deleteEmployeeById(req, res, next) {
  try {
    await service.deleteEmployeeById(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Directory search and org chart
export async function searchDirectory(req, res, next) {
  try {
    const results = await service.searchDirectory(req.query);
    res.json(response.success(results));
  } catch (err) {
    next(err);
  }
}

export async function getOrgChart(req, res, next) {
  try {
    const { rootId, depth } = req.query;
    const chart = await service.getOrgChart({ rootId, depth: Number(depth) || 2 });
    res.json(response.success(chart));
  } catch (err) {
    next(err);
  }
}

// Skills
export async function listEmployeeSkills(req, res, next) {
  try {
    const data = await service.listEmployeeSkills(req.params.id);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function addEmployeeSkill(req, res, next) {
  try {
    const created = await service.addEmployeeSkill(req.params.id, req.body);
    res.status(201).json(response.success(created));
  } catch (err) {
    next(err);
  }
}

export async function updateEmployeeSkill(req, res, next) {
  try {
    const updated = await service.updateEmployeeSkill(req.params.id, req.params.assignmentId, req.body);
    res.json(response.success(updated));
  } catch (err) {
    next(err);
  }
}

export async function removeEmployeeSkill(req, res, next) {
  try {
    await service.removeEmployeeSkill(req.params.id, req.params.assignmentId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Enhanced Skills Functions
export async function getAllSkills(req, res, next) {
  try {
    const skills = await service.getAllSkills();
    res.json(response.success(skills));
  } catch (err) {
    next(err);
  }
}

export async function getSkillsByCategory(req, res, next) {
  try {
    const skills = await service.getSkillsByCategory(req.params.category);
    res.json(response.success(skills));
  } catch (err) {
    next(err);
  }
}

export async function getSkillGapAnalysis(req, res, next) {
  try {
    const analysis = await service.getSkillGapAnalysis(req.params.employeeId, req.params.jobPostingId);
    res.json(response.success(analysis));
  } catch (err) {
    next(err);
  }
}

export async function getSkillAnalytics(req, res, next) {
  try {
    const analytics = await service.getSkillAnalytics();
    res.json(response.success(analytics));
  } catch (err) {
    next(err);
  }
}

export async function getSkillRecommendations(req, res, next) {
  try {
    const recommendations = await service.getSkillRecommendations(req.params.id);
    res.json(response.success(recommendations));
  } catch (err) {
    next(err);
  }
}

// Certifications
export async function listEmployeeCertifications(req, res, next) {
  try {
    const data = await service.listEmployeeCertifications(req.params.id);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function addEmployeeCertification(req, res, next) {
  try {
    const created = await service.addEmployeeCertification(req.params.id, req.body);
    res.status(201).json(response.success(created));
  } catch (err) {
    next(err);
  }
}

export async function removeEmployeeCertification(req, res, next) {
  try {
    await service.removeEmployeeCertification(req.params.id, req.params.certId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Documents
export async function listEmployeeDocuments(req, res, next) {
  try {
    const data = await service.listEmployeeDocuments(req.params.id);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function addEmployeeDocument(req, res, next) {
  try {
    const created = await service.addEmployeeDocument(req.params.id, req.body);
    res.status(201).json(response.success(created));
  } catch (err) {
    next(err);
  }
}

export async function removeEmployeeDocument(req, res, next) {
  try {
    await service.removeEmployeeDocument(req.params.id, req.params.docId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Evaluations incl. probation
export async function listEmployeeEvaluations(req, res, next) {
  try {
    const data = await service.listEmployeeEvaluations(req.params.id);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function addEmployeeEvaluation(req, res, next) {
  try {
    const created = await service.addEmployeeEvaluation(req.params.id, req.body);
    res.status(201).json(response.success(created));
  } catch (err) {
    next(err);
  }
}

// Career progression
export async function promoteEmployee(req, res, next) {
  try {
    const result = await service.promoteEmployee(req.params.id, req.body);
    res.json(response.success(result));
  } catch (err) {
    next(err);
  }
}

export async function transferEmployee(req, res, next) {
  try {
    const result = await service.transferEmployee(req.params.id, req.body);
    res.json(response.success(result));
  } catch (err) {
    next(err);
  }
}

export async function getCareerProgressionHistory(req, res, next) {
  try {
    const history = await service.getCareerProgressionHistory(req.params.id);
    res.json(response.success(history));
  } catch (err) {
    next(err);
  }
}

export async function getPendingCareerProgressions(req, res, next) {
  try {
    const progressions = await service.getPendingCareerProgressions();
    res.json(response.success(progressions));
  } catch (err) {
    next(err);
  }
}

export async function approveCareerProgression(req, res, next) {
  try {
    const result = await service.approveCareerProgression(req.params.id, req.body);
    res.json(response.success(result));
  } catch (err) {
    next(err);
  }
}

export async function getCareerProgressionAnalytics(req, res, next) {
  try {
    const analytics = await service.getCareerProgressionAnalytics(req.query);
    res.json(response.success(analytics));
  } catch (err) {
    next(err);
  }
}

// Probation lifecycle
export async function startProbation(req, res, next) {
  try {
    const updated = await service.startProbation(req.params.id, req.body);
    res.json(response.success(updated));
  } catch (err) {
    next(err);
  }
}

export async function endProbation(req, res, next) {
  try {
    const updated = await service.endProbation(req.params.id, req.body);
    res.json(response.success(updated));
  } catch (err) {
    next(err);
  }
}

// Offboarding
export async function offboardEmployee(req, res, next) {
  try {
    const updated = await service.offboardEmployee(req.params.id, req.body);
    res.json(response.success(updated));
  } catch (err) {
    next(err);
  }
}

// Admin Skills Management Controllers
export async function getSkillById(req, res, next) {
  try {
    await validate(v.getSkillCatalogSchema, { params: req.params });
    const skill = await service.getSkillById(req.params.id);
    if (!skill) return res.status(404).json(response.error("Skill not found", 404));
    res.json(response.success(skill));
  } catch (err) {
    next(err);
  }
}

export async function listSkills(req, res, next) {
  try {
    const skills = await service.listSkillsWithFilters(req.query);
    res.json(response.success(skills));
  } catch (err) {
    next(err);
  }
}

export async function createSkill(req, res, next) {
  try {
    await validate(v.createSkillCatalogSchema, { body: req.body });
    const skill = await service.createSkillWithGuards(req.body);
    res.status(201).json(response.success(skill));
  } catch (err) {
    next(err);
  }
}

export async function updateSkill(req, res, next) {
  try {
    await validate(v.updateSkillCatalogSchema, { params: req.params, body: req.body });
    const skill = await service.updateSkillWithGuards(req.params.id, req.body);
    res.json(response.success(skill));
  } catch (err) {
    next(err);
  }
}

export async function deleteSkill(req, res, next) {
  try {
    await validate(v.deleteSkillCatalogSchema, { params: req.params });
    await service.deleteSkillWithGuards(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}


