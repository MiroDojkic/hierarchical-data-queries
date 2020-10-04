require('dotenv').config();
const consola = require('consola');
const ora = require('ora');
const { Command } = require('commander');
const { db, init, reset } = require('./database');
const seed = require('./database/seed');
const numberParser = require('./utils/numberParser');

const spinner = ora({ color: 'magentaBright' });

const program = new Command();
program
  .option('-s, --size <size>', 'define number of items per level', numberParser, 5)
  .option('-l, --levels <levels>', 'define number of levels', numberParser, 5)
  .parse(process.argv);

setup(program.size, program.levels);

async function setup(size, levels) {
  consola.info(`Inserting trees with
  - ${levels} levels
  - ${size} items per level`);
  spinner.start('Cleaning up existing schema');
  await reset();
  spinner.text = 'Creating schema';
  await init();
  spinner.text = 'Seeding';
  return seed(size, levels)
    .then(() => db('items').count('id'))
    .then(([{ count }]) => spinner.succeed(`Setup completed - ${count} items added!`))
    .then(() => {
      spinner.stop();
      process.exit();
    })
    .catch(err => {
      consola.error(err);
      process.exit(1);
    });
}
