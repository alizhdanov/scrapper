const mongoose = require('mongoose');

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

// Connect to our Database and handle any bad connections
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

// READY?! Let's go!
require('./models/Flats');

const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

const Flats = mongoose.model('Flats');
const request = require('request');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const baseUrl = 'https://www.bezrealitky.cz/vypis/nabidka-pronajem/byt/praha?priceTo=10000';
const bot = require('./bot')

request(baseUrl, (error, response, html) => {

  if(error) {
    console.log(error)
    return
  }

  const { document } = (new JSDOM(html)).window;

  let records = [...document.querySelectorAll('.record')]
    .map(record => {
      const [rent, utils] = record.querySelector('p.price').textContent.match(/(\d+\.)?\d+/gi).map(d => +d.replace('.', ''));
      const finalPrice = rent + utils;
      const url = record.querySelector('p.short-url').textContent;
      const id = +url.match(/\d+$/)[0];
      return { finalPrice, rent, utils, id, url }
    })

  records.forEach((flat) => {
    Flats
      .findOne({id: flat.id})
      .then((res) => {
        if (res === null) {
          const newFlat = new Flats(flat);
          return newFlat.save()
        }
      })
      .then((res) => {
        if (res) {
          bot.sendMessageTo(`
            final price = ${flat.finalPrice},
            rent - ${flat.rent},
            utils - ${flat.utils},
            url - ${flat.url}
          `)
        }
      })
  })

})