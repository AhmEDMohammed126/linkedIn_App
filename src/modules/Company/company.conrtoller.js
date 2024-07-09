import Company from "../../../DB/models/company.model.js";
import User from "./../../../DB/models/user.model.js";
import { ErrorClass } from "../../utils/error-class.utils.js";
import Job from "../../../DB/models/job.model.js";
import Application from "../../../DB/models/application.model.js";
import excel from "exceljs";

/**
 * 
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 * @returns {object} return response {message, company}
 * @description add company
 */
export const addCompany = async (req, res, next) => {
  //destruct data from body
  const { companyName, desc, industry, address, noOfEmployees, companyEmail } =
    req.body;
    //destruct user from req
  const { authUser } = req;
  //check if commpany exist
  const isCompanyNameExist = await Company.findOne({
    $or: [{ companyName }, { companyEmail }, { companyHR: authUser._id }],
  });

  if (isCompanyNameExist) {
    return next(
      new ErrorClass("company already exists", 400, "company already exists")
    );
  }
  //make instance of company
  const company = new Company({
    companyName,
    desc,
    industry,
    address,
    noOfEmployees,
    companyEmail,
    companyHR: authUser._id,
  });
  //save company
  await company.save();
  //response
  res.status(201).json({ message: "company created", company });
};

/**
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 * @returns {object} return response {message, company}
 * @description update company
 */
export const updateCompany = async (req, res, next) => {
  //destruct data from body
  const { companyName, desc, industry, address, noOfEmployees, companyEmail } =
    req.body;
    //destruct user from req
  const { authUser } = req;
  //destruct id from params
  const { _id } = req.params;
  //find company
  const company = await Company.findById({ _id });
  if(!company)
    return next(
      new ErrorClass(
        "no matched company",
        400,
        "no matched company"
      )
    );
  //check if the user is the owner of company or not
  if (!authUser._id == company.companyHR) {
    return next(
      new ErrorClass(
        "you are not allowed to update this company",
        400,
        "you are not allowed to update this company"
      )
    );
  }
  //check if new name exist
  const isCompanyNameExist = await Company.findOne({
    $or: [{ companyName }, { companyEmail }],
  });
  if (isCompanyNameExist) {
    return next(
      new ErrorClass("company already exists", 400, "company already exists")
    );
  }
  //update company
  const updatedCompany = await Company.findByIdAndUpdate(
    _id,
    {
      companyName,
      desc,
      industry,
      address,
      noOfEmployees,
      companyEmail,
    },
    { new: true }
  );
  //response
  res.status(200).json({ message: "updated", updatedCompany });
};

/**
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 * @returns {object} return response {message, company}
 * @description delete company
 */
export const deleteCompany = async (req, res, next) => {
  //destruct user from req
  const { authUser } = req;
  //destruct _id from params
  const { _id } = req.params;
  //find company
  const company = await Company.findById({ _id });
  if(!company){
    return next(
      new ErrorClass(
        "no matched company",
        400,
        "no matched company"
      )
    );
  }
  //check if the user is the owner of company or not
  if (!authUser._id == company?.companyHR) {
    return next(
      new ErrorClass(
        "you are not allowed to delete this company",
        400,
        "you are not allowed to delete this company"
      )
    );
  }
  //delete company and related jobs
  const deleteJob=await Job.deleteMany({addedBy:company.companyHR})
  const deletedCompany = await Company.findByIdAndDelete(_id);
  //response
  res.status(200).json({ message: "deleted", deletedCompany });
};

/**
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 * @returns {object} return response {company,companyJobs}
 * @description get company
 */
export const getCompany = async (req, res, next) => {
  //destruct user from req
  const { authUser } = req;
  //destruct _id from params
  const { _id } = req.params;
  //find
  const company = await Company.findById({ _id });
  if(!company){
    return next(
      new ErrorClass(
        "no matched company",
        400,
        "no matched company"
      )
    );
  }
  //find related jobs
  const companyJobs=await Job.find({addedBy:company.companyHR})
  
  //check if the user is the owner of company or not
  if (!authUser._id == company.companyHR) {
    return next(
      new ErrorClass(
        "you are not allowed to get this company",
        400,
        "you are not allowed to get this company"
      )
    );
  }
  //response
  res.status(200).json({ company,companyJobs });
};

/**
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 * @returns {object} return response {message}
 * @description search by company name
 */
export const search = async (req, res, next) => {
  //destruct search from body
  const { search } = req.body;
  //find companies
  const result = await Company.find({
    companyName: { $regex: search, $options: "i" }, // for making it case insensitive search
  });
  //response
  res.status(200).json({ message: result });
};

/**
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 * @returns {object} return response {allApplications}
 * @description get Company With related Jobs
 */
export const GetAllApplicationsForJob = async (req, res, next) => {
  //destruct user from req
  const { authUser } = req;
  //destruct jobid from params
  const { jobId } = req.body;
  //find job
  const job = await Job.findById({ _id: jobId });
  if (!authUser._id == job.addedBy) {
    return next(
      new ErrorClass(
        "you are not allowed to get those apps",
        400,
        "you are not allowed to get those apps"
      )
    );
  }
  //find all Applications
  const allApplications = await Application.find({ jobId: jobId }).populate([
    { path: "userId" },
  ]);
  //response
  res.status(200).json({ allApplications });
};

/**
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 * @returns {object} return response 
 * @description creates an Excel sheet
 */
export const excelEndpoint = async (req, res, next) => {
  const { _id } = req.params;
  const company = await Company.findById(_id);
  if (!company) {
    return next(new ErrorClass("Company does not exist", 404,"Company does not exist"));
  }

  const job = await Job.findOne({ addedBy: company.companyHR });
  if (!job) {
    return next(new ErrorClass("No job found for this company", 404,"No job found for this company"));
  }

  const applications = await Application.find({ jobId: job._id });

  // Create Excel workbook and worksheet
  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet("Applications");

  // Define headers
  worksheet.columns = [
    { header: "Job Id", key: "jobId", width: 40 },
    { header: "User Id", key: "userId", width: 40 },
    { header: "User Tech skills", key: "userTechSkills", width: 50 },
    { header: "User Soft skills", key: "userSoftSkills", width: 50 }
  ];

  // Populate data
  applications.forEach((app) => {
    worksheet.addRow({
      jobId: app.jobId,
      userId: app.userId,
      userTechSkills:app.userTechSkills.toString(),
      userSoftSkills:app.userSoftSkills.toString(),
    });
  });

  // Set response headers for Excel file download
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment;filename=" + "applications.xlsx"
  );

  // Write workbook to response
  await workbook.xlsx.write(res);
  res.end();
};
