loveMsg = [
  "<3",
  "I love you too",
  "aww! I love you too",
  "I know.",
  "I have a boyfriend"
]

module.exports = (robot) ->

  robot.respond /where is left?/i, (msg) ->
    msg.reply "Left is there ------------------->"

  robot.respond /where is right?/i, (msg) ->
    msg.reply "<------------ Right is there "

  robot.respond /(\bi love you\b)/i, (msg) ->
    msg.reply msg.random loveMsg

  robot.respond /(\bwhat is love\b\?{0,})/i, (msg) ->
    msg.send "Baby don't hurt me, don't hurt me, no more..."

  robot.respond /\btank (.+)/i, (msg) ->
    tank = msg.match[1]
    msg.send "#{tank} is the TSEB tank!"

  robot.respond /ken lee/i, (msg) ->
    msg.send "Tulibu dibu douchoo!"

  robot.respond /will you marry me?/i, (msg) ->
    msg.send "I'm not desperate."
