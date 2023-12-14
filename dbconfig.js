const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

/**
 * MongoDB connection URI.
 * @type {string}
 */
const uri = process.env.MONGODB_URI;

/**
 * MongoDB client configured with specific options.
 * @type {MongoClient}
 */
const client = new MongoClient(uri, {
  /**
   * Server API options for the MongoDB client.
   * @type {{
   *   version: ServerApiVersion,
   *   strict: boolean,
   *   deprecationErrors: boolean
   * }}
   */
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

/**
 * Attempts to ping the database to check the connection status.
 * @returns {Promise<boolean>} Returns a Promise that resolves to a boolean indicating whether the connection was successful.
 */
async function pingdb() {
  let connectionEstablished = false;
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connection to the database established successfully");
    connectionEstablished = true;
  } catch {
    console.log("Failed to establish a connection to the database");
  } finally {
    await client.close();
    return connectionEstablished;
  }
}

/**
 * Connects to the MongoDB database and returns the connected client.
 * @returns {Promise<MongoClient>} Returns a Promise that resolves to the connected MongoClient.
 * @throws {Error} Throws an error if the connection cannot be established.
 */
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connection to the database established successfully");
    return client;
  } catch (error) {
    console.error("Failed to establish a connection to the database:", error);
    throw error;
  }
}

/**
 * Closes the MongoDB connection.
 * @returns {Promise<void>} Returns a Promise that resolves when the connection is closed.
 * @throws {Error} Throws an error if there is an issue closing the connection.
 */
async function closeMongoDBConnection() {
  try {
    await client.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    throw error;
  }
}

/**
 * Module exports.
 * @type {{
 *   pingdb: typeof pingdb,
 *   connectToMongoDB: typeof connectToMongoDB,
 *   closeMongoDBConnection: typeof closeMongoDBConnection
 * }}
 */
module.exports = {
  pingdb,
  connectToMongoDB,
  closeMongoDBConnection,
};
