import httpStatus from "http-status"
import { User } from "../models/user.model.js";
import bcrypt,{hash} from "bcrypt"
import crypto from "crypto"
import e from "express";
import { Meeting } from "../models/meeting.model.js";
const login=async(req,res)=>{
      let {username,password}=req.body;
      console.log(username);
      if(!username || !password){
        return res.status(400).json({message:"Please Sign Up First"});
      }
      
      try{
        const user=await  User.findOne({username});
         if(!user){
           return  res.status(httpStatus.NOT_FOUND).json({message:`User Not Found`});
         }
         let isPassword=await bcrypt.compare(password,user.password)
          if(isPassword){
            let token=crypto.randomBytes(20).toString("hex");
            user.token=token;
            await user.save();
             return res.status(httpStatus.OK).json({token :token});
            
          }else{
            return res.status(httpStatus.UNAUTHORIZED).json({message:"Invalid Username Or Password"})
          }
          
        
      }
      catch(e){
         return res.status(500).json({message:`error found ${e}`});
      }
      
}

const register=async(req,res)=>{
  let {name,username,password}=req.body;
  const existUser=await  User.findOne({username})
  try{
     if(existUser){
    return res.status(httpStatus.FOUND).json({message:`${name}, you already login`});
  }
  const handPassword=await bcrypt.hash(password,10);
  const newUser=new User({
    name:name,
    password:handPassword,
    username:username
  })

  await newUser.save();

  res.status(httpStatus.CREATED).json({message:`Welcome,${name}`})
  }
  catch(e){
      return res.status(500).json({message:`error found ${e}`})
  }
  
}
const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        const meetings = await Meeting.find({ user_id: user.username })
        res.json(meetings)
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token });

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        })

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" })
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}


export { login, register, getUserHistory, addToHistory }