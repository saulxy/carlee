const
http = require('http'),
Bot = require('messenger-bot'),
config = require('config')

let bot = new Bot({
  token: config.get('pageAccessToken'),
  verify: config.get('validationToken'),
  app_secret: config.get('appSecret')
})

bot.on('error', (err) => {
  console.log(err.message)
})

bot.on('message', (payload, reply) => {
  var text = "Tu mensaje fue:" + payload.message.text

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err

    reply({ text }, (err) => {
      if (err) throw err

      console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)
    })
  })
})

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
http.createServer(bot.middleware()).listen(server_port, server_ip_address)
console.log(`Echo bot server running at port ${server_port}.`)
