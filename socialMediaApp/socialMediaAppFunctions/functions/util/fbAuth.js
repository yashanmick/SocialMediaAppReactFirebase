//--------------------Middleware function--------------------------
const { admin, db } = require('./admin');


//user authentication
module.exports = (req, res, next) => {
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
            //console.log(decodedToken);
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get();
        })
        .then((data) => {
            req.user.handle = data.docs[0].data().handle;
            req.user.ImageUrl = data.docs[0].data().ImageUrl;
            return next();
        })
        .catch(err => {
            console.error('Error while verifying token ', err);
            return res.status(403).json(err);
        })
}