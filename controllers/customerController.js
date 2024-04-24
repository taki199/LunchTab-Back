const asyncHandler= require("express-async-handler");
const {Customer,validateUpdateCustomer}=require("../models/Customer")
const bcrypt = require("bcryptjs");
const path=require("path");
const fs=require("fs");
const {cloudinaryUploadImage,cloudinaryRemoveImage, cloudinaryRemoveMultipleImage}=require('../utils/cloudinary');


/**------------------------------------------
 *
 *   @desc    Get all customers Profile
 *   @route   get /api/customers/profile
 *   @method Get
 *   @access private (only admin)
----------------------------------------- */
module.exports.getAllCustomersCtrl = asyncHandler(async (req, res) => {
    const customers = await Customer.find({ IsDeleted: false }).select("-password");
    if (customers.length === 0) {
        return res.status(404).json({ success: false, msg: "No active users found" });
    }
    
    res.status(200).json({ success: true, data: customers });
});

/**------------------------------------------
 *
 *   @desc    Get  customer Profile
 *   @route   Get /api/customers/profile/:id
 *   @method Get
 *   @access private 
----------------------------------------- */
module.exports.getCustomerProfileCtrl = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id).select("-password");
    if (!customer || customer.IsDeleted) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: customer });
});
/**------------------------------------------
 *
 *   @desc    Get  customer Profile
 *   @route   Get /api/customers/profile/me
 *   @method Get
 *   @access private 
----------------------------------------- */


module.exports.getMyProfile = asyncHandler(async (req, res) => {
    try {
        const customerId = req.user.id;
        
        // Query the database for the user profile
        const customer = await Customer.findById(customerId).select('-password');

        // Check if user exists and is not soft deleted
        if (!customer || customer.IsDeleted) {
            return res.status(404).json({ success: false, message: 'Your account is deactivated or inaccessible. Please contact support for assistance.' });
        }

        // Send the user data in the response
        res.status(200).json({ success: true, data: customer });
    } catch (error) {
        // Handle any errors
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
    }
});


/**------------------------------------------
 *
 *   @desc    Update customer Profile 
 *   @route   /api/customers/profile/:id
 *   @method Put
 *   @access private(only user himself) 
----------------------------------------- */ 

module.exports.updateCustomerProfileCtrl = asyncHandler(async (req, res) => {
    // Check if at least one field (username, password, or email) is provided
    if (!req.body.username && !req.body.password && !req.body.email) {
        return res.status(400).json({ success: false, message: 'At least one of the following fields is required: username, password, email' });
    }

    const { error } = validateUpdateCustomer(req.body);
   
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Check if password is provided and hash it if necessary
    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    // Check if the user exists and is not deleted
    const existingUser = await Customer.findOne({ _id: req.params.id, IsDeleted: false });
    if (!existingUser) {
        return res.status(404).json({ success: false, message: 'User not found or deleted' });
    }

    // Construct the update object based on the fields provided
    const updateFields = {};
    if (req.body.username) {
        updateFields.username = req.body.username;
    }
    if (req.body.password) {
        updateFields.password = req.body.password;
    }
    if (req.body.email) {
        updateFields.email = req.body.email;
    }

    // Update the customer profile
    const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true }).select('-password');

    // Check if the update operation was successful
    if (!updatedCustomer) {
        return res.status(500).json({ success: false, message: 'Failed to update user profile' });
    }

    // Send the updated user profile in the response
    res.status(200).json({ success: true, data: updatedCustomer });
});

/**------------------------------------------
 *
 *   @desc    Get  customers count
 *   @route   POST /api/customers/count
 *   @method Get
 *   @access private (only admin)
----------------------------------------- */

module.exports.getCustomerCountCtrl=asyncHandler(async(req,res)=>{
    const count=await Customer.countDocuments();
    res.status(200).json(count);

});

/**------------------------------------------
 *
 *   @desc    Profile photo Upload
 *   @route   POST /api/customers/profile-photo-upload
 *   @method post
 *   @access private (only logged in user)
----------------------------------------- */

module.exports.profilePhotoUploaderCtrl=asyncHandler(async(req,res)=>{
    if(!req.file){
        return res.status(400).json({message:'no file provided'})
    }
    //get the path to the image
    const imagePath=path.join(__dirname,`../images/${req.file.filename}`)
    
    //upload to cloudinary 
    const result=await cloudinaryUploadImage(imagePath);
    //get the user from Db
    
    const customer =await Customer.findById(req.user.id);
    

   

    //delete the old profile photo if exist
    if(customer.profilePhoto.publicId!==null){
     await cloudinaryRemoveImage(customer.profilePhoto.publicId);
    }

    //change the profile photo filed in the db 
    customer.profilePhoto={
        url:result.secure_url,
        publicId:result.public_id
    }

    await customer.save();

    res.status(200).json({message:"your profile photo uploaded successfully",
    profilePhoto:{url:result.secure_url,publicId:result.public_id}
});
   //remove image from the server

   fs.unlinkSync(imagePath);



})

/**------------------------------------------
 *
 *   @desc    Delete customer Profile(account)
 *   @route   POST /api/customers/profile/:id
 *   @method Delete
 *   @access private (only admin or user himself)
----------------------------------------- */

module.exports.deleteCustomerProfileCtrl = asyncHandler(async (req, res) => {
    // Get customer from DB
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
        return res.status(404).json({ message: 'No user found' });
    }

    // Set IsDeleted to true
    customer.IsDeleted = true;
    
    // Save the updated customer document
    await customer.save();

    // Send a response to the client
    res.status(200).json({ message: 'The account has been soft deleted!' });
});
