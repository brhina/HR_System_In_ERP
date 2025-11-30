import * as repo from "../repositories/recruitmentRepository.js";

export function listJobPostings(query) {
  return repo.findJobPostings(query);
}

export function createJobPosting(data) {
  return repo.createJobPostingWithSkills(data);
}

export function getJobPostingById(id) {
  return repo.findJobPostingById(id);
}

export function getJobPostingByPublicToken(publicToken) {
  return repo.findJobPostingByPublicToken(publicToken);
}

export function generatePublicTokenForJob(jobId) {
  return repo.generatePublicTokenForJob(jobId);
}

export function updateJobPostingById(id, data) {
  return repo.updateJobPostingByIdWithSkills(id, data);
}

export function archiveJobPostingById(id) {
  return repo.archiveJobPostingById(id);
}

export function deleteJobPostingById(id) {
  return repo.deleteJobPostingById(id);
}

export function listCandidatesForJob(jobId) {
  return repo.findCandidatesForJob(jobId);
}

export function listAllCandidates(query) {
  return repo.findAllCandidates(query);
}

export function createCandidateForJob(jobId, data) {
  return repo.createCandidateForJob(jobId, data);
}

export function updateCandidateStage(candidateId, stage) {
  return repo.updateCandidateStage(candidateId, stage);
}

// Shortlist and scoring
export function shortlistCandidates(jobId, criteria) {
  return repo.shortlistCandidates(jobId, criteria);
}

export function setCandidateScore(candidateId, score) {
  return repo.setCandidateScore(candidateId, score);
}

// Communications
export function notifyCandidate(candidateId, { subject, message, channel = "email" }) {
  return repo.notifyCandidate(candidateId, { subject, message, channel });
}

export function updateCandidateStatusWithReason(candidateId, stage, reason) {
  return repo.updateCandidateStatusWithReason(candidateId, stage, reason);
}

// Interviews
export function scheduleInterview(payload) {
  return repo.scheduleInterview(payload);
}

export function updateInterview(id, payload) {
  return repo.updateInterview(id, payload);
}

export function listInterviewsForCandidate(candidateId) {
  return repo.listInterviewsForCandidate(candidateId);
}

export function listAllInterviews(query) {
  return repo.findAllInterviews(query);
}

export function deleteInterview(id) {
  return repo.deleteInterview(id);
}

// KPIs
export function getRecruitmentKpis(query) {
  return repo.getRecruitmentKpis(query);
}

// Offers and contracts
export function generateOfferLetter(candidateId, data) {
  return repo.generateOfferLetter(candidateId, data);
}

export function createEmploymentContract(candidateId, data) {
  return repo.createEmploymentContract(candidateId, data);
}

// Onboarding linkage
export function createOnboardingChecklist(candidateId, data) {
  return repo.createOnboardingChecklist(candidateId, data);
}

// Guards and domain rules mirroring employee patterns
export async function createJobPostingWithGuards(data) {
  const department = await repo.findDepartmentById(data.departmentId);
  if (!department) {
    const error = new Error(`Department with ID ${data.departmentId} does not exist`);
    error.statusCode = 400;
    error.code = 'DEPARTMENT_NOT_FOUND';
    throw error;
  }
  return repo.createJobPostingWithSkills(data);
}

export async function createCandidateForJobWithGuards(jobId, data) {
  const job = await repo.findJobPostingByIdWithDept(jobId);
  if (!job) {
    const error = new Error(`Job posting with ID ${jobId} not found`);
    error.statusCode = 404;
    error.code = 'JOB_NOT_FOUND';
    throw error;
  }
  if (!job.isActive) {
    const error = new Error(`Job posting ${jobId} is not active`);
    error.statusCode = 400;
    error.code = 'JOB_INACTIVE';
    throw error;
  }
  const duplicate = await repo.findCandidateByEmailForJob(jobId, data.email);
  if (duplicate) {
    const error = new Error(`A candidate with email ${data.email} has already applied to this job posting`);
    error.statusCode = 409; // Conflict status code
    error.code = 'CANDIDATE_DUPLICATE';
    throw error;
  }
  
  // Normalize data: convert empty strings to null for optional fields
  const normalizedData = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone && data.phone.trim() !== '' ? data.phone : null,
    resumeUrl: data.resumeUrl && data.resumeUrl.trim() !== '' ? data.resumeUrl : null,
  };
  
  return repo.createCandidateForJob(jobId, normalizedData);
}

