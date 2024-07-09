import Joi from "joi";
import { generalRules } from "../../utils/general-rules.utils.js";

export const addJobSchema= {
    body: Joi.object({
        jobTitle:Joi.string().required(),
        jobLocation:Joi.string().optional().valid("onsite", "remotely", "hybrid"),
        workingTime:Joi.string().optional().valid("partTime", "fullTime"),
        seniorityLevel:Joi.string().optional().valid("junior", "midLevel", "senior", "teamLead", "CTO"),
        jobDescription:Joi.string().required(),
        technicalSkills:Joi.array().items(Joi.string()).optional(),
        softSkills:Joi.array().items(Joi.string()).optional(),
    }),
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
}
export const updateJobSchema= {
    body: Joi.object({
        jobTitle:Joi.string().optional(),
        jobLocation:Joi.string().optional().valid("onsite", "remotely", "hybrid"),
        workingTime:Joi.string().optional().valid("partTime", "fullTime"),
        seniorityLevel:Joi.string().optional().valid("junior", "midLevel", "senior", "teamLead", "CTO"),
        jobDescription:Joi.string().optional(),
        technicalSkills:Joi.array().items(Joi.string()).optional(),
        softSkills:Joi.array().items(Joi.string()).optional(),
    }),
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
    params:Joi.object({
        _id:generalRules._id.required()
    }),
}
export const deleteJobSchema= {
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
    params:Joi.object({
        _id:generalRules._id.required()
    }),
}
export const applySchema= {
    body: Joi.object({
        userTechSkills:Joi.array().items(Joi.string()).optional(),
        userSoftSkills:Joi.array().items(Joi.string()).optional(),
    }),
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
    params:Joi.object({
        _id:generalRules._id.required()
    }),
}

export const getJobsSchema= {
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
}

export const getJobsByCompanyNameSchema= {
    query:Joi.object({
        companyName:Joi.string().required()
    })
    ,

    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
}
export const filterSchema= {
    body: Joi.object({
        jobTitle:Joi.string().optional(),
        jobLocation:Joi.string().optional().valid("onsite", "remotely", "hybrid"),
        workingTime:Joi.string().optional().valid("partTime", "fullTime"),
        seniorityLevel:Joi.string().optional().valid("junior", "midLevel", "senior", "teamLead", "CTO"),
        technicalSkills:Joi.array().items(Joi.string()).optional(),
    }),
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
}