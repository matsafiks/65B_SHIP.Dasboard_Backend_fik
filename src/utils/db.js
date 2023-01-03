import mongoose from 'mongoose'
import fs from "fs";
import config from './config.js'
// import tunnel from 'tunnel-ssh';

var mongoose_connect = () => {
    mongoose.connect(config.mongo_db);

    var db = mongoose.connection;

    db.on('error', console.error.bind(console, 'DB connection error:'));
    db.once('open', function () {
        console.log("DB connection successful");
    });
}

export default mongoose_connect

// db.getCollectionNames().forEach(c => { if (c != 'system.users' && c != 'system.version') { db[c].drop() } })


// var config_db = {
//     username: 'root',
//     host: '212.80.213.252',
//     agent: process.env.SSH_AUTH_SOCK,
//     // privateKey: fs.readFileSync('/Users/matsafikbesa/.ssh/id_rsa'),
//     port: 22,
//     dstPort: 27017,
//     password: 'cQ8dAyRr_4uTuRsc'
// };

// tunnel(config_db, function (error, server) {
//     if (error) {
//         console.log("SSH connection error: " + error);
//     }
// mongoose.connect(config.mongo_db);

// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'DB connection error:'));
// db.once('open', function () {
// we're connected!
// console.log("DB connection successful");
// console.log(server);
// });
// });