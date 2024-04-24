const mongoose = require('mongoose');
const Joi=require("joi");
const jwt=require("jsonwebtoken")

const CustomerSchema = new mongoose.Schema({
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
      isCustomer:{
          type:Boolean,
          default:true,
      
         },
    }, {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    });

  
//populate order That Belongs to this User when he/she get his/her Profile

CustomerSchema.virtual("orders",{
    ref: "Order",
    foreignField:"customer",
    localField: "_id"
})


    CustomerSchema.methods.generateAuthToken=function(){
        return jwt.sign({id: this._id,isCustomer: this.isCustomer},process.env.JWT_SECRET)
      }

  const Customer = mongoose.model('Customer', CustomerSchema);
  // validate Register Customer
function validateRegisterCustomer(obj){
    const schema = Joi.object({
        username: Joi.string().trim().min(4).max(32).required(),
        email: Joi.string().trim().min(4).max(32).required().email(), 
        password: Joi.string().trim().min(8).required(),
    });
    return schema.validate(obj);
}

// validate Login Customer
function validateLoginCustomer(obj){
    const schema = Joi.object({
        email: Joi.string().trim().min(4).max(32).required().email(), 
        password: Joi.string().trim().min(8).required(),
    });
    return schema.validate(obj);
}
// validate Update Customer
function validateUpdateCustomer(obj){
    const schema = Joi.object({
        username: Joi.string().trim().min(4).max(32),
        password: Joi.string().trim().min(8),
        
    });
    return schema.validate(obj);
}
  
  module.exports = {
    Customer,
    validateLoginCustomer,
    validateRegisterCustomer,
    validateUpdateCustomer
  };