const asyncHandler= require("express-async-handler");
const {dish,validateCreateDish,validateUpdateDish}=require('../models/Dish');
const {Customer}=require('../models/Customer')
const path=require("path");
const fs=require("fs");
const {cloudinaryUploadImage,cloudinaryRemoveImage, cloudinaryRemoveMultipleImage}=require('../utils/cloudinary');

/**------------------------------------------
 *
 *   @desc    Get all dishes 
 *   @route   POST /api/dishes
 *   @method Get
 *   @access public 
----------------------------------------- */

module.exports.getAllDishesCtrl = asyncHandler(async (req, res) => {
    const dishes = await dish.find({ IsDeleted: false }).populate('category', 'name');

    if (dishes.length === 0) {
        return res.status(404).json({ success: false, msg: "No dishes  found" });
    }
    
    res.status(200).json({ success: true, data: dishes });
});

/**------------------------------------------
 *
 *   @desc    Get  single Dish
 *   @route   Get /api/dishes/:id
 *   @method Get
 *   @access public 
----------------------------------------- */


module.exports.getSingleDishCtrl = asyncHandler(async (req, res) => {
    const dish = await dish.findById(req.params.id).populate("Customer",["-password"])
    if (!dish || dish.IsDeleted) {
        return res.status(404).json({ success: false, message: "this dish doesnt exist" });
    }

    res.status(200).json({ success: true, data: user });
});

/**------------------------------------------
 *
 *   @desc    Create New Dish
 *   @route    /api/dishes
 *   @method Post
 *   @access Private (only admin)
----------------------------------------- */

module.exports.createDishCtrl = asyncHandler(async (req, res) => {

    // Validate the request body
    const { error } = validateCreateDish(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    let dishImage = null;

    // Check if an image is provided in the request body
    if (req.file) {
        // Get the path to the uploaded image
        const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

        // Upload the image to Cloudinary
        const result = await cloudinaryUploadImage(imagePath);

        // Set the dish image properties
        dishImage = {
            url: result.secure_url,
            publicId: result.public_id
        };
    }

    // Create the dish
    const Dish = new dish({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: dishImage, // Assign the dish image
        stock: req.body.stock,
        tags: req.body.tags,
        ingredients: req.body.ingredients,
        ratings: req.body.ratings,
        availabilitySchedule: req.body.availabilitySchedule,
        relatedDishes: req.body.relatedDishes,
    });

    // Save the dish to the database
    await Dish.save();

    // Remove the old image from Cloudinary (if it exists)
    

    // Delete the image from the server
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            }
        });
    }

    // Return the created dish in the response
    res.status(201).json(Dish);
});

 /**------------------------------------------
 *
 *   @desc   update Dish
 *   @route    /api/dishes/:id
 *   @method put
 *   @access private (only admin)
----------------------------------------- */
module.exports.updateDishCtrl = asyncHandler(async (req, res) => {
    // Validate the request body for updating a dish
    const { error } = validateUpdateDish(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        // Find the dish by ID
        let Dish = await dish.findById(req.params.id);
        if (!dish) {
            return res.status(404).json({ message: 'Dish not found' });
        }

        // Extract fields from the request body
        const { name, description, price, category, stock, tags, ingredients, ratings, availabilitySchedule, relatedDishes } = req.body;

        // Update only the provided fields
        if (name) Dish.name = name;
        if (description) Dish.description = description;
        if (price) Dish.price = price;
        if (category) Dish.category = category;
        if (stock) Dish.stock = stock;
        if (tags) Dish.tags = tags;
        if (ingredients) Dish.ingredients = ingredients;
        if (ratings) Dish.ratings = ratings;
        if (availabilitySchedule) Dish.availabilitySchedule = availabilitySchedule;
        if (relatedDishes) Dish.relatedDishes = relatedDishes;

        // Check if a new image is provided
        if (req.file) {
            // Remove the old image from Cloudinary if it exists
            if (Dish.image && Dish.image.publicId) {
                await cloudinaryRemoveImage(Dish.image.publicId);
            }
            // Upload the new image to Cloudinary
            const result = await cloudinaryUploadImage(req.file.path);

            // Update the dish's image information
            Dish.image = {
                url: result.secure_url,
                publicId: result.public_id
            };
        }

        // Save the updated dish
        const updatedDish = await Dish.save();

        // Delete the image from the server
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            }
        });
    }

        // Return success message and the updated dish
        res.status(200).json({ message: 'Dish updated successfully', Dish: updatedDish });
    } catch (err) {
        console.error('Error updating dish:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**------------------------------------------
 *
 *   @desc   delete dish
 *   @route    /api/dishes/:id
 *   @method Delete
 *   @access private (only admin)
----------------------------------------- */

module.exports.deleteDishCtrl = asyncHandler(async (req, res) => {
    // Find the category by ID
    const Dish = await dish.findById(req.params.id);

    // Check if the category exists
    if (!Dish) {
        return res.status(404).json({ message: 'Dish not found' });
    }

    // Remove the category from the database
    await dish.findByIdAndDelete(req.params.id);

    // Check if the category has an image associated with it
    if (Dish.image && Dish.image.publicId) {
        // Remove the image from Cloudinary
        await cloudinaryRemoveImage(Dish.image.publicId);
    }

    // Return success message
    res.status(200).json({ message: 'Dish has been deleted successfully', DishId: Dish._id });
});

/**------------------------------------------
 *
 *   @desc   find  dish by id
 *   @route    /api/dishes/:id
 *   @method get
 *   @access public 
----------------------------------------- */

module.exports.getDishByIdCtrl = asyncHandler(async (req, res) => {
    const Dish = await dish.findById(req.params.id).populate('category');

    // Check if the dish exists
    if (!Dish) {
        return next([{ msg: "Dish not found" }]);
    }

    // Return the dish object
    res.status(200).json(Dish);
});




