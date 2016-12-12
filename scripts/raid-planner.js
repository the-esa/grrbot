// Description:
//  Saving events and players
//
// Dependencies:
//   Redis brain
//
// Configuration:
//   none
//
// Author:
//   the-esa
//
// Commands:
//   hubot event help - to get all commands to manage events
//





var moment = require('moment');
var arrayFindIndex = require('lodash.findindex');
var motivationals = [
    "http://www.relatably.com/m/img/motivated-memes/58026171.jpg",
    "http://www.relatably.com/m/img/motivated-memes/d44743bdddb24037ac449e683e29a914fe75a2fb6ee83b4147440f2b37c4a6c8.jpg",
    "http://4.bp.blogspot.com/-5wKIOUwR2R0/VmhKc9Dd8-I/AAAAAAAACTw/6JGyPEPZ-cw/s1600/funny-motivational-memes.jpg",
    "http://3.bp.blogspot.com/-pvmN9Y-mnx4/VmhWlwihuVI/AAAAAAAACVE/jVII3-piEuc/s1600/funny-encouraging-memes.jpg",
    "http://m.memegen.com/ud2ip1.jpg",
    "http://ugc-01.cafemomstatic.com/gen/constrain/500/500/80/2015/08/29/20/51/p3/mo0hkbjw8w24zvn.jpg",
    "http://4.bp.blogspot.com/-1qFqEV9hcpU/VmhJ_xNY2-I/AAAAAAAACTc/OwLLNHrxgkA/s1600/Funny-Motivational-memes.jpg",
    "https://cdn.meme.am/instances/53972850.jpg",
    "https://memecrunch.com/meme/A910M/raid-team-assemble/image.png?w=400&c=1",
    "http://s.quickmeme.com/img/18/18c2f6010e5e9cd3c2b868785cfe6628788beff0f46f89c83b2c55cbae7c1502.jpg",
    "http://www.mememaker.net/static/images/memes/4594152.jpg",
    "http://s2.quickmeme.com/img/b5/b53ccd63ec195b1e2a8647f896b2a8a39c9f67df88b13d5cbb63f04cc7e475e6.jpg",
    "https://cdn.meme.am/cache/instances/folder262/500x/53969262.jpg",
    "http://img.memecdn.com/showtime_o_1077405.jpg",
    "http://www.vomzi.com/wp-content/uploads/2016/02/book-with-shakira-gif.gif"
    ];

var titles = [
    "Head of Potatoes",
    "Beaver Expert",
    "Director of Awesome",
    "\"Fun Club\" President",
    "Digital Overlord",
    "Part-Time Jedi",
    "Twisted Brother",
    "Chief Chatter",
    "Digital Dynamo",
    "Part-Time Czar",
    "Professional Snuggler",
    "Namer of Clouds",
    "Cool Kid"
    ];

