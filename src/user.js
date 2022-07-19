import {database as db} from './startup';
import {TroubadourError} from './helpers';
const dataDB = require('../db');

function User (userId) {
    this.userId = userId;
  
}

User.prototype.get = async function() {
  try{
    const curUser = await db.troubadourusers.findAll({ where: { user_id: this.userId } });
    return curUser;
  } catch (error){
    console.log(error)
  }
}

User.prototype.updateLocation = async function(newLocation) {
    if(!( newLocation instanceof Object) ||
       ! Number.isFinite(newLocation.lat) ||
       ! Number.isFinite(newLocation.long)) {
         throw new TroubadourError('The entered location is invalid. ' +
         'See docs at https://api.troubadour.tk/docs. ', 400);
    }

    const user = db.troubadourusers.build({ 
      user_id: this.userId,
      updated_at: db.sequelize.fn('NOW'),
      last_location: newLocation
     }).save();
    console.log(user.toJSON()); // This is good!
    console.log(JSON.stringify(user, null, 4)); // This is also good!

    // await db.TroubadourUser.upsert({
    //     user_id: this.userId,
    //     updated_at: db.sequelize.fn('NOW'),
    //     last_location: newLocation,
    // });

    return true;
  }

User.prototype.create = async function() {
    try{
        const { rows } = await dataDB.query(
          `INSERT INTO troubadourusers(user_id, spotify_id, last_location, updated_at) 
              VALUES ($1, $2, $3, $4)`,
              [this.userId, this.userId, null, null]
          );       
          return rows; 
      // db.sequelize.sync();
      // const a = await db.troubadourusers.create({ 
      //   user_id: this.userId,
      //   updated_at: db.sequelize.fn('NOW')
      //  }).then( result => {
  
      //     console.log(result.toJSON()); // This is good!
      //     console.log(JSON.stringify(result, null, 4)); // This is also good!
      //   }
  
      //  ).catch( err => {
      //   console.log(err);
      //  });
       //return a;
    } catch(err){
      return null;
    }
  //   return await db.TroubadourUser.upsert({
  //     user_id: this.userId,
  //     updated_at: db.sequelize.fn('NOW'),
  //   }).then(function(test){
  //     console.log(test);//test returned here as true or false how can i get the inserted id here so i can insert data in other tables using this new id?
  // });
  }

module.exports = User;
