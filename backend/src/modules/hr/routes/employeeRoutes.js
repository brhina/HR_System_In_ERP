import { Router } from "express";
import * as controller from "../controllers/employeeController.js";
import multer from "multer";
import path from "path";
import { 
  authenticateToken, 
  requirePermission, 
  requireAnyPermission,
  requireEmployeeAccess 
} from "../../../middlewares/authMiddleware.js";

const router = Router();

// Multer setup for simple disk storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.resolve(process.cwd(), "uploads")),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || "";
    cb(null, `${unique}${ext}`);
  },
});
const upload = multer({ storage });

// Apply authentication to all routes
router.use(authenticateToken);

// List employees - requires employee read permission
router.get("/", requirePermission("employee:read"), controller.listEmployees);

// Create employee - requires employee create permission
router.post("/", requirePermission("employee:create"), controller.createEmployee);

// Department management - requires employee update permission for create/update/delete
router.get("/departments", requirePermission("employee:read"), controller.listDepartments);
router.post("/departments", requirePermission("employee:update"), controller.createDepartment);
router.put("/departments/:id", requirePermission("employee:update"), controller.updateDepartment);
router.delete("/departments/:id", requirePermission("employee:update"), controller.deleteDepartment);

// List managers - requires employee read permission
router.get("/managers", requirePermission("employee:read"), controller.listEmployeesForManagerSelection);

// Skills Management Routes (must be before /:id routes)
// List all skills with optional filters - requires employee read permission
router.get("/skills", requirePermission("employee:read"), controller.listSkills);

// Enhanced Skills Functions - require employee read permission
router.get("/skills/all", requirePermission("employee:read"), controller.getAllSkills);
router.get("/skills/category/:category", requirePermission("employee:read"), controller.getSkillsByCategory);
router.get("/skills/analytics", requirePermission("employee:read"), controller.getSkillAnalytics);

// Skills CRUD - require admin permissions for create/update/delete
router.get("/skills/:id", requirePermission("employee:read"), controller.getSkillById);
router.post("/skills", requirePermission("admin:manage_system"), controller.createSkill);
router.put("/skills/:id", requirePermission("admin:manage_system"), controller.updateSkill);
router.delete("/skills/:id", requirePermission("admin:manage_system"), controller.deleteSkill);

// Directory search and org chart (must be before /:id routes)
router.get("/directory/search", requirePermission("employee:read"), controller.searchDirectory);
router.get("/org-chart", requirePermission("employee:read"), controller.getOrgChart); // ?rootId&depth=

// Parameterized routes (must be after specific routes)
// Get employee by ID - requires employee access (own data or HR permission)
router.get("/:id", requireEmployeeAccess(), controller.getEmployeeById);

// Update employee - requires employee update permission or own data
router.put("/:id", requireAnyPermission(["employee:update"]), requireEmployeeAccess(), controller.updateEmployeeById);

// Assign manager - requires employee update permission
router.post("/:id/assign-manager", requirePermission("employee:update"), controller.assignManager);

// Delete employee - requires employee delete permission
router.delete("/:id", requirePermission("employee:delete"), controller.deleteEmployeeById);

// Employee Skills - require employee access
router.get("/:id/skills", requireEmployeeAccess(), controller.listEmployeeSkills);
router.post("/:id/skills", requireAnyPermission(["employee:update"]), requireEmployeeAccess(), controller.addEmployeeSkill);
router.put("/:id/skills/:assignmentId", requireAnyPermission(["employee:update"]), requireEmployeeAccess(), controller.updateEmployeeSkill);
router.delete("/:id/skills/:assignmentId", requireAnyPermission(["employee:update"]), requireEmployeeAccess(), controller.removeEmployeeSkill);

// Parameterized skill routes
router.get("/:employeeId/skill-gap/:jobPostingId", requireEmployeeAccess(), controller.getSkillGapAnalysis);
router.get("/:id/skill-recommendations", requireEmployeeAccess(), controller.getSkillRecommendations);

// Certifications - require employee access
router.get("/:id/certifications", requireEmployeeAccess(), controller.listEmployeeCertifications);
router.post("/:id/certifications", requireAnyPermission(["employee:update"]), requireEmployeeAccess(), controller.addEmployeeCertification);
router.delete("/:id/certifications/:certId", requireAnyPermission(["employee:update"]), requireEmployeeAccess(), controller.removeEmployeeCertification);
// Upload certification document: returns { fileUrl }
router.post("/:id/certifications/upload", requireAnyPermission(["employee:update"]), requireEmployeeAccess(), upload.single("file"), (req, res) => {
  const filePath = `/uploads/${req.file.filename}`;
  res.json({ success: true, data: { fileUrl: filePath, originalName: req.file.originalname } });
});

// Documents - require employee access
router.get("/:id/documents", requireEmployeeAccess(), controller.listEmployeeDocuments);
router.post("/:id/documents", requireAnyPermission(["employee:update"]), requireEmployeeAccess(), controller.addEmployeeDocument);
// Upload endpoint: returns { fileUrl }
router.post("/:id/documents/upload", requireAnyPermission(["employee:update"]), requireEmployeeAccess(), upload.single("file"), (req, res) => {
  const filePath = `/uploads/${req.file.filename}`;
  res.json({ success: true, data: { fileUrl: filePath, originalName: req.file.originalname } });
});
router.delete("/:id/documents/:docId", requireAnyPermission(["employee:update"]), requireEmployeeAccess(), controller.removeEmployeeDocument);

// Evaluations (incl. probation-related) - require employee access
router.get("/:id/evaluations", requireEmployeeAccess(), controller.listEmployeeEvaluations);
router.post("/:id/evaluations", requireAnyPermission(["employee:update"]), requireEmployeeAccess(), controller.addEmployeeEvaluation);

// Career progression - require employee update permission
router.post("/:id/promotion", requirePermission("employee:update"), controller.promoteEmployee);
router.post("/:id/transfer", requirePermission("employee:update"), controller.transferEmployee);
router.get("/:id/career-history", requireEmployeeAccess(), controller.getCareerProgressionHistory);
router.get("/career-progressions/pending", requirePermission("employee:read"), controller.getPendingCareerProgressions);
router.post("/career-progressions/:id/approve", requirePermission("employee:update"), controller.approveCareerProgression);
router.get("/career-progressions/analytics", requirePermission("employee:read"), controller.getCareerProgressionAnalytics);

// Probation lifecycle - require employee update permission
router.post("/:id/probation/start", requirePermission("employee:update"), controller.startProbation);
router.post("/:id/probation/end", requirePermission("employee:update"), controller.endProbation);

// Offboarding - require employee delete permission
router.post("/:id/offboard", requirePermission("employee:delete"), controller.offboardEmployee);

export default router;


