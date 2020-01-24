var restify = require('restify');
var builder = require('botbuilder');

var inMemoryStorage = new builder.MemoryBotStorage();

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, [
    (session, args, next) => {
        session.send("Welcome, how can we help you?");
        next();
    },

    (session) => {
        builder.Prompts.text(session, `Looking for products, Managing the basket, or want to Checkout?`);
    },

    (session, results) => {
        if (results.response.toLocaleLowerCase().includes("products")) {
            session.beginDialog('/products');
        }
        else if (results.response.toLocaleLowerCase().includes("basket")) {
            session.beginDialog('/basket');
        }
        else if (results.response.toLocaleLowerCase().includes("checkout")) {
            //ToDo
        }
    }
]).set('storage', inMemoryStorage);

bot.dialog('/products', 
    [function (session) {
         builder.Prompts.choice(session, "You have these options:",
          ["Order products", "Remove products from basket"]) 
        },
         
        (session) => {
             builder.Prompts.text(session, "Name of the product you want to order:") 
            },
             
            (session, results) => {
                session.userData.basket = session.userData.basket || []
                session.userData.basket.push(results.response)
                session.send(`"${results.response}" is added to the basket`)
                session.endDialog() //ToDo
             },
            ])

            bot.dialog('/basket', [
            (session) => {
                if (results.response.entity === "List basket contents") {
                    session.send('Products in your basket: ' + session.userData.basket.join(", "))
                    next();
                };
            },
        ])

        bot.dialog('/checkout', [ (session) => {
             //ToDo 
        },
    ])