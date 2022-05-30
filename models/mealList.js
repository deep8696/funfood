
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//define model
const mealSchema = new Schema({
        
    "name": {
        "type" : String,
        "required": true,
        "unique": true
    },
    "price": {
        "type" : String,
        "required": true,
    },
    "currency": {
        "type" : String,
        "required": true,
    },
    "ingredients": {
        "type" : String,
        "required": true,
    },
    "description": {
        "type" : String,
        "required": true,
    },
    "cover": {
        "type" : String,        
    },
    "category": {
        "type" : String,
        "required": true,
    },
    "cookingTime": {
        "type" : String,
        "required": true,
    },
    "calories": {
        "type" : String,
        "required": true,
    },
    "topMeal": {
        "type" : String,
        "required": true,
    }

});


const mealsModel = mongoose.model("meals", mealSchema);
module.exports = mealsModel;



/*
//return categorized meals
let categories = [];

for (i = 0; i < meals.length; i++) {
    let currentMeals = meals[i];
    let categoryName = currentMeals.category;

    let category = categories.find(c => c.category == categoryName);

    if (!category) {
        category = {
            category: categoryName,
            items: []
        };

        categories.push(category);
    }
    category.items.push(currentMeals);
}

module.exports.getMeals = function() {
    return categories;
};

 //filter top meals
 module.exports.getTopMeals = function() {
   return meals.filter((meal) => meal.topMeal);
}*/