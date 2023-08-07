const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

//async await cleaner
const connectDB = async () => {
    try {
        //returns a promise, so need await before it:
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            //useCreateIndex: true
        });

        console.log("MongoDB connected...");
    } catch (err) { 
        //if sth goes wrong
        console.error(err.message);
        //escape from the process with failure
        process.exit(1);

        
    }
}

module.exports = connectDB;
