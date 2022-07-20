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
	} catch (error) {
		throw new TroubadourError('User does not exist', 400);
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
		var dateNow = new Date(Date.now()).toISOString();
		// var now_utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
		// 				date.getUTCDate(), date.getUTCHours(),
		// 				date.getUTCMinutes(), date.getUTCSeconds());

		// console.log(new Date(now_utc));
		// console.log(date.toISOString());
		const { updateResult } = await dataDB.updateQuery(
			"UPDATE Troubadour_Users set updated_at = $1, last_location = 'POINT($2 $3)' where user_id = $4",
			[dateNow, newLocation.lat, newLocation.long, this.userId]
		);
		return updateResult;
	} catch (err) {
		throw new TroubadourError('Error updating user', 400);
	}
}

User.prototype.create = async function () {
	try {
		const insertResult = await dataDB.insertQuery(
			`INSERT INTO Troubadour_Users(user_id, spotify_id, last_location, updated_at) 
              VALUES ($1, $2, $3, $4)`,
			[this.userId, this.userId, null, null]
		)
		return insertResult;
	} catch (err) {
		throw new TroubadourError('Error creating user', 400);
	}
}

module.exports = User;
