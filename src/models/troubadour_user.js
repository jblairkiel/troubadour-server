export default function(sequelize, DataTypes) {
  return sequelize.define('troubadour_user', {
    user_id: {type: DataTypes.TEXT, primaryKey: true},
    spotify_id: DataTypes.TEXT,
    last_location: DataTypes.GEOGRAPHY('Point', 4326),
    updated_at: DataTypes.DATE,
  }, {timestamps: false, tableName: "troubadour_user"});
}
