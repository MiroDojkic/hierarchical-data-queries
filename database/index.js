const fs = require('fs');

const db = require('knex')({
  client: 'pg',
  connection: process.env.DB_CONNECTION_STRING
});

async function init() {
  await db.schema.createTable('employees', table => {
    table.increments();
    table.string('name');
    table.string('role');
    table.integer('salary');
    table.integer('superior_id');
    table
      .foreign('superior_id')
      .references('employees.id');
  });
  const dropLtree = fs.readFileSync('./queries/up/ltree.sql', { encoding: 'utf8' });
  await db.schema.raw(dropLtree);
}

async function reset() {
  const dropLtree = fs.readFileSync('./queries/down/ltree.sql', { encoding: 'utf8' });
  await db.schema.raw(dropLtree);
  return db.schema.dropTableIfExists('employees');
}

module.exports = { db, reset, init };
