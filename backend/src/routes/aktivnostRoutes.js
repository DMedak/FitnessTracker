const express = require('express');
const router = express.Router();

const { createAktivnost, getAktivnostiByKorisnik, deleteAktivnost } = require('../controllers/aktivnostController');

router.post('/', createAktivnost);
router.get('/:korisnickoIme', getAktivnostiByKorisnik);
router.delete('/:korisnickoIme/:datumAktivnosti/:vrstaAktivnosti', deleteAktivnost);

module.exports = router;