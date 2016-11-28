var LODESTONE_CHAR_URL = "http://na.finalfantasyxiv.com/lodestone/character/";
var arrayFindIndex = require('lodash.findindex');

module.exports = function(robot) {

    robot.respond(/(\bi am\b)(?!.\bnot\b) (.+)/i, function(msg) {
        var storage = new UserStorage(robot);
        var id = msg.match[2];
        var currentU = new User(msg.envelope.user, id);

        storage.addUser(currentU, function(err, message) {
            if(err){
                return msg.reply("I already know you as "+message);
            }
            else {
                return msg.reply("I added you as "+message);
            }
        });
    });
    
    robot.respond(/(\bi am not\b) (.+)/i, function(msg) {
        var storage = new UserStorage(robot);
        var id = msg.match[2];
        var currentU = new User(msg.envelope.user, id);

        storage.removeUser(currentU, function(err, message) {
            if(err){
                return msg.reply("I never knew you as "+id);
            }
            else {
                return msg.reply("I removed "+id+" from your entries");
            }
        });
    });
    
    robot.respond(/(\bsave player\b) (.+) (.+) as (.+)/i, function(msg) {
        var storage = new UserStorage(robot);
        var name = msg.match[2];
        var userId = msg.match[3];
        var id = msg.match[4];
        var currentU = new User({name:name, id:userId}, id);

        storage.addUser(currentU, function(err, message) {
            if(err){
                return msg.reply("I already know "+name+" as "+message);
            }
            else {
                return msg.reply("I added "+name+" as "+message);
            }
        });
    });

    robot.respond(/(\bwho am i\b)/i, function(msg) {
        var storage = new UserStorage(robot);
        var currentU = new User(msg.envelope.user, 0);

        storage.getUser(currentU, function(err, message) {
            if(err){
                return msg.reply("Seems like i can't remember you.");
            }
            else {
                return msg.reply("I know you as :\n"+message);
            }
        });
    });


    return robot.hear(/(\bwho is\b) (.+)/i, function(msg) {
        var storage = new UserStorage(robot);
        var name = msg.match[2];
        var currentU = new User({name:name, id:null}, 0);

        storage.getUser(currentU, function(err, message) {
            if(err){
                return msg.reply("I don't know "+name+".");
            }
            else {
                return msg.reply("I know "+name+" as :\n"+message);
            }
        });
    });
};

function UserStorage(robot){
    var self = this;
    var base;
    if ((base = robot.brain.data).userList == null) {
        base.userList = [];
    }
    self.userList = robot.brain.data.userList;

    self.getUser = function(needle, callback){
        var message = "";
        var foundUser = _findUser(needle);

        if(foundUser){
            foundUser.lodestoneIds.forEach(function(entry) {
                message += LODESTONE_CHAR_URL + entry + "\n";
            });

            callback(false, message);
        }
        else {
            callback(true, message);
        }
    }

    self.addUser = function(newUser,callback){
        var index = _addUser(newUser);

        if( index === -1){
            callback(false, LODESTONE_CHAR_URL + newUser.lodestoneIds[0])
        }
        else {
            if(_addCharId(index, newUser) === -1){
                callback(false, LODESTONE_CHAR_URL + newUser.lodestoneIds[0])
            }
            else {
                callback(true,LODESTONE_CHAR_URL+newUser.lodestoneIds[0]);
            }
        }
    }
    
    self.removeUser = function(needle,callback){
        var foundUser = _findUser(needle);
        var message ="";
        if(foundUser){
            var idIndex = arrayFindIndex(foundUser.lodestoneIds, function(elem){
                return elem === needle.lodestoneIds[0];
            });
            if(idIndex == -1){
                callback(true, message);
            }
            else {
                foundUser.lodestoneIds.splice(idIndex, 1);
                if(foundUser.lodestoneIds.length == 0){
                    var index = arrayFindIndex(self.userList, function(elem){
                        return elem.id === foundUser.id && elem.name === foundUser.name;
                    });
                   
                    self.userList.splice(index, 1);
                }
                callback(false, message);
            }
        }
    }

    function _addUser(newUser){
        var index = arrayFindIndex(self.userList, function(elem){
            return elem.id === newUser.id && elem.name === newUser.name;
        });

        if(index === -1){
            self.userList.push(newUser);
        }
        return index;
    }

    function _addCharId(index, newUser){
        var idIndex = arrayFindIndex(self.userList[index].lodestoneIds, function(elem){
            return elem === newUser.lodestoneIds[0];
        });

        if(idIndex === -1){
            self.userList[index].lodestoneIds.push(newUser.lodestoneIds[0]);
        }
        return idIndex;
    }
    
    function _findUser(needle){
        var index = arrayFindIndex(self.userList, function(elem){
            if(needle.id){
                return elem.id === needle.id && elem.name.toUpperCase() === needle.name.toUpperCase();
            }
            else {
                return elem.name.toUpperCase() === needle.name.toUpperCase();
            }
        });
        
        if(index!==-1){
            return self.userList[index];
        }
        return false;
    }
        
    return self;
}

function User(userObj, charId){
    var self = this;
    self.lodestoneIds = [];
    self.name = userObj.name;
    self.id = userObj.id;
    self.lodestoneIds.push(charId);

    return self;
}



