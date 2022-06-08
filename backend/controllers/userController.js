const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body

    if(!name || !email || !password || !role){
        res.status(400)
        throw new Error('Please add all fields')
    }

    // Check if user exists
    const userExists = await User.findOne({email})
        
    if(userExists){
        res.status(400)
        throw new Error('User already exists')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
    })

    if(user){
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        })
    }
    else{
        res.status(400)
        throw new Error('Invalid user data')
    }

    res.json({ message: 'Register User' })
})

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    // Check for user email
    const user = await User.findOne({email})

    if(user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        })
    } else{
        res.status(400)
        throw new Error('Invalid credentials')
    }
})
// @desc    Get users data
// @route   GET /api/users
// @access  Private
const getAllUser = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin' && req.user.status === 'active'){
        res.status(400)
        throw new Error('need to be admin')
    }
    const users = await User.find()
    res.status(200).json(users)
})
// @desc    udpate user data
// @route   PUT /api/users/:id
// @access  Private
const UpdateUserAdmin = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin' && req.user.status === 'active'){
        res.status(400)
        throw new Error('need to be admin')
    }
    const userExists = await User.findById(req.params.id)
    if(!userExists){
        res.status(400)
        throw new Error('User not exists')
    }
    if(!req.body.status){
        res.status(400)
        throw new Error('please enter field')
    }
    const updatedItem = await User.findByIdAndUpdate(req.params.id, {status: req.body.status}, {
        new: true,
      });
    res.status(200).json(updatedItem)
})

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    //const {_id, name, email} = await User.findById(req.user)
    res.status(200).json(req.user)
})

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    })
}

module.exports = {
    registerUser,
    loginUser,
    getMe,
    getAllUser,
    UpdateUserAdmin,
}