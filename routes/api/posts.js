//prob not touching lawl
const express = require("express");
const router = express.Router();


//@route    Get request type
//@desc     Test route
//@access   Public (no auth token needed)
router.get("/", (req, res) => {
    res.send("Post route")
});


module.exports = router;
