const functions = require('firebase-functions');

const express = require('express');
const { ExportBundleInfo } = require('firebase-functions/lib/providers/analytics');
const app = express();

const FBAuth = require('./util/fbAuth');

const { getAllScreams, postOneScream } = require('./handlers/screams');
const { signup, login, uploadImage, addUserDetails } = require('./handlers/users');


const { ResultStorage } = require('firebase-functions/lib/providers/testLab');


//scream routes
app.get('/screams', getAllScreams);     //get all screams
app.post('/scream', FBAuth, postOneScream);     //post a scream
//users routes
app.post('/signup', signup);       //signup route
app.post('/login', login);   //login route
app.post('/user/image', FBAuth, uploadImage);       //upload image
app.post('/user', FBAuth, addUserDetails);


// https://baseurl.com/api/something
exports.api = functions.region('asia-south1').https.onRequest(app);