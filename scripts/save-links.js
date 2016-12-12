// Description:
//  Saving Bookmarks
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
//   hubot link help - to get all commands for managing links
//

var Bookmark, Link, Url,
indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

module.exports = function(robot) {
    
    robot.respond(/link help/i, function(msg) {
        return msg.send("link [url] as [name] - Saving url\r\n     link me [name] - Get entries for name\r\n     delete links for [name]\r\n     list links\r\n     delete link [url] for [name]");
    });

    robot.respond(/link (http(s?)\:\/\/\S+) as (.+)/i, function(msg) {
        var url = msg.match[1];
        var description = msg.match[3];
        var bookmark = new Bookmark(url, description);
        var link = new Link(robot);

        return link.add(bookmark, function(err, message) {
            if (err != null) {
                return msg.reply("I have a vague memory of hearing about that link sometime in the past.");
            } else {
                return msg.reply("I've stuck that link into my robot brain.");
            }
        });
    });

    robot.respond(/link me for (.+)/i, function(msg) {
        var description = msg.match[1];
        var link = new Link(robot);

        return link.find(description, function(err, message) {
            if (err != null) {
                return msg.send("" + err);
            } else {
                return msg.send(message);
            }
        });
    });
    
    robot.respond(/link me (.+)/i, function(msg) {
        var description = msg.match[1];
        var link = new Link(robot);

        return link.find(description, function(err, message) {
            if (err != null) {
                return msg.send("" + err);
            } else {
                return msg.send(message);
            }
        });
    });

    robot.respond(/delete links for (.+)/i, function(msg) {
        var description, link;
        description = msg.match[1];
        link = new Link(robot);
        return link.deleteAll(description, function(err, message) {
            if (err != null) {
                return msg.send("" + err);
            } else {
                return msg.send(message);
            }
        });
    });

    robot.respond(/delete link (http(s?)\:\/\/\S+) for (.+)/i, function(msg) {
        var url = msg.match[1];
        var description = msg.match[3];
        var bookmark = new Bookmark(url, description);
        var link = new Link(robot);

        return link.deleteOne(bookmark, function(err, message) {
            if (err != null) {
                return msg.send("" + err);
            } else {
                return msg.send(message);
            }
        });
    });

    robot.respond(/list links/i, function(msg) {
        var link;
        link = new Link(robot);
        return link.list(function(err, message) {
            if (err != null) {
                return msg.reply("Links? What links? I don't remember any links.");
            } else {
                return msg.reply(message);
            }
        });
    });

    robot.respond(/list links for (.+)/i, function(msg) {
        var description = msg.match[1];
        var link = new Link(robot);

        return link.find(description, function(err, message) {
            if (err != null) {
                return msg.send("" + err);
            } else {
                return msg.send(message);
            }
        });
    });

    return robot.hear(/(http(s?)\:\/\/\S+)/i, function(msg) {
        var href, url;
        href = msg.match[1];
        url = new Url(robot);
        return url.add(href, function(err, message) {
            if (err != null) {
                return console.log(href + " : " + err);
            }
        });
    });
};

Url = (function() {
    function Url(robot) {
        var base;
        if ((base = robot.brain.data).urls == null) {
            base.urls = [];
        }
        this.urls_ = robot.brain.data.urls;
    }

    Url.prototype.all = function(url) {
        if (url) {
            return this.urls_.push(url);
        } else {
            return this.urls_;
        }
    };

    Url.prototype.add = function(url, callback) {
        if (indexOf.call(this.all(), url) >= 0) {
            return callback("Url already exists");
        } else {
            this.all(url);
            return callback(null, "Url added");
        }
    };

    return Url;

})();

Bookmark = (function() {
    function Bookmark(url, description) {
        this.url = url;
        this.description = description;
    }

    Bookmark.prototype.encodedUrl = function() {
        return encodeURIComponent(this.url);
    };

    Bookmark.prototype.encodedDescription = function() {
        return encodeURIComponent(this.description);
    };

    return Bookmark;

})();

Link = (function() {
    function Link(robot) {
        var base;
        if ((base = robot.brain.data).links == null) {
            base.links = [];
        }
        this.links_ = robot.brain.data.links;
    }

    Link.prototype.all = function(bookmark) {
        if (bookmark) {
            return this.links_.push(bookmark);
        } else {
            return this.links_;
        }
    };

    Link.prototype.add = function(bookmark, callback) {
        var result;
        result = [];
        this.all().forEach(function(entry) {
            if (entry) {
                if (entry.url === bookmark.url) {
                    return result.push(bookmark);
                }
            }
        });
        if (result.length > 0) {
            return callback("Bookmark already exists");
        } else {
            this.all(bookmark);
            return callback(null, "Bookmark added");
        }
    };

    Link.prototype.list = function(callback) {
        var bookmark, i, len, ref, resp_str;
        if (this.all().length > 0) {
            resp_str = "These are the links I'm remembering:\n\n";
            ref = this.all();
            for (i = 0, len = ref.length; i < len; i++) {
                bookmark = ref[i];
                if (bookmark) {
                    resp_str += bookmark.description + " (" + bookmark.url + ")\n";
                }
            }
            return callback(null, resp_str);
        } else {
            return callback("No bookmarks exist");
        }
    };

    Link.prototype.find = function(description, callback) {
        var result = [];
        var resp_str = "These are the links I'm remembering for " + description + ":\n\n";
        this.all().forEach(function(bookmark) {
            if (bookmark && bookmark.description) {
                if (RegExp(description, "i").test(bookmark.description)) {
                    result.push(bookmark);
                    return resp_str += bookmark.url + "\n";
                }
            }
        });
        if (result.length > 0) {
            return callback(null, resp_str);
        } else {
            return callback("No results found");
        }
    };

    Link.prototype.deleteAll = function(description, callback) {
        var deletedElem = "";
        var self = this;
        this.all().forEach(function(bookmark, index) {
            if (bookmark && bookmark.description && RegExp(description, "i").test(bookmark.description)) {
                deletedElem = bookmark.description;
                return self.links_.splice(index, 1);
            }
        });

        if (deletedElem.length > 0) {
            return callback(null, deletedElem + " has been deleted");
        } else {
            return callback("No results found");
        }
    };

    Link.prototype.deleteOne = function(needle, callback) {
        var deletedElem = "";
        var self = this;
        this.all().forEach(function(bookmark, index) {
            if (bookmark && bookmark.description &&
                            RegExp(needle.description, "i").test(bookmark.description) && 
                            RegExp(needle.url, "i").test(bookmark.url) ) {
                deletedElem = bookmark.url + ", " + bookmark.description;
                return self.links_.splice(index, 1);
            }
        });

        if (deletedElem.length > 0) {
            return callback(null, deletedElem + " has been deleted");
        } else {
            return callback("No results found");
        }
    };

    return Link;
})();