import * as service from "../services/recruitmentService.js";
import { response } from "../../../utils/response.js";
import * as v from "../validations/recruitmentValidation.js";
import { validate } from "../../../middlewares/validationMiddleware.js";

export async function listJobPostings(req, res, next) {
  try {
    const jobs = await service.listJobPostings(req.query);
    res.json(response.success(jobs));
  } catch (err) {
    next(err);
  }
}

export async function createJobPosting(req, res, next) {
  try {
    await validate(v.createJobSchema, { body: req.body });
    const job = await service.createJobPostingWithGuards(req.body);
    res.status(201).json(response.success(job));
  } catch (err) {
    next(err);
  }
}

export async function getJobPostingById(req, res, next) {
  try {
    const job = await service.getJobPostingById(req.params.id);
    if (!job) return res.status(404).json(response.error("Job not found", 404));
    res.json(response.success(job));
  } catch (err) {
    next(err);
  }
}

export async function updateJobPostingById(req, res, next) {
  try {
    await validate(v.updateJobSchema, { params: req.params, body: req.body });
    const job = await service.updateJobPostingById(req.params.id, req.body);
    res.json(response.success(job));
  } catch (err) {
    next(err);
  }
}

export async function archiveJobPostingById(req, res, next) {
  try {
    await service.archiveJobPostingById(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function deleteJobPostingById(req, res, next) {
  try {
    await service.deleteJobPostingById(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function listCandidatesForJob(req, res, next) {
  try {
    const candidates = await service.listCandidatesForJob(req.params.id);
    res.json(response.success(candidates));
  } catch (err) {
    next(err);
  }
}

export async function listAllCandidates(req, res, next) {
  try {
    const candidates = await service.listAllCandidates(req.query);
    res.json(response.success(candidates));
  } catch (err) {
    next(err);
  }
}

export async function createCandidateForJob(req, res, next) {
  try {
    await validate(v.createCandidateSchema, { params: req.params, body: req.body });
    const candidate = await service.createCandidateForJobWithGuards(req.params.id, req.body);
    res.status(201).json(response.success(candidate));
  } catch (err) {
    next(err);
  }
}

export async function updateCandidateStage(req, res, next) {
  try {
    await validate(v.candidateStageSchema, { params: req.params, body: req.body });
    const candidate = await service.updateCandidateStageWithGuards(req.params.candidateId, req.body.stage);
    res.json(response.success(candidate));
  } catch (err) {
    next(err);
  }
}

// Shortlist and scoring
export async function shortlistCandidates(req, res, next) {
  try {
    await validate(v.shortlistSchema, { params: req.params, body: req.body });
    const result = await service.shortlistCandidates(req.params.id, req.body.criteria);
    res.json(response.success(result));
  } catch (err) {
    next(err);
  }
}

export async function setCandidateScore(req, res, next) {
  try {
    await validate(v.setScoreSchema, { params: req.params, body: req.body });
    const result = await service.setCandidateScore(req.params.candidateId, req.body.score);
    res.json(response.success(result));
  } catch (err) {
    next(err);
  }
}

// Communications
export async function notifyCandidate(req, res, next) {
  try {
    await validate(v.notifySchema, { params: req.params, body: req.body });
    const result = await service.notifyCandidate(req.params.candidateId, req.body);
    res.json(response.success(result));
  } catch (err) {
    next(err);
  }
}

export async function updateCandidateStatusWithReason(req, res, next) {
  try {
    await validate(v.statusWithReasonSchema, { params: req.params, body: req.body });
    const result = await service.updateCandidateStatusWithReason(req.params.candidateId, req.body.stage, req.body.reason);
    res.json(response.success(result));
  } catch (err) {
    next(err);
  }
}

// Interviews
export async function scheduleInterview(req, res, next) {
  try {
    await validate(v.scheduleInterviewSchema, { body: req.body });
    const interview = await service.scheduleInterview(req.body);
    res.status(201).json(response.success(interview));
  } catch (err) {
    next(err);
  }
}

export async function updateInterview(req, res, next) {
  try {
    await validate(v.updateInterviewSchema, { params: req.params, body: req.body });
    const interview = await service.updateInterview(req.params.id, req.body);
    res.json(response.success(interview));
  } catch (err) {
    next(err);
  }
}

export async function listInterviewsForCandidate(req, res, next) {
  try {
    const interviews = await service.listInterviewsForCandidate(req.params.candidateId);
    res.json(response.success(interviews));
  } catch (err) {
    next(err);
  }
}

export async function listAllInterviews(req, res, next) {
  try {
    const interviews = await service.listAllInterviews(req.query);
    res.json(response.success(interviews));
  } catch (err) {
    next(err);
  }
}

export async function deleteInterview(req, res, next) {
  try {
    await service.deleteInterview(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// KPIs
export async function getRecruitmentKpis(req, res, next) {
  try {
    const data = await service.getRecruitmentKpis(req.query);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

// Offers and contracts
export async function generateOfferLetter(req, res, next) {
  try {
    await validate(v.generateOfferSchema, { params: req.params, body: req.body });
    const payload = await service.generateOfferLetter(req.params.candidateId, req.body);
    res.status(201).json(response.success(payload));
  } catch (err) {
    next(err);
  }
}

export async function createEmploymentContract(req, res, next) {
  try {
    await validate(v.createContractSchema, { params: req.params, body: req.body });
    const contract = await service.createEmploymentContract(req.params.candidateId, req.body);
    res.status(201).json(response.success(contract));
  } catch (err) {
    next(err);
  }
}

// Onboarding linkage
export async function createOnboardingChecklist(req, res, next) {
  try {
    await validate(v.onboardingChecklistSchema, { params: req.params, body: req.body });
    const checklist = await service.createOnboardingChecklist(req.params.candidateId, req.body);
    res.status(201).json(response.success(checklist));
  } catch (err) {
    next(err);
  }
}

// Hiring endpoint
export async function deleteCandidate(req, res, next) {
  try {
    await validate(v.deleteCandidateSchema, { params: req.params });
    const result = await service.deleteCandidateById(req.params.candidateId);
    res.status(200).json(response.success(result));
  } catch (err) {
    next(err);
  }
}

export async function hireCandidate(req, res, next) {
  try {
    await validate(v.hireCandidateSchema, { params: req.params, body: req.body });
    const result = await service.hireCandidate(req.params.candidateId, req.body);
    res.status(201).json(response.success(result));
  } catch (err) {
    next(err);
  }
}

// Candidate Document Controllers
export async function getCandidateDocuments(req, res, next) {
  try {
    const result = await service.getCandidateDocuments(req.params.id);
    if (result.success) {
      res.json(response.success(result.data));
    } else {
      res.status(400).json(response.error(result.error, 400));
    }
  } catch (err) {
    next(err);
  }
}

export async function addCandidateDocument(req, res, next) {
  try {
    await validate(v.addCandidateDocumentSchema, { params: req.params, body: req.body });
    const result = await service.addCandidateDocument(req.params.id, req.body);
    if (result.success) {
      res.json(response.success(result.data, "Document added successfully"));
    } else {
      res.status(400).json(response.error(result.error, 400));
    }
  } catch (err) {
    next(err);
  }
}

export async function updateCandidateDocument(req, res, next) {
  try {
    await validate(v.updateCandidateDocumentSchema, { params: req.params, body: req.body });
    const result = await service.updateCandidateDocument(req.params.documentId, req.body);
    if (result.success) {
      res.json(response.success(result.data, "Document updated successfully"));
    } else {
      res.status(400).json(response.error(result.error, 400));
    }
  } catch (err) {
    next(err);
  }
}

export async function removeCandidateDocument(req, res, next) {
  try {
    await validate(v.deleteCandidateDocumentSchema, { params: req.params });
    const result = await service.removeCandidateDocument(req.params.documentId);
    if (result.success) {
      res.json(response.success(result.data, "Document removed successfully"));
    } else {
      res.status(400).json(response.error(result.error, 400));
    }
  } catch (err) {
    next(err);
  }
}

// Public endpoints (no authentication required)
export async function getPublicJobPosting(req, res, next) {
  try {
    const job = await service.getJobPostingByPublicToken(req.params.token);
    if (!job) return res.status(404).json(response.error("Job posting not found", 404));
    res.json(response.success(job));
  } catch (err) {
    next(err);
  }
}

export async function createPublicApplication(req, res, next) {
  try {
    const applicationData = {
      ...req.body,
      resumeUrl: req.file ? `/uploads/${req.file.filename}` : req.body.resumeUrl,
    };
    await validate(v.createCandidateSchema, { body: applicationData });
    const candidate = await service.createPublicApplication(req.params.token, applicationData);
    res.status(201).json(response.success(candidate, "Application submitted successfully"));
  } catch (err) {
    next(err);
  }
}

export async function generatePublicLink(req, res, next) {
  try {
    const job = await service.generatePublicTokenForJob(req.params.id);
    res.json(response.success(job, "Public link generated successfully"));
  } catch (err) {
    next(err);
  }
}


