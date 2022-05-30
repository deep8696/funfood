const mealsModel = require("../models/mealList.js");
const express = require('express');
const router = express.Router();

// http://localhost/
router.get("/", function(req, res) {

    mealsModel.find()
    .exec()
    .then((data) => {

        data= data.map(value => value.toObject());
        res.render("general/index", {
        
        });
    });    

    
});

module.exports = router;