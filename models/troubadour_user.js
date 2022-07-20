'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class troubadour_users extends Model {
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
  troubadour_users.init({
    user_id: DataTypes.STRING,
    spotify_id: DataTypes.STRING,
    last_location: DataTypes.GEOMETRY,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'troubadour_users',
  });
  return troubadour_users;
};