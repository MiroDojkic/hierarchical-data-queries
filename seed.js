const faker = require('faker');
const times = require('lodash/times');
const flatten = require('lodash/flatten');

async function seed(db, tableName, sizePerLevel, levels) {
  function seedDescendants (parentIds, currentLevel) {
    const children = parentIds.map(id => times(sizePerLevel, () => ({
      name: faker.random.words(),
      parent_id: id
    })));
    return db.batchInsert(tableName, flatten(children))
      .returning('id')
      .then(ids => currentLevel === levels
        ? Promise.resolve()
        : seedDescendants(ids, currentLevel + 1)
      );
  }

  const items = times(sizePerLevel, () => ({ name: faker.random.words() }));
  const rootIds = await db.batchInsert(tableName, items)
    .returning('id');
  return seedDescendants(rootIds, 2);
}

module.exports = seed;
