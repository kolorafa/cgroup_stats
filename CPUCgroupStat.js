'use strict';

const fs = require('graceful-fs');
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
        return new Promise(function (resolve, reject) {
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
CPUCgroupStat.prototype.update = async function () {
    let that = this;
    return new Promise(function (resolve, reject) {
        that.readUsage().then(value => {
            let prevtime = that.time;
            that.time = new Date().getTime();
            let previous = that.previous;
            that.previous = value;
            that.usage = ((value - previous) / 10000000) / (that.time / prevtime);
            that.history.push(that.usage);
            if (that.history.length > 5) {
                that.history.shift();
            }
            resolve();
        }).catch((err) => {
            console.log("UPDATE FAIL: ", err);
            reject(err);
        });
    });
};

// class methods
CPUCgroupStat.prototype.getUsage = function () {
    return this.usage;
};

// export the class
module.exports = CPUCgroupStat;