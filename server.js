'use strict';

const express = require('express');
const Slapp = require('slapp');
const ConvoStore = require('slapp-convo-beepboop');
const Context = require('slapp-context-beepboop');
const AwsModule = require('./libs/AwsDynamicDb.js');
const _ = require('lodash');
// use `PORT` env var on Beep Boop - default to 3000 locally
let port = process.env.PORT || 3000;

let slapp = Slapp({
    // Beep Boop sets the SLACK_VERIFY_TOKEN env var
    verify_token: process.env.SLACK_VERIFY_TOKEN,
    convo_store: ConvoStore(),
    context: Context()
});



let HELP_TEXT = `
I will respond to the following messages:
\`help\` - to see this message.
\`configure\` - to connect you to your teamwork desk application
\`thanks\` - to demonstrate a simple response.
\`<type-any-other-text>\` - to demonstrate a random emoticon response, some of the time :wink:.
\`attachment\` - to see a Slack attachment message.
`;

//*********************************************
// Setup different handlers for messages
//*********************************************

// response to the user typing "help"
slapp.message('help', ['mention', 'direct_message'], (msg) => {
  msg.say(HELP_TEXT)
});
// Configure
slapp
    .message('^(config)$', ['direct_mention', 'direct_message'], (msg) =>{
        AwsModule.getSlackTeamDataFromMsg(msg,function (err,data){
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                if( _.isEmpty(data)){
                    msg
                        .say('Okay, lets begin. What it your teamwork desk team name?')
                        .route('set-team-name')

                }else {
                    msg
                        .say('It appears your team is already configured as '  + data.Item.data.deskTeamName )
                        .route('set-team-name')
                }
            }

        });
})
    .route('set-team-name',(msg,state) => {
        let text = (msg.body.event && msg.body.event.text) || '';

        // user may not have typed text as their next action, ask again and re-route
        if (!text) {
            return msg
                .say("Whoops, still waiting for your team name")
                .say('What is your team name?')
                .route('set-team-name', state)
        }
        state.deskTeamName = text;

        msg
            .say(`Ok then. whats your API key?`)
            .route('api-key', state)

    })
    .route('api-key',(msg, state) => {
        let text = (msg.body.event && msg.body.event.text) || '';
        // user may not have typed text as their next action, ask again and re-route
        if (!text) {
            return msg
                .say("can you please provide your api key?.")
                .route('api-key', state)
        }
        state.deskApiKey = text;
        msg
            .say(`Here is what I trying to use to connect with : \`\`\`${JSON.stringify(state)}\`\`\``);
        AwsModule.CreateTeam(msg,state)
    });

// "Conversation" flow that tracks state - kicks off when user says hi, hello or hey
slapp
  .message('^(hi|hello|hey)$', ['direct_mention', 'direct_message'], (msg, text) => {
    msg
      .say(`${text}, how are you?`)
      // sends next event from user to this route, passing along state
      .route('how-are-you', { greeting: text })
  })
  .route('how-are-you', (msg, state) => {
    let text = (msg.body.event && msg.body.event.text) || '';

    // user may not have typed text as their next action, ask again and re-route
    if (!text) {
      return msg
        .say("Whoops, I'm still waiting to hear how you're doing.")
        .say('How are you?')
        .route('how-are-you', state)
    }

    // add their response to state
    state.status = text;

    msg
      .say(`Ok then. What's your favorite color?`)
      .route('color', state)
  })
  .route('color', (msg, state) => {
    let text = (msg.body.event && msg.body.event.text) || '';

    // user may not have typed text as their next action, ask again and re-route
    if (!text) {
      return msg
        .say("I'm eagerly awaiting to hear your favorite color.")
        .route('color', state)
    }

    // add their response to state
    state.color = text;

    msg
      .say('Thanks for sharing.')
      .say(`Here's what you've told me so far: \`\`\`${JSON.stringify(state)}\`\`\``);
    // At this point, since we don't route anywhere, the "conversation" is over
  });

// Can use a regex as well
slapp.message(/^(thanks|thank you)/i, ['mention', 'direct_message'], (msg) => {
  // You can provide a list of responses, and a random one will be chosen
  // You can also include slack emoji in your responses
  msg.say([
    "You're welcome :smile:",
    'You bet',
    ':+1: Of course',
    'Anytime :sun_with_face: :full_moon_with_face:'
  ])
});

// demonstrate returning an attachment...
slapp.message('attachment', ['mention', 'direct_message'], (msg) => {
  msg.say({
    text: 'Check out this amazing attachment! :confetti_ball: ',
    attachments: [{
      text: 'Slapp is a robust open source library that sits on top of the Slack APIs',
      title: 'Slapp Library - Open Source',
      image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
      title_link: 'https://beepboophq.com/',
      color: '#7CD197'
    }]
  })
});

// Catch-all for any other responses not handled above
slapp.message('.*', ['direct_mention', 'direct_message'], (msg) => {
  // respond only 40% of the time
  if (Math.random() < 0.4) {
    msg.say([':wave:', ':pray:', ':raised_hands:'])
  }
});

// attach Slapp to express server
let server = slapp.attachToExpress(express());

// start http server

// Setup AWS connection
AwsModule.createTable();
server.listen(port, (err) => {
  if (err) {
    return console.error(err)
  }

  console.log(`Listening on port ${port}`)
});
