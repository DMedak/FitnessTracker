const { PodaciZaPrijavu } = require('../models');

const register = async (req, res) => {
  try {
    const { korisnickoIme, ime, prezime, mail, lozinka } = req.body;

    if (!korisnickoIme || !ime || !prezime || !mail || !lozinka) {
      return res.status(400).json({ message: 'Sva polja su obavezna.' });
    }

    const postoji = await PodaciZaPrijavu.findOne({
      where: { korisnickoIme },
    });

    if (postoji) {
      return res.status(409).json({ message: 'Korisničko ime već postoji.' });
    }

    const korisnik = await PodaciZaPrijavu.create({
      korisnickoIme,
      ime,
      prezime,
      mail,
      lozinka,
    });

    return res.status(201).json({
      message: 'User registered successfully.',
      korisnik,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error during registration.',
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { korisnickoIme, lozinka } = req.body;

    const korisnik = await PodaciZaPrijavu.findOne({
      where: { korisnickoIme, lozinka },
    });

    if (!korisnik) {
      return res.status(401).json({ message: 'Wrong username or password.' });
    }

    return res.json({
      message: 'Login successful.',
      korisnik,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error during login.',
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
};