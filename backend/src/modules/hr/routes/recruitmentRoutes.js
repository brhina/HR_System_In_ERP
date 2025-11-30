import { Router } from "express";
import * as controller from "../controllers/recruitmentController.js";
import multer from "multer";
import path from "path";
import { 
  authenticateToken, 
  requirePermission, 
  requireAnyPermission 
} from "../../../middlewares/authMiddleware.js";

const router = Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.resolve(process.cwd(), "uploads")),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || "";
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, JPG, PNG, and GIF files are allowed'));
    }
  }
});

// Public routes (no authentication required)
router.get("/public/jobs/:token", controller.getPublicJobPosting);
router.post("/public/jobs/:token/apply", upload.single("resume"), controller.createPublicApplication);

// Apply authentication to all routes below
router.use(authenticateToken);

// Job postings - require recruitment permissions
router.get("/jobs", requirePermission("recruitment:read"), controller.listJobPostings);
router.post("/jobs", requirePermission("recruitment:create"), controller.createJobPosting);
router.get("/jobs/:id", requirePermission("recruitment:read"), controller.getJobPostingById);
router.post("/jobs/:id/generate-link", requirePermission("recruitment:read"), controller.generatePublicLink);
router.put("/jobs/:id", requirePermission("recruitment:update"), controller.updateJobPostingById);
router.patch("/jobs/:id/archive", requirePermission("recruitment:update"), controller.archiveJobPostingById);
router.delete("/jobs/:id", requirePermission("recruitment:delete"), controller.deleteJobPostingById);

// Candidates - require recruitment permissions
router.get("/candidates", requirePermission("recruitment:read"), controller.listAllCandidates);
router.get("/jobs/:id/candidates", requirePermission("recruitment:read"), controller.listCandidatesForJob);
router.post("/jobs/:id/candidates", requirePermission("recruitment:create"), controller.createCandidateForJob);
router.put("/candidates/:candidateId/stage", requirePermission("recruitment:update"), controller.updateCandidateStage);
router.delete("/candidates/:candidateId", requirePermission("recruitment:delete"), controller.deleteCandidate);
router.post("/candidates/:candidateId/hire", requirePermission("recruitment:update"), controller.hireCandidate);

// Shortlist and scoring - require recruitment update permission
router.post("/jobs/:id/shortlist", requirePermission("recruitment:update"), controller.shortlistCandidates);
router.put("/candidates/:candidateId/score", requirePermission("recruitment:update"), controller.setCandidateScore);

// Communications - require recruitment update permission
router.post("/candidates/:candidateId/notify", requirePermission("recruitment:update"), controller.notifyCandidate);
router.post("/candidates/:candidateId/status", requirePermission("recruitment:update"), controller.updateCandidateStatusWithReason);

// Interviews - require recruitment permissions
router.get("/interviews", requirePermission("recruitment:read"), controller.listAllInterviews);
router.post("/interviews", requirePermission("recruitment:create"), controller.scheduleInterview);
router.put("/interviews/:id", requirePermission("recruitment:update"), controller.updateInterview);
router.delete("/interviews/:id", requirePermission("recruitment:delete"), controller.deleteInterview);
router.get("/candidates/:candidateId/interviews", requirePermission("recruitment:read"), controller.listInterviewsForCandidate);

// KPIs - require recruitment read permission
router.get("/kpis", requirePermission("recruitment:read"), controller.getRecruitmentKpis);

// Offers and contracts - require recruitment create permission
router.post("/offers/:candidateId", requirePermission("recruitment:create"), controller.generateOfferLetter);
router.post("/contracts/:candidateId", requirePermission("recruitment:create"), controller.createEmploymentContract);

// Onboarding linkage - require recruitment create permission
router.post("/onboarding/:candidateId", requirePermission("recruitment:create"), controller.createOnboardingChecklist);

// Candidate Documents - require recruitment permissions
router.get("/candidates/:id/documents", requirePermission("recruitment:read"), controller.getCandidateDocuments);
router.post("/candidates/:id/documents", requirePermission("recruitment:create"), controller.addCandidateDocument);
router.post("/candidates/:id/documents/upload", requirePermission("recruitment:create"), upload.single("file"), (req, res) => {
  res.json({ success: true, data: { fileUrl: `/uploads/${req.file.filename}` } });
});
router.put("/candidates/:id/documents/:documentId", requirePermission("recruitment:update"), controller.updateCandidateDocument);
router.delete("/candidates/:id/documents/:documentId", requirePermission("recruitment:delete"), controller.removeCandidateDocument);

export default router;


