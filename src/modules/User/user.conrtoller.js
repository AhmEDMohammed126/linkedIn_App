import Company from "../../../DB/models/company.model.js";
import User from "./../../../DB/models/user.model.js";
import Job from "../../../DB/models/job.model.js";
import Application from "../../../DB/models/application.model.js";
import { hashSync, compareSync } from "bcrypt";
import { ErrorClass } from "../../utils/error-class.utils.js";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import { sendEmailService } from "../../services/send-email.service.js";
/**
 * 
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 * @returns {object} return response {message, userInstance}
 * @description singUp for user
 */
export const signUp = async (req, res, next) => {
  // destruct data from body
  const {
    firstName,
    lastName,
    email,
    password,
    recoveryEmail,
    DOB,
    phone,
    role,
  } = req.body;
  const userName = firstName + " " + lastName;
 // check email is exist or not
  const isEmailAndPhoneExist = await User.findOne({
    $or: [{ email }, { phone }, { recoveryEmail }],
  });
  if (isEmailAndPhoneExist) {
    return next(
      new ErrorClass("Email or phone already exists", 400, "Email or phone already exists")
    );
  }
  //make otp code
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });
  const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS);
  //make instance of user
  const userInstance = new User({
    firstName,
    lastName,
    userName,
    email,
    password: hashedPassword,
    recoveryEmail,
    DOB,
    phone,
    role,
    otp,
  });
  //generate token instead of sending _id
  const confirmationToken = jwt.sign(
    { user: userInstance },
    process.env.CONFIRM_TOKEN,
    { expiresIn: "1h" }
  );
  // generate email confirmation link
  const confirmationLink = `${req.protocol}://${req.headers.host}/user/confirmation/${confirmationToken}`;
  //sending email
  const isEmailSent = await sendEmailService({
    to: email,
    subject: "welcome",
    htmlMessage: `<a href=${confirmationLink}>please verify your account</a>`,
  });

  if (isEmailSent.rejected.length) {
    return res
      .status(500)
      .json({ message: "verification email sending is failed " });
  }
  //save the instance in DB
  await userInstance.save();
  // response
  res.status(201).json({ message: "user created ", userInstance });
};

/**
 * 
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 * @returns  {object} return response {message, user}
 * @description verify Email of user
 */
export const verifyEmail = async (req, res, next) => {
  //destruct token from params
  const { confirmationToken } = req.params;

  //verifing the token
  const data = jwt.verify(confirmationToken, process.env.CONFIRM_TOKEN);
  const confirmedUser = await User.findOneAndUpdate(
    { _id: data?.user._id, isConfirmed: false },
    { isConfirmed: true },
    { new: true }
  );
  if (!confirmedUser) {
      // response
    return res.status(404).json({ message: "not confirmed" });
  }
    // response
  res
    .status(200)
    .json({ message: "User email successfully confirmed ", confirmedUser });
};

/***
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {object} return response {message, token}
 * @description login user
 */
export const login = async (req, res, next) => {
  // destruct email and password from req.body
  const { email, password } = req.body;
  // find user
  const user = await User.findOne({
    $and: [
      { $or: [{ email }, { recoveryEmail: email }] },
      { isConfirmed: true },
    ],
  });
  if (!user) {
    return next(
      new ErrorClass("Invalid credentials", 400, "Invalid credentials")
    );
  }

  // compare password
  const isMatch = compareSync(password, user.password);
  if (!isMatch) {
    return next(
      new ErrorClass("Invalid credentials", 400, "Invalid credentials")
    );
  }
  //update status
  user.status = true;
  await user.save();
  // generate the access token
  const token = jwt.sign({ userId: user._id }, process.env.LOGIN_SECRET, {
    expiresIn: "1d",
  });

  // response
  res.status(200).json({ message: "Login success", token });
};

/***
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {object} return response {message}
 * @description logout user
 */
export const logOut = async (req, res, next) => {
  //destruct user from req
  const { authUser } = req;
  //find user
  const user = await User.findById(authUser._id);
  //update status of user
  user.status = false;
  await user.save();
  //respons
  res.status(200).json({ message: "logged out successfuly" });
};

/***
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {object} return response {message,user}
 * @description update user
 */
