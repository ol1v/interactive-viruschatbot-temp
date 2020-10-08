const builder = require('botbuilder');
const restify = require('restify');
const fetch = require("node-fetch");
      
const connector = new builder.ChatConnector();
const bot = new builder.UniversalBot(
    connector,
    [
        (session) => {
            if(session.message.text.includes('lookup')) {
                let url = session.message.text.replace('lookup','')
                session.send('Looking up ' + url)

                //Convert url to base64 string
                const url_encoded = convert_to_base64(url)
                
                //Breakout to function when finished TBC
                fetch('https://www.virustotal.com/api/v3/urls/' + url_encoded, {
                    method: 'GET',
                    headers: {
                        'x-apikey': 'your-api-key-here'
                    }
                }).then(response => response.json())
                  .then(data => console.log(data))
                    // Do stuff with data here
                               
            } else {
                session.send('Try: <lookup www.exampleurl.com>');
            }
        }
    ]
).set('storage', new builder.MemoryBotStorage());

function convert_to_base64(url) {
    //encoding url
    const buf = Buffer.from(url, 'utf8')

    // return base64 decoded string and strip =
    return buf.toString('base64').replace('=','')
}

const server = restify.createServer();
server.post('/api/messages', connector.listen());
server.listen(3978);
console.log('Listening on port 3978');

