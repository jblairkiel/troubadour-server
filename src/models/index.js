// from the express-sequelize example app;
//let fs = require('fs');
let path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../config.env') })
let Sequelize = require('sequelize');

// let sequelize = new Sequelize("troubadour", "postgres", null, {

//   host: 'localhost',
//   dialect:'postgres',
//   operatorsAliases: false,
//   pool: {
//       max: 5,
//       min: 0,
//       acquire: 30000,
//       idle: 10000
//   },
//   logging: process.env.NODE_ENV == 'development' ? console.log : false,
// });
let sequelize = new Sequelize("postgres://postgres@localhost:5432/troubadour");
// let sequelize = new Sequelize(process.env.CONNECTION_STRING, {
//   logging: process.env.NODE_ENV == 'development' ? console.log : false,
// });
let db = {};

// let playlist = require('./playlist')
// let playlist_preference = require("./playlist_preference")
// let preference = require("./preference")
// let troubadour_user = require("./troubadour_user")
// let user_blacklist = require("./user_blacklist")
// db[model.name] = playlist;
// db[playlist_preference.name] = playlist_preference;
// db[preference.name] = preference;
// db[troubadour_user.name] = troubadour_user;
// db[user_blacklist.name] = user_blacklist;
//let troubadour_user = sequelize.import("./troubadour_user")
//var trUs = sequelize["import"]("./troubadour_user");
let trUs = require("./troubadour_user")(sequelize, Sequelize.DataTypes)
db[trUs.name] = trUs
// fs
//   .readdirSync(__dirname)
//   .filter(function(file) {
//     return (file.indexOf('.') !== 0) && (file !== 'index.js');
//   })
//   .forEach(function(file) {
//     // let model = import(path.join(__dirname, file));
//     // db[model.name] = model;

//     //const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//     const model = require(path.join("../", file))(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
try {
  sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}



module.exports = db;