export const updateUser = async (req, res, next) => {
  //destruct user from req
  const { authUser } = req;
  //destruct data from body
  const { email, phone, recoveryEmail, DOB, lastName, firstName } = req.body;
  //find user
  const isEmailAndPhoneExist = await User.findOne({
    $or: [{ email }, { phone }],
  });
  //check if email exist
  if (isEmailAndPhoneExist) {
    return next(
      new ErrorClass(
        "Email or phone already exists",
        400,
        "Email or phone already exists"
      )
    );
  }
  //update user comfirmation status to false
  if (email) {
    const userByEmail = await User.findByIdAndUpdate(
      authUser._id,
      {
        isConfirmed: false,
      },
      { new: true }
    );
    //generate token instead of sending _id
    const confirmationToken = jwt.sign(
      { user: userByEmail },
      process.env.CONFIRM_TOKEN,
      { expiresIn: "1h" }
    );
    // generate email confirmation link
    const confirmationLink = `${req.protocol}://${req.headers.host}/user/confirmation/${confirmationToken}`;
    //sending email
    const isEmailSent = await sendEmailService({
      to: email,
      subject: "welcome",
      htmlMessage: `<a href=${confirmationLink}>please verify your account</a>`,
    });
    //check if email sented or not
    if (isEmailSent.rejected.length) {
      return res
        .status(500)
        .json({ message: "verification email sending is failed " });
    }
  }
  // update user
  const user = await User.findByIdAndUpdate(
    authUser._id,
    {
      email,
      phone,
      recoveryEmail,
      DOB,
      lastName,
      firstName,
    },
    { new: true }
  ).select("-password -_id");
  user.userName = user.firstName + " " + user.lastName;
  //save user in db
  await user.save();
  //response
  res.status(200).json({ message: "user updated ", user });
};

/***
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {object} return response {message,user}
 * @description delete user
 */
export const deleteUser = async (req, res, next) => {
  //destruct user from req
  const { authUser } = req;
  //find job
  const job = await Job.find({ addedBy: authUser._id });
  let jobs =[]
  //destruct all jobs related to user
  job.forEach((e)=>{
    jobs.push(e._id)
  })
  console.log(jobs);
  //delete related company if exist
  const deleteCompany = await Company.deleteMany({ companyHR: authUser._id });
  //delete related Application if exist
  const deleteApp = await Application.deleteMany({
    $or: [
      { userId: authUser._id },
      { jobId: { $in: jobs } }
    ]
  });
  //delete related jobs if exist
  const deleteJob = await Job.deleteMany({ addedBy: authUser._id })
  //delete user
  const deleteUser = await User.findByIdAndDelete(authUser._id);
  //response
  res.status(200).json({ message: "user deleted ",deleteUser });

};

/***
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {object} return response {user}
 * @description get user information
 */
export const getInfo = async (req, res, next) => {
  //destruct user from req
  const { authUser } = req;
  //find user
  const user = await User.findById(authUser._id).select("-password -_id -otp");
  //response
  res.status(200).json({ user });
};

/***
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {object} return response {user}
 * @description get user information by id
 */
export const getById = async (req, res, next) => {
  //destruct id from params
  const { _id } = req.params;
  //find user
  const user = await User.findById(_id).select("-password -_id -otp");
  //response if user not exist
  if (!user) {
    return next(
      new ErrorClass(
        "there is no matched users",
        400,
        "there is no matched users"
      )
    );
  }
  //response
  res.status(200).json({ user });
};

/***
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {object} return response {message,user}
 * @description update password
 */
export const updatePass = async (req, res, next) => {
  //destruct user from req
  const { authUser } = req;
  //destruct password from body
  const { password } = req.body;
  //hashing password
  const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS);
  //update user password
  const user = await User.findByIdAndUpdate(
    authUser._id,
    {
      password: hashedPassword,
    },
    { new: true }
  );
  //response
  res.status(200).json({ message: "user password updated ", user });
};

/***
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {object} return response {user}
 * @description get user by recovery email
 */
export const getAllRecovery = async (req, res, next) => {
  //destruct recoveryEmail from body
  const { recoveryEmail } = req.body;
  //find user
  const user = await User.findOne({ recoveryEmail }).select("-password -_id -otp");
  //check if user exist
  if (!user) {
    return next(
      new ErrorClass(
        "there is no matched users",
        400,
        "there is no matched users"
      )
    );
  }
  //response
  res.status(200).json({ user });
};

/***
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {object} return response {message}
 * @description send otp to user email
 */
export const forgetPassword = async (req, res, next) => {
  //destruct email from body
  const { email } = req.body;
  //find user
  const isUserExists = await User.findOne({
    $or: [{ email }, { recoveryEmail: email }],
  });
  //check if user exist
  if (!isUserExists) {
    return next(
      new ErrorClass("email doesn't exist", 400, "email doesn't exist")
    );
  }
  //sending email
  const isEmailSent = await sendEmailService({
    to: email,
    subject: "welcome",
    htmlMessage: `<h1>your otp numbers for reseting the password are : ${isUserExists.otp}</h1>`,
  });
  if (isEmailSent.rejected.length) {
    return res
      .status(500)
      .json({ message: "verification email sending is failed " });
  }
  //response
  res.json({ message: "check your email" });
};

/***
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {object} return response {message,user}
 * @description change password
 */
export const changePassword = async (req, res, next) => {
  //destruct data from body
  const { email, password, otp } = req.body;
  //find user
  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new ErrorClass("email doesn't exist", 400, "email doesn't exist")
    );
  }
  //check otp validation
  if (!user?.otp == otp) {
    return new ErrorClass("otp is wrong");
  }
  //generate new otp to save in db
  const newOTP = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });
  //update user data
  const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS);
  user.password = hashedPassword;
  user.otp = newOTP;
  const savedUser = await user.save();
  //response
  res.json({ message: "password changed", savedUser });
};
