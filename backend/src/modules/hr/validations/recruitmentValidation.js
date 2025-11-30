import Joi from "joi";

export const createJobSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(10).required(),
    departmentId: Joi.string().uuid().required(),
    isActive: Joi.boolean().optional(),
    skills: Joi.array().items(Joi.object({
      skillId: Joi.string().uuid().required(),
      required: Joi.boolean().default(true),
      minLevel: Joi.number().integer().min(1).max(5).default(1),
    })).optional(),
  }).required(),
});

export const createCandidateSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow(null, '').optional(),
    resumeUrl: Joi.alternatives().try(
      Joi.string().uri(),
      Joi.string().allow(''),
      Joi.allow(null)
    ).optional(),
  }).required(),
});

export const updateJobSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    title: Joi.string().min(3).optional(),
    description: Joi.string().min(10).optional(),
    departmentId: Joi.string().uuid().optional(),
    isActive: Joi.boolean().optional(),
    skills: Joi.array().items(Joi.object({
      skillId: Joi.string().uuid().required(),
      required: Joi.boolean().default(true),
      minLevel: Joi.number().integer().min(1).max(5).default(1),
    })).optional(),
  }).min(1).required(),
});

export const candidateStageSchema = Joi.object({
  params: Joi.object({ candidateId: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    stage: Joi.string().valid("APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED").required(),
  }).required(),
});

export const setScoreSchema = Joi.object({
  params: Joi.object({ candidateId: Joi.string().uuid().required() }).required(),
  body: Joi.object({ score: Joi.number().integer().min(0).max(100).required() }).required(),
});

export const notifySchema = Joi.object({
  params: Joi.object({ candidateId: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    subject: Joi.string().min(3).required(),
    message: Joi.string().min(1).required(),
    channel: Joi.string().valid("email", "sms").optional(),
  }).required(),
});

export const shortlistSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    criteria: Joi.object({
      minScore: Joi.number().integer().min(0).max(100).optional(),
    }).default({}).optional(),
  }).required(),
});

export const statusWithReasonSchema = Joi.object({
  params: Joi.object({ candidateId: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    stage: Joi.string().valid("REJECTED", "APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED").required(),
    reason: Joi.string().allow("").optional(),
  }).required(),
});

export const scheduleInterviewSchema = Joi.object({
  body: Joi.object({
    candidateId: Joi.string().uuid().required(),
    interviewerId: Joi.string().uuid().allow(null).optional(),
    date: Joi.date().required(),
    duration: Joi.number().integer().min(15).max(480).optional(), // 15 minutes to 8 hours
    type: Joi.string().valid('IN_PERSON', 'VIDEO', 'PHONE').optional(),
    location: Joi.string().allow("").optional(),
    meetingLink: Joi.string().allow("").optional(),
    notes: Joi.string().allow("").optional(),
    feedback: Joi.string().allow("").optional(),
    rating: Joi.number().integer().min(1).max(10).optional(),
  }).required(),
});

export const updateInterviewSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    date: Joi.date().optional(),
    duration: Joi.number().integer().min(15).max(480).optional(),
    type: Joi.string().valid('IN_PERSON', 'VIDEO', 'PHONE').optional(),
    location: Joi.string().allow("").optional(),
    meetingLink: Joi.string().allow("").optional(),
    notes: Joi.string().allow("").optional(),
    feedback: Joi.string().allow("").optional(),
    rating: Joi.number().integer().min(1).max(10).optional(),
    status: Joi.string().valid('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED').optional(),
  }).min(1).required(),
});

export const generateOfferSchema = Joi.object({
  params: Joi.object({ candidateId: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    salary: Joi.number().positive().required(),
    startDate: Joi.date().required(),
    position: Joi.string().optional(),
    template: Joi.string().optional(),
  }).required(),
});

export const createContractSchema = Joi.object({
  params: Joi.object({ candidateId: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    employeeId: Joi.string().uuid().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().optional(),
    document: Joi.string().uri().allow(null).optional(),
  }).required(),
});

export const onboardingChecklistSchema = Joi.object({
  params: Joi.object({ candidateId: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    tasks: Joi.array().items(Joi.object({
      title: Joi.string().required(),
      description: Joi.string().allow("").optional(),
      dueDate: Joi.date().optional(),
    })).default([]),
  }).required(),
});

export const deleteCandidateSchema = Joi.object({
  params: Joi.object({ candidateId: Joi.string().uuid().required() }).required(),
});

export const hireCandidateSchema = Joi.object({
  params: Joi.object({ candidateId: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    jobType: Joi.string().valid("FULL_TIME", "PART_TIME", "CONTRACT", "INTERN").required(),
    salary: Joi.number().positive().optional(),
    managerId: Joi.string().uuid().allow(null).optional(),
    startDate: Joi.date().required(),
  }).required(),
});

// Candidate Document Validation Schemas
export const addCandidateDocumentSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({ 
    name: Joi.string().required(), 
    fileUrl: Joi.string().uri().optional(),
    documentType: Joi.string().valid('RESUME', 'COVER_LETTER', 'PORTFOLIO', 'CERTIFICATE', 'OTHER').optional()
  }).required(),
});

export const updateCandidateDocumentSchema = Joi.object({
  params: Joi.object({ 
    id: Joi.string().uuid().required(),
    documentId: Joi.string().uuid().required()
  }).required(),
  body: Joi.object({ 
    name: Joi.string().optional(),
    documentType: Joi.string().valid('RESUME', 'COVER_LETTER', 'PORTFOLIO', 'CERTIFICATE', 'OTHER').optional()
  }).min(1).required(),
});

export const deleteCandidateDocumentSchema = Joi.object({
  params: Joi.object({ 
    id: Joi.string().uuid().required(),
    documentId: Joi.string().uuid().required()
  }).required(),
});


