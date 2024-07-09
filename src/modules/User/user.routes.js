import { Router } from "express";
import { errorHandler } from "../../middleware/error-handling.middleware.js";
import * as userController from "./user.conrtoller.js";
import { validationMiddleware } from "../../middleware/validation.middleware.js";
import { auth } from "../../middleware/authentication.middleware.js";
import {
  changePassword,
  deleteSchema,
  forgetPassword,
  getByIdSchema,
  getInfoSchema,
  logInSchema,
  logOutSchema,
  recoveryEmailSchema,
  SignUpSchema,
  updatePassSchema,
  updateSchema,
  verifySchema,
} from "./user.schema.js";


const router = Router();
router.post(
  "/signUp",
  errorHandler(validationMiddleware(SignUpSchema)),
  errorHandler(userController.signUp)
);

router.post(
  "/login",
  errorHandler(validationMiddleware(logInSchema)),
  errorHandler(userController.login)
);

router.patch(
  "/logout",
  errorHandler(auth()),
  errorHandler(validationMiddleware(logOutSchema)),
  errorHandler(userController.logOut)
);

router.put(
  "/update",
  errorHandler(auth()),
  errorHandler(validationMiddleware(updateSchema)),
  errorHandler(userController.updateUser)
);

router.delete(
  "/delete",
  errorHandler(auth()),
  errorHandler(validationMiddleware(deleteSchema)),
  errorHandler(userController.deleteUser)
);
router.get(
  "/getInfo",
  errorHandler(auth()),
  errorHandler(validationMiddleware(getInfoSchema)),
  errorHandler(userController.getInfo)
);

router.get(
  "/getById/:_id",
  errorHandler(auth()),
  errorHandler(validationMiddleware(getByIdSchema)),
  errorHandler(userController.getById)
);

router.patch(
  "/updatePass",
  errorHandler(auth()),
  errorHandler(validationMiddleware(updatePassSchema)),
  errorHandler(userController.updatePass)
);
router.get(
  "/recoveryEmail",
  errorHandler(auth()),
  errorHandler(validationMiddleware(recoveryEmailSchema)),
  errorHandler(userController.getAllRecovery)
);

router.get(
  "/confirmation/:confirmationToken",
  errorHandler(validationMiddleware(verifySchema)),
  errorHandler(userController.verifyEmail)
);

router.post(
  "/forgetPass",
  errorHandler(validationMiddleware(forgetPassword)),
  errorHandler(userController.forgetPassword)
);

router.patch(
  "/changePass",
  errorHandler(validationMiddleware(changePassword)),
  errorHandler(userController.changePassword)
);

export default router;
