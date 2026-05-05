const express = require('express');
const router = express.Router();

const { createOrUpdateMetrika, getMetrikaByKorisnik } = require('../controllers/metrikaController');

router.post('/', createOrUpdateMetrika);
router.get('/:korisnickoIme', getMetrikaByKorisnik);

module.exports = router;