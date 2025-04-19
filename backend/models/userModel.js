import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    minLength : [6, "Email must be at least 6 characters long"],
    maxLength : [50, "Email must be at most 50 characters long"]
  },

    password: {
        type : String,
        select: false
  }

});

userSchema.statics.hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

userSchema.methods.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAuthToken = async function () {
    return jwt.sign({email: this.email}, process.env.JWT_SECRET);
};

const user = mongoose.model("user", userSchema);
export default user;