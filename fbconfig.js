const admin = require( 'firebase-admin');
const { initializeApp } = require('firebase/app');
const serviceAccount = require("../enviroment/credentials.json");
const { getAuth } = require('firebase-admin/auth');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};

let firebaseInstance;


/**
 * Initializes the Firebase Admin and Basic instances using the provided service account 
 * credentials and configuration.
 * @throws {Error} If initialization fails.
 */
const initiateFirebase = () => {
  try {
    console.log("Initializing Firebase Admin instance...");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin instance initialized successfully.");
  } catch (error) {
    console.log("Error initializing Firebase Admin:", error);
    throw new Error("Firebase Admin initialization failed");
  }
  try {
    console.log("Initializing Firebase Basic instance...");
    firebaseInstance = initializeApp(firebaseConfig);
    console.log("Firebase Basic instance initialized successfully.");
  } catch (error) {
    console.log("Error initializing Firebase Basic:", error);
    throw new Error("Firebase Basic initialization failed");
  }
};

/**
 * Creates a new user in Firebase Authentication with the provided information.
 * @param {string} name - The user's first name.
 * @param {string} lastName - The user's last name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 */
const createUser = ( name, lastName, email, password ) => {
  let displayName = name + ' ' + lastName;
  admin.auth().createUser({
    email: email,
    password: password,
    displayName: displayName,
  })
  .then((userRecord) => {
    console.log('Successfully created new user:', userRecord.uid);
  })
  .catch((error) => {
    console.log('Error creating new user:', error);
    throw new Error('Error creating new user:', error)
  });
};

/**
 * Retrieves the UID (User ID) of a user based on the provided ID token.
 * @param {string} idToken - The user's ID token.
 * @returns {Promise<string>} A Promise that resolves to the user's UID.
 * @throws {Error} If an error occurs during UID retrieval.
 */
const getUserUID = async (idToken) => {
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error) {
    console.log('Error getting user UID:', error);
    throw new Error('Error getting user UID:', error);
  }
};

/**
 * Updates a specific attribute of a user (e.g., email, password, displayName) based 
 * on the provided ID token.
 * @param {string} idToken - The user's ID token.
 * @param {string} field - The attribute to update.
 * @param {string} value - The new value for the attribute.
 * @returns {Promise<void>} A Promise that resolves when the update is successful.
 * @throws {Error} If an error occurs during the update.
 */
const updateUserAttribute = async (idToken, field, value) => {
  const uid = getUserUID(idToken);
  if (!uid) return;

  const updateObject = {};
  updateObject[field] = value;

  try {
    const userRecord = await getAuth().updateUser(uid, updateObject);
    console.log(`Successfully updated ${field} for user`, userRecord.toJSON());
  } catch (error) {
    console.log(`Error updating ${field} for user:`, error);
    throw new Error(`Error updating ${field} for user: ${error}`);
  }
};

/**
 * Updates the email address of a user based on the provided ID token.
 * @param {string} idToken - The user's ID token.
 * @param {string} newEmail - The new email address.
 * @throws {Error} If an error occurs during the email update.
 */
const updateUserEmail = async (idToken, newEmail) => {
  try {
    await updateUserAttribute(idToken, 'email', newEmail);
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Updates the password of a user based on the provided ID token.
 * @param {string} idToken - The user's ID token.
 * @param {string} newPassword - The new password.
 * @throws {Error} If an error occurs during the password update.
 */
const updateUserPassword = async (idToken, newPassword) => {
  try {
    await updateUserAttribute(idToken, 'password', newPassword);
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Updates the display name of a user based on the provided ID token.
 * @param {string} idToken - The user's ID token.
 * @param {string} newDisplayName - The new display name.
 * @throws {Error} If an error occurs during the display name update.
 */
const updateUserDisplayName = async (idToken, newDisplayName) => {
  try {
    await updateUserAttribute(idToken, 'displayName', newDisplayName);
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Sends a password reset email to the user with the provided email address.
 * @param {string} email - The user's email address.
 * @throws {Error} If an error occurs during the password reset email sending process.
 */
const sendPasswordResetEmail = async (email) => {
  try {
    await firebaseInstance.auth().sendPasswordResetEmail(email);
    console.log('Password reset email sent successfully.');
  } catch (error) {
    console.log('Error reseting password:', error);
    throw new Error('Error reseting password:', error);
  }
};

/**
 * Logs in a user with the provided email and password.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<[string, string]>} A Promise that resolves to an array containing
 * the ID token and refresh token.
 * @throws {Error} If login fails.
 */
const logIn = async (email, password) => {
  try {
    await admin.auth().getUserByEmail(email);
    const userCredential = await admin.auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Return tokens
    return [await user.getIdToken(), user.refreshToken];
  } catch (error) {
    console.log("Login failed:", error);
    throw new Error("Login failed: Incorrect password or email", error);
  }
};

/**
 * Logs out a user based on the provided ID token.
 * @param {string} idToken - The user's ID token.
 * @returns {Promise<boolean>} A Promise that resolves to true if the logout is successful.
 * @throws {Error} If logout fails.
 */
const logOut = async (idToken) => {
  try {
    const uid = await getUserUID(idToken);
    // Revoke refresh tokens for the user
    await admin.auth().revokeRefreshTokens(uid);
    console.log("User logged out successfully");
    return true;
  } catch (error) {
    console.log("Logout failed:", error);
    throw new Error("Failed to log out user");
  }
};

/**
 * Deletes a user based on the provided ID token.
 * @param {string} idToken - The user's ID token.
 * @throws {Error} If user deletion fails.
 */
const deleteUser = async (idToken) => {
  try {
    const uid = await getUserUID(idToken);
    // Delete the user
    await admin.auth().deleteUser(uid);

    console.log("User deleted successfully");
  } catch (error) {
    console.log("User deletion failed:", error);
    throw new Error("Failed to delete user");
  }
};

/**
 * Module exports for external usage.
 */
module.exports = {
  initiateFirebase,
  createUser,
  updateUserEmail,
  updateUserPassword,
  updateUserDisplayName,
  sendPasswordResetEmail,
  logIn,
  logOut,
  deleteUser
};
