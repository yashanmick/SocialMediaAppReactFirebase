const admin = require('firebase-admin');        //admin SDK

admin.initializeApp();      //initialize

const db = admin.firestore();

module.exports = { admin, db };

