const { MongoClient } = require("mongodb");
const { mongo_url } = require('../../env_variables/mongo_vars')

class MONGO_DAO {
    constructor() {
        this.client = new MongoClient(mongo_url, { useUnifiedTopology: true });
        this.DATABASE_NAME = 'lazy-bot';
        this.MONITORING_COLLECTION = 'monitoring';
        this.REPORTING_HISTORY_COLLECTION = 'tweets_reported';
        this.GUILD_SETTINGS = 'guild_settings';

        this.client.connect();
    }
}

    MONGO_DAO.prototype.get_all_monitors = function (callback) {
    const collection = this.client.db(this.DATABASE_NAME).collection(this.MONITORING_COLLECTION)
    var results =[]
    var cursor = collection.find({
})
    cursor.forEach((item) => results.push(item), () => {
    callback(results);
})
}

    MONGO_DAO.prototype.get_monitor_list = function (callback, guild_id, twitter_handle = null) {
    const collection = this.client.db(this.DATABASE_NAME).collection(this.MONITORING_COLLECTION)
    var results =[];
    //Get all monitored for server if nothing specified - else, get the monitors for the twitter listed
    var query = twitter_handle != null?{
    'twitter_handle': twitter_handle,
    'guild_id': guild_id
}: {
    'guild_id': guild_id
};
    var cursor = collection.find(query)
    cursor.forEach((item) => results.push(item), () => {
    callback(results);
})
}

    MONGO_DAO.prototype.insert_monitor = function (monitor) {
    const collection = this.client.db(this.DATABASE_NAME).collection(this.MONITORING_COLLECTION)

    return new Promise((resolve, reject) => {
    collection.insertOne(monitor)
    .then((result) => {
    resolve(result)
})
    .catch((err) => {
    reject(err)
})
})
}

    MONGO_DAO.prototype.add_listener = function (twitter_handle, guild_id, user_id) {
    const collection = this.client.db(this.DATABASE_NAME).collection(this.MONITORING_COLLECTION)

    return new Promise((resolve, reject) => {
    collection.updateMany(
{
    'twitter_handle': twitter_handle,
    'guild_id': guild_id

},
{
    '$addToSet': {
    'users_listening': user_id
}
}).then((result) => {
    resolve(result);
}).catch((err) => {
    reject(err);
})
})
}

    MONGO_DAO.prototype.find_author = function (twitter_handle) {
    const collection = this.client.db(this.DATABASE_NAME).collection(this.REPORTING_HISTORY_COLLECTION)

    return new Promise((resolve, reject) => {
    collection.find({
    'twitter_handle': twitter_handle
}).count(false)
    .then((value) => {
    resolve(value> 0)
}).catch((err) => {
    reject(err)
})
})
}

    MONGO_DAO.prototype.insert_author = function (twitter_handle, guild_id) {
    const collection = this.client.db(this.DATABASE_NAME).collection(this.REPORTING_HISTORY_COLLECTION)

    return new Promise((resolve, reject) => {
    collection.insertOne({
    'twitter_handle': twitter_handle,
    'guild_id': guild_id
}, (err, result) => {
    if (!err) {
    resolve(result)
} else {
    reject(err)
}
})
})
}

    MONGO_DAO.prototype.insert_reported_tweet = function (tweet, monitoring_guild_id) {
    const collection = this.client.db(this.DATABASE_NAME).collection(this.REPORTING_HISTORY_COLLECTION)

    return new Promise((resolve, reject) => {
    collection.updateOne(
{
    twitter_handle: tweet.twitter_handle,
    guild_id: monitoring_guild_id
},
{
    '$set': {
     'twitter_handle': tweet.twitter_handle,
     'guild_id': monitoring_guild_id
 },
    '$addToSet':
{
    'tweet_ids': tweet.tweet_id
}
}, {
                upsert: true
}, () => {
    resolve(true)
})
})
}

    MONGO_DAO.prototype.get_reported_tweets = function (twitter_handle, guild_id) {
    const collection = this.client.db(this.DATABASE_NAME).collection(this.REPORTING_HISTORY_COLLECTION)

    return new Promise((resolve, reject) => {
    collection.findOne({
    'twitter_handle': twitter_handle,
    'guild_id': guild_id
}, (err, result) => {
    if (!err) {
    resolve((result != null && result.tweet_ids != null) ?result.tweet_ids: [])
} else {
    reject(err)
}
})
})

}

    MONGO_DAO.prototype.get_guild_settings = function (guild_id) {
    const collection = this.client.db(this.DATABASE_NAME).collection(this.GUILD_SETTINGS);

    return new Promise((resolve, reject) => {
    collection.findOne({
    'guild_id': guild_id
})
    .then((result) => {
    resolve(result)
})
    .catch((err) => {
    reject(err)
})
})
}

    MONGO_DAO.prototype.upsert_guild_settings = function (guild_id, new_settings) {
    const collection = this.client.db(this.DATABASE_NAME).collection(this.GUILD_SETTINGS);

    return new Promise((resolve, reject) => {
    collection.updateOne({
    'guild_id': guild_id
}, {
    '$set': new_settings
}, {
    upsert: true
})
    .then((result) => {
    resolve(result)
})
    .catch((err) => reject(err))
})
}

module.exports = new MONGO_DAO()