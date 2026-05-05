const express = require('express');
const router = express.Router();

const { createProfil, getProfil } = require('../controllers/profilController');

router.post('/', createProfil);
router.get('/:korisnickoIme', getProfil);

module.exports = router;