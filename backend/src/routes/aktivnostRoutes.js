const express = require('express');
const router = express.Router();

const { createAktivnost, getAktivnostiByKorisnik } = require('../controllers/aktivnostController');

router.post('/', createAktivnost);
router.get('/:korisnickoIme', getAktivnostiByKorisnik);

module.exports = router;