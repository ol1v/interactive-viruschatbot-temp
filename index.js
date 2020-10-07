const builder = require('botbuilder');
const restify = require('restify');
      
const connector = new builder.ChatConnector();
const bot = new builder.UniversalBot(
    connector,
    [
        (session) => {
            session.send('Use the lookup command and paste a URL <lookup http://www.example.com> to se if the URL is malicious');
        }
    ]
).set('storage', new builder.MemoryBotStorage());

const dialog = new builder.IntentDialog();

dialog.matches(/^lookup/i, [
    function (session, args, next) {
        console.log(session);
        var conversationId =
    session.message.address.conversation.id;
        session.send('Looking up...')
    }
]);
      
const server = restify.createServer();
server.post('/api/messages', connector.listen());
server.listen(3978);
console.log('Listening on port 3978');
