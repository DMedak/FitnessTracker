const { Aktivnost } = require('../models');

const createAktivnost = async (req, res) => {
  try {
    const {
      korisnickoIme,
      datumAktivnosti,
      vrstaAktivnosti,
      trajanje,
      potrosnjaKalorija,
      napomena,
    } = req.body;

    const aktivnost = await Aktivnost.create({
      korisnickoIme,
      datumAktivnosti,
      vrstaAktivnosti,
      trajanje,
      potrosnjaKalorija,
      napomena,
    });

    return res.status(201).json({
      message: 'Activity saved successfully.',
      aktivnost,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error occurred while saving activity.',
      error: error.message,
    });
  }
};

const getAktivnostiByKorisnik = async (req, res) => {
  try {
    const { korisnickoIme } = req.params;

    const aktivnosti = await Aktivnost.findAll({
      where: { korisnickoIme },
      order: [['datumAktivnosti', 'ASC']],
    });

    return res.json(aktivnosti);
  } catch (error) {
    return res.status(500).json({
      message: 'Error occurred while fetching activities.',
      error: error.message,
    });
  }
};

module.exports = {
  createAktivnost,
  getAktivnostiByKorisnik,
};