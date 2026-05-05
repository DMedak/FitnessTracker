const { TjelesnaMetrika } = require('../models');

const createOrUpdateMetrika = async (req, res) => {
  try {
    const { korisnickoIme, bmi, procjenaTjelesneMase, procjenaKalorija } = req.body;

    const [metrika, created] = await TjelesnaMetrika.upsert({
      korisnickoIme,
      bmi,
      procjenaTjelesneMase,
      procjenaKalorija,
    });

    return res.status(created ? 201 : 200).json({
      message: created ? 'Metrika uspješno kreirana.' : 'Metrika uspješno ažurirana.',
      metrika,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Greška kod spremanja metrike.',
      error: error.message,
    });
  }
};

const getMetrikaByKorisnik = async (req, res) => {
  try {
    const { korisnickoIme } = req.params;

    const metrika = await TjelesnaMetrika.findByPk(korisnickoIme);

    if (!metrika) {
      return res.status(404).json({ message: 'Metrika nije pronađena.' });
    }

    return res.json(metrika);
  } catch (error) {
    return res.status(500).json({
      message: 'Greška kod dohvaćanja metrike.',
      error: error.message,
    });
  }
};

module.exports = {
  createOrUpdateMetrika,
  getMetrikaByKorisnik,
};