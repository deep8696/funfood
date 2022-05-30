const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


//user Schema 
const userSchema = new Schema({
    //User First Name
    firstName: {
        type : String,
        required: true
    },
    //Last Name
    lastName: {
        type : String,
        required: true
    },
    //E mail address 
    email: {
        type : String,
        required : true,
        unique : true
    },
    //user password
    password: {
        type : String,
        required: true
    },
    //date created 
    dateCreated: {
        type : Date,
        default : Date.now()
    }
});

userSchema.pre("save", function(next){

    let user = this;

    // salting 
    bcrypt.genSalt(10)
    .then(salt => {
        // hash the password using the salt
        bcrypt.hash(user.password, salt)
        .then(hashedPwd => {            
            user.password = hashedPwd;
            next();
        })
        .catch(err => {
            console.log(`Error while hashing ... ${err}`);    
        })
    })
    .catch(err => {
        console.log(`Error while salting ... ${err}`);
    })

});

const userModel = mongoose.model("users", userSchema);
module.exports = userModel;
