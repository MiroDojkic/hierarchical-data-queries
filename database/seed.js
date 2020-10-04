const times = require('lodash/times');
const flatten = require('lodash/flatten');
const { db } = require('.');

const BATCH_INSERT_SIZE = 500;
async function seed(sizePerLevel, levels) {
  const createLevelNodes = level => nodeId => times(sizePerLevel, () => ({
    name: `Level ${level}, node ${nodeId}`,
    node_id: nodeId
  }));
  async function seedDescendants(nodeIds, currentLevel) {
    if (currentLevel > levels) return;
    const items = flatten(nodeIds.map(createLevelNodes(currentLevel)));
    const childrenIds = await db
      .batchInsert('items', items, BATCH_INSERT_SIZE)
      .returning('id');
    return seedDescendants(childrenIds, currentLevel + 1);
  }
  return seedDescendants([null], 1);
}

module.exports = seed;
