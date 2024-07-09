import { Router } from "express";
import { errorHandler } from "../../middleware/error-handling.middleware.js";
import { authorizationMiddleware } from "../../middleware/authorization.middleware.js";
import { roles, systemRoles } from "../../utils/system-roles.utils.js";
import * as companyController from "./company.conrtoller.js";
import { auth } from "../../middleware/authentication.middleware.js";
import { validationMiddleware } from "../../middleware/validation.middleware.js";
import {
  addCompanySchema,
  deleteCompanySchema,
  findSchema,
  getCompanySchema,
  searchCompanySchema,
  updateCompanySchema,
} from "./company.schema.js";

const router = Router();
router.post(
  "/addCompany",
  errorHandler(auth()),
  errorHandler(authorizationMiddleware(systemRoles.COMPANY_HR)),
  errorHandler(validationMiddleware(addCompanySchema)),
  errorHandler(companyController.addCompany)
);
router.put(
  "/updateCompany/:_id",
  errorHandler(auth()),
  errorHandler(authorizationMiddleware(systemRoles.COMPANY_HR)),
  errorHandler(validationMiddleware(updateCompanySchema)),
  errorHandler(companyController.updateCompany)
);
router.delete(
  "/deleteCompany/:_id",
  errorHandler(auth()),
  errorHandler(authorizationMiddleware(systemRoles.COMPANY_HR)),
  errorHandler(validationMiddleware(deleteCompanySchema)),
  errorHandler(companyController.deleteCompany)
);
router.get(
  "/getCompany/:_id",
  errorHandler(auth()),
  errorHandler(authorizationMiddleware(systemRoles.COMPANY_HR)),
  errorHandler(validationMiddleware(getCompanySchema)),
  errorHandler(companyController.getCompany)
);
router.get(
  "/search",
  errorHandler(auth()),
  errorHandler(authorizationMiddleware(roles.USER_COMPANY_HR)),
  errorHandler(validationMiddleware(searchCompanySchema)),
  errorHandler(companyController.search)
);
router.get(
  "/find",
  errorHandler(auth()),
  errorHandler(authorizationMiddleware(systemRoles.COMPANY_HR)),
  errorHandler(validationMiddleware(findSchema)),
  errorHandler(companyController.GetAllApplicationsForJob)
);
router.get(
  "/excel/:_id",
  errorHandler(companyController.excelEndpoint)
);
export default router;
