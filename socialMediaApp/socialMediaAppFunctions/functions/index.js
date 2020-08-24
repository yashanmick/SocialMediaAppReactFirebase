const functions = require('firebase-functions');

const express = require('express');
const { ExportBundleInfo } = require('firebase-functions/lib/providers/analytics');
const app = express();

const FBAuth = require('./util/fbAuth');

const { getAllScreams, postOneScream, getScream, commentOnScream, likeScream, unlikeScream } = require('./handlers/screams');
const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser } = require('./handlers/users');


const { ResultStorage } = require('firebase-functions/lib/providers/testLab');


//scream routes
app.get('/screams', getAllScreams);     //get all screams
app.post('/scream', FBAuth, postOneScream);     //post a scream
app.get('/scream/:screamId', getScream);
// TODO: deleteScream
app.get('/scream/:screamId/like', FBAuth, likeScream);//like a scream
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream); //unlike a scream
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);   //comment on scream

//users routes
app.post('/signup', signup);       //signup route
app.post('/login', login);   //login route
app.post('/user/image', FBAuth, uploadImage);       //upload image
app.post('/user', FBAuth, addUserDetails);      //add user details
app.get('/user', FBAuth, getAuthenticatedUser);     //hold redux data


// https://baseurl.com/api/something
exports.api = functions.region('asia-south1').https.onRequest(app);