const express = require('express');
const laFourchette = require('./laFourchetteAPI.js');

const app = express();
let restaurants = null;

async function launchServer()
{
    restaurants = await laFourchette.getRestaurants("./data/restaurant.json");

    app.use(express.static('public'));

    app.get('/', (request, response) =>
    {
        response.sendFile("index.html");
    });

    app.get('/api/restaurants', (request, response) =>
    {
        response.send(restaurants);
    });

    app.listen(3000, function()
    {
        console.log("listening on port 3000");
    });
}

launchServer();