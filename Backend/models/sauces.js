const mongoose = require('mongoose');


const saucesSchema = mongoose.Schema({
  // UserId du createur
  userId: {
    type: String,
    required: true
  },
  // Nom de la sauce
  name: {
    type: String,
    required: true,
  },
  // Créateur de la sauce
  manufacturer: {
    type: String,
    required: true,
  },
  // description de la sauce
  description: {
    type: String,
    required: true,
  },
  // Ingredients qui pimentent la sauce
  mainPepper: {
    type: String,
    required: true,
  },
  // Adresse de l'image de presentation de la sauce
  imageUrl: {
    type: String,
    required: true
  },
  // Force le piquant de la sauce
  heat: {
    type: Number,
    required: true
  },
  // nombre de Like reçu
  likes: {
    type: Number
  },
  // nombre de dislike reçu
  dislikes: {
    type: Number
  },
  // Utilisateurs qui Like la sauce
  usersLiked: {
    type: [String]
  },
  // Utilisateur qui DisLike la sauce
  usersDisliked: {
    type: [String]
  },
})

module.exports = mongoose.model('sauces', saucesSchema);