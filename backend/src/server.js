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
  res.json({ message: 'API is running' });
});

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

PodaciZaPrijavu.findAll()
  .then(data => console.log('Test OK:', data.length))
  .catch(err => console.error(err));