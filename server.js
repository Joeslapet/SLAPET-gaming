const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const User = require('./models/user');  // Modèle pour les utilisateurs

const app = express();
app.use(bodyParser.json());

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/file-sharing', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.log('Erreur de connexion MongoDB:', err));

// Middleware pour vérifier si l'utilisateur est admin
const isAdmin = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Accès refusé' });

  try {
    const decoded = jwt.verify(token, 'your_secret_key');
    User.findById(decoded.userId).then(user => {
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès interdit' });
      }
      next();
    });
  } catch (e) {
    res.status(400).json({ message: 'Token invalide' });
  }
};

// Route d'inscription
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) return res.status(400).json({ message: 'Utilisateur déjà existant' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.status(201).json({ message: 'Utilisateur créé avec succès' });
});

// Route de connexion
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'Utilisateur non trouvé' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });

  const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });
  res.json({ token });
});

// Route pour accéder à la page admin
app.get('/admin', isAdmin, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Route pour promouvoir un utilisateur en admin
app.post('/admin/promote', isAdmin, async (req, res) => {
  const { userId, role } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

  user.role = role;
  await user.save();
  res.json({ message: 'Rôle mis à jour' });
});

// Route pour démouvoir un utilisateur
app.post('/admin/demote', isAdmin, async (req, res) => {
  const { userId, role } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

  user.role = role;
  await user.save();
  res.json({ message: 'Rôle mis à jour' });
});

// Route pour supprimer un utilisateur
app.delete('/admin/delete', isAdmin, async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

  await user.remove();
  res.json({ message: 'Utilisateur supprimé' });
});

// Démarrer le serveur
app.listen(5000, () => {
  console.log('Serveur démarré sur http://localhost:5000');
});

