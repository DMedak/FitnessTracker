const { Tezina } = require('../models');

const createTezina = async (req, res) => {
  try {
    const { korisnickoIme, datumUnosa, tezina, napomena } = req.body;

    const zapis = await Tezina.create({
      korisnickoIme,
      datumUnosa,
      tezina,
      napomena,
    });

    return res.status(201).json({
      message: 'Težina uspješno spremljena.',
      zapis,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Greška kod spremanja težine.',
      error: error.message,
    });
  }
};

const getTezineByKorisnik = async (req, res) => {
  try {
    const { korisnickoIme } = req.params;

    const zapisi = await Tezina.findAll({
      where: { korisnickoIme },
      order: [['datumUnosa', 'ASC']],
    });

    return res.json(zapisi);
  } catch (error) {
    return res.status(500).json({
      message: 'Greška kod dohvaćanja težina.',
      error: error.message,
    });
  }
};

module.exports = {
  createTezina,
  getTezineByKorisnik,
};