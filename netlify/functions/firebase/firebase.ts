var admin = require('firebase-admin');

var serviceAccount = require('./find-sindicato-firebase-adminsdk-lslid-ab2acc677f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const store = admin.storage();
var storageRef = store.bucket('gs://find-sindicato.appspot.com');

export { storageRef };
