const express = require('express');
const router = express.Router();

const {
  createProfil,
  getProfil,
  updateProfil,
} = require('../controllers/profilController');

router.post('/', createProfil);
router.get('/:korisnickoIme', getProfil);
router.put('/:korisnickoIme', updateProfil);

module.exports = router;