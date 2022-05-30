const mealsModel = require("../models/mealList.js");
const userModel = require("../models/userList");
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const path = require("path");
const express = require("express");
const router = express.Router();


router.post("/mealKit", function(req, res) {
    const mealId = req.body;
    mealsModel.findOne({
        _id: req.body.mealId                          
    })
    .then((data) => {   
        data= [data].map(value => value.toObject());     
        res.render("menu/mealKit", {
            data,          
        });
    }); 
      
});






//shopping cart



//prepare model

const cartViewModel = function(req, message){
    if (req.session && req.session.user){
        var cart = req.session.cart || [];
        var cartTotal = 0;

        const hasMeals = cart.length > 0;

        if (hasMeals){
            cart.forEach(cartMeal =>{
                cartTotal += cartMeal.meal.price * cartMeal.qty;

            });
        }

        return{
            hasMeals,
            meals: cart,
            cartTotal: "$" + cartTotal.toFixed(2),
            message: message
        };
    }
    else{
        return{
            hasMeals: false,
            meals: [],
            cartTotal: "$0.00",
            message: message
        }
    }
}

router.get("/order", (req, res) => {
    res.render("menu/order", cartViewModel(req));
});

var findMeal = function(_id, req){
   return mealsModel.findOne(_id)
     .then((meal) => { 
       return meal= [meal].map(value => value.toObject());        
        }); 
   };
   
   
   

router.post("/add-cart", (req, res) =>{       
    

    var message;

    const mealId = req.body._id;

    if (req.session.user){
        var meal = findMeal(mealId);    
      var cart = req.session.cart = req.session.cart || [];
    
      if(meal){
       
        var found = false;

        cart.forEach(cartMeal =>{
            if (cartMeal._id == mealId){
                found = true;
                cartMeal.qty++;
            }
        });
        if (found) {
            message = "Meal is already in the cart, quantity incremented by one.";
        }
        else{
            cart.push({
                _id: mealId,
                qty:1,
                meal
            });
            message = " Meal is added to cart.";
         }
    }
    else{
        message = "Meal not found.";
    }
    }
    else{
        message = "Please login to order.";
    }
    res.render("menu/order", cartViewModel(req, message));
});


//place order

router.post("/place-order", (req, res) =>{
    res.render("user/customer", {
        message :"your order has been made successfully"         
    });

    /*
    var message;

    if (req.session.user) {
        var cart = req.session.cart || [];

        if (cart.length > 0) {
            userModel.findOne({
                email: req.session.user._id                          
            })
            .then(email =>{
               

                const sgMail = require("@sendgrid/mail");
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
                const msg = {
                    to: email,
                    from: 'drpatel33@myseneca.ca',
                    subject: 'Welcome to FunFood',
                    html:
                        `
                         
                         Email Address: ${email}<br>
    
                         <h3>Thank you for shopping with FunFood</h3><br>
                         
                         You have successfully placed order ,<br>
                         Stay connected and enjoy delicious dishes!!<br>
                         <h3>Deep Patel<br>
                         FunFood</h3>
                         
                        `
                };
        
    
                sgMail.send(msg)
                    .then(() => {                
    
                        res.render("user/customer", {                
                                        message :"Your order has been placed please check email"
                            });
                    })
                    .catch(err => {
                        console.log(`Error ${err}`);                  
                        
                    });                
                
                
    
                req.session.cart = [];

            });
            
        }
        else {
            
            message = "You cannot check-out, there are no items in the cart.";
        }
    }
    else {
        
        message = "You must be logged in.";
    }
    
   
*/
})





// http://localorhost/menu/list
router.get("/menuList", function(req, res) {
    mealsModel.find()
    .exec()
    .then((data) => {
        data= data.map(value => value.toObject());
        res.render("menu/menuList", {
            data,        
            //categories: mealModel.getMeals()
        });
    });    
});

//add new meal kit

router.post("/addNew", (req, res) =>{
 let newMeal = new mealsModel({
    name: req.body.name,
    price: req.body.price,
    currency: req.body.currency,
    ingredients: req.body.ingredients,
    description: req.body.description,
    category: req.body.category,
    cookingTime: req.body.cookingTime,
    calories: req.body.calories,
    cover: req.body.cover,
    topMeal: req.body.topMeal
 });

 newMeal.save()
 .then((mealSaved) => {
    
     console.log(`Meal ${mealSaved.name} has been added to the database.`);
    
     
     let uniqueName = `meal-pic-${mealSaved._id}${path.parse(req.files.cover.name).ext}`;
     
     req.files.cover.mv(`static/img/menu/${uniqueName}`)
     .then(() => {
         
         mealsModel.updateOne({
             _id: mealSaved._id
         }, {
             cover: uniqueName
         })
         .then(() => {                
             console.log("Meal picture updated .");
             res.redirect("/user/clerk");
         })
         .catch(err => {
             console.log(`Error updating the picture ... ${err}`);
             res.redirect("/user/clerk");
         })
     });
 })
 .catch((err) => {
     console.log(`Error adding meal to the database ... ${err}`);
     res.redirect("/user/clerk");
 });           

});





router.post("/updateMeal", (req, res) => {
    //delete mealkit
   if (req.body.name.trim().length === 0) {
        // Remove the document from the collection.
        mealsModel.deleteOne({
            mealId: req.body.mealId
        })
        .exec()
        .then(() => {
            console.log("Successfully removed the meal for " + req.body.mealId);
            res.redirect("/user/clerk");
        });
    }

    else {
        // Update the mealkit in the collection.
        mealsModel.updateOne({
            mealId: req.body.mealId
        }, {
            $set: {
                name: req.body.name,
                price: req.body.price,
                currency: req.body.currency,
                ingredients: req.body.ingredients,
                description: req.body.description,
                category: req.body.category,
                cookingTime: req.body.cookingTime,
                calories: req.body.calories,
                cover: req.body.cover,
                topMeal: req.body.topMeal             
            }
        })
        .exec()
        .then(() => {
            console.log("Successfully updated the name for " + req.body.mealId);
            res.redirect("/user/clerk");
        });
    }

});


module.exports = router;