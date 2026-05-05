const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const { PodaciZaPrijavu } = require('./models');
const authRoutes = require('./routes/authRoutes');
const profilRoutes = require('./routes/profilRoutes');
const tezinaRoutes = require('./routes/tezinaRoutes');
const aktivnostRoutes = require('./routes/aktivnostRoutes');
const metrikaRoutes = require('./routes/metrikaRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/profil', profilRoutes);
app.use('/tezina', tezinaRoutes);
app.use('/aktivnost', aktivnostRoutes);
app.use('/metrika', metrikaRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API radi' });
});

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('Baza spojena');
    app.listen(PORT, () => {
      console.log(`Server radi na portu ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Greška spajanja baze:', err);
  });

PodaciZaPrijavu.findAll()
  .then(data => console.log('Test OK:', data.length))
  .catch(err => console.error(err));