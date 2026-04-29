import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email:{type:String, required:true},
  name:{type:String},
  username:{type:String, required:true},
  password:    { type: String, default: "" },
  profilepic:{type:String},
  coverpic:{type:String},
  creatorType:{type:String},
  createdAt:{type:Date, default:Date.now},
  updatedAt:{type:Date, default:Date.now},
  role: { type: String, enum: ["creator", "fan"], default: "fan" },
  done:{type:Boolean, default:false}
})

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;