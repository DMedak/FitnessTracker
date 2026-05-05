const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TjelesnaMetrika = sequelize.define('TjelesnaMetrika', {
  korisnickoIme: {
    type: DataTypes.STRING,
    primaryKey: true,
    field: 'korisnicko_ime',
  },
  bmi: {
    type: DataTypes.DECIMAL(5, 2),
  },
  procjenaTjelesneMase: {
    type: DataTypes.STRING,
    field: 'procjena_tjelesne_mase',
  },
  procjenaKalorija: {
    type: DataTypes.DECIMAL(8, 2),
    field: 'procjena_kalorija',
  },
}, {
  tableName: 'tjelesna_metrika',
  timestamps: false,
});

module.exports = TjelesnaMetrika;