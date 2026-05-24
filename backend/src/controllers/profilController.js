const { KorisnickiProfil } = require('../models');

const createProfil = async (req, res) => {
  try {
    const { korisnickoIme, dob, spol, visina, trenutnaTezina, cilj } = req.body;

    if (!korisnickoIme) {
      return res.status(400).json({ message: 'Username is required.' });
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
      message: 'Profile created successfully.',
      profil,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error occurred while creating profile.',
      error: error.message,
    });
  }
};

const getProfil = async (req, res) => {
  try {
    const { korisnickoIme } = req.params;

    const profil = await KorisnickiProfil.findByPk(korisnickoIme);

    if (!profil) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    return res.json(profil);
  } catch (error) {
    return res.status(500).json({
      message: 'Error occurred while fetching profile.',
      error: error.message,
    });
  }
};

module.exports = {
  createProfil,
  getProfil,
};