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
      message: created ? 'Metrics created successfully.' : 'Metrics updated successfully.',
      metrika,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error occurred while saving/updating metrics.',
      error: error.message,
    });
  }
};

const getMetrikaByKorisnik = async (req, res) => {
  try {
    const { korisnickoIme } = req.params;

    const metrika = await TjelesnaMetrika.findByPk(korisnickoIme);

    if (!metrika) {
      return res.status(404).json({ message: 'Metrics not found.' });
    }

    return res.json(metrika);
  } catch (error) {
    return res.status(500).json({
      message: 'Error occurred while fetching metrics.',
      error: error.message,
    });
  }
};

module.exports = {
  createOrUpdateMetrika,
  getMetrikaByKorisnik,
};