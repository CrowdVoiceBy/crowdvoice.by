global.db = require('knex')(CONFIG.database[CONFIG.environment]);

// db.on('query', function(data) {
//   if (CONFIG.database.logQueries) {
//     logger.info('SQL: '.yellow + data.sql + ' Data: '.yellow + data.bindings);
//   }
// });
