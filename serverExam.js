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
    console.log("Usuario: ", email, "creado exitosamente en firebase");
    // Connect to MongoDB
    let client = await connectToMongoDB();
    const db = client.db(dbName);

    // Access the Users collection
    const collection = db.collection("Users");

    // Insert the user into the collection
    await collection.insertOne(user);
    console.log("Usuario: ", email, "creado exitosamente en Mongodb");

    // Respond with success message and user details
    res.status(201).json({ message: 'User created successfully' });

  } catch (error) {
    // Handle errors
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
  console.log("Usuario Creado");
});

// Endpoint to logIn a User
appInstance.post('/logIn', async (req, res) => {
  const { email = '', password = '' } = req.body;

  // Check if required fields are present
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required for logging in.' });

  try {
    // Verify user credentials and get tokens
    const [idToken, refreshToken] = await logIn(email, password);

    // Respond with success message and user details
    res.status(200).json({
      message: 'Login successful',
      idToken,
      refreshToken,
    });
  } catch (error) {
    // Handle login errors
    console.error('Error logging in user:', error);

    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      // Return specific error message for user not found or wrong password
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // General error response
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    // Log a message after processing
    console.log('User logged in');
  }
});

// Endpoint to LogOut a user that has been loggedIn
appInstance.post('/logOut', async (req, res) => {
  const { idToken = '' } = req.body;

  // Check if required fields are present
  if (!idToken) {
    return res.status(400).json({ error: 'idToken is required for logging out.' });
  }

  try {
    // Attempt to log the user out
    console.log("idToken: ",idToken);
    const isLoggedOut = await logOut(idToken);
    console.log("Paso", isLoggedOut);

    // If successfully logged out, respond with success message
    if (isLoggedOut) {
      return res.status(200).json({ message: 'Logout successful' });
    } else {
      // Handle case where logout was not successful (e.g., invalid tokens)
      return res.status(401).json({ error: 'Invalid tokens or user not found' });
    }
  } catch (error) {
    // Handle logout errors
    console.error('Error logging out user:', error);

    // General error response
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    // Log a message after processing
    console.log('User logged out');
  }
});