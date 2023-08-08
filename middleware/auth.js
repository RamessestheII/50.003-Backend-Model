const jwt = require("jsonwebtoken");
const config = require("config")

module.exports = function(req, res, next) {
    //Get token from header
    //When u send req to unprotected routes, need to send token with header
    //x-auth-token is the header key we wannna send in
    const token = req.header("x-auth-token"); 
    
    //check if no token:
    // if route is protected and using dis middleware, 401.
    if (!token) {return res.status(401).json({ msg: 'No token, authorization denied!' });
    }

    //If there is token, verify token
    try{
        //decode the token
        //2 params: token in header and secret from config
        const decoded = jwt.verify( token, config.get("jwtSecret"));
        //assign req.user the value of decoded user in header
        req.user = decoded.user;
        next();

    } catch(err) {
        //token but not valid
        res.status(401).json({
            msg: "Token is not valid!"});
    }


};