const express = require('express');

var app = express();
app.use(express.static('public'));

app.get('/', (request, response) =>
{
    response.sendFile("index.html");
});

app.listen(3000, function()
{
    console.log("listening on port 3000");
});