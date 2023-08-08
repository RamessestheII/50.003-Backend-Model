const express = require("express");
const connectDB = require("./config/db");

const app = express();

//Connect Database
connectDB();

//Init Middleware (Bpdyparser)
app.use(express.json({extended: false}));

app.get("/", (req, res) => {
    res.send("API is running")
});

//Define Routes
// "/api/users" is now the root directory of users route in users.js
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server has now started in port ${PORT}`)
})