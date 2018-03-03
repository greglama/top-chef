## What does this app do ?
This application scraps Michelin website in order to get a list (and all the related data) of starred restaurant in France.
Then it tries to match the restaurants with offers and promotions on the La Fourchette website. Finally all these data will be display on a website running on a node server.

## How could you use it ?
It's pretty straightforward to use. Open a terminal while on the folder and type 
```{sh}
npm install
```
then type npm run.
The server will process all the restaurants and offers, this process usually takes around 30 seconds.
Then the server will display on the consol : "Server is now listening on port 3000". 
This means you can safely go to your browser and go to http://localhost:3000/ . 
You can now scroll down and look at the restaurants and offers.
