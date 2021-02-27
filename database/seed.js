const chunk = require('lodash/chunk');
const faker = require('faker');
const times = require('lodash/times');
const flatten = require('lodash/flatten');
const { db } = require('.');

async function seed(sizePerLevel, levels) {
  async function seedEmployees(superiorIds, currentLevel) {
    if (currentLevel > levels) return;
    const employees = flatten(superiorIds.map(createSubordinates));
    const subordinateIds = [];
    const employeeChunks = chunk(employees, 1000);
    for (let i = 0; i < employeeChunks.length; i++) {
      const ids = await db('employees').insert(employeeChunks[i]).returning('id');
      subordinateIds.push(...ids);
    }
    return seedEmployees(subordinateIds, currentLevel + 1);
  }
  return seedEmployees([null], 1);

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
