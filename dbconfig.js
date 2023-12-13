const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function pingdb() {
  let connectionStablish = false;
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connection to the database established successfully");
    connectionStablish = true;
  } catch {
    console.log("Failed to establish a connection to the database")
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    return connectionStablish;
  }
}

async function connectToMongoDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connection to the database established successfully");
    return client; // Return the connected client for external use
  } catch (error) {
    console.error("Failed to establish a connection to the database:", error);
    throw error; // Re-throw the error for external handling
  }
}

async function closeMongoDBConnection() {
  try {
    await client.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    throw error; // Re-throw the error for external handling
  }
}

module.exports = {
  pingdb,
  connectToMongoDB,
  closeMongoDBConnection,
};