if(process.env.NODE_ENV!="production"){
    require('dotenv').config();

}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path =  require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Student  =  require("./models/student");
const Membership = require("./models/membership");
const payment = require("./models/payment");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const studetroute = require("./routes/student.js");
const { saveRedirectUrl } = require("./middleware.js");
const transporter = require("./utils/mail.js");

//  const MONGO_URL ="mongodb://127.0.0.1:27017/chava";
const db_url = process.env.ATLAS_URI;
 main()
 .then(()=>{
        console.log("mongodb is connected");    
 })
 .catch((err)=>{
        console.log(err);``
 });
 async function main(){
    await mongoose.connect(db_url);
 }


 app.set("view engine","ejs");
   app.set("views",path.join(__dirname,"/views"));
   app.use(express.urlencoded({extended:true}));
   app.use(methodOverride("_method"));
   app.engine('ejs', ejsMate);
   app.use(express.static(path.join(__dirname,"/public")));

app.get("/", (req, res) => {
    res.render("pages/login");
});

const store = MongoStore.create({
  mongoUrl: db_url,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("SESSION STORE ERROR");
});

const sessionOption = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

       
   app.use(session(sessionOption));
   app.use(flash());

   app.use(passport.initialize());
   app.use(passport.session());
   passport.use(new LocalStrategy(User.authenticate()));
   passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  
   app.use((req,res,next)=>{
       res.locals.success = req.flash("success");
       res.locals.error = req.flash("error");
       res.locals.currUser = req.user;
       next();
   });


app.use("/",studetroute);

app.get("/students/:id/membership/form",async (req,res)=>{
    let meberstudent = await Student.findById(req.params.id);
    res.render("pages/membership",{meberstudent});
});


    
   app.post("/students/:id/membership", async (req, res) => {

  let student = await Student.findById(req.params.id);

  if (!student) {
    return res.send("Student not found");
  }

  const newMembership = new Membership(req.body.membership);

  await newMembership.save();

  student.Membership.push(newMembership._id);

  await student.save();

  // console.log(student);

  res.redirect(`/students/${student._id}`);

});

app.get("/membership/:id/payment",async(req,res)=>{

    let meberstudent = await Membership.findById(req.params.id);
 
    res.render("pages/payment.ejs",{meberstudent})
     
});

// ================= PAYMENT ROUTE FIX =================
app.post("/membership/:id", async (req, res) => {

  let membership = await Membership.findById(req.params.id);

  if (!membership) {
    return res.send("Membership not found");
  }

  // 🔥 Duplicate रोक
  if (membership.Payment) {
    req.flash("error", "Payment already done!");
    return res.redirect("/students");
  }

  try {
    const newpayment = new payment(req.body.payment);

    // ✅ Save payment first
    await newpayment.save();

    // ✅ Link with membership
    membership.Payment = newpayment._id;
    await membership.save();

    req.flash("success", "Payment added successfully!");
    res.redirect("/showpayment");

  } catch (err) {
    console.log(err);
    res.send("Error in payment");
  }
});

// dashbord
app.get("/dashbord", async (req, res) => {

  let activeStudents = await Student.countDocuments({ status: "Active" });

  let monthlyIncome = await payment.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" }
      }
    }
  ]);

  const today = new Date();
  const fiveDaysLater = new Date();
  fiveDaysLater.setDate(today.getDate() + 5);

  // 🔥 IMPORTANT FIX
  const students = await Student.find().populate("Membership");

  let expiringMemberships = [];
  let expiringCount = 0;

  for (let student of students) {
    if (student.Membership && student.Membership.endDate) {
      
      let end = new Date(student.Membership.endDate);

      if (end >= today && end <= fiveDaysLater) {
        expiringMemberships.push(student);
        expiringCount++;

        // ✅ MAIL SEND
        if (student.email) {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: "Membership Expiring Soon",
            html: `
              <h2>Hello ${student.fullName}</h2>
              <p>Your Gym Membership will expire soon.</p>
              <b>Renew soon!</b>
            `
          });
        }
      }
    }
  }

  const unpaidMemberships = await Membership.find({
    Payment: null
  });

  const unpaidCount = unpaidMemberships.length;

  res.render("pages/Dashbord", {
    activeStudents,
    monthlyIncome,
    expiringCount,
    expiringMemberships,
    unpaidCount,
    unpaidMemberships
  });

});

app.put("/students/status/:id", async (req, res) => {

let student = await Student.findById(req.params.id);

student.status = student.status === "Active" ? "Inactive" : "Active";

await student.save();

res.redirect("/students");

});

// app.get("/demouser",async(req,res)=>{
//     let owner = new User({
//         email:"Chhava.Fitness.Center.Visapur@gmail.com",
//        username:"CHHAVA3333",
//     });
//     let Registeruser = await User.register(owner,"helloworld");
//     res.send(Registeruser);
     
//  });

app.get("/login",(req,res)=>{
    
});

app.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", `Welcome back ${req.user.username}`);

    const redirectUrl = res.locals.redirectUrl || "/dashbord";
    res.redirect(redirectUrl);
  }
);
app.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
      if(err){
       return next(err);
      }
       req.flash("success","you are logged out");
      res.redirect("/");
    });
    });

// //  payment pag
// app.get("/showpayment", async (req,res)=>{

// const memberships = await Membership.find({
//     Payment: { $ne: null }   
// }).populate("Payment");

// console.log(memberships);   // 👈 add this

// ================= SHOW PAYMENT PAGE FIX =================
app.get("/showpayment", async (req, res) => {

  const memberships = await Membership.find()
    .populate("Payment")
    // .populate("student"); // optional

  res.render("pages/showppayment.ejs", { memberships });
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});

