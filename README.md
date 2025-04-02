# 🌍 Garbage Classification HumanAIze

![HumanAIze Logo](https://i.imgur.com/y9vLUyy.png)

Un'applicazione web moderna per la classificazione in tempo reale dei rifiuti utilizzando l'intelligenza artificiale. Il progetto utilizza due modelli di machine learning per rilevare e classificare gli oggetti in diverse categorie di rifiuti.

## ✨ Caratteristiche

- 🎥 Rilevamento in tempo reale tramite webcam
- 🤖 Due modelli di AI disponibili:
  - COCO-SSD per il rilevamento in tempo reale
  - Roboflow per l'analisi di immagini statiche
- 🎯 Classificazione accurata in 6 categorie:
  - 🌱 BIODEGRADABILE
  - 📄 CARTA
  - 🥤 PLASTICA
  - 🔧 METALLO
  - 📦 CARTONE
  - 🍷 VETRO
- 💫 Interfaccia utente moderna con effetti glassmorphism
- 📸 Modalità fotocamera con animazioni
- 🎨 Design responsive e accattivante

## 🚀 Demo

L'applicazione è in grado di:
- Rilevare oggetti in tempo reale
- Classificare i materiali automaticamente
- Fornire feedback visivo con bordi colorati
- Mostrare le percentuali di confidenza
- Catturare e analizzare immagini statiche

## 🛠️ Tecnologie Utilizzate

- HTML5
- CSS3 (Animazioni, Flexbox, Grid)
- JavaScript (ES6+)
- TensorFlow.js (COCO-SSD)
- Roboflow API
- Axios per le chiamate API

## 📦 Installazione

1. Clona il repository:
```bash
git clone https://github.com/tuousername/garbage-classification-humanaize.git
```

2. Naviga nella directory del progetto:
```bash
cd garbage-classification-humanaize
```

3. Apri `index.html` nel tuo browser

⚠️ **Nota**: I modelli AI non sono inclusi nel repository a causa delle dimensioni. Per ottenere accesso ai modelli, contattami in privato.

## 💻 Utilizzo

1. Concedi l'accesso alla webcam quando richiesto
2. Seleziona il modello desiderato:
   - COCO-SSD: per rilevamento in tempo reale
   - Roboflow: per analisi di singole immagini
3. Per COCO-SSD:
   - Clicca "Start Detection" per iniziare
   - Mostra oggetti alla webcam
   - Il sistema classificherà automaticamente
4. Per Roboflow:
   - Clicca "Scatta Foto"
   - Attendi il countdown
   - L'analisi verrà eseguita automaticamente

## 🎨 Personalizzazione

Il sistema è altamente personalizzabile:
- Modifica le soglie di confidenza in `app.js`
- Aggiungi nuove categorie nel mapping dei materiali
- Personalizza i colori nel sistema di classificazione
- Modifica le animazioni in `styles.css`

## 🤝 Contribuire

I contributi sono benvenuti! Per contribuire:
1. Fai un fork del repository
2. Crea un branch per la tua feature
3. Committa le tue modifiche
4. Pusha al branch
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.

## 📧 Contatti

Per ottenere accesso ai modelli AI o per qualsiasi domanda:
- Email: [tuo-email@example.com]
- GitHub: [@tuousername]

## 🙏 Ringraziamenti

- TensorFlow.js team per COCO-SSD
- Roboflow per l'API di object detection
- La community open source per il supporto

---
Fatto con ❤️ da [Il tuo nome] 