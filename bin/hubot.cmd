@echo off

call npm install
SETLOCAL
SET PATH=node_modules\.bin;node_modules\hubot\node_modules\.bin;%PATH%
SET HUBOT_DISCORD_TOKEN=MjUxNjUxNTQ5ODA0MTAxNjMy.CzU7hQ.1aA2_kS-iE2V09GUeKNGKKZehEc
SET HUBOT_MAX_MESSAGE_LENGTH=2000
export HUBOT_EVENT_NOTIFIER_ROOM="174947838290165760"
export HUBOT_HEROKU_WAKEUP_TIME="03:00"
export HUBOT_HEROKU_SLEEP_TIME="03:00"

node_modules\.bin\hubot.cmd --name "mogai" %* 
