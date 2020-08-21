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
firebase.initializeApp(firebaseConfig);


app.get('/screams', (req, res) => {
    admin.firestore().collection('screams').orderBy('createdAt', 'desc').get()
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
    admin.firestore()
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

//signup route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    // TODO validate data

    firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then((data) => {
            return res.status(201).json({ message: `user ${data.user.uid} signed up successfully` });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
});

// https://baseurl.com/api/something
exports.api = functions.region('asia-south1').https.onRequest(app);