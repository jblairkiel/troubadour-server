'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class playlist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      // define association here
    }
  }
  playlist.init({
    playlist_id: DataTypes.STRING,
    created_by: DataTypes.STRING,
    in_progress: DataTypes.BOOLEAN,
    preference_id: DataTypes.INTEGER,
    party_location: DataTypes.GEOGRAPHY("Point", 4326),
    radius: DataTypes.INTEGER

  }, {
    sequelize,
    modelName: 'playlist',
  });
  return playlist;
};