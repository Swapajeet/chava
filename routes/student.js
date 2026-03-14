const express = require("express");
const route = express.Router();
const multer  = require("multer");
const{storage} = require("../cloudConfig.js")
const upload = multer({ storage });
const studentcontroller = require("../controllers/student.js");


route.get("/students",studentcontroller.index);

route.get("/students/new",studentcontroller.newform);

route.post("/students",upload.single('Student[image]'),studentcontroller.newstudent);


route.get("/students/:id",studentcontroller.account);

module.exports = route;