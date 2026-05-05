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
      message: 'Aktivnost uspješno spremljena.',
      aktivnost,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Greška kod spremanja aktivnosti.',
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
      message: 'Greška kod dohvaćanja aktivnosti.',
      error: error.message,
    });
  }
};

module.exports = {
  createAktivnost,
  getAktivnostiByKorisnik,
};