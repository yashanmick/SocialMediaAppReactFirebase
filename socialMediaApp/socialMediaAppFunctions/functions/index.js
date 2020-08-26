const functions = require('firebase-functions');

const express = require('express');
const { ExportBundleInfo } = require('firebase-functions/lib/providers/analytics');
const app = express();

const { db } = require('./util/admin');

const FBAuth = require('./util/fbAuth');

const { getAllScreams, postOneScream, getScream, commentOnScream, likeScream, unlikeScream, deleteScream } = require('./handlers/screams');
const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser, getUserDetails, markNotificationsRead } = require('./handlers/users');


const { ResultStorage } = require('firebase-functions/lib/providers/testLab');


//scream routes
app.get('/screams', getAllScreams);     //get all screams
app.post('/scream', FBAuth, postOneScream);     //post a scream
app.get('/scream/:screamId', getScream);
app.delete('/scream/:screamId', FBAuth, deleteScream);   //deleteScream
app.get('/scream/:screamId/like', FBAuth, likeScream);  //like a scream
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);  //unlike a scream
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);   //comment on scream

//users routes
app.post('/signup', signup);       //signup route
app.post('/login', login);   //login route
app.post('/user/image', FBAuth, uploadImage);       //upload image
app.post('/user', FBAuth, addUserDetails);      //add user details
app.get('/user', FBAuth, getAuthenticatedUser);     //hold redux data  //get own user details
app.get('/user/:handle', getUserDetails);   //get any user details
app.post('/notifications', FBAuth, markNotificationsRead);  //mark notifications read or not


// https://baseurl.com/api/something
exports.api = functions.region('asia-south1').https.onRequest(app);


//notification on like
exports.createNotificationOnLike = functions
    .region('asia-south1')
    .firestore.document('likes/{id}')
    .onCreate((snapshot) => {
        return db
            .doc(`/screams/${snapshot.data().screamId}`)
            .get()
            .then((doc) => {
                if (
                    doc.exists &&
                    doc.data().userHandle !== snapshot.data().userHandle
                ) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: 'like',
                        read: false,
                        screamId: doc.id
                    });
                }
            })
            .catch((err) => console.error(err));
    });

//delete notification on unlike
exports.deleteNotificationOnUnLike = functions
    .region('asia-south1')
    .firestore.document('likes/{id}')
    .onDelete((snapshot) => {
        return db
            .doc(`/notifications/${snapshot.id}`)
            .delete()
            .catch((err) => {
                console.error(err);
                return;
            });
    });


//notification on comment
exports.createNotificationOnComment = functions
    .region('asia-south1')
    .firestore.document('comments/{id}')
    .onCreate((snapshot) => {
        return db
            .doc(`/screams/${snapshot.data().screamId}`)
            .get()
            .then((doc) => {
                if (
                    doc.exists &&
                    doc.data().userHandle !== snapshot.data().userHandle
                ) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: 'comment',
                        read: false,
                        screamId: doc.id
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                return;
            });
    });

//if user changes the profile picture, need to change all the occurencess belongs to the 
//perticular user

exports.onUserImageChange = functions
    .region('asia-south1')
    .firestore.document('/users/{userId}')
    .onUpdate((change) => {
        console.log(change.before.data());      //value before
        console.log(change.after.data());       //value after
        if (change.before.data().imageUrl !== change.after.data().imageUrl) {
            console.log('image has changed');
            const batch = db.batch();       //upload multiple documents
            return db
                .collection('screams')
                .where('userHandle', '==', change.before.data().handle)
                .get()
                .then((data) => {
                    data.forEach((doc) => {
                        const scream = db.doc(`/screams/${doc.id}`);
                        batch.update(scream, { userImage: change.after.data().imageUrl });
                    });
                    return batch.commit();
                });
        } else return true;
    });

//remove all occurences when user delete an scream
exports.onScreamDelete = functions
    .region('asia-south1')
    .firestore.document('/screams/{screamId}')
    .onDelete((snapshot, context) => {
        const screamId = context.params.screamId;
        const batch = db.batch();
        return db
            .collection('comments')
            .where('screamId', '==', screamId)
            .get()
            .then((data) => {
                data.forEach((doc) => {
                    batch.delete(db.doc(`/comments/${doc.id}`));
                });
                return db
                    .collection('likes')
                    .where('screamId', '==', screamId)
                    .get();
            })
            .then((data) => {
                data.forEach((doc) => {
                    batch.delete(db.doc(`/likes/${doc.id}`));
                });
                return db
                    .collection('notifications')
                    .where('screamId', '==', screamId)
                    .get();
            })
            .then((data) => {
                data.forEach((doc) => {
                    batch.delete(db.doc(`/notifications/${doc.id}`));
                });
                return batch.commit();
            })
            .catch((err) => console.error(err));
    });