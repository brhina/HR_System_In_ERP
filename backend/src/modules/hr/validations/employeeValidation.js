import Joi from "joi";

export const createEmployeeSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    gender: Joi.string().valid("MALE", "FEMALE", "OTHER").optional(),
    dob: Joi.date().optional(),
    jobType: Joi.string().valid("FULL_TIME", "PART_TIME", "CONTRACT", "INTERN").required(),
    jobTitle: Joi.string().required(),
    departmentId: Joi.string().uuid().required(),
    managerId: Joi.string().uuid().allow(null).optional(),
    salary: Joi.number().positive().optional(),
    payFrequency: Joi.string().optional(),
    benefitsPackage: Joi.string().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    postalCode: Joi.string().optional(),
    country: Joi.string().optional(),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      relationship: Joi.string().required(),
      phone: Joi.string().required()
    }).optional(),
    notes: Joi.string().optional(),
    // File handling fields
    files: Joi.object({
      newFiles: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        size: Joi.number().required(),
        type: Joi.string().required(),
        file: Joi.any().optional() // File object for multipart uploads
      })).optional(),
      removedFiles: Joi.array().items(Joi.string()).optional(),
      existingFiles: Joi.array().items(Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required()
      })).optional()
    }).optional()
  }).required(),
});

export const updateEmployeeSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    firstName: Joi.string().min(2).optional(),
    lastName: Joi.string().min(2).optional(),
    phone: Joi.string().optional(),
    gender: Joi.string().valid("MALE", "FEMALE", "OTHER").optional(),
    dob: Joi.date().optional(),
    status: Joi.string().valid("ACTIVE", "INACTIVE", "PROBATION", "TERMINATED", "RESIGNED").optional(),
    jobType: Joi.string().valid("FULL_TIME", "PART_TIME", "CONTRACT", "INTERN").optional(),
    jobTitle: Joi.string().optional(),
    departmentId: Joi.string().uuid().optional(),
    managerId: Joi.string().uuid().allow(null).optional(),
    salary: Joi.number().positive().optional(),
    payFrequency: Joi.string().optional(),
    benefitsPackage: Joi.string().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    postalCode: Joi.string().optional(),
    country: Joi.string().optional(),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      relationship: Joi.string().required(),
      phone: Joi.string().required()
    }).optional(),
    notes: Joi.string().optional(),
    // File handling fields
    files: Joi.object({
      newFiles: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        size: Joi.number().required(),
        type: Joi.string().required(),
        file: Joi.any().optional() // File object for multipart uploads
      })).optional(),
      removedFiles: Joi.array().items(Joi.string()).optional(),
      existingFiles: Joi.array().items(Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required()
      })).optional()
    }).optional()
  })
    .min(1)
    .required(),
});

// Additional schemas
export const addSkillSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({ 
    skillId: Joi.string().uuid().required(), 
    level: Joi.number().integer().min(1).max(5).required(),
    evidence: Joi.string().allow("").optional(),
    notes: Joi.string().allow("").optional(),
    assessedBy: Joi.string().uuid().optional()
  }).required(),
});

export const updateSkillSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required(), assignmentId: Joi.string().uuid().required() }).required(),
  body: Joi.object({ 
    level: Joi.number().integer().min(1).max(5).required(),
    evidence: Joi.string().allow("").optional(),
    notes: Joi.string().allow("").optional(),
    assessedBy: Joi.string().uuid().optional()
  }).required(),
});

export const addCertificationSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    name: Joi.string().required(),
    issuer: Joi.string().optional(),
    issuedAt: Joi.date().required(),
    expiresAt: Joi.date().optional(),
  }).required(),
});

export const addDocumentSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({ 
    name: Joi.string().required(), 
    fileUrl: Joi.string().uri().optional() 
  }).required(),
});

export const addEvaluationSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({ evaluatorId: Joi.string().uuid().optional(), date: Joi.date().optional(), score: Joi.number().integer().min(1).max(10).required(), feedback: Joi.string().allow("").optional(), probation: Joi.boolean().optional() }).required(),
});

export const promotionSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({ 
    jobTitle: Joi.string().required(),
    salary: Joi.number().positive().optional(),
    effectiveDate: Joi.date().optional(),
    reason: Joi.string().allow("").optional(),
    approvedBy: Joi.string().uuid().optional()
  }).required(),
});

export const transferSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({ 
    departmentId: Joi.string().uuid().required(), 
    managerId: Joi.string().uuid().allow(null).optional(),
    reason: Joi.string().allow("").optional(),
    effectiveDate: Joi.date().optional(),
    approvedBy: Joi.string().uuid().optional()
  }).required(),
});

export const careerProgressionApprovalSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    status: Joi.string().valid("APPROVED", "REJECTED").required(),
    approvedBy: Joi.string().uuid().required(),
    reason: Joi.string().allow("").optional()
  }).required(),
});

export const startProbationSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({ evaluatorId: Joi.string().uuid().optional(), score: Joi.number().integer().min(1).max(10).required(), feedback: Joi.string().allow("").optional() }).required(),
});

export const endProbationSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({ status: Joi.string().valid("ACTIVE", "INACTIVE", "TERMINATED", "RESIGNED").optional(), evaluatorId: Joi.string().uuid().optional(), score: Joi.number().integer().min(1).max(10).optional(), feedback: Joi.string().allow("").optional() }).required(),
});

export const offboardSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({ reason: Joi.string().allow("").optional(), approvedById: Joi.string().uuid().optional() }).required(),
});

// Admin Skills Management Schemas
export const createSkillCatalogSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().allow("").optional(),
    category: Joi.string().max(50).allow("").optional(),
    subcategory: Joi.string().max(50).allow("").optional(),
    isRequired: Joi.boolean().optional(),
  }).required(),
});

export const updateSkillCatalogSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().allow("").optional(),
    category: Joi.string().max(50).allow("").optional(),
    subcategory: Joi.string().max(50).allow("").optional(),
    isRequired: Joi.boolean().optional(),
  })
    .min(1)
    .required(),
});

export const deleteSkillCatalogSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
});

export const getSkillCatalogSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
});


