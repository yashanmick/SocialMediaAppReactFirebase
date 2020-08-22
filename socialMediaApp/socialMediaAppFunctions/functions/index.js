const functions = require('firebase-functions');
const admin = require('firebase-admin');        //admin SDK

admin.initializeApp();      //initialize

const express = require('express');
const { ExportBundleInfo } = require('firebase-functions/lib/providers/analytics');
const app = express();



const firebaseConfig = {
    apiKey: "AIzaSyCunw6AIpPj8xaKLzs_Dfr5pXaQRmLNVDQ",
    authDomain: "socialmediaapp-cfc19.firebaseapp.com",
    databaseURL: "https://socialmediaapp-cfc19.firebaseio.com",
    projectId: "socialmediaapp-cfc19",
    storageBucket: "socialmediaapp-cfc19.appspot.com",
    messagingSenderId: "542464735807",
    appId: "1:542464735807:web:b580b979ff1d1ececed68a",
    measurementId: "G-H7KTMFE5QQ"
};

const firebase = require('firebase');
const { ResultStorage } = require('firebase-functions/lib/providers/testLab');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();


app.get('/screams', (req, res) => {
    db.collection('screams').orderBy('createdAt', 'desc').get()
        .then(data => {
            let screams = [];
            data.forEach(doc => {
                screams.push({
                    screamId: doc.id,
                    //...doc.data()             //spread operator
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                    // commentCount: doc.data().commentCount,
                    // likeCount: doc.data().likeCount
                });
            });
            return res.json(screams);
        })
        .catch(err => console.error(err));
});

app.post('/scream', (req, res) => {
    // if (request.method != 'POST') {
    //     return res.status(400).json({ error: 'Method not allowed' });
    // }
    //dont need above validation coz. with express it is automatically handles.
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()         //date format to string
    };
    db
        .collection('screams')
        .add(newScream)
        .then(doc => {
            res.json({ message: `doucment ${doc.id} created successfully` });

        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong' });
            console.error(err);
        });

});

//validating email
const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    else return false;
}

//helper function to check the string empty or not
const isEmpty = (string) => {
    //eleminate any white spaces
    if (string.trim() === '') return true;
    else return false;
}

//signup route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    let errors = {};        //initializing errors object

    //email validation
    if (isEmpty(newUser.email)) {
        errors.email = 'Email must not be empty'
    } else if (!isEmail(newUser.email)) {
        errors.email = 'Must be a valid email address'
    }

    if (isEmpty(newUser.password)) {
        errors.password = 'Password must not be empty'
    }


    let token, userId;

    //checking the handle being unique
    db.doc(`/users/${newUser.handle}`).get()
        .then((doc) => {
            //if user already exists
            if (doc.exists) {
                return res.status(400).json({ handle: 'this handle is already taken' });
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then((data) => {
            userId = data.user.uid;
            //return a authentication token to the user
            return data.user.getIdToken();
        })
        .then((idToken) => {
            token = idToken;
            //create a new collection
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            };
            //use this colleciton
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch(err => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return res.status(400).json({ email: 'Email is already in use' })
            } else {
                return res.status(500).json({ error: err.code });
            }
        });
});

// https://baseurl.com/api/something
exports.api = functions.region('asia-south1').https.onRequest(app);