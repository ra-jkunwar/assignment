// require the necessary modules
const mongoose = require('mongoose');
require('dotenv').config();
const mongooseURI = process.env.DATABASE_URL;

// configuring parameters for the database connection
const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true 
}


// connecting to the database
const connectToMongo = ()=>{
    
    mongoose.connect(mongooseURI,connectionParams)
        .then( () => {
            console.log('Connected to database ')
        })
        .catch( (err) => {
            console.error(`Error connecting to the database. \n${err}`);
        })
}

module.exports = connectToMongo;