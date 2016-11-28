var moment = require('moment');

module.exports = function(robot) {

    robot.respond(/event (.+) on (.+) at (.+)/i, function(msg) {
        var evName = msg.match[1];
        var date = msg.match[2];
        var time = msg.match[3];
        var event = new Event(evName, date, time);

    });
    
    function Event(evName, date, time){
        var self = this;
        self.name = evName;
        console.log(date + " " + time);
        self.date = moment(date + " " + time, "DD.MM.YYYY HH:mm");
        console.log(self.date.toString());
        
    }

};