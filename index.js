const http = require('http')
const Bot = require('messenger-bot')

let bot = new Bot({
  token: 'EAAJHqDbHHmoBAF00oJHPhOb9XxZBOCiuUa4NsIZAfi62mPCHep1k82LIQyZChIKdKFuasVrtNga896ZBwjciasFOuJqPUpdsvuoZBK6DccqU2lRs7LeZCZC0z8IXEpT4kf5CHtjS3fRIUWrDVk31gA829LiMg8QsyNzJm9efwTWJQZDZD',
  verify: 'WEEABO_TEST',
  app_secret: '53e08e305f84bf58c3db296dea885aa2'
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
