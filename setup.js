require('dotenv').config();
const { Command } = require('commander');
const consola = require('consola');
const ora = require('ora');
const seed = require('./seed');
const db = require('knex')({
  client: 'pg',
  connection: process.env.DB_CONNECTION_STRING
});

const spinner = ora({ color: 'magentaBright' });
const program = new Command();
program
  .option('-s, --size <size>', 'define number of rows per level', 20)
  .option('-l, --levels <levels>', 'define number of levels', 3)
  .parse(process.argv);

setup(program.size, program.levels)
  .then(process.exit)
  .catch(err => {
    consola.error(err);
    process.exit(1);
  });

async function setup(size, levels) {
  const tableName = 'items';
  consola.info(`Inserting trees with
  - ${levels} levels
  - ${size} items per level`);
  spinner.start('Cleaning up existing schema');
  await db.schema.dropTableIfExists(tableName);
  spinner.text = 'Creating schema';
  await db.schema.createTable(tableName, table => {
    table.increments();
    table.string('name');
    table.integer('parent_id');
    table
      .foreign('parent_id')
      .references(`${tableName}.id`);
  });
  spinner.text = 'Seeding';
  return seed(db, tableName, size, levels)
    .then(() => db(tableName).count('id'))
    .then(([{ count }]) => {
      spinner.succeed(`Setup completed - ${count} items added!`);
    })
    .finally(() => { spinner.stop(); });
}
