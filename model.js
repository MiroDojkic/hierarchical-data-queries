const { Sequelize, DataTypes, Deferrable } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_CONNECTION_STRING, {
  dialect: 'postgres',
  logging: false
});
const { STRING } = DataTypes;

const Item = sequelize.define('Item', {
  name: STRING,
  nodeId: {
    type: DataTypes.INTEGER,
    field: 'node_id',
    references: {
      model: this,
      key: 'id',
      deferrable: Deferrable.INITIALLY_IMMEDIATE
    }
  }
}, {
  tableName: 'items',
  timestamps: false
});

Item.prototype.getTree = function getTree(levels) {
  const attributes = Object.keys(Item.rawAttributes);
  const qNodeId = getModelAttributeColumn(Item, 'nodeId', 'i');
  const qItemFields = attributes
    .map(attr => getModelAttributeColumn(Item, attr, 'i'))
    .join(', ');
  const levelLimitFilter = levels ? `and t.lvl < ${levels}` : '';
  const query = `
    WITH RECURSIVE tree(id, name, node_id, path, lvl)
    AS (
      SELECT
        ${qItemFields},
        i.id::text::ltree,
        0
      FROM ${Item.tableName} i
      WHERE i.id = ${this.id}
      UNION ALL
      SELECT ${qItemFields}, t.path || ${qNodeId}::text, t.lvl + 1
      FROM ${Item.tableName} i
      JOIN tree t
      ON ${qNodeId} = t.id
      WHERE ${qNodeId} IS NOT NULL ${levelLimitFilter}
    )
    SELECT * FROM tree;
  `;

  return sequelize.query(query, { mapToModel: true, model: Item });
};

module.exports = Item;

function getModelAttributeColumn(model, attribute, prefix) {
  const { field } = model.rawAttributes[attribute];
  return prefix ? `${prefix}.${field}` : field;
}
