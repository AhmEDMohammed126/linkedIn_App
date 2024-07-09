import express from 'express';
import { config } from "dotenv";

import { db_connection } from "./DB/connection.js";
import companyRouter from './src/modules/Company/company.routes.js'
import userRouter from './src/modules/User/user.routes.js';
import jobRouter from './src/modules/Job/job.routes.js'
import { globaleResponse } from './src/middleware/error-handling.middleware.js';

const app = express();
app.use(express.json());

config();
const port = process.env.PORT;

app.get("/", (req, res) => res.send("Hello World!"));
app.use("/user", userRouter);
app.use("/company", companyRouter);
app.use("/job", jobRouter);
app.use(globaleResponse);

db_connection();
 
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
