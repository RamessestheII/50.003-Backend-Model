const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
//Handle validation and response
const {check, validationResult}  = require("express-validator");

const User = require("../../models/User")
//@route    Get request type
//@desc     Test route
//@access   Public (no auth token needed)
// want to use auth middleware? Add as 2nd param
// Makes the route protected
router.get("/", auth, async (req, res) => {
    console.log("Auth middleware reached");

    try {
        //returns all User info except for password
        console.log("1");
        const user = await User.findById(req.user.id). select("-password");
        console.log("2");
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error Auth")
    }
});








//@route    POST request type
//@desc     Authenticate user and get token
//@access   Public (no auth token needed)
router.post("/", [
    //VALIDATION for login
    check("email", "PLease inclde a valid email").isEmail(),
    check(
        "password",
        "Password is required"
        ).exists()
],
async (req, res) => {
    //If any of the validations fail/dont match, handle it like this:
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //if there are errors:
        return res.status(400).json({
            errors: errors.array()});
    }

    const {email, password} = req.body;

    //Make query too Mongo
    try{
        //See if user exists
        //If they alr exist, raise error since multi email not allowed
        let user = await User.findOne({email});
        
        //ALER WARNING DEBUG
        if (!user) {
            return res.status(400).json({
                errors: [{
                    msg: "Invalid credentials!"
                }]
            });
        }

        //compare password with hashed one
        const isMatch = await bcrypt.compare(password, user.password);

        // if no password matches:
        if (!isMatch) {
            return res
            .status(400)
            .json({ errors: [{ msg: 'Invalid Credentials' }] });
        }


        //Return jsonwebtoken
        //getpayload which includes UserID
        //MongoDB auto ID:
        const payload = {user: {id: user.id}};


        //sign the token, pass in payload, secret, exp
        jwt.sign(
            payload,
            config.get('jwtSecret'),
            {expiresIn: 360000},
            (err, token) => {
              if (err) throw err;
              //can also send back user ID if wan...
              res.json({ token });
            });

        
    } catch(err) {
        // Prob server error
        console.error(err.message);
        res.status(500).send('Server error');
    }
    
});




module.exports = router;