module.exports = function(robot) {
    var dateFormat = "DD.MM.YYYY HH:mm";
    var room = process.env["HUBOT_EVENT_NOTIFIER_ROOM"];

    robot.brain.on('loaded', function() {
        var storage = new EventStorage(robot);

        robot.respond(/event help/i, function(msg) {
            return msg.reply("add event [text] on [DD.MM.YYYY] at [HH:mm] - to add an event (careful! this has to be UTC/server time) \r\n"+
                            "list events \r\n"+
                            "list upcoming \r\n"+
                            "show event [index] \r\n"+
                            "delete event [index] \r\n"+
                            "add player [name] as [role] to event [index] \r\n"+
                            "remove player [name]  from event [index] \r\n"
            );
        });

        robot.respond(/add event (.+) on (.+) at (.+)/i, function(msg) {
            var evName = msg.match[1];
            var date = msg.match[2];
            var time = msg.match[3];
            var event = new Event(evName, date, time);

            storage.addEvent(event, function(success,event,pos){
                if(success){
                    return msg.reply("I saved the event "+event.name+' on '+moment(event.date).format(dateFormat)+" with index "+event.pos);
                }
                else{
                    return msg.reply("I already have an event "+event.name+' on '+moment(event.date).format(dateFormat)+" with index "+event.pos); 
                }
            });
        });

        robot.respond(/add player (.+) as (.+) to event (.+)/i, function(msg) {
            var playername = msg.match[1];
            var role = msg.match[2];
            var evPos = msg.match[3];

            var player = new Player(playername,role);

            storage.addPlayer(player, evPos, function(success,message){
                if(success){
                    return msg.reply(message);
                }
                else{
                    return msg.reply(message); 
                }
            });
        });

        robot.respond(/remove player (.+) from event (.+)/i, function(msg) {
            var playername = msg.match[1];
            var evPos = msg.match[2];

            storage.removePlayer(playername, evPos, function(success,message){
                if(success){
                    return msg.reply(message);
                }
                else{
                    return msg.reply(message); 
                }
            });
        });

        robot.respond(/list events/i, function(msg) {
            storage.listEvents(function(success,events){
                if(events.length > 0){
                    return msg.reply("Here are the events i remember:\r\n" + events);
                }
                else{
                    return msg.reply("I don't remember any events."); 
                }
            });
        });

        robot.respond(/show event (.+)/i, function(msg) {
            var pos = msg.match[1];
            storage.getEvent(pos, function(success,text){
                if(success){
                    return msg.reply(text);
                }
                else{
                    return msg.reply("I don't remember an event with index "+pos); 
                }
            });
        });

        robot.respond(/list upcoming/i, function(msg) {
            storage.listUpcoming(function(success,events){
                if(events.length > 0){
                    return msg.reply("Here are the events i remember:\r\n" + events);
                }
                else{
                    return msg.reply("I don't remember any events."); 
                }
            });
        });

        robot.respond(/delete event (.+)/i, function(msg) {
            var pos = msg.match[1];

            storage.deleteEvent(pos, function(success,message){
                if(success){
                    return msg.reply("I deleted the Event " + message);
                }
                else{
                    return msg.reply("I don't remember an event with index "+pos); 
                }
            });
        });

    });

    function Event(evName, date, time){
        var self = this;
        self.name = evName;
        self.date = moment(date + " " + time, dateFormat).format();
        self.players = [];
        self.addPlayer = addPlayer;
        self.removePlayer = removePlayer;
        self.pos;

        self.setPos = function(pos){
            self.pos = pos;
        }

        return self;
    }

    function Player(name,role){
        var self = this;
        self.name = name;
        self.role = role;
        return self;
    }

    function EventStorage(robot){
        var self = this;     
        var base;
        if ((base = robot.brain.data).eventList == null) {
            base.eventList = [];
        }

        self.eventList = robot.brain.data.eventList;
        self.addEvent = addEvent;
        self.listEvents = listEvents;
        self.deleteEvent = deleteEvent;
        self.addPlayer = addPlayer;
        self.removePlayer = removePlayer;
        self.listUpcoming = listUpcoming;
        self.getEvent = getEvent;

        _setTimers();

        function addEvent(newEv, callback){
            var index = arrayFindIndex(self.eventList, function(elem){
                return elem.name === newEv.name && moment(elem.date).isSame(newEv.date,'hour');
            });

            if(index === -1){
                newEv.setPos(self.eventList.length);
                self.eventList.push(newEv);
                _addTimer(newEv);
                callback(true, newEv);
            }
            else {
                callback(false, self.eventList[index]);
            }
        }

        function getEvent(newEv, callback){
            var i = arrayFindIndex(self.eventList, function(elem){
                return String(elem.pos) === String(pos);
            });

            var msg = '';
            var event = self.eventList[i];

            msg += "``` "+event.pos+': ** '+event.name+' **, '+ moment(event.date).format(dateFormat);
            msg += " with: \r\n" + listPlayers(event);
            msg+= " ```";

            callback(true, msg);

        }

        function addPlayer(player, pos, callback){
            var i = arrayFindIndex(self.eventList, function(elem){
                return String(elem.pos) === String(pos);
            });

            if(i===-1){
                callback(false, "I don't remember an event with index "+pos);
            }
            else {
                var event = self.eventList[pos];

                var index = arrayFindIndex(event.players, function(elem){
                    return elem.name === player.name;
                });

                if(index === -1){
                    event.players.push(player);
                    callback(true, "Player "+player.name+" added for "+event.name);
                }
                else {
                    callback(false, "I already have the player listed.");
                }
            }
        }

        function removePlayer(playername, pos, callback){
            var index = arrayFindIndex(self.eventList, function(elem){
                return String(elem.pos) === String(pos);
            });

            if(index===-1){
                callback(false, "I don't remember an event with index "+pos);
            }
            else {
                var event = self.eventList[pos];

                var index = arrayFindIndex(event.players, function(elem){
                    return elem.name === playername;
                });

                if(index === -1){
                    callback(false, "I don't have the player listed.");
                }
                else {
                    event.players.splice(index, 1);
                    callback(true, "Player "+playername+" removed from "+event.name);
                }
            }

        }

        function deleteEvent(pos, callback){
            var index = arrayFindIndex(self.eventList, function(elem){
                return String(elem.pos) === String(pos);
            });

            if(index === -1){
                callback(false, '');
            }
            else {
                var msg = self.eventList[index].name+', '+ moment(self.eventList[index].date).format(dateFormat);
                self.eventList.splice(index, 1);

                callback(true, msg);
            }
        }

        function listEvents(callback){
            var msg = '';
            self.eventList.forEach(function(event) {
                msg += "``` "+event.pos+': **'+event.name+'**, '+ moment(event.date).format(dateFormat)+" ```\r\n";
            });

            callback(true, msg);
        }

        function listUpcoming(callback){
            var msg = '';
            self.eventList.forEach(function(event) {
                var date = moment(event.date);
                var now = moment();
                if(date.isAfter(now)){
                    msg += "``` "+event.pos+': ** '+event.name+' **, '+ moment(event.date).format(dateFormat);
                    msg += " with: \r\n" + listPlayers(event);
                    msg+= " ```";
                }
            });

            callback(true, msg);
        }

        function listPlayers(event){
            var msg ='';
            if(event.players.length > 0){

                event.players.forEach(function(player) {
                    var index = Math.round(Math.random() * (titles.length-1));
                    msg += titles[index]+" ** "+player.name+' ** as '+player.role+"\r\n";  
                });
            }

            return msg;
        }


        function _setTimers(){
            self.eventList.forEach(function(event) {
                _addTimer(event);
            });
        }

        function _addTimer(event){
            var date = moment(event.date);
            var now = moment();

            if(date.isAfter(now)){
                var difference = moment.duration(date.diff(now));                   
                setTimeout(function(){
                    _eventDue(event);
                },difference.asMilliseconds());

                if(difference.asHours() >= 1){
                    setTimeout(function(){
                        _reminderFor(event);
                    },difference.subtract(1,'hour').asMilliseconds());
                }
            }
        }

        function _reminderFor(event){
            robot.messageRoom(room, "** "+event.name+" **\r\n is due at \r\n "+moment(event.date).format(dateFormat)+" with: \r\n"+listPlayers(event));
        }

        function _eventDue(event){
            var index = Math.round(Math.random() * (motivationals.length-1));
            robot.messageRoom(room, "It is time for ** "+event.name+" **!\r\n "+motivationals[index]);
        }

        return self;
    }

};