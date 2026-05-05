const sequelize = require('../config/database');

const PodaciZaPrijavu = require('./PodaciZaPrijavu');
const KorisnickiProfil = require('./KorisnickiProfil');
const TjelesnaMetrika = require('./TjelesnaMetrika');
const Tezina = require('./Tezina');
const Aktivnost = require('./Aktivnost');


// 🔗 RELACIJE

// PodaciZaPrijavu 1 — 1 KorisnickiProfil
PodaciZaPrijavu.hasOne(KorisnickiProfil, {
  foreignKey: 'korisnickoIme',
});
KorisnickiProfil.belongsTo(PodaciZaPrijavu, {
  foreignKey: 'korisnickoIme',
});


// KorisnickiProfil 1 — 1 TjelesnaMetrika
KorisnickiProfil.hasOne(TjelesnaMetrika, {
  foreignKey: 'korisnickoIme',
});
TjelesnaMetrika.belongsTo(KorisnickiProfil, {
  foreignKey: 'korisnickoIme',
});


// KorisnickiProfil 1 — N Tezina
KorisnickiProfil.hasMany(Tezina, {
  foreignKey: 'korisnickoIme',
});
Tezina.belongsTo(KorisnickiProfil, {
  foreignKey: 'korisnickoIme',
});


// KorisnickiProfil 1 — N Aktivnost
KorisnickiProfil.hasMany(Aktivnost, {
  foreignKey: 'korisnickoIme',
});
Aktivnost.belongsTo(KorisnickiProfil, {
  foreignKey: 'korisnickoIme',
});


// 📦 EXPORT
module.exports = {
  sequelize,
  PodaciZaPrijavu,
  KorisnickiProfil,
  TjelesnaMetrika,
  Tezina,
  Aktivnost,
};