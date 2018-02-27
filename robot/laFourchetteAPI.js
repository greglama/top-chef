const fetch = require('node-fetch');
const fs = require('fs');

//new String method to get rid of accents
String.prototype.ereaseAccent = function(){
    const accents = [
        "\306","\346",                  //AE, ae
        /[\300-\305]/g, /[\340-\345]/g, // A, a
        /[\310-\313]/g, /[\350-\353]/g, // E, e
        /[\314-\317]/g, /[\354-\357]/g, // I, i
        /[\322-\330]/g, /[\362-\370]/g, // O, o
        /[\331-\334]/g, /[\371-\374]/g, // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g, // C, c
    ];
    const noaccent = ["AE","ae",'A','a','E','e','I','i','O','o','U','u','N','n','C','c'];
     
    let str = this;

    for(var i = 0; i < accents.length; i++){
        str = str.replace(accents[i], noaccent[i]);
    }
    return str;
}

//get the json from an api (the api has to return a json or it won't worked)
const getJsonFromApi = async apiUrl =>
{
    const response = await fetch(apiUrl, "utf-8");
    const content = response.json();

    return content;
}

//get the restaurants from a Json file
const getRestaurantsFromJson = path =>
{
    const content = fs.readFileSync(path, 'utf-8');
    const arrayResataurants = JSON.parse(content);

    return arrayResataurants;
}

//get the lafourchette id of a restaurant, return null if the restaurant doesn't exist
const getIdFrom = async restaurant =>
{
    const name = restaurant.name.ereaseAccent();

    const apiUrl = "https://m.lafourchette.com/api/restaurant-prediction?name=" + name;

    let isTimeout = true;

    //while we have got a timeout we re-run the request
    while(isTimeout)
    {
        try
        {
            const content = await getJsonFromApi(apiUrl);
            const result = content.filter(r => restaurant.postalCode === r.address.postal_code);

            isTimeout = false;
            
            if (result.length > 0)
            {
                return result[0].id;
            }
            else
            {
                return null;
            }
        }
        catch(e)
        {
            if(e.errno !== "ETIMEDOUT")
            {
                

                isTimeout = false;
                return null;
            }
            else
            {
                console.log("timeout at " + apiUrl);
                console.log("this request will be re-send\n");
            }
        }
    }
}

//get the offers of a restaurant with his id (return null if id is null)
const getOffersFrom = async id =>
{
    if(id != null)
    {
        const apiUrl = "https://m.lafourchette.com/api/restaurant/"+ id +"/sale-type";
        const offers = await getJsonFromApi(apiUrl);

        const filteroffers = offers.filter(offer => offer.is_special_offer);
    
        return filteroffers;
    }
    else
    {
        return null;
    }
}

//function to create a restaurant whith the lafourchette features given a michelin restaurant
const LaFourchetteRestaurant = async MichelinRestaurant =>
{
    const id = await getIdFrom(MichelinRestaurant);
    const offers = await getOffersFrom(id);

    return Object.assign(MichelinRestaurant,
    {
        id: id,
        offers: offers
    });
}

//get all the lafouchette data about restaurants from a json file, 
//and return an array of restaurants with lafourchette features beside the michelin features already here.
//if a restaurant is not in the lafourchette data base or if it doesn't have any offer : it won't be on the list
const getLafourchetteData = async path =>
{
    console.log("reading data from " + path + " ...");
    const michelinRestaurantArr = getRestaurantsFromJson(path);

    console.log("get Lafourchette data...");
    const promiseLafourchette = michelinRestaurantArr.map(r => LaFourchetteRestaurant(r));

    console.log("process and wait all the api calls");
    const lafourchetteRestaurantArr = await Promise.all(promiseLafourchette);

    console.log("filter to keep the revelant restaurants")
    const finalList = lafourchetteRestaurantArr.filter(r => r.offers !== null).filter(r => r.offers.length != 0);

    console.log("---\tDONE\t---");
    return finalList;
}