// Public application (no auth required)
export async function createPublicApplication(publicToken, data) {
  const job = await repo.findJobPostingByPublicToken(publicToken);
  if (!job) {
    const error = new Error(`Job posting not found`);
    error.statusCode = 404;
    error.code = 'JOB_NOT_FOUND';
    throw error;
  }
  if (!job.isActive) {
    const error = new Error(`This job posting is no longer accepting applications`);
    error.statusCode = 400;
    error.code = 'JOB_INACTIVE';
    throw error;
  }
  const duplicate = await repo.findCandidateByEmailForJob(job.id, data.email);
  if (duplicate) {
    const error = new Error(`You have already applied to this position`);
    error.statusCode = 409;
    error.code = 'CANDIDATE_DUPLICATE';
    throw error;
  }
  return repo.createCandidateForJob(job.id, data);
}

const VALID_STAGES = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];
const ALLOWED_TRANSITIONS = {
  APPLIED: ["SCREENING", "REJECTED"],
  SCREENING: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["OFFER", "REJECTED"],
  OFFER: ["HIRED", "REJECTED"],
  REJECTED: [],
  HIRED: [],
};

export async function updateCandidateStageWithGuards(candidateId, nextStage) {
  if (!VALID_STAGES.includes(nextStage)) {
    const error = new Error(`Invalid stage: ${nextStage}`);
    error.statusCode = 400;
    error.code = 'INVALID_STAGE';
    throw error;
  }
  
  // Prevent marking as HIRED through stage update - must use hireCandidate endpoint
  if (nextStage === 'HIRED') {
    const error = new Error('Cannot mark candidate as HIRED through stage update. Please use the hire candidate endpoint to create an employee record.');
    error.statusCode = 400;
    error.code = 'USE_HIRE_ENDPOINT';
    throw error;
  }
  
  const candidate = await repo.findCandidateById(candidateId);
  if (!candidate) {
    const error = new Error(`Candidate with ID ${candidateId} not found`);
    error.statusCode = 404;
    error.code = 'CANDIDATE_NOT_FOUND';
    throw error;
  }
  if (!candidate.jobPosting?.isActive && nextStage !== 'REJECTED') {
    const error = new Error('Cannot progress candidate: job is inactive');
    error.statusCode = 400;
    error.code = 'JOB_INACTIVE';
    throw error;
  }
  const currentStage = candidate.stage;
  const allowed = ALLOWED_TRANSITIONS[currentStage] || [];
  if (!allowed.includes(nextStage)) {
    const error = new Error(`Invalid transition from ${currentStage} to ${nextStage}`);
    error.statusCode = 400;
    error.code = 'INVALID_STAGE_TRANSITION';
    throw error;
  }
  return repo.updateCandidateStage(candidateId, nextStage);
}

export function deleteCandidateById(candidateId) {
  return repo.deleteCandidateById(candidateId);
}

// Candidate Document Service Functions
export async function getCandidateDocuments(candidateId) {
  try {
    const documents = await repo.findCandidateDocuments(candidateId);
    return { success: true, data: documents };
  } catch (error) {
    console.error('Error fetching candidate documents:', error);
    return { success: false, error: 'Failed to fetch candidate documents' };
  }
}

export async function addCandidateDocument(candidateId, documentData) {
  try {
    // Validate that candidate exists
    const candidate = await repo.findCandidateById(candidateId);
    if (!candidate) {
      return { success: false, error: 'Candidate not found' };
    }

    const document = await repo.createCandidateDocument(candidateId, documentData);
    return { success: true, data: document };
  } catch (error) {
    console.error('Error adding candidate document:', error);
    return { success: false, error: 'Failed to add candidate document' };
  }
}

export async function updateCandidateDocument(documentId, updateData) {
  try {
    // Validate that document exists
    const existingDocument = await repo.findCandidateDocumentById(documentId);
    if (!existingDocument) {
      return { success: false, error: 'Document not found' };
    }

    const document = await repo.updateCandidateDocument(documentId, updateData);
    return { success: true, data: document };
  } catch (error) {
    console.error('Error updating candidate document:', error);
    return { success: false, error: 'Failed to update candidate document' };
  }
}

export async function removeCandidateDocument(documentId) {
  try {
    // Validate that document exists
    const existingDocument = await repo.findCandidateDocumentById(documentId);
    if (!existingDocument) {
      return { success: false, error: 'Document not found' };
    }

    await repo.deleteCandidateDocument(documentId);
    return { success: true, data: { id: documentId } };
  } catch (error) {
    console.error('Error removing candidate document:', error);
    return { success: false, error: 'Failed to remove candidate document' };
  }
}

export function hireCandidate(candidateId, data) {
  return repo.hireCandidate(candidateId, data);
}


