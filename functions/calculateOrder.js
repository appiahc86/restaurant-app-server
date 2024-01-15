const db = require("../config/db");
const logger = require("../winston");
const {formatNumber} = require("./index");

const calculateOrder = async (cart, deliveryAddress, paymentMethod, note) => {
   try {

       let minOrder = 0;
       let deliveryFee = 0;


       //Get zipcode data
       const query = await db("zipcodes")
           .where("zipCode", deliveryAddress.postCode).limit(1);

       //******************* Zipcode Validation *************
       if (!query.length){
           return {error: "Geben Sie eine gültige Postleitzahl ein"} //Enter valid zipcode
       }

       deliveryFee = query[0].deliveryFee;
       minOrder = query[0].minOrder;


       const ids = []; //Get all product Ids
       for (const cartElement of cart) {
           ids.push(cartElement.id)
       }

       //Query db with product Ids
       const menuItems = await db('menuItems')
           .join('menu', 'menuItems.menuId', '=','menu.id')
           .select('menuItems.id', 'menuItems.name', 'menuItems.price',
               'menuItems.choiceOf','menu.id as menuId','menu.name as menu'
           )
           .whereIn('menuItems.id', ids);

       //Map array to Parse JSON to js object or array
       menuItems.map(men => men.choiceOf = JSON.parse(men.choiceOf));


       const newCart = [];


       for (const cartElement of cart) { //From client
           for (const menuItem of menuItems) { //From server
               if (cartElement.id.toString() === menuItem.id.toString()){ //If match found
                   const id = menuItem.id;
                   const name = menuItem.name;
                   const menu = menuItem.menu;
                   const menuId = menuItem.menuId;
                   const qty = parseInt(cartElement.qty);
                   let selectedChoice = "";
                   let price = parseFloat(menuItem.price);

                   //check selected option from customer
                   for (const choice of menuItem.choiceOf) {
                       if (cartElement.selectedChoice === choice.name){ // update price
                           price = parseFloat(choice.price);
                           selectedChoice = choice.name;
                       }
                   }

                   //Push to new cart array
                   newCart.push({
                        id, name, menu, menuId, qty, selectedChoice, price
                   })
               }
           }
       }

       //Check for minimum order
       let total = 0;
       for (const crt of newCart) {
           total += parseFloat(crt.price) * parseInt(crt.qty);
       }

       if (total < minOrder){
           return {
               error: `Der Mindestbestellwert beträgt ${formatNumber(minOrder)} €`
           }
       }


       return {
           cart: newCart,
           deliveryAddress,
           deliveryFee,
           paymentMethod,
           total: (total + deliveryFee).toFixed(2),
           note
       }

   }catch (e) {
       logger.info("calculate order function")
       logger.error(e);
       return {
           error: `Leider war Ihre Anfrage nicht erfolgreich` //Sorry your request was not successful
       }
   }
}



module.exports = {
    calculateOrder
}