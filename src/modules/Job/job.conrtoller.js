import Company from "../../../DB/models/company.model.js";
import User from "./../../../DB/models/user.model.js";
import { ErrorClass } from "../../utils/error-class.utils.js";
import Job from "../../../DB/models/job.model.js";
import Application from "../../../DB/models/application.model.js";

/**
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 * @returns {object} return response {message, job}
 * @description add job
 */
export const addJob = async (req, res, next) => {
  //destruct data from body
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
  } = req.body;
  //destruct user from req
  const { authUser } = req;
  //make instance of job
  const job = new Job({
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    addedBy: authUser._id,
  });
  //add job to db
  await job.save();
  //response
  res.status(201).json({ message: "job created", job });
};

/**
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 * @returns {object} return response {message, job}
 * @description update job
 */
export const updateJob = async (req, res, next) => {
  //destruct data from body
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
  } = req.body;

  //destruct user from req
  const { authUser } = req;

  //destruct _id from params
  const { _id } = req.params;
  //find job
  const job = await Job.findById({ _id });
  if(!job){
    return next(
      new ErrorClass(
        "no matched job",
        400,
        "no matched job"
      )
    );
  }
  if (!authUser._id == job.addedBy) {
    return next(
      new ErrorClass(
        "you are not allowed to update this job",
        400,
        "you are not allowed to update this job"
      )
    );
  }
  //update job
  const updatedJob = await Job.findByIdAndUpdate(
    _id,
    {
      jobTitle,
      jobLocation,
      workingTime,
      seniorityLevel,
      jobDescription,
      technicalSkills,
      softSkills,
    },
    { new: true }
  );
  //response
  res.status(200).json({ message: "updated", updatedJob });
};

/**
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 * @returns {object} return response {message, job}
 * @description delete job
 */
export const deleteJob = async (req, res, next) => {
  //destruct user from req
  const { authUser } = req;
  //destruct _id from params
  const { _id } = req.params;
  //find job
  const job = await Job.findById({ _id });
  //check if job exist
  if(!job){
    return next(
      new ErrorClass(
        "no matched job",
        400,
        "no matched job"
      )
    );
  }
  if (!authUser._id == job.addedBy) {
    return next(
      new ErrorClass(
        "you are not allowed to update this job",
        400,
        "you are not allowed to update this job"
      )
    );
  }
  //delete related applications
  const deletedApp = await Application.deleteMany({jobId:_id});
  //delete jobs
  const deletedJob = await Job.findByIdAndDelete(_id);
  //response
  res.status(200).json({ message: "deleted", deletedJob  });
};

/**
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 * @returns {object} return response {message, Application}
 * @description apply to job
 */
export const applyToJob = async (req, res, next) => {
  //destruct user from req
  const { authUser } = req;
  // destruct job id from params
  const { _id } = req.params;
  //find is job exist or not
  const isjobExist=await Job.findById(_id)
  if(!isjobExist){
    return next(
      new ErrorClass(
        "no matched job",
        400,
        "no matched job"
      )
    );
  } 
  //destruct data from body
  const { userTechSkills, userSoftSkills } = req.body;
  //make instance of appication
  const appliedApplication = new Application({
    jobId: _id,
    userId: authUser?._id,
    userTechSkills,
    userSoftSkills,
  });
  //save application in db
  const applicationFilled = await appliedApplication.save();
  //response
  res.status(201).json({ message: "applied successfuly", applicationFilled });
}

/**
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 * @returns {object} return response {[jobs]}
 * @description get job With Company data
 */
export const jobWithCompany = async (req, res, next) => {
  //get jobs and company data
  const allJobs = await Job.aggregate([
    {
      $lookup: {
        from: "companies",
        localField: "addedBy",
        foreignField: "companyHR",
        as: "company info",
      },
    },
  ]);
  //response
  res.status(200).json({ allJobs });
}

/**
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 * @returns {object} return response {[jobs]}
 * @description get job With Company name
 */
export const getJobsByCompanyName = async (req, res, next) => {
  //destract company name from query
  const { companyName } = req.query;
  //find company
  const company = await Company.findOne({
    companyName,
  });
  //check is company exist or not
  if (!company) {
    return next(
      new ErrorClass("company does not exists", 400, "company does not exists")
    );
  }
  //find jobs
  const allJobs = await Job.find({
    addedBy: company.companyHR,
  });
  //response
  res.status(200).json({ allJobs });
}

/**
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 * @returns {object} return response {[jobs]}
 * @description filter jobs
 */
export const filter = async (req, res, next) => {
  //destruct data from body
  const {
    technicalSkills=[] ,
    seniorityLevel,
    workingTime,
    jobLocation,
    jobTitle,
  } = req.body;
  // filters object to save filters
  const filters = {};

  // Check if each filter exists in req.body and add it to filters object if present
  if (workingTime) {
    filters.workingTime = workingTime;
  }
  if (jobLocation) {
    filters.jobLocation = jobLocation;
  }
  if (seniorityLevel) {
    filters.seniorityLevel = seniorityLevel;
  }
  if (jobTitle) {
    filters.jobTitle = jobTitle;
  }
  if (technicalSkills.length) {
    filters.technicalSkills = technicalSkills;
  }
  //find jobs
  const allJobs = await Job.find(filters);
  //response
  res.status(200).json({ allJobs });
};
