const express = require('express');
const router = express.Router();

const { createTezina, getTezineByKorisnik } = require('../controllers/tezinaController');

router.post('/', createTezina);
router.get('/:korisnickoIme', getTezineByKorisnik);

module.exports = router;