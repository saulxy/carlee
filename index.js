const
http = require('http'),
Bot = require('messenger-bot'),
config = require('config'),
response = require('./basic_response.js')

let Wit = null
let log = null
try {
  // if running from repo
  Wit = require('../').Wit;
  log = require('../').log;
} catch (e) {
  Wit = require('node-wit').Wit;
  log = require('node-wit').log;
}

// Wit.ai parameters
const WIT_TOKEN = config.get('witToken'),
sessions = {}

const fbMessage = (id, text) => {
  const body = JSON.stringify({
    recipient: { id },
    message: { text },
  });
  const qs = 'access_token=' + config.get('pageAccessToken');
  return fetch('https://graph.facebook.com/v2.6/me/messages?' + qs, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body,
  })
  .then(rsp => rsp.json())
  .then(json => {
    if (json.error && json.error.message) {
      throw new Error(json.error.message);
    }
    return json;
  });
};

// Our bot actions
const actions = {
  send({sessionId}, {text}) {
    const recipientId = sessions[sessionId].fbid;
    if (recipientId) {
      return fbMessage(recipientId, text)
      .then(() => null)
      .catch((err) => {
        console.error(
          'Oops! An error occurred while forwarding the response to',
          recipientId,
          ':',
          err.stack || err
        );
      });
    } else {
      console.error('Oops! Couldn\'t find user for session:', sessionId);
      return Promise.resolve()
    }
  },
  addElement({context, entities}) {
    return new Promise(function(resolve, reject) {
      console.log("Inserting record in DB ...")
      //TODO: Logic to save the item in DB
      return resolve(context);
    });
  },
};

// Setting up our bot
const wit = new Wit({
  accessToken: WIT_TOKEN,
  actions,
  logger: new log.Logger(log.INFO)
});

const findOrCreateSession = (fbid) => {
  let sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    // No session found for user fbid, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = {fbid: fbid, context: {}};
  }
  return sessionId;
};

let bot = new Bot({
  token: config.get('pageAccessToken'),
  verify: config.get('validationToken'),
  app_secret: config.get('appSecret')
})

bot.on('error', (err) => {
  console.log(err.message)
})

bot.on('message', (payload, reply) => {
  if (payload.message && !payload.message.is_echo) {
    const sender = payload.sender.id
    const sessionId = findOrCreateSession(sender)
    const {text, attachments} = payload.message

    if (attachments) {
      fbMessage(sender, 'Sorry I can only process text messages for now.')
      .catch(console.error)
    } else if (text) {
      wit.runActions(
        sessionId, // the user's current session
        text, // the user's message
        sessions[sessionId].context // the user's current session state
      ).then((context) => {
        console.log('Waiting for next user messages');
        sessions[sessionId].context = context;
      })
      .catch((err) => {
        console.error('Oops! Got an error from Wit: ', err.stack || err);
      })
    }
  } else {
    console.log('received event', JSON.stringify(event));
  }

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err
  })
})

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
http.createServer(bot.middleware()).listen(server_port, server_ip_address)
console.log(`Carlee running at port ${server_port}.`)
