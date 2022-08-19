// Keep this import first. It does black magic to setup the environment so
// things don't break mysteriously
import startup from './startup'; //eslint-disable-line
// import {database} from '.startup';
import express from 'express';
import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import morgan from 'morgan';
import cors from 'cors';

import { errorHandler as defaultHandler } from './middleware';

import searchController from './controllers/search';
import locationController from './controllers/location';
import preferencesController from './controllers/preferences';
import nearbyController from './controllers/nearby';
import playlistController from './controllers/playlist';
import userController from './controllers/user';


const app = express();
app.use(cors());
// const allowedOrigins = ['www.example1.com'];
// app.use(cors({
//   origin: function(origin, callback){
//     if(!origin) return callback(null, true);
//     if(allowedOrigins.indexOf(origin) === -1){
//       const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   }

// }));
// for parsing application/json
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(morgan('dev'));
  app.use(errorhandler());
} else {
  app.use(morgan('combined'));
}

//Comments so root goes to app
app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.use('/api/search', searchController);

app.use('/api/location', locationController);
app.use('/api/preferences', preferencesController);
app.use('/api/nearby', nearbyController);
app.use('/api/playlist', playlistController);
app.use('/api/user', userController);

if (process.env.NODE_ENV === 'development') {
  app.use('/docs', express.static('out/docs'));
} else {
  app.use('/docs', express.static('docs'));
}

app.use(defaultHandler);

module.exports = app.listen(process.env.PORT || 3000, function () {
  console.log('Troubadour Server Listening on port 3000');
});
