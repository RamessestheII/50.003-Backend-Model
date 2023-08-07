const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

const User = require("../../models/User")
//@route    Get request type
//@desc     Test route
//@access   Public (no auth token needed)
// want to use auth middleware? Add as 2nd param
// Makes the route protected
router.get("/", auth, async (req, res) => {
    try {
        //returns all User info except for password
        const user = await User.findById(req.user). select(
            "-password"
        );
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error")
    }
});


module.exports = router;
