const { PodaciZaPrijavu } = require('../models');

const register = async (req, res) => {
  try {
    const { korisnickoIme, ime, prezime, mail, lozinka } = req.body;

    const cleanKorisnickoIme = korisnickoIme?.trim();
    const cleanIme = ime?.trim();
    const cleanPrezime = prezime?.trim();
    const cleanMail = mail?.trim().toLowerCase();
    const cleanLozinka = lozinka?.trim();

    if (!cleanKorisnickoIme || !cleanIme || !cleanPrezime || !cleanMail || !cleanLozinka) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

    if (!passwordRegex.test(cleanLozinka)) {
      return res.status(400).json({
        message:
          'Password must be at least 6 characters and include one letter and one number.',
      });
    }

    const existingUsername = await PodaciZaPrijavu.findOne({
      where: { korisnickoIme: cleanKorisnickoIme },
    });

    if (existingUsername) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    const existingEmail = await PodaciZaPrijavu.findOne({
      where: { mail: cleanMail },
    });

    if (existingEmail) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    const korisnik = await PodaciZaPrijavu.create({
      korisnickoIme: cleanKorisnickoIme,
      ime: cleanIme,
      prezime: cleanPrezime,
      mail: cleanMail,
      lozinka: cleanLozinka,
    });

    return res.status(201).json({
      message: 'User registered successfully.',
      korisnik,
    });
  } catch (error) {
    console.log('Registration error:', error);

    return res.status(500).json({
      message: 'Error during registration.',
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { korisnickoIme, lozinka } = req.body;

    const cleanKorisnickoIme = korisnickoIme?.trim();
    const cleanLozinka = lozinka?.trim();

    const korisnik = await PodaciZaPrijavu.findOne({
      where: {
        korisnickoIme: cleanKorisnickoIme,
        lozinka: cleanLozinka,
      },
    });

    if (!korisnik) {
      return res.status(401).json({ message: 'Wrong username or password.' });
    }

    return res.json({
      message: 'Login successful.',
      korisnik,
    });
  } catch (error) {
    console.log('Login error:', error);

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