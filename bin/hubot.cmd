@echo off

call npm install
SETLOCAL
SET PATH=node_modules\.bin;node_modules\hubot\node_modules\.bin;%PATH%
SET HUBOT_DISCORD_TOKEN=MjUxNjUxNTQ5ODA0MTAxNjMy.CzBZig.VtYHtAaCbmYY_2gZ_tUVAqIhSIM
SET HUBOT_MAX_MESSAGE_LENGTH=2000
export HUBOT_EVENT_NOTIFIER_ROOM="general"

node_modules\.bin\hubot.cmd --name "mogai" %* 
