import { Router } from "express";
import { errorHandler } from "../../middleware/error-handling.middleware.js";
import { authorizationMiddleware } from "../../middleware/authorization.middleware.js";
import { roles, systemRoles } from "../../utils/system-roles.utils.js";
import * as jobController from "./job.conrtoller.js";
import { auth } from "../../middleware/authentication.middleware.js";
import { validationMiddleware } from "../../middleware/validation.middleware.js";
import { addJobSchema, applySchema, deleteJobSchema, filterSchema, getJobsByCompanyNameSchema, getJobsSchema, updateJobSchema } from "./job.schema.js";

const router = Router();

router.post(
  "/addJob",
  errorHandler(auth()),
  errorHandler(authorizationMiddleware(systemRoles.COMPANY_HR)),
  errorHandler(validationMiddleware(addJobSchema)),
  errorHandler(jobController.addJob)
);
router.post(
    "/applyToJob/:_id",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware(systemRoles.USER)),
    errorHandler(validationMiddleware(applySchema)),
    errorHandler(jobController.applyToJob)
  );
router.put(
  "/update/:_id",
  errorHandler(auth()),
  errorHandler(authorizationMiddleware(systemRoles.COMPANY_HR)),
  errorHandler(validationMiddleware(updateJobSchema)),
  errorHandler(jobController.updateJob)
);
router.delete(
  "/delete/:_id",
  errorHandler(auth()),
  errorHandler(authorizationMiddleware(systemRoles.COMPANY_HR)),
  errorHandler(validationMiddleware(deleteJobSchema)),
  errorHandler(jobController.deleteJob)
);
router.get(
  "/getJobs",
  errorHandler(auth()),
  errorHandler(authorizationMiddleware(roles.USER_COMPANY_HR)),
  errorHandler(validationMiddleware(getJobsSchema)),
  errorHandler(jobController.jobWithCompany)
);
router.get(
  "/getJobsByCompanyName",
  errorHandler(auth()),
  errorHandler(authorizationMiddleware(roles.USER_COMPANY_HR)),
  errorHandler(validationMiddleware(getJobsByCompanyNameSchema)),
  errorHandler(jobController.getJobsByCompanyName)
);
router.get(
    "/filter",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware(roles.USER_COMPANY_HR)),
    errorHandler(validationMiddleware(filterSchema)),
    errorHandler(jobController.filter)
  );
  
export default router;
