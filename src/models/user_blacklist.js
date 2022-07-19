const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

	const UserBlacklist = sequelize.define('UserBlacklist', {
    preference_id: {type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true},
    spotify_uri: DataTypes.TEXT,
    name: DataTypes.TEXT,
    user_id: {
      type: DataTypes.TEXT,
      references: {
        model: require('./troubadour_user'),
        key: 'user_id',
      },
    },
  }, {timestamps: false, tableName: 'user_blacklist'});
  return UserBlacklist;
}
