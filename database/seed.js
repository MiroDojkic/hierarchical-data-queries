const faker = require('faker');
const times = require('lodash/times');
const flatten = require('lodash/flatten');
const { db } = require('.');

const BATCH_INSERT_SIZE = 500;
async function seed(sizePerLevel, levels) {
  async function seedSubordinates(superiorIds, currentLevel) {
    if (currentLevel > levels) return;
    const employees = flatten(superiorIds.map(createSubordinates));
    const subordinateIds = await db
      .batchInsert('employees', employees, BATCH_INSERT_SIZE)
      .returning('id');
    return seedSubordinates(subordinateIds, currentLevel + 1);
  }
  return seedSubordinates([null], 1);

  function createSubordinates(superiorId) {
    return times(sizePerLevel, () => ({
      name: faker.fake('{{name.firstName}} {{name.lastName}}'),
      role: faker.name.jobType(),
      salary: faker.finance.amount(1000, 4500, 0),
      superior_id: superiorId
    }));
  }
}

module.exports = seed;
