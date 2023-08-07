const express = require("express");
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
//Handle validation and response
const {check, validationResult}  = require("express-validator");
//const normalize = require('normalize-url');

const User = require("../../models/User");


//@route    POST request type
//@desc     Register user
//@access   Public (no auth token needed)
router.post("/", [
    //VALIDATION
    //run name checking function with custom msg for it to not be empty
    check("name", "Name is required").not().isEmpty(),
    check("email", "PLease inclde a valid email").isEmail(),
    check(
        "password",
        "Please enter a password with 6 or characters"
        ).isLength({min: 6})
],
async (req, res) => {
    //If any of the validations fail/dont match, handle it like this:
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //if there are errors:
        return res.status(400).json({
            errors: errors.array()});
    }

    const {name, email, password} = req.body;

    //Make query too Mongo
    try{
        //See if user exists
        //If they alr exist, raise error since multi email not allowed
        let user = await User.findOne({email});

        if (user) {
            return res.status(400).json({
                errors: [{
                    msg: "User already exists!"
                }]
            });
        }
        //Get users Gravatar
        const avatar = gravatar.url(       
            //pass user email and get back gravatar url
            gravatar.url(email, {
                //default size, PG rating
                s: '200',
                r: 'pg',
                d: 'mm'
                //default image
            }),
            { forceHttps: true }
        );

        //create new User
        user = new User({
            name,
            email,
            avatar,
            password
        });
        

        //hash the password
        //Encrypt with bcrypt, higher no. more secure
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        
        //returns a promise so need await!!
        //save user in database
        await user.save();


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
            }
          );

        
    } catch(err) {
        // Prob server error
        console.error(err.message);
        res.status(500).send('Server error');
    }
    
});






module.exports = router;
