import Searcher from './search';
import { TroubadourError } from './helpers';
import User from './user';
const dataDB = require("../db");
//var format = require('pg-format');
//const dataDB = require("pg-promise")();

function Preferences(user_id) {
	this.user_id = user_id;
}

Preferences.prototype.getAll = async function () {

	try {
		const userCount = await dataDB.query(
			`Select COUNT(playlist_id) from Troubadour_Users
      Where user_id = $1`,
			[this.user_id]
		)

		if (userCount == 0) {
			throw new TroubadourError('User does not exist', 400);
		}
	} catch (error) {
		throw new TroubadourError('User does not exist', 400);
	}
	try {
		const preferences = await dataDB.query(
			`Select spotify_uri from Preference
      		Where user_id = $1`,
			[this.user_id]
		)

		const searcher = new Searcher();
		return await searcher.fromSpotifyUris(
			preferences.map((x) => x.spotify_uri));
	} catch (error) {
		throw new TroubadourError('User does not exist', 400);
	}

}

Preferences.prototype.add = async function (newPreferences) {
	try {
		let user = await new User(this.user_id).get();
		if (user == null) {
			user = await new User(this.user_id).create();
		}

	} catch (err) {
		return err;
	}
	try {
		for (var i = 0; i < newPreferences.length; i++) {
			newPreferences[i]["user_id"] = this.user_id
		}
		dataDB.insertMultiple(["user_id", "spotify_uri", "name"], "preference", newPreferences)
		return newPreferences
	} catch (err) {
		throw new TroubadourError('Error Creating multiple preferences', 400);
	}
}




Preferences.prototype.delete = async function (spotifyUris) {

	try {

		const deleteResults = await dataDB.query(
			`DELETE FROM Preference 
               Where user_id = $1 AND spotify_uri = ANY($2::Text[])`,
			[this.user_id, spotifyUris])
		return deleteResults
	} catch (error) {
		throw new TroubadourError('Error Deleting preferences', 400);
	}
}

module.exports = Preferences;