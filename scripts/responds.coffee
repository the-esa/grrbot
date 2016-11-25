loveMsg = [
  "<3",
  "I love you too",
  "aww! I love you too",
]

module.exports = (robot) ->     

  robot.respond /where is left?/i, (msg) ->
    msg.reply "Left is there ------------------->"

  robot.respond /where is right?/i, (msg) ->
    msg.reply "<------------ Right is there "

  robot.hear /(\bLala\b|\blala\b)/i, (msg) ->
    msg.send "Did you mean potato? http://images.akamai.steamusercontent.com/ugc/543022736890858021/04BE3D54CC9C1209F858E722E15F936BC313ADEE/"

  robot.hear /(\bLalafell\b|\blalafell\b)/i, (msg) ->
    msg.send "Did you mean Falafel? https://i.ytimg.com/vi/foB6bxhZYF0/maxresdefault.jpg"
    
  robot.respond /(\bi love you\b)/i, (msg) ->
    msg.reply msg.random loveMsg