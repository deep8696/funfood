const mealsModel = require("../models/mealList.js");
const userModel = require("../models/userList");
const bcrypt = require("bcryptjs");
const path = require("path");
const express = require("express");
const router = express.Router();

//set clerk page only when login session active
router.get("/clerk", (req, res) => {
    if(req.session.isClerk){

    mealsModel.find()
    .exec()
    .then((data) => {
        data= data.map(value => value.toObject());
        res.render("user/clerk",{
            data,
            }); 
        });               
    }    
    else {
        req.session.destroy();
        res.redirect("/user/signIn");
    }
});

//Note: I have changed some logic 
//set customer page only when login session active
router.get("/customer", (req, res) => {
    if(!req.session.isClerk){
        res.render("user/customer");
    }
    else{
        req.session.destroy();
        res.redirect("/user/signIn");
    }
});

// Set up a registration page
router.get("/signUp", (req, res) => {
    req.session.destroy();
    res.render("user/signUp");
});

//signIn form for validation
router.post("/signUp", (req, res) => {

    console.log(req.body);

    const {firstName , lastName, email , password} = req.body;

    let flag = true;
    
    let emailFormat = /^\S+@\S+\.\S+$/; //regular expression for email
    let passFormat = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*]).{8,14}$/; //password 


    //check for firstName 
    if (typeof firstName !== 'string' || firstName.trim().length === 0) {
        flag = false;
        res.render("user/signUp", {
            values: req.body,
            emptyF : "First name should not be empty"        
        }); 
    }
//check length for first name
    else if (typeof firstName !== 'string' || firstName.trim().length < 2) {
        flag = false;
        res.render("user/signUp", {
            values: req.body,
            shortF : "First name must have 2 or more than 2 characters.."        
        }); 
    }

     //check for lastName 
    else if (typeof lastName !== 'string' || lastName.trim().length === 0) {
        flag = false;
        res.render("user/signUp", {
            values: req.body,
            emptyL : "Last name should not be empty"        
        }); 
    }

    else if (typeof lastName !== 'string' || lastName.trim().length < 2) {
        flag = false;
        res.render("user/signUp", {
            values: req.body,
            shortL : "Last name must have more than 2 characters.."        
        }); 
    }
    
    //check for valid E-mail pattern and null 
    else if (emailFormat.test(email) == 0 || email.trim().length == 0) {
        flag = false;
        res.render("user/signUp", {
            values: req.body,
            emailF : "Enter valid E-mail Address"        
        }); 
    }
   
      
 //check password for the null entry
      else if(password.trim().length == 0){
        flag = false;
             res.render("user/signUp", {   
             values: req.body,      
             passwordE : "Password should not be empty !!"       
           }); 
        } 
      //check for valid password pattern 
      else if (passFormat.test(password) == 0 ) {
        flag = false;
             res.render("user/signUp", {
             values: req.body,
             passwordF : "Password must contain 8 characters,Upper and lower case ,special character and number.."        
           }); 
        }
//after successful validating
        if(flag) {    
            
            const newUser = new userModel({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password
            });

            userModel.findOne({
                email: req.body.email
            })
            .then(user => {
                // Completed the search.
                if (user) {            
                // Found the user document.
                     res.render("user/signUp", {   
                                values: req.body,      
                                existUser : "User is already Registered , please use different E-Mail !!"       
                            }); 
                }
                else {
                  newUser.save()
                    .then((userSaved) => {
        
                    // User was saved correctly.
                    console.log(`User ${userSaved.firstName} has been added to the database.`);
        
                    const sgMail = require("@sendgrid/mail");
                    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            
                    const msg = {
                        to: email,
                        from: 'drpatel33@myseneca.ca',
                        subject: 'Welcome to FunFood',
                        html:
                            `
                             Full Name: ${firstName} ${lastName}<br>
                             Email Address: ${email}<br>
        
                             <h3>Welcome to FunFood</h3><h2> ${firstName},</h2><br>
                             <h3>Thank you for Joining FunFood..</h3><br>
                             You have successfully registered with the FunFood,<br>
                             Stay connected and enjoy delicious dishes!!<br>
                             <h3>Deep Patel<br>
                             FunFood</h3>
                             
                            `
                    };
            
        
                    sgMail.send(msg)
                        .then(() => {                
        
                            res.render("user/signIn", {                
                                            
                                });
                        })
                        .catch(err => {
                            console.log(`Error ${err}`);
                            flag = false;
                            res.render("user/signUp", {
                                values: req.body,
                                failMail : "Sorry!! Registration is not Completed!! Please check the information carefully"        
                              }); 
                        });                 
                    })
                    .catch((err) => {
                        console.log(`Error adding user to the database ... ${err}`);
                        res.render("user/signUp", {
                            values: req.body,                    
                            failMail : "Sorry!! Registration is not Completed!! Please check the information carefully"        
                          }); 
                    }); 
                }
            })
            .catch(err => {
                // Couldn't query the database.
                console.log(`Error finding the user in the database ... ${err}`);       
        
            });
       
            
                            
        }

});




// Set up the login page
router.get("/signIn", (req, res) => {
    req.session.destroy();
    res.render("user/signIn");
});


//signIn form for validation
router.post("/signIn", (req, res) => {
   
    console.log(req.body);
    
    const {loginEmail , password , uType} = req.body;

    let passed = true;    
    let emailFormat = /^\S+@\S+\.\S+$/; //regular expression for email
   
    

    //check for valid E-mail pattern and null 
    if (emailFormat.test(loginEmail) == 0 || loginEmail.trim().length == 0) {
        passed = false;
        res.render("user/signIn", {
            values: req.body,
            fMsg : "Enter valid E-mail Address"        
        }); 
    }
   
    //check for the null entry
   else if(password.trim().length == 0){
            passed = false;
            res.render("user/signIn", {
                values: req.body,                
                fpass : "Enter valid password "       
            }); 
    } 
   
    
 
    //Successful login
    if(passed) { 
         //checking into database for user
         userModel.findOne({
             email: req.body.loginEmail                          
         })
        .then(user =>{
            //search completed 
            //if user found in MongoDB
            if (user){                
                //check for password matching 
                bcrypt.compare(req.body.password, user.password)
                .then(isMatched => {
                    //if password match
                    if(isMatched){
                        //create new session
                        req.session.user = user;  
                       
                        req.session.isClerk = req.body.uType === "clerk"; 

                        if (req.session.isClerk){                                                                
                            res.redirect("/user/clerk");
                            
                        }
                        else {
                            res.redirect("/user/customer");                           
                        }                  
                    }
                    else{
                        res.render("user/signIn", {
                            values: req.body,                
                            inPass : "Incorrect password !!"       
                        }); 
                    }
                })
                .catch(err => {
                    //failed to compare password 
                    console.log(`Unable to compare passwords ... ${err}`);                     
                });                
            }
            else{
                //if user not found in database
                console.log("User not found in the database.");
                res.render("user/signIn", {
                    values: req.body,                
                    noUser : "User not found in database  !!"       
                }); 
            }
        })

        .catch(err =>{
            console.log(`Error finding the user in the database ... ${err}`);
            res.render("user/signIn", {
                values: req.body,                
                fpass : "Enter valid password "       
            }); 
        });
           
    }    


});

router.get("/logout", (req, res) => {    
    // destroy session 
    req.session.destroy();
    res.redirect("/user/signIn");
});


module.exports = router;