loveMsg = [
  "<3",
  "I love you too",
  "aww! I love you too",
  "I know."
]

module.exports = (robot) ->     

  robot.respond /where is left?/i, (msg) ->
    msg.reply "Left is there ------------------->"

  robot.respond /where is right?/i, (msg) ->
    msg.reply "<------------ Right is there "
    
  robot.respond /(\bi love you\b)/i, (msg) ->
    msg.reply msg.random loveMsg

  robot.respond /(\bwhat is love\?\b)/i, (msg) ->
    msg.send "Baby don't hurt me, don't hurt me, no more..."
