const jwt = require('jsonwebtoken');

var token = {
  email: 'shivam231198@gmail.com'
};

// var state = jwt.sign(token, '123abc');
// console.log(state);

let x = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNoaXZhbTIzMTE5OEBnbWFpbC5jb20iLCJpYXQiOjE1NTk5Mjc1MDh9.GGr1QyB-cfkIBaGzo_2XSLbpTE9HIQ0XJBJaKr39NN0';


jwt.verify(x, '123abc').then(data => {
  console.log(data);
}).catch(err => {
  console.log(err);
});


// const admin = require('firebase-admin');
// var serviceAccount = require('./../serviceAccountKey.json');

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
//     // databaseURL: "https://assistant-a4a97.firebaseio.com"
//   });


// var db = admin.firestore();

// db.settings({
//   timestampsInSnapshots: true
// });

// var id = '5l6ZXbFraF93e5mwLMpF';

// db.collection('users').doc(id).get().then(doc => {
//   console.log(doc.data());
// }).catch(e => console.log(e));

// var citiesRef = db.collection('cities');

// var setSf = citiesRef.doc('SF').set({
//   name: 'San Francisco', state: 'CA', country: 'USA',
//   capital: false, population: 860000
// });


