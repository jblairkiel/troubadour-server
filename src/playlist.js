import { Nearby } from './nearby';
import SpotifyApi from 'spotify-web-api-node';
import { groupBy, TroubadourError } from './helpers';
import request from 'request-promise';
import { sequelize } from '../models';

const DATETIME = require('node-datetime');
const SPOTIFY_BASE = 'https://api.spotify.com/v1/users/';
const GENRES = require(process.env.GENRE_FILE);
const dataDB = require("../db");

function fixPlaylist(playlist) {
	// For... reasons, we end up with the radius twice
	return Object.assign({}, playlist.toJSON(), { radius: undefined });
}


export class Playlist {
	constructor(userId, accessToken) {
		console.log("accessToken" + accessToken)
		this.userId = userId;
	}

	async getAllPreferencesForPlaylist(playlistId) {

		return dataDB.query(`
      SELECT pr.*
      FROM troubadour_user u
      JOIN (select party_location, radius
        from playlist where playlist_id=$1) locations
        ON ST_DWITHIN(locations.party_location, u.last_location, locations.radius)
      JOIN preference pr
        ON pr.user_id = u.user_id
      WHERE preference.spotify_uri NOT IN (
        select spotify_uri from user_blacklist where user_id=$2
      );
    `, [playlistId, this.userId]);
	}

	async getPlaylists() {
		try {
			const playlists = await dataDB.query(
				`Select * from Playlist
            Where created_by = $1`,
				[this.user_id]
			)
			return playlists.map(fixPlaylist);
		} catch (error) {
			throw new TroubadourError('Error finding playlists', 400);
		}
	}

	async deletePlaylist(apiKey, playlistId) {
		try {

			await this.unfollowPlaylist(apiKey, playlistId);
			await dataDB.query(
				`DELETE from Playlist
            	Where playlist_id = $1`,
				[playlistId]
			)
			return true;
		} catch (error) {
			throw new TroubadourError('Error deleting playlist', 400);
		}
	}

	async unfollowPlaylist(apiKey, playlist_id){
		try{
			let spotifyApi = new SpotifyApi();
			spotifyApi.setAccessToken(apiKey);
			let user = await spotifyApi.getMe();
			user = user.body;
			await spotifyApi.unfollowPlaylist(user.id, playlist_id);
		} catch (error){
			throw new TroubadourError('Error deleting playlist', 400);
		}
	}

	async deletePlaylists(apiKey) {

		try {

			let spotifyApi = new SpotifyApi();
			spotifyApi.setAccessToken(apiKey);
			let user = await spotifyApi.getMe();
			user = user.body;

			const playlists = this.getPlaylists()
			let deletePromises = playlists
			.map((x) => x.playlist_id)
			.map((x) => this.unfollowPlaylist(apiKey, x));
			deletePromises.push(
				await dataDB.query(
					`DELETE from Playlist
					Where created_by = $1`,
					[user.id]
				)
			);

			await Promise.all(deletePromises);
			return true;
		} catch (error) {
			throw new TroubadourError('Error deleting playlists', 400);
		}

	}

	async updatePlaylist(playlistId, playlist) {
		try {
			const playlists = await dataDB.query(
				`UPDATE Playlist
            	SET party_location = $1,
				in_progress = $2, 
				Where playlist_id = $3`,
				[playlist.party_location, playlist.in_progress, playlistId]
			)		
			return fixPlaylist(playlists[1][0]);

		} catch (error) {
			throw new TroubadourError('Error updating playlist', 400);
		}

	}

	async createPlaylist(apiKey, { lat, long, radius = 30, preferences }) {
		if (!preferences) {
			let temp = await new Nearby(this.userId)
				.getPreferences({ lat, long }, radius);
			preferences = temp.map((x) => x.spotify_uri);
		}

		if (preferences.length == 0) {
			throw new TroubadourError(
				'No preferences in the requested area and none specified in the body.',
				400);
		}

		// spotify
		const spotifyApi = new SpotifyApi();
		spotifyApi.setAccessToken(apiKey);

		// aggregation
		let seeds = await this.aggregatePreferences(spotifyApi, preferences);
		let tracks = await this.getTracksFromSeeds(spotifyApi, seeds);
		let [user, playlist] = await this.createEmptyPlaylist(spotifyApi);

		let promises = [];
		promises.push(this.
			addTracksToPlaylist(apiKey, user.id, playlist.id, tracks));

		try {

			let promise = await dataDB.query(
				`INSERT INTO Playlist
				VALUES ($1, $2, $3, $4)`,
				[this.userId, true, sequelize.DataTypes.GEOGRAPHY("Point", 4326)(lat, long)]
			)
			promises.push(promise);
			let [_, result] = await Promise.all(promises); //eslint-disable-line
			result = result[0];
			return fixPlaylist(result);
		} catch (error) {
			throw new TroubadourError('Error deleting playlist', 400);
		}

	}

