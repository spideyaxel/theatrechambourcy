
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Configuration portable avec variables d'environnement
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = process.env.DATA_DIR || './data';

// Middleware pour parser le JSON
app.use(express.json());

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Fonctions utilitaires pour la persistance des données
function loadData(filename, defaultValue = []) {
    const filepath = path.join(DATA_DIR, filename);
    try {
        if (fs.existsSync(filepath)) {
            const data = fs.readFileSync(filepath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.warn(`Erreur lors du chargement de ${filename}:`, error.message);
    }
    return defaultValue;
}

function saveData(filename, data) {
    const filepath = path.join(DATA_DIR, filename);
    try {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Erreur lors de la sauvegarde de ${filename}:`, error.message);
        return false;
    }
}

// Stockage persistant des données (portable sur toute plateforme)
let connexions = loadData('connexions.json');
let posts = loadData('posts.json');
let userPhotos = loadData('userPhotos.json');
let textesPdf = loadData('textesPdf.json');
let messagesContact = loadData('messagesContact.json');

// Servir les fichiers statiques (HTML, CSS, images, etc.)
app.use(express.static(__dirname));

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route pour la page admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// API pour enregistrer une connexion
app.post('/api/login', (req, res) => {
    try {
        const { username, success, userAgent, ip } = req.body;
        const connexion = {
            id: Date.now(),
            username: username,
            success: success,
            timestamp: new Date().toISOString(),
            userAgent: userAgent || req.headers['user-agent'],
            ip: ip || req.ip || req.connection.remoteAddress,
            date: new Date().toLocaleDateString('fr-FR'),
            time: new Date().toLocaleTimeString('fr-FR')
        };
        connexions.unshift(connexion);
        saveData('connexions.json', connexions);
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur API login:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// API pour récupérer les connexions
app.get('/api/connexions', (req, res) => {
    res.json(connexions);
});

// API pour supprimer une connexion
app.delete('/api/connexions/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        connexions = connexions.filter(c => c.id !== id);
        saveData('connexions.json', connexions);
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur suppression connexion:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// API pour vider toutes les connexions
app.delete('/api/connexions', (req, res) => {
    try {
        connexions = [];
        saveData('connexions.json', connexions);
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur vidage connexions:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// API pour créer un nouveau post
app.post('/api/posts', (req, res) => {
    try {
        const { title, content, image } = req.body;
        const post = {
            id: Date.now(),
            title: title,
            content: content,
            image: image || null,
            date: new Date().toLocaleDateString('fr-FR'),
            timestamp: new Date().toISOString()
        };
        posts.unshift(post);
        saveData('posts.json', posts);
        res.json({ success: true, post: post });
    } catch (error) {
        console.error('Erreur création post:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// API pour récupérer tous les posts
app.get('/api/posts', (req, res) => {
    res.json(posts);
});

// API pour supprimer un post
app.delete('/api/posts/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        posts = posts.filter(p => p.id !== id);
        saveData('posts.json', posts);
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur suppression post:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// API pour créer une nouvelle photo utilisateur
app.post('/api/user-photos', (req, res) => {
    try {
        const { description, imageUrl, username } = req.body;
        const photo = {
            id: Date.now(),
            description: description,
            imageUrl: imageUrl,
            username: username,
            date: new Date().toLocaleDateString('fr-FR'),
            timestamp: new Date().toISOString()
        };
        userPhotos.unshift(photo);
        saveData('userPhotos.json', userPhotos);
        res.json({ success: true, photo: photo });
    } catch (error) {
        console.error('Erreur création photo:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// API pour récupérer toutes les photos utilisateur
app.get('/api/user-photos', (req, res) => {
    res.json(userPhotos);
});

// API pour supprimer une photo utilisateur
app.delete('/api/user-photos/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        userPhotos = userPhotos.filter(p => p.id !== id);
        saveData('userPhotos.json', userPhotos);
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur suppression photo:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// API pour créer un nouveau texte PDF
app.post('/api/textes-pdf', (req, res) => {
    try {
        const { titre, description, urlPdf } = req.body;
        const textePdf = {
            id: Date.now(),
            titre: titre,
            description: description,
            urlPdf: urlPdf,
            date: new Date().toLocaleDateString('fr-FR'),
            timestamp: new Date().toISOString()
        };
        textesPdf.unshift(textePdf);
        saveData('textesPdf.json', textesPdf);
        res.json({ success: true, textePdf: textePdf });
    } catch (error) {
        console.error('Erreur création texte PDF:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// API pour récupérer tous les textes PDF
app.get('/api/textes-pdf', (req, res) => {
    res.json(textesPdf);
});

// API pour supprimer un texte PDF
app.delete('/api/textes-pdf/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        textesPdf = textesPdf.filter(t => t.id !== id);
        saveData('textesPdf.json', textesPdf);
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur suppression texte PDF:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// API pour créer un nouveau message de contact
app.post('/api/contact', (req, res) => {
    try {
        const { nom, email, sujet, message } = req.body;
        const messageContact = {
            id: Date.now(),
            nom: nom,
            email: email,
            sujet: sujet,
            message: message,
            date: new Date().toLocaleDateString('fr-FR'),
            heure: new Date().toLocaleTimeString('fr-FR'),
            timestamp: new Date().toISOString(),
            lu: false
        };
        messagesContact.unshift(messageContact);
        saveData('messagesContact.json', messagesContact);
        res.json({ success: true, message: messageContact });
    } catch (error) {
        console.error('Erreur création message contact:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// API pour récupérer tous les messages de contact
app.get('/api/contact', (req, res) => {
    res.json(messagesContact);
});

// API pour marquer un message comme lu
app.put('/api/contact/:id/lu', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const message = messagesContact.find(m => m.id === id);
        if (message) {
            message.lu = true;
            saveData('messagesContact.json', messagesContact);
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Message non trouvé' });
        }
    } catch (error) {
        console.error('Erreur marquage message lu:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// API pour supprimer un message de contact
app.delete('/api/contact/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        messagesContact = messagesContact.filter(m => m.id !== id);
        saveData('messagesContact.json', messagesContact);
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur suppression message contact:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Gestion des erreurs globales
process.on('uncaughtException', (error) => {
    console.error('Erreur non gérée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promise rejetée:', reason);
});

// Démarrage du serveur portable
const server = app.listen(PORT, HOST, () => {
    console.log(`\n=== SERVEUR PORTABLE DÉMARRÉ ===`);
    console.log(`Port: ${PORT}`);
    console.log(`Host: ${HOST}`);
    console.log(`Dossier de données: ${DATA_DIR}`);
    console.log(`Node.js version: ${process.version}`);
    console.log(`Application portable prête sur http://${HOST}:${PORT}`);
    console.log(`===============================\n`);
});

server.on('error', (error) => {
    console.error('Erreur serveur:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Le port ${PORT} est déjà utilisé. Essayez un autre port.`);
    }
});
