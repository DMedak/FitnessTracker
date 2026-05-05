const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tezina = sequelize.define('Tezina', {
  korisnickoIme: {
    type: DataTypes.STRING,
    primaryKey: true,
    field: 'korisnicko_ime',
  },
  datumUnosa: {
    type: DataTypes.DATEONLY,
    primaryKey: true,
    field: 'datum_unosa',
  },
  tezina: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  napomena: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'tezina',
  timestamps: false,
});

module.exports = Tezina;