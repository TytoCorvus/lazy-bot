const { MongoClient } = require("mongodb");
const { mongo_url } = require('../../env_variables/mongo_vars')

class MONGO_DAO {
    constructor() {
        this.client = new MongoClient(mongo_url, { useUnifiedTopology: true });
        this.DATABASE_NAME = 'lazy-bot'
        this.MONITORING_COLLECTION = 'monitoring'
        this.REPORTING_HISTORY_COLLECTION = 'tweets_reported'
    }
}

    MONGO_DAO.prototype.get_monitor_list = function () {
    this.client.connect()
    const collection = this.client.db(this.DATABASE_NAME).collection(this.MONITORING_COLLECTION)
    var results =[];
    var query = {
}
    var cursor = collection.find(query)
    cursor.forEach((item) => results.push(item), () => {
    console.log(JSON.stringify(results));
    this.client.close();
})
}

    MONGO_DAO.prototype.find_author = function (twitter_handle) {
    this.client.connect()
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

    MONGO_DAO.prototype.insert_author = function (twitter_handle) {
    this.client.connect()
    const collection = this.client.db(this.DATABASE_NAME).collection(this.REPORTING_HISTORY_COLLECTION)

    return new Promise((resolve, reject) => {
    collection.insertOne({
    'twitter_handle': twitter_handle
}, (err, result) => {
    if (!err) {
    resolve(result)
} else {
    reject(err)
}
})
})
}

    MONGO_DAO.prototype.insert_written_tweet = function (tweet) {
    this.client.connect()
    const collection = this.client.db(this.DATABASE_NAME).collection(this.REPORTING_HISTORY_COLLECTION)

    return new Promise((resolve, reject) => {
    this.find_author(tweet.twitter_handle)
    .then((author_exists) => {
    if (!author_exists) {
    this.insert_author(tweet.twitter_handle)
    .then(() => {
    collection.updateOne(
{
    twitter_handle: tweet.twitter_handle
},
{
    '$addToSet':
{
    tweet_id: tweet.tweet_id
}
}, {
}, () => {
    resolve(true)
})
})
    .catch((err) => {
    reject(err)
})
} else {
    collection.updateOne(
{
    twitter_handle: tweet.twitter_handle
},
{
    '$addToSet':
{
    tweet_id: tweet.tweet_id
}
}, {
}, () => {
    resolve(true)
})
}
}).catch((err) => {
    reject(err)
})
})
}

    MONGO_DAO.prototype.get_reported_tweets = function (twitter_handle) {
    this.client.connect()
    const collection = this.client.db(this.DATABASE_NAME).collection(this.REPORTING_HISTORY_COLLECTION)

    return new Promise((resolve, reject) => {
    collection.findOne({
    'twitter_handle': twitter_handle
}, {
},
    (err, result) => {
    if (!err) {
    resolve(result.tweet_id)
}
else {
    reject(err)
}

})
})

}

module.exports = MONGO_DAO

var mongo = new MONGO_DAO()
mongo.get_reported_tweets('TytoCorvus').then((result) => { console.log(result) })

