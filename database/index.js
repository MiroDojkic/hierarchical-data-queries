const db = require('knex')({
  client: 'pg',
  connection: process.env.DB_CONNECTION_STRING
});

function init() {
  return db.schema.createTable('items', table => {
    table.increments();
    table.string('name');
    table.integer('node_id');
    table
      .foreign('node_id')
      .references('items.id');
  });
}

function reset() {
  return db.schema.dropTableIfExists('items');
}

module.exports = { db, reset, init };
