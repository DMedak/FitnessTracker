const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PodaciZaPrijavu = sequelize.define('PodaciZaPrijavu', {
  korisnickoIme: {
    type: DataTypes.STRING,
    primaryKey: true,
    field: 'korisnicko_ime',
  },
  ime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prezime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mail: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  lozinka: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'podaci_za_prijavu',
  timestamps: false,
});

module.exports = PodaciZaPrijavu;