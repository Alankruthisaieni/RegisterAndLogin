// const cookieParser =require('cookie-parser');
const express=require("express");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const multer = require('multer');
const uuidv4 = require('uuid');
const router=express.Router();
require("../db/conn");
const User=require("../models/userSchema");
const authenticate=require("../middleware/authenticate");
const cookieParser = require('cookie-parser');
router.use(cookieParser());
router.get('/',(req,res)=>{
  res.setHeader("Access-Control-Allow-Origin", "*")
res.setHeader("Access-Control-Allow-Credentials", "true");
res.setHeader("Access-Control-Max-Age", "1800");
res.setHeader("Access-Control-Allow-Headers", "content-type");
res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" ); 
  res.send("Hello World router");
});
//using promises
// router.post('/register',(req,res)=>{
//   const {name, gender ,Address,phone,email}=req.body;
//   if(!name|| !gender || !Address || !phone || !email){
//     return res.status(422).json({error:"Plz fill all the fields properly"});
//   }
//   User.findOne({email:email})
//   .then((userExist)=>{
//     if(userExist){
//       return res.status(422).json({error:"Email already exists!"});
//     }
//     const user=new User({name, gender ,Address,phone,email});
//     user.save().then(()=>{
//       res.status(201).json({message:"User registered successfully"});
//     }).catch((err)=>{
//       res.status(500).json({error:"Failed to register"});
//     })
//   })
//   .catch((err)=>{
//     console.log(err);
//   })

// })
const DIR = './public/uploads/';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname;
        cb(null, fileName)
    }
});
var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});
//using async and await
const addDetails=async (req,res)=>{
  console.log(req.body);
  const name=req.body.name;
  const gender=req.body.gender;
  const age=req.body.age;
  const address=req.body.address;
  const phone=req.body.phone;
  const email=req.body.email;
  const password=req.body.password;
  const profileImg=req.file.originalname;
  console.log("profileimg",profileImg);
  if(!name|| !gender|| !age || !address || !phone || !email|| !password|| !profileImg){
    console.log("Plz fill all the fields properly");
    return res.status(422).json({error:"Plz fill all the fields properly"});
  }
  try{
    const userExist=await User.findOne({email:email});
    if(userExist){
      return res.status(422).json({error:"Email already exists!"});
    }
    const user=new User({name, gender,age ,address,phone,email,password,profileImg});
    const save=await user.save();
    if(save){
      res.status(201).json({message:"User registered successfully"});
    }
    else{
      res.status(500).json({error:"Failed to register"});
    }
  }
  catch(err){
    console.log(err);
  }
};
router.post('/register', upload.single('profileImg'),addDetails);
//login route
router.post('/login',async(req,res)=>{
  try{
    const {email,password}=req.body;
    if(!email || !password){
      return res.status(400).json({"error":"Plz fill all the fields"});
    }
    const userLogin=await User.findOne({email:email});
    console.log(userLogin);
    if(userLogin){
      const isMatch=await bcrypt.compare(password,userLogin.password);
      // console.log(isMatch);
      
      if(isMatch){
        const token=await userLogin.generateAuthToken();
        console.log(token);
        res.cookie("jwt",token,{
          expires:new Date(Date.now()+25892000000),
          httpOnly:true
        });
         res.json ({"message":"user login succesfully"});
         
      }
      else{
         res.status(400).json({"error":"Invalid Credentials pass"});
      }
    }
    else{
      res.status(400).json ({"error":"Invalid Credentials user"});
    }

  }
  catch(err){
    console.log(err);
  }
})
// router.use(cookieParser());
router.get('/about',authenticate,(req,res)=>{
  
  res.send(req.rootUser);
});
router.get('/logout',(req,res)=>{
  console.log("My logout page");
  res.clearCookie('jwt',{path:'/'})
  res.status(200).send("user logout");
})
module.exports=router;