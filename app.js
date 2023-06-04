const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Professeur = require("./models/Professeur");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const app = express();

// Activer CORS pour toutes les requêtes
app.use(cors());

// Configuration CORS pour autoriser les requêtes provenant d'un domaine spécifique
// app.use(
//   cors({
//     origin: "https://permutation.vercel.app",
//   })
// );

// Configuration CORS pour autoriser les requêtes avec des méthodes HTTP spécifiques
app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Configuration CORS pour autoriser les requêtes avec des en-têtes personnalisés
app.use(
  cors({
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connexion à la base de données MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());

// Routes pour gérer les professeurs
app.get("/professeurs", async (req, res) => {
  try {
    const professeurs = await Professeur.find();
    res.json(professeurs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.post("/professeurs", async (req, res) => {
  try {
    console.log(req.body);
    const {
      nom,
      prenom,
      tel,
      email,
      grade,
      specialite,
      faculteActuelle,
      villeFaculteActuelle,
      villeDesiree,
      password,
    } = req.body;

    // Générer un salt pour le hachage
    const salt = await bcrypt.genSalt(10);
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer un nouvel objet Professeur avec le mot de passe crypté
    const newProfesseur = new Professeur({
      nom,
      prenom,
      tel,
      email,
      grade,
      specialite,
      faculteActuelle,
      villeFaculteActuelle,
      villeDesiree,
      password: hashedPassword,
    });

    // Enregistrer le professeur dans la base de données
    const savedProfesseur = await newProfesseur.save();
    res.json(savedProfesseur);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.post("/professeurs", async (req, res) => {
  const { email } = req.body;
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingProfesseur = await Professeur.findOne({ email });
    if (existingProfesseur) {
      // Mettre à jour tous les champs avec les valeurs de req.body (en excluant le mot de passe)
      Object.assign(existingProfesseur, req.body);

      const savedProfesseur = await existingProfesseur.save();
      // console.log(savedProfesseur);
      const token = generateToken(savedProfesseur); // Replace with your token generation logic
      res.json({ message: "Authentication successful", token });
    } else {
      // Créer un nouvel utilisateur
      const newProfesseur = new Professeur(req.body);
      const savedProfesseur = await newProfesseur.save();
      res.json(savedProfesseur);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

const generateToken = (userId) => {
  const secretKey = "mido"; // Replace with your own secret key
  const token = jwt.sign({ userId }, secretKey, { expiresIn: "1h" });

  return token;
};

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // Add your authentication logic here
  // For example, you can query the database to find the user with the provided email
  const user = await Professeur.findOne({ email });

  // Perform authentication checks, such as comparing the password hash
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // const isMatch = await user.comparePassword(password);
  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      console.error(err);
      return;
    }

    if (result) {
      // Passwords match
      // Proceed with successful authentication
      //   return res.status(200).json({ message: "Success" });
      // If authentication is successful, you can generate a token or set a session
      // Here, we're sending a success message with a token as a response
      const token = generateToken(user); // Replace with your token generation logic
      return res.json({
        message: "Authentication successful",
        token,
        user: user,
      });
    } else {
      // Passwords do not match
      // Handle authentication failure
      return res.status(401).json({ message: "Invalid email or password" });
    }
  });

  // if (!isMatch) {
  //   return res.status(401).json({ message: "Invalid email or password" });
  // }
});

//app.post('/register', authController.register);

app.post("/forget", async (req, res) => {
  const { email } = req.body;
  try {
    // Add your authentication logic here
    // For example, you can query the database to find the user with the provided email
    const user = await Professeur.findOne({ email });
    // Perform authentication checks, such as comparing the password hash
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = generateToken(user); // Replace with your token generation logic
    res.json({ message: "Token", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/professeurs/:email", async (req, res) => {
  const { email } = req.params;
  try {
    // Ajoutez votre logique d'authentification ici
    // Par exemple, vous pouvez interroger la base de données pour trouver l'utilisateur avec l'email fourni
    const professeur = await Professeur.findOne({ email });

    // Vérifiez si l'utilisateur existe
    if (!professeur) {
      return res.status(404).json({ message: "Professeur not found" });
    }

    // Effectuez d'autres vérifications d'authentification si nécessaire

    // Supprimez le professeur
    await Professeur.deleteOne({ email });

    res.json({ message: "Professeur deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/password/init", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const user = await Professeur.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Générer le hash du mot de passe
    //const hashedPassword = await bcrypt.hash(password, 10);

    // Mettre à jour le mot de passe de l'utilisateur
    user.password = password;
    await user.save();

    return res
      .status(200)
      .json({ message: "Mot de passe initialisé avec succès" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message:
        "Une erreur est survenue lors de l'initialisation du mot de passe",
    });
  }
});

app.get("*", (req, res) => {
  res.status(404).send({ message: "Page not found." });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

async function runMigration() {
  try {
    const professeurs = await Professeur.find({}); // Récupérer tous les enregistrements existants

    // Parcourir chaque professeur et mettre à jour le champ ajouté avec une valeur par défaut
    for (const professeur of professeurs) {
      professeur.password = "AZ#{#GThvF";
      await professeur.save();
    }

    console.log("Migration des données terminée.");
  } catch (error) {
    console.error("Erreur lors de la migration des données :", error);
  }
}

// Appel de la fonction de migration
//runMigration();

module.exports = app;
