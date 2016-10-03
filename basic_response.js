exports.isHi = function(sentences){
  var output = ""
  var lower_s = sentences.toLowerCase()
  switch (lower_s) {
    case 'hi':
    case 'hello':
      output = "Hello! Thanks for your message."
      break;
    default:
      output = "Sorry, I'm learning how to chat with humans. I'm in wit.ai 8-)"
  }
  return output
}
