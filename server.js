const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("API is running")
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server has now started in port ${PORT}`)
})