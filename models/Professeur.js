const mongoose = require("mongoose");
const { Schema } = mongoose;

const professeurSchema = new Schema({
  nom: {
    type: String,
    required: true,
  },
  prenom: {
    type: String,
    required: true,
  },
  tel: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  specialite: {
    type: String,
    required: true,
  },
  faculteActuelle: {
    type: String,
    required: true,
  },
  villeFaculteActuelle: {
    type: String,
    required: true,
  },
  villeDesiree: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Professeur = mongoose.model("Professeur", professeurSchema);

module.exports = Professeur;
