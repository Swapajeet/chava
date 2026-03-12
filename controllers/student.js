const Student  =  require("../models/student");
const Membership = require("../models/membership");
const payment = require("../models/payment");
const transporter = require("../utils/mail.js");


module.exports.index =async(req,res)=>{


    const allstudent =  await Student.find({});

     res.render("pages/student",{allstudent});
};

module.exports.newform = (req,res)=>{
       res.render("pages/newstudent");
};

module.exports.newstudent = async (req, res) => {

  const newstudent = new Student(req.body.Student);

  // image upload असेल तरच add कर
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    newstudent.image = { url, filename };
  }

  let savedStudent = await newstudent.save();

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: savedStudent.email,
    subject: "Welcome to Chava Family",
    html: `
      <h2>Welcome to Chava Gym ${savedStudent.fullName}</h2>
      <p>Your membership has been activated.</p>
      <b>Thank you!</b>
    `
  });

  console.log(savedStudent);

  res.redirect("/student");
};

module.exports.account = async(req,res)=>{
    const {id} = req.params;
    const foundstudent = await Student.findById(id).populate("Membership");
    
        res.render("pages/account",{foundstudent});
    
};