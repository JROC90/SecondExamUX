const { 
  pingdb, 
  connectToMongoDB, 
  closeMongoDBConnection } = require('./dbconfig.js');

const {
  initiateFirebase,
  createUser,
  updateUserEmail,
  updateUserPassword,
  updateUserDisplayName,
  sendPasswordResetEmail,
  logIn,
  logOut,
  deleteUser } = require ('./fbconfig.js')

// Load environment variables from a .env file into the Node.js process environment
require('dotenv').config();

// Importing 'express' for building the server and creating an app instance.
const express = require('express');
const appInstance = express();

// Importing 'cors' middleware for handling Cross-Origin Resource Sharing.
const cors = require('cors');
appInstance.use(cors());

// Importing 'body-parser' middleware for parsing incoming request bodies
const bodyParser = require('body-parser');
const { initializeApp } = require('firebase/app');

// Middleware for handling URL-encoded data using 'body-parser'
const urlEncodeParser = bodyParser.urlencoded({ extended: true });
appInstance.use(urlEncodeParser);

// Setting the port number for the server to listen on.
const port = process.env.PORT;

// Starting the server and testing the connection to the MongoDB database.
appInstance.listen(port,async ()=>{
  console.log("Server is running and listening on port",port);
  await pingdb(console.dir);
  initiateFirebase(console.dir);
});