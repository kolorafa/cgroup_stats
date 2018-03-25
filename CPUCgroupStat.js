'use strict';

const fs = require('fs');
const DS = '/';

// Constructor
function CPUCgroupStat(path) {
    // always initialize all instance properties
    this.path = path;
    this.previous = null;
    this.usage = 0;
    this.history = [];

    this.readUsage = function () {
        let that = this;
        return new Promise(
                function (resolve, reject) {
                    fs.open(that.path + DS + 'cpuacct.usage', 'r', function (err, fileToRead) {
                        if (!err) {
                            fs.readFile(fileToRead, {encoding: 'utf-8'}, function (err, data) {
                                if (!err) {
                                    fs.close(fileToRead, function () {});
                                    resolve(data);
                                } else {
                                    fs.close(fileToRead, function () {});
                                    console.log(err);
                                    reject(err);
                                }
                            });
                        } else {
                            console.log(err);
                        }
                    });
                });

    }


    this.readUsage().then(value => {
        this.previous = value;
        this.time = new Date().getTime();
    });
}
// class methods
CPUCgroupStat.prototype.update = function () {
    this.readUsage().then(value => {
        let prevtime = this.time;
        this.time = this.time = new Date().getTime();
        let previous = this.previous;
        this.previous = value;
        this.usage = ((value - previous) / 10000000) / (this.time / prevtime);
        this.history.push(this.usage);
        if (this.history.length > 5) {
            this.history.shift();
        }
    });
};

// class methods
CPUCgroupStat.prototype.getUsage = function () {
    return this.usage;
};

// export the class
module.exports = CPUCgroupStat;