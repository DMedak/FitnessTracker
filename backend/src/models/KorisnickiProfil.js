const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KorisnickiProfil = sequelize.define('KorisnickiProfil', {
  korisnickoIme: {
    type: DataTypes.STRING,
    primaryKey: true,
    field: 'korisnicko_ime',
  },
  dob: {
    type: DataTypes.INTEGER,
  },
  spol: {
    type: DataTypes.STRING,
  },
  visina: {
    type: DataTypes.DECIMAL(5, 2),
  },
  trenutnaTezina: {
    type: DataTypes.DECIMAL(5, 2),
    field: 'trenutna_tezina',
  },
  cilj: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'korisnicki_profil',
  timestamps: false,
});

module.exports = KorisnickiProfil;