const { db } = require('../util/admin');

//get all screams
exports.getAllScreams = (req, res) => {
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
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
}

//post one scream
exports.postOneScream = (req, res) => {
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

}
