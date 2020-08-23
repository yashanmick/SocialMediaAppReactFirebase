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

//Middleware function
//user authentication
const FBAuth = (req, res, next) => {
    let idToken;

    //if auth ant auth token startsWith('Bearer ')
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        //extracting the token from headers
        // header_format => Bearer Token
        //headers.authorization[0] => Bearer
        //headers.authorization[1] => Token
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('No token found');
        //unknown authorize error
        return res.status(403).json({ error: 'Unauthorized' });
    }
    //verify the token
    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken;
            console.log(decodedToken);
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get();
        })
        .then((data) => {
            req.user.handle = data.docs[0].data().handle;
            return next();
        })
        .catch(err => {
            console.error('Error while verifying token ', err);
            return res.status(403).json(err);
        })
}

app.post('/scream', FBAuth, (req, res) => {
    // if (request.method != 'POST') {
    //     return res.status(400).json({ error: 'Method not allowed' });
    // }
    //dont need above validation coz. with express it is automatically handles.
    const newScream = {
        body: req.body.body,
        userHandle: req.user.handle,
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
        errors.email = 'Must not be empty'
    } else if (!isEmail(newUser.email)) {
        errors.email = 'Must be a valid email address'
    }

    //check if password is empty
    if (isEmpty(newUser.password)) {
        errors.password = 'Must not be empty'
    }

    //check if password matches
    if (newUser.password !== newUser.confirmPassword) {
        errors.confirmPassword = 'Password does not match'
    }

    //handle validation
    if (isEmpty(newUser.handle)) {
        errors.handle = 'Must not be empty'
    }

    //if any above error happens return error
    if (Object.keys(errors).length > 0) {
        return res.status(400).json(errors);
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


//login route
app.post('/login', (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    let errors = {};

    //login validation
    if (isEmpty(user.email)) {
        errors.email = 'Must not be empty'
    }

    if (isEmpty(user.password)) {
        errors.password = 'Must not be empty'
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json(errors);
    }

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((data) => {
            return data.user.getIdToken();
        })
        .then((token) => {
            return res.json({ token });
        })
        .catch(err => {
            console.error(err);
            if (err.code === 'auth/wrong-password') {
                return res.status(403).json({ general: 'Wrong credentials, please try again' });
            } else {
                return res.status(500).json({ error: err.code });
            }

        })

})

// https://baseurl.com/api/something
exports.api = functions.region('asia-south1').https.onRequest(app);