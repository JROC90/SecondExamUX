const { 
  pingdb, 
  connectToMongoDB, 
  closeMongoDBConnection } = require('./dbconfig.js');

const dbName = process.env.MONGODB_DBNAME;

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
const { app } = require('firebase-admin');

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

// Endpoint for creating a user
appInstance.post("/createUser", async (req, res) => {
  try {
    const { name = '', lastName = '', email = '', password = '' } = req.body;

    // Check if required fields are present
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required for creating a User.' });

    // Log user details
    console.log(name, email, password);

    // Prepare user object
    let user = {
      email: email,
      password: password
    };

    // Add name and lastName to user if provided
    if (name) user.name = name;
    if (lastName) user.lastName = lastName;


    // Adding User to Firebase and geting idToken
    await createUser(name,lastName,email,password);
    console.log('paso');
    const [idToken,refreshToken] = await logIn(email,password);

    // Connect to MongoDB
    let client = await connectToMongoDB();
    const db = client.db(dbName);

    // Access the Users collection
    const collection = db.collection("Users");

    // Insert the user into the collection
    await collection.insertOne(user);

    // Respond with success message and user details
    res.status(201).json({ message: 'User created successfully', idToken, refreshToken });

  } catch (error) {
    // Handle errors
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  } finally {
    // Log a message after processing
    console.log("Usuario Creado");
  }
});