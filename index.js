const builder = require('botbuilder');
const restify = require('restify');
const fetch = require("node-fetch");

var inMemoryStorage = new builder.MemoryBotStorage();
const connector = new builder.ChatConnector();

// ###################################
// ########### BOT ###################
// ###################################

const bot = new builder.UniversalBot(
    connector, [
        (session) => {
            if(session.message.text.includes('lookupurl')) {
                session.beginDialog('lookupurl')
            } else{
                session.beginDialog('howto');
            } 
        }
        
    ]).set('storage', inMemoryStorage)

 // ###################################
 // ########### DIALOGS ###############
 // ###################################

    bot.dialog('howto', [
        function (session) {    
            builder.Prompts.text(session, 'Hi! Im an anti-malwarebot. Ill scan URLs, filehashes and IPs for malware. Type anything to see a list of commands.');
            
        },
        function (session) {
            session.endDialog(`List of commands: \r lookupurl www.example.com \r lookupip 123.123.123.123 \r lookupfilehash HsHQ1pswOS4OZ5o6mPZLwMOPAo`);
        }
    ])

    bot.dialog('lookupurl', [
        function (session) {    
            
                
                let url = session.message.text.replace('lookupurl','')
                session.send('Looking up ' + url).endDialog;
            
                // Check string format and decide if it's a filehash or url
            
                //Convert url to base64 string
                const url_encoded = convert_to_base64(url)
            
                get_url(url_encoded, function(res){
                    session.sendTyping();
                    setTimeout(function() {
                        var msg = new builder.Message(session);
                        msg.attachmentLayout(builder.AttachmentLayout.carousel)
                        msg.attachments([
                            new builder.HeroCard(session)
                            .title('VirusTotal Results')
                            .subtitle(res.url)
                            .text(`\r clean: ${res.clean} \r
                                   suspicious: ${res.suspicious} \r
                                   undetected: ${res.undetected} \r
                                   malicious: ${res.malicious}`)
                            .buttons([
                                builder.CardAction.imBack(session, 'Full Details', 'See Details')
                            ])
                        ])
                        session.send(msg)
                    }, 3000);
                })                    
                
                if(session.message.text.includes('Full Details')) {
                    session.endDialog('Heres the full details!')
                    
                }
            
        },
        function (session, result) {
            session.endDialog(`List of commands: \r lookupurl www.example.com \r lookupip 123.123.123.123 \r lookupfilehash HsHQ1pswOS4OZ5o6mPZLwMOPAo`);
        }
    ])

 // ###################################
 // ########### FUNCTIONS #############
 // ###################################

function convert_to_base64(url) {
    //encoding url
    const buf = Buffer.from(url, 'utf8')

    // return base64 decoded string and strip =
    return buf.toString('base64').replace('=','')
}

function is_valid_url(string) {
    try {
      new URL(string);
    } catch (_) {
      return false;  
    }
  
    return true;
  }

  // Virus total URL
const get_url = (url_encoded, callback) => {
    fetch('https://www.virustotal.com/api/v3/urls/' + url_encoded, {
                    method: 'GET',
                    headers: {
                        'x-apikey': ''
                    }
                }).then(response => response.json())
                  .then(data => {
                    
                    // ################################# INSERT ERROR HANDELING ##################################################################

                    console.log(data.data.attributes)
                    // variables for result object
                    let analyzed_summarize = data.data.attributes.last_analysis_stats

                    let analyzed = data.data.attributes.last_analysis_results
                    let clean = analyzed_summarize.harmless;
                    let malicious = analyzed_summarize.malicious;
                    let suspicious = analyzed_summarize.suspicious;
                    let undetected = analyzed_summarize.undetected;
                    let sites = []
                    let url = data.data.attributes.last_final_url

                    for(const [key, value] of Object.entries(analyzed)) {

                        sites.push(`${key}: ${value.result}`)
                        console.log(`${key}: ${value.result}`)
                    }

                    let result = {
                        clean: clean,
                        malicious: malicious,
                        suspicious: suspicious,
                        undetected: undetected,
                        details: sites,
                        url: url

                    }
                    callback(result);
                  })
                    
                    
                    
}
// URLScan


const server = restify.createServer();
server.post('/api/messages', connector.listen());
server.listen(3978);
console.log('Listening on port 3978');

