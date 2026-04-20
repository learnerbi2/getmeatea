import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email:{type:String, required:true},
  name:{type:String},
  username:{type:String, required:true},
  profilepic:{type:String},
  coverpic:{type:String},
  createdAt:{type:Date, default:Date.now},
  updatedAt:{type:Date, default:Date.now},
  // razorpayid:{type:String},
  // razorpaysecret:{type:String},
  done:{type:Boolean, default:false}
})

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;