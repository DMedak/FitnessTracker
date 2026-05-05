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
      message: 'Korisnik uspješno registriran.',
      korisnik,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Greška kod registracije.',
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
      return res.status(401).json({ message: 'Neispravni podaci za prijavu.' });
    }

    return res.json({
      message: 'Prijava uspješna.',
      korisnik,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Greška kod prijave.',
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
};