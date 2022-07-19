'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class troubadourusers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  troubadourusers.init({
    user_id: DataTypes.STRING,
    spotify_id: DataTypes.STRING,
    last_location: DataTypes.GEOMETRY,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'troubadourusers',
  });
  return troubadourusers;
};