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
  try {
    console.log("Incoming Data:", req.body.Student); // 👈 debug

    // ✅ email अस्तित्व check
    if (!req.body.Student.email) {
      return res.send("Email is required!");
    }

    // 🔍 duplicate email check
    const existingStudent = await Student.findOne({ email: req.body.Student.email });
    if (existingStudent) {
      return res.send("Student with this email already exists!");
    }

    const newstudent = new Student(req.body.Student);

    // image upload असेल तरच add कर
    if (req.file) {
      let url = req.file.path;
      let filename = req.file.filename;
      newstudent.image = { url, filename };
    }

    let savedStudent = await newstudent.save();
    const email = savedStudent.email?.toString().trim();

     if (!email) {
       throw new Error("Recipient email missing");
      }


    // ✅ email send करण्याआधी check
    if (!savedStudent.email) {
      return res.send("Student saved but email missing!");
    }
    // console.log("TYPE:", typeof savedStudent.email);
    // console.log("VALUE:", savedStudent.email);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
     to: email,
      subject: "Welcome to Chava Family",
      html: `
        <h2>Welcome to Chava Gym ${savedStudent.fullName}</h2>
        <p>Your membership has been activated.</p>
        <b>Thank you!</b>
      `
    });

    res.redirect("/students");

  } catch (err) {
    console.log(err);
    res.send("Error adding student");
  }
};

module.exports.account = async(req,res)=>{
    const {id} = req.params;
    const foundstudent = await Student.findById(id).populate("Membership");
    
        res.render("pages/account",{foundstudent});
    
};