const { KorisnickiProfil } = require('../models');

const createProfil = async (req, res) => {
  try {
    const { korisnickoIme, dob, spol, visina, trenutnaTezina, cilj } = req.body;

    if (!korisnickoIme) {
      return res.status(400).json({ message: 'Korisničko ime je obavezno.' });
    }

    const profil = await KorisnickiProfil.create({
      korisnickoIme,
      dob,
      spol,
      visina,
      trenutnaTezina,
      cilj,
    });

    return res.status(201).json({
      message: 'Profil uspješno kreiran.',
      profil,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Greška kod kreiranja profila.',
      error: error.message,
    });
  }
};

const getProfil = async (req, res) => {
  try {
    const { korisnickoIme } = req.params;

    const profil = await KorisnickiProfil.findByPk(korisnickoIme);

    if (!profil) {
      return res.status(404).json({ message: 'Profil nije pronađen.' });
    }

    return res.json(profil);
  } catch (error) {
    return res.status(500).json({
      message: 'Greška kod dohvaćanja profila.',
      error: error.message,
    });
  }
};

module.exports = {
  createProfil,
  getProfil,
};