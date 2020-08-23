const { admin, db } = require('../util/admin');

const config = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignupData, validateLoginData } = require('../util/validators');

//sign up
exports.signup = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    const { valid, errors } = validateSignupData(newUser);

    if (!valid) {
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
}


exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    const { valid, errors } = validateLoginData(user);

    if (!valid) {
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

        });
}


// upload image
//      npm install --save busboy
exports.uploadImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    let imaeFileName;
    let imageToBeUploaded = {};     //initializing image object

    const busboy = new BusBoy({ headers: req.headers });

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        console.log(fieldname);
        console.log(filename);
        console.log(mimetype);
        //getting the file extension (.png, .jpeg, etc)
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        //ex : 4544545645456.png
        imageFileName = `${Math.round(Math.random() * 1000000000)}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype };
        //for now the file(object) is created, so need to use the filesystem library to actually create this file
        file.pipe(fs.createWriteStream(filepath));
    });
    busboy.on('finish', () => {
        admin.storage().bucket().upload(imageToBeUploaded.filepath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
        })
            .then(() => {
                //construct the image url to added it to the user
                https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName} 
                // will just download the file to the computer instead of showing it onthe brower
                //adding 'alt.media' will shows the image on the browser
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`

                //then add this url to our users user document 
                return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
            })
            .then(() => {
                return res.json({ message: 'Image uploaded successfully' });
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ error: err.code });
            })
    })
}