// openPages.js
const open = require("open");

// URLs a abrir (asegúrate de que npm start levante el servidor en http://localhost:3000)
const urls = [
  "http://localhost:3000/Login",
  "http://localhost:3000/DenunciaForm"
];

// Abrir cada URL en el navegador predeterminado
urls.forEach(url => {
  open(url);
});
