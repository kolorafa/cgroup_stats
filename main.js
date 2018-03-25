'use strict';
const CPUCgroupStat = require('./CPUCgroupStat.js');
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const DS = '/';
const cgroupCpuFolder = '/sys/fs/cgroup/cpu';
const fs = require('fs');
let stats = {};
let handleCgroup = (path) => {
    if (fs.lstatSync(path + DS + 'cpuacct.usage').isFile()) {
        stats[path.substring(cgroupCpuFolder.length + 1)] = new CPUCgroupStat(path);
    }
};
let scanRecursive = (path) => {
    handleCgroup(path);
    fs.readdir(path, (err, files) => {
        files.forEach(file => {
            if (fs.lstatSync(path + DS + file).isFile()) {
                /**
                 * We are interested only in directories
                 */
                return;
            }

//            if (file.substr(0, 5) !== "user_") {
//                return;
//            }

            scanRecursive(path + DS + file);
        });
    });
};
scanRecursive(cgroupCpuFolder);
let updateUsage = () => {
    for (let key in stats) {
        stats[key].update();
    }
    ;
//    console.log(stats["/sys/fs/cgroup/cpu/user_test"].getUsage());
};
setInterval(updateUsage, 1000);
const express = require('express');
const app = express();
//app.use((request, response, next) => {
//    console.log(request.headers);
//    next();
//});
//
//app.use((request, response, next) => {
//    request.chance = Math.random();
//    next();
//});

app.get('/', (request, response) => {
    response.status(500).send('Something broke!');
});

app.get('/api/v1/get_usage/*', (request, response) => {
    let path = request.params[0];
    if (typeof stats[path] === 'undefined') {
        response.status(404).send('Unknown group');
        return;
    }
    response.json({
        cpuUsagePercent: stats[path].getUsage()
    });
});

app.get('/api/v1/get_user_usage/:user', (request, response) => {
    let path = 'user_' + request.params['user'];
    if (typeof stats[path] === 'undefined') {
        response.status(404).send('Unknown user');
        return;
    }
    response.json({
        cpuUsagePercent: stats[path].getUsage()
    });
});

app.get('/api/v1/list_groups', (request, response) => {
    response.json({
        cpuGroups: Object.keys(stats)
    });
});

app.get('/api/v1/list_users', (request, response) => {
    let list = [];
    for (let x in stats) {
        if (x.substr(0, 5) === "user_") {
            list.push(x.substr(5));
        }
    }
    response.json({
        cpuUsers: list
    });
});

app.use(express.static('public'));

app.listen(7465);