	async getTracksFromSeeds(spotifyApi, seeds) {
		let groupedSeeds = groupBy(seeds,
			(uri) => uri.split(':')[1], // grabs the type
			(uri) => uri.split(':')[2]); // grabs the id)
		let tracks = await spotifyApi.getRecommendations({
			'seed_artists': groupedSeeds.artist,
			'seed_genres': groupedSeeds.genre,
			'seed_tracks': groupedSeeds.track,
			'seed_albums': groupedSeeds.album,
		});
		return tracks.body.tracks.map((x) => x.uri);
	}

	async addTracksToPlaylist(apiKey, userId, playlistId, tracks) {
		// don't use spotify-api-node b/c it is broken
		const uriEncode = encodeURIComponent;
		const url = SPOTIFY_BASE +
			`${uriEncode(userId)}/playlists/${uriEncode(playlistId)}/tracks`;

		return await request
			.post(url, {
				headers: { 'Authorization': `Bearer ${apiKey}` },
				body: { uris: tracks },
				json: true,
			}); //eslint-disable-line
	}

	async createEmptyPlaylist(spotifyApi) {
		let dt = DATETIME.create();
		let formatted = dt.format('m-d H:M');
		let user = await spotifyApi.getMe();
		user = user.body;

		let playlist = await spotifyApi.
			createPlaylist(user.id, 'Troubadour ' + formatted);

		return [user, playlist.body];
	}

	async aggregatePreferences(spotifyApi, spotifyUris) {
		if (spotifyUris.length <= 5) {
			return spotifyUris;
		}

		/* Group URIs by type, reduce to list of responses for each type */
		let promises = [];

		let uriByType = groupBy(spotifyUris,
			(uri) => uri.split(':')[1], // grabs the type from the uri
			(uri) => uri.split(':')[2]  // grabs the id
		);

		if (uriByType.artist) {
			let promise = spotifyApi
				.getArtists(uriByType.artist)
				.then((result) => {
					return {
						artists: result.body.artists,
					};
				});

			promises.push(promise);
		}

		if (uriByType.track) {
			let promise = spotifyApi
				.getTracks(uriByType.track)
				.then((result) => {
					return {
						tracks: result.body.tracks,
					};
				});

			promises.push(promise);
		}

		if (uriByType.album) {
			let promise = spotifyApi
				.getAlbums(uriByType.album)
				.then((result) => {
					return {
						albums: result.body.albums,
					};
				});

			promises.push(promise);
		}

		let finished = await Promise.all(promises);
		let data = finished.reduce((out, item) => {
			return Object.assign(out, item);
		}, {
			artists: [],
			albums: [],
			tracks: [],
		});

		/* Get artists from albums and tracks */
		let additionalArtists = [];

		for (let i = 0; i < data.albums.length; i++) {
			for (let artist of data.albums[i].artists) {
				additionalArtists.push(artist.id);
			}
		}

		for (let i = 0; i < data.tracks.length; i++) {
			for (let artist of data.tracks[i].artists) {
				additionalArtists.push(artist.id);
			}
		}

		let value = await spotifyApi.getArtists(additionalArtists);
		let artists = data.artists.concat(value.body.artists);

		/* Get frequencies for each artist and genre. */
		let artistCount = {};
		let genreCount = {};
		let artistTotal = 0;
		let genreTotal = 0;
		let genreURI = '';

		for (let genre of uriByType.genre) {
			genreURI = 'spotify:genre:' + genre;
			if (!(genreURI in genreCount)) {
				genreCount[genreURI] = 1;
			} else {
				genreCount[genreURI] += 1;
			}
			genreTotal += 1;
		}

		for (let artist of artists) {
			if (artist.genres) {
				for (let genre in artist.genres) {
					if (genre in GENRES) {
						genreURI = 'spotify:genre:' + genre;
						if (!(genreURI in genreCount)) {
							genreCount[genreURI] = 1;
						} else {
							genreCount[genreURI] += 1;
						}
						genreTotal += 1;
					}
				}
			}

			if (!(artist.uri in artistCount)) {
				artistCount[artist.uri] = 1;
			} else {
				artistCount[artist.uri] += 1;
			}
			artistTotal += 1;
		}

		/* Filter out preferences below the popularity threshold. */
		let sortedArtist = [];
		let sortedGenre = [];
		let ratio = 0;

		for (let artist in artistCount) {
			ratio = artistCount[artist] * (1.0 / artistTotal);
			// if (ratio >= .25) {
			sortedArtist.push([artist, ratio]);
			// }
		}

		for (let genre in genreCount) {
			ratio = genreCount[genre] * (1.0 / genreTotal);
			// if (ratio >= .25) {
			sortedGenre.push([genre, ratio]);
			// }
		}

		/* Sort by ratio and return the most popular references */
		let final = [];

		sortedArtist.sort(function (a, b) {
			return b[1] - a[1];
		});

		sortedGenre.sort(function (a, b) {
			return b[1] - a[1];
		});

		for (let i = 0; i < 3; i++) {
			if (i < sortedArtist.length) {
				final.push(sortedArtist[i][0]);
			}
		}

		for (let i = 0; i < 2; i++) {
			if (i < sortedGenre.length) {
				final.push(sortedGenre[i][0]);
			}
		}

		return final;
	}
}
