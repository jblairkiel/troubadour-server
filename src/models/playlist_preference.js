const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

	const PlaylistPreference = sequelize.define('PlaylistPreference', {
    playlist_id: {
      type: DataTypes.TEXT,
      references: {
        model: require('./playlist'),
        key: 'user_id',
      },
    },
    preference_id: {
      type: DataTypes.INTEGER,
      references: {
        model: require('./preference'),
        key: 'user_id',
      },
    },
  }, {timestamps: false, tableName: 'playlist_preference'});
  return PlaylistPreference;
}
