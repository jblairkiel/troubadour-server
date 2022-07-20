'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class playlist_preference extends Model {
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
  playlist_preference.init({
    playlist_id: DataTypes.STRING,
    preference_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'playlist_preference',
  });
  return playlist_preference;
};