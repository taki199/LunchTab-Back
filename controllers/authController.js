const asyncHandler= require("express-async-handler");
const bcrypt = require("bcryptjs");
const {User,validateRegisterUser, validateLoginUser}=require("../models/User");
const {Customer,validateLoginCustomer, validateRegisterCustomer}=require("../models/Customer");



/**------------------------------------------
 *
 * @desc    Register a new user
 *  @route   POST /api/auth/register/admin
 * @method Post
 * @access public
 * 
----------------------------------------- */
module.exports.registerUserCtrl=asyncHandler(async(req,res)=>{
   const {error}=validateRegisterUser(req.body)
   if (error) return res.status(400).json({message: error.details[0].message})
   let user=await User.findOne({email: req.body.email});
   if (user){
    return res.status(400).json({message:'Email already in use'});
   }

   const salt=await bcrypt.genSalt(10);
   const hashedPassword = await  bcrypt.hash(req.body.password,salt)

   user = new User({
    username:req.body.username,
    email:req.body.email,
    password:hashedPassword,
   });

   await user.save();
    // @TODO---- sending email (verify account if not verified )

   res.status(201).json({message:"User created successfully" , data :{...user._doc}})
});

/**------------------------------------------
 *
 * @desc    Login  user
 *  @route   POST /api/auth/login/admin
 * @method Post
 * @access public
 * 
----------------------------------------- */

module.exports.loginUserCtrl=asyncHandler(async(req,res)=>{
    const {error}=validateLoginUser(req.body)
   if (error) return res.status(400).json({message: error.details[0].message})
   let user=await User.findOne({email: req.body.email});
   if (!user){
   return  res.status(400).json({message:'Invalid credentials'})
   }

   const isPasswordMatch =await bcrypt.compare(req.body.password, user.password)
   if (!isPasswordMatch){
    return  res.status(400).json({message:'Invalid credentials'})
    }

    // @TODO---- sending email (verify account if not verified )

   const token=user.generateAuthToken();

   res.status(200).json({
    _id:user._id,
    isAdmin:user.isAdmin,
    profilePhoto:user.profilePhoto,
    token,
    username:user.username,
   })
    

});


/**------------------------------------------
 *
 * @desc    Register a new Customer
 * @route   POST /api/auth/register
 * @method  POST
 * @access  public
 * 
----------------------------------------- */
module.exports.registerCustomerCtrl = asyncHandler(async (req, res) => {
   // Validate the request body
   const { error } = validateRegisterCustomer(req.body);
   if (error) {
       return res.status(400).json({ message: error.details[0].message });
   }

   try {
       // Check if the email is already in use
       let customer = await Customer.findOne({ email: req.body.email });
       if (customer) {
           return res.status(400).json({ message: 'Email already in use' });
       }

       // Hash the password
       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash(req.body.password, salt);

       // Create and save the new customer
       customer = new Customer({
           username: req.body.username,
           email: req.body.email,
           password: hashedPassword,
       });
       await customer.save();

       // @TODO: Send verification email if necessary

       // Return success response
       res.status(201).json({ message: "User created successfully", data: { ...customer._doc } });
   } catch (error) {
       console.error('Error registering customer:', error);
       res.status(500).json({ message: 'Internal Server Error' });
   }
});


/**------------------------------------------
*
* @desc    Login user
* @route   POST /api/auth/login/customer
* @method  POST
* @access  public
* 
----------------------------------------- */
module.exports.loginCustomerCtrl = asyncHandler(async (req, res) => {
   // Validate the request body
   const { error } = validateLoginCustomer(req.body);
   if (error) {
       return res.status(400).json({ message: error.details[0].message });
   }

   try {
       // Check if the user exists
       let customer = await Customer.findOne({ email: req.body.email });
       if (!customer) {
           return res.status(400).json({ message: 'Invalid credentials' });
       }

       // Verify the password
       const isPasswordMatch = await bcrypt.compare(req.body.password, customer.password);
       if (!isPasswordMatch) {
           return res.status(400).json({ message: 'Invalid credentials' });
       }

       // @TODO: Send verification email if necessary

       // Generate authentication token
       const token = customer.generateAuthToken();

       // Return user data and token
       res.status(200).json({
           _id: customer._id,
           isCustomer: customer.isCustomer,
           profilePhoto: customer.profilePhoto,
           token,
           username: customer.username,
       });
   } catch (error) {
       console.error('Error logging in customer:', error);
       res.status(500).json({ message: 'Internal Server Error' });
   }
});
