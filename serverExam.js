
const { 
  Customer, 
  Owner, 
  Organization, 
  BankAccount, 
  Property, 
  Rating, 
  Room, 
  Reservation, 
  ReservationStatus, 
  PaymentOptions} = require('./enviroment/Classes.js');

const { 
  pingdb, 
  connectToMongoDB, 
  closeMongoDBConnection } = require('./services/configdb.js');

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
const port = 3001;

// Starting the server and testing the connection to the MongoDB database.
appInstance.listen(port,async ()=>{
  console.log("Server is running and listening on port",port);
  await pingdb(console.dir);
  initiateFirebase(console.dir);
});