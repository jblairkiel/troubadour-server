import { database as db } from './startup';
import { TroubadourError } from './helpers';
const dataDB = require('../db');

function User(userId) {
	this.userId = userId;

}

User.prototype.get = async function () {
	try {

		const getResult = await dataDB.queryGetOne(
			`Select * from Troubadour_Users
			Where user_id = $1`,
			[this.userId]
		)
		return getResult;
		//const curUser = await db.troubadourusers.findAll({ where: { user_id: this.userId } });
		//return curUser;
	} catch (error) {
		console.log(error)
	}
}

User.prototype.updateLocation = async function (newLocation) {
	if (!(newLocation instanceof Object) ||
		!Number.isFinite(newLocation.lat) ||
		!Number.isFinite(newLocation.long)) {
		throw new TroubadourError('The entered location is invalid. ' +
			'See docs at https://api.troubadour.tk/docs. ', 400);
	}
	try {
		const { updateResult } = await dataDB.updateQuery(
			`UPDATE Troubadour_Users
			set updated_at = '$1', last_location = '$2'
			where user_id = '$3'`,
			[Date.now(), newLocation, this.userId]
		);
		return updateResult;
	} catch (err) {
		console.log(err)
		return err;
	}
	// const user = db.troubadourusers.build({ 
	//   user_id: this.userId,
	//   updated_at: db.sequelize.fn('NOW'),
	//   last_location: newLocation
	//  }).save();
	// console.log(user.toJSON()); // This is good!
	// console.log(JSON.stringify(user, null, 4)); // This is also good!

	// await db.TroubadourUser.upsert({
	//     user_id: this.userId,
	//     updated_at: db.sequelize.fn('NOW'),
	//     last_location: newLocation,
	// });

	//return true;
}

User.prototype.create = async function () {
	try {
		const insertResult = await dataDB.insertQuery(
			`INSERT INTO Troubadour_Users(user_id, spotify_id, last_location, updated_at) 
              VALUES ($1, $2, $3, $4)`,
			[this.userId, this.userId, null, null]
		)
		return insertResult;
		// .then(res => {
		// 	console.log(res.rows[0])
		// 	return res
		// 	// { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
		// });
	} catch (err) {
		return err;
	}
}

module.exports = User;
