const { MongoClient } = require('mongodb');
const { APP } = require('./appEnums');

let client;

async function connect() {
    if (!client) {
        client = MongoClient.connect(APP.MONGO_URI)
            .catch((error) => console.log('error on connect', error));
    }

    return client;
}

const getConnectedClient = () => client;

module.exports = { connect, getConnectedClient }