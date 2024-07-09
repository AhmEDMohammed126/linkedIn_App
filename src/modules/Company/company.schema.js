import Joi from "joi";
import { generalRules } from "../../utils/general-rules.utils.js";

export const addCompanySchema= {
    body: Joi.object({
        companyName: Joi.string().required(),
        desc:Joi.string().required(),
        industry:Joi.string().required(),
        address:Joi.string().required(),
        noOfEmployees:Joi.number().min(2).max(50).required(),
        companyEmail:generalRules.email
    }),
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
}
export const updateCompanySchema= {
    body: Joi.object({
        companyName: Joi.string().optional(),
        desc:Joi.string().optional(),
        industry:Joi.string().optional(),
        address:Joi.string().optional(),
        noOfEmployees:Joi.number().min(2).max(50).optional(),
        companyEmail:generalRules.email.optional()
    }),
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
    params: Joi.object({
        _id:generalRules._id.required()
    })
}
export const deleteCompanySchema= {
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
    params: Joi.object({
        _id:generalRules._id.required()
    })
}
export const getCompanySchema= {
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    }),
    params: Joi.object({
        _id:generalRules._id.required()
    })
}

export const searchCompanySchema= {
    body: Joi.object({
        search: Joi.string().required()
    }),
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    })
}

export const findSchema= {
    body: Joi.object({
        jobId: generalRules._id.required()
    }),
    headers: Joi.object({
        token: Joi.string().required(),
        ...generalRules.headers,
    })
}