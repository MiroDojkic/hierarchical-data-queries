const db = require('knex')({
  client: 'pg',
  connection: process.env.DB_CONNECTION_STRING
});

function init() {
  return db.schema.createTable('employees', table => {
    table.increments();
    table.string('name');
    table.string('role');
    table.integer('salary');
    table.integer('superior_id');
    table
      .foreign('superior_id')
      .references('employees.id');
  });
}

function reset() {
  return db.schema.dropTableIfExists('employees');
}

module.exports = { db, reset, init };
