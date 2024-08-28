const asyncHandler = require("express-async-handler");
const { Category, validateCreateCategory, validateUpdateCategory } = require("../models/Category");
const path = require('path');
const fs = require("fs");
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require('../utils/cloudinary');
const { Dish } = require('../models/Dish');
/**------------------------------------------
 *
 *   @desc    Create New category
 *   @route    /api/categories
 *   @method Post
 *   @access Private (only admin)
----------------------------------------- */


module.exports.createCategoryCtrl = asyncHandler(async (req, res) => {
    const { error } = validateCreateCategory(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    let categoryImage = null;

    if (req.file) {
        const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
        const result = await cloudinaryUploadImage(imagePath);
        categoryImage = {
            url: result.secure_url,
            publicId: result.public_id
        };
    }

    const category = await Category.create({
        name: req.body.name,
        image: categoryImage,
        description: req.body.description
    });

    res.status(201).json(category);
});




/**------------------------------------------
 *
 *   @desc    get all categories
 *   @route    /api/categories
 *   @method get
 *   @access public 
----------------------------------------- */

module.exports.getAllCategoriesCtrl = asyncHandler(async (req, res) => {
    const categories = await Category.find({ IsDeleted: false });
    res.status(200).json(categories);
});
 
/**------------------------------------------
 *
 *   @desc   delete category
 *   @route    /api/categories/:id
 *   @method Delete
 *   @access private (only admin)
----------------------------------------- */

module.exports.deleteCategoriesCtrl = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }

    await Category.findByIdAndDelete(req.params.id);

    if (category.image && category.image.publicId) {
        await cloudinaryRemoveImage(category.image.publicId);
    }

    res.status(200).json({ message: 'Category has been deleted successfully', categoryId: category._id });
});


 /**------------------------------------------
 *
 *   @desc   update category
 *   @route    /api/categories/:id
 *   @method put
 *   @access private (only admin)
----------------------------------------- */
module.exports.updateCategoryCtrl = asyncHandler(async (req, res) => {
    const { error } = validateUpdateCategory(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    let category = await Category.findById(req.params.id);
    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }

    if (req.body.name) category.name = req.body.name;
    if (req.body.description) category.description = req.body.description;

    if (req.file) {
        if (category.image && category.image.publicId) {
            await cloudinaryRemoveImage(category.image.publicId);
        }
        const result = await cloudinaryUploadImage(req.file.path);
        category.image = {
            url: result.secure_url,
            publicId: result.public_id
        };
    }

    const updatedCategory = await category.save();

    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            }
        });
    }

    res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });
});




/**------------------------------------------
 *  //api/categories/catId/dishes
 *   @desc  get dishes of a category
 *   @route    /api/categories/:categoryId/dishes
 *   @method get
 *   @access public 
----------------------------------------- */

module.exports.getDishesByCategoryCtrl = asyncHandler(async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        if (!categoryId) {
            return res.status(400).json({ message: 'Category ID is required' });
        }

        const dishes = await Dish.find({ category: categoryId });

        res.status(200).json(dishes);
    } catch (error) {
        console.error('Error fetching dishes by category:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
/**------------------------------------------
 *  
 *   @desc  get single category
 *   @route    /api/categories/:categoryId
 *   @method get
 *   @access public 
----------------------------------------- */

module.exports.getSingleCategoryCtrl = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(category);
});