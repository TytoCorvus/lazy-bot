var mongo = require('./mongo_dao')

mongo.remove_monitor('TytoCorvus', '779488667868594207')
    .then((result) => { console.log(`should have worked`) })
    .catch((err) => { console.log(`should have died`) })
