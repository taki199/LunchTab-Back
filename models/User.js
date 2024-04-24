const mongoose = require('mongoose');
const Joi=require("joi");
const jwt=require("jsonwebtoken")

// Schema for Users collection
const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 4,
      maxlength: 32,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      maxlength: 32,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    profilePhoto: {
      type: Object,
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
        publicId: null,
      },
    },
    IsDeleted: {
      type: Boolean,
      default: false,
    },
    isAdmin:{
        type:Boolean,
        default:true,
    
       },
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  });
  
 
  

// Generate Auth Token 

UserSchema.methods.generateAuthToken=function(){
    return jwt.sign({id: this._id,isAdmin: this.isAdmin},process.env.JWT_SECRET)
  }
  


const User = mongoose.model('User', UserSchema);

// validate Register User
function validateRegisterUser(obj){
    const schema = Joi.object({
        username: Joi.string().trim().min(4).max(32).required(),
        email: Joi.string().trim().min(4).max(32).required().email(), 
        password: Joi.string().trim().min(8).required(),
    });
    return schema.validate(obj);
}

// validate Login User
function validateLoginUser(obj){
    const schema = Joi.object({
        email: Joi.string().trim().min(4).max(32).required().email(), 
        password: Joi.string().trim().min(8).required(),
    });
    return schema.validate(obj);
}
// validate Update user
function validateUpdateUser(obj){
    const schema = Joi.object({
        username: Joi.string().trim().min(4).max(32),
        password: Joi.string().trim().min(8),
        email: Joi.string().trim().email()
        
    });
    return schema.validate(obj);
}


module.exports = {User,validateLoginUser,validateRegisterUser,validateUpdateUser};
