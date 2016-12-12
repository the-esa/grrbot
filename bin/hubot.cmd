@echo off

call npm install
SETLOCAL
SET PATH=node_modules\.bin;node_modules\hubot\node_modules\.bin;%PATH%
SET HUBOT_DISCORD_TOKEN=MjUxNjU2MTk5MDY0MjU2NTEz.Cxm_gg.rBpSinJ_Z1R92qi69dFOUM9MGms
SET HUBOT_MAX_MESSAGE_LENGTH=2000
export HUBOT_EVENT_NOTIFIER_ROOM="174947838290165760"

node_modules\.bin\hubot.cmd --name "mogai" %* 
