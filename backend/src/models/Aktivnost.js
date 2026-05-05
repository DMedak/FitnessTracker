const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Aktivnost = sequelize.define('Aktivnost', {
  korisnickoIme: {
    type: DataTypes.STRING,
    primaryKey: true,
    field: 'korisnicko_ime',
  },
  datumAktivnosti: {
    type: DataTypes.DATEONLY,
    primaryKey: true,
    field: 'datum_aktivnosti',
  },
  vrstaAktivnosti: {
    type: DataTypes.STRING,
    primaryKey: true,
    field: 'vrsta_aktivnosti',
  },
  trajanje: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  potrosnjaKalorija: {
    type: DataTypes.DECIMAL(8, 2),
    field: 'potrosnja_kalorija',
  },
  napomena: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'aktivnost',
  timestamps: false,
});

module.exports = Aktivnost;