/* This code is defining a function called `connectDB` that is used to connect to a MongoDB database
using the Mongoose library. */

const mongoose = require('mongoose')

const connectDB = async (url) => {
  try{
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('Connected to DB!!');
  }catch(error){
    console.error('Error connecting to MongoDB:', error.message);
  }
}

module.exports = connectDB