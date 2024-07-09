import Joi from "joi";
import { generalRules } from "../../utils/general-rules.utils.js";

export const SignUpSchema = {
  body: Joi.object({
    firstName: Joi.string().min(3).max(30).alphanum().required(),
    lastName: Joi.string().min(3).max(30).alphanum().required(),
    email: generalRules.email.required(),
    password: generalRules.password.required(),
    recoveryEmail: generalRules.email.required(),
    DOB: Joi.date().required(),
    phone: Joi.string().required(),
    role: Joi.string().valid("user", "company_hr"),
  }),
};

export const logInSchema = {
  body: Joi.object({
    email: generalRules.email.required(),
    password: generalRules.password.required(),
  }),
};

export const logOutSchema = {
  headers: Joi.object({
    token: Joi.string().required(),
    ...generalRules.headers,
  }),
};
export const updateSchema = {
  body: Joi.object({
    firstName: Joi.string().min(3).max(30).alphanum().optional(),
    lastName: Joi.string().min(3).max(30).alphanum().optional(),
    email:generalRules.email.optional(),
    recoveryEmail:generalRules.email.optional(),
    DOB:Joi.date().optional(),
    phone:Joi.string().optional(),
  }),
  headers: Joi.object({
    token: Joi.string().required(),
    ...generalRules.headers,
  }),
};

export const deleteSchema = {
  headers: Joi.object({
    token: Joi.string().required(),
    ...generalRules.headers,
  }),
};

export const getInfoSchema = {
  headers: Joi.object({
    token: Joi.string().required(),
    ...generalRules.headers,
  }),
};

export const getByIdSchema = {
  headers: Joi.object({
    token: Joi.string().required(),
    ...generalRules.headers,
  }),
  params: generalRules.objectId,
};


export const updatePassSchema = {
  body: Joi.object({
    password: generalRules.password.required(),
  }),
  headers: Joi.object({
    token: Joi.string().required(),
    ...generalRules.headers,
  }),
};

export const recoveryEmailSchema = {
  body: Joi.object({
    recoveryEmail:Joi.string().email({
      minDomainSegments: 2,
    }).required()
  }),
  headers: Joi.object({
    token: Joi.string().required(),
    ...generalRules.headers,
  }),
};

export const verifySchema = {
  params: Joi.object({
    confirmationToken: Joi.string().required(),
  }),
};

export const forgetPassword = {
  body: Joi.object({
    email:Joi.string().email({
      minDomainSegments: 2,
    }).required()
  }),
};

export const changePassword = {
  body: Joi.object({
    email:generalRules.email.required(),
    password:generalRules.password.required(),
    otp: Joi.string().required()
  }),
};