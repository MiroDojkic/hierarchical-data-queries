require('dotenv').config();
const consola = require('consola');
const { performance } = require('perf_hooks');
const { Command } = require('commander');
const { db } = require('./database');
const Employee = require('./model');
const numberParser = require('./utils/numberParser');

const program = new Command();
program
  .option('-id, --id <id>', 'define root node ID', numberParser)
  .option('-l, --levels <levels>', 'define number of levels to fetch', numberParser)
  .parse(process.argv);

run(program.id, program.levels);

async function runPWithTimer(label, promise) {
  const start = performance.now();
  return promise
    .then(items => {
      const end = performance.now();
      consola.success(`Fetched ${items.length} items with ${label} in ${end - start} ms`);
      return items;
    });
}

async function getTreeById(idOrIds, maxLevel, level = 0) {
  if (level === maxLevel) return [];
  const rootOrChildren = await Employee.findAll({ where: { superior_id: idOrIds } });
  const hasChildren = rootOrChildren.length;
  if (!hasChildren) return rootOrChildren;
  const childrenNodeIds = rootOrChildren.map(it => it.id);
  const descendants = await getTreeById(childrenNodeIds, maxLevel, level + 1);
  return [...rootOrChildren, ...descendants];
}

async function getTreeByIdWithCte(id, levels) {
  const employee = await Employee.findByPk(id);
  return employee.getTree(levels);
}

function run(id, levels) {
  const runTests = () => Promise.all([
    runPWithTimer('Model.findAll', getTreeById(id, levels)),
    runPWithTimer('recursive CTE', getTreeByIdWithCte(id, levels))
  ]);

  return runTests()
    .then(() => db.schema.alterTable('employees', table => table.index('superior_id')))
    .then(() => {
      consola.info('Added index on column superior_id, re-running tests...');
      return runTests();
    })
    .then(() => db.schema.alterTable('employees', table => table.dropIndex('superior_id')))
    .then(() => {
      consola.info('Dropped index on column superior_id');
      consola.info('Finished running tests');
      process.exit();
    })
    .catch(err => {
      consola.error(err);
      process.exit(1);
    });
}
