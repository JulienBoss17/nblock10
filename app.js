// app.js
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const nodemailer = require("nodemailer");

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

const app = express();
const PORT = process.env.PORT;
const HOST = '0.0.0.0'; 
const MOTDEPASSEAPPLICATION = process.env.MOTDEPASSEAPPLICATION;
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du dossier courant
app.use(express.static(__dirname));

// Route qui envoie un fichier HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/mentionslegales", (req, res) => {
  res.sendFile(path.join(__dirname, "mentionslegales.html"));
});

app.get("/politiquedeconfidentialite", (req, res) => {
  res.sendFile(path.join(__dirname, "politiquedeconfidentialite.html"));
});

app.post("/api/contact", async (req, res) => {
    const { firstName, lastName, email, phone, preferredDate, message } = req.body;
    const dateObj = new Date(preferredDate);
    const formattedDate = dateObj.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });


    // Configuration de ton compte Gmail
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "nbloc10@gmail.com", // 🔹 ton adresse Gmail (celle qui envoie réellement)
            pass: MOTDEPASSEAPPLICATION, // 🔹 mot de passe d'application Gmail
        },
    });

    // Détails de l'email envoyé
    const mailOptions = {
        from: `"${firstName} ${lastName}" <${email}>`, // 🔹 l'expéditeur = celui qui a rempli le formulaire
        to: "nbloc10@gmail.com", // 🔹 ton adresse pour recevoir les messages
        subject: "📬 Nouvelle demande de contact depuis le site vitrine",
        text: 
`Bonjour, 
Vous venez de recevoir une nouvelle demande via le formulaire du site vitrine. Voici les détails :

Nom : ${firstName} ${lastName}
📧 Email : ${email}
📞 Téléphone : ${phone}
📅 Date souhaitée : ${formattedDate}

📝 Message :
${message}

--------------------------------
Ce message a été envoyé depuis le formulaire du magnifique site de Julien.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("📩 Email envoyé avec succès !");
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("❌ Erreur lors de l'envoi de l'email :", err);
        res.status(500).json({ success: false });
    }
});


app.listen(PORT, HOST, () => {
  console.log(`Serveur lancé sur http://${HOST}:${PORT}`);
});

