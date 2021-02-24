const { Sequelize, DataTypes, Deferrable } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_CONNECTION_STRING, {
  dialect: 'postgres',
  logging: false
});
const { STRING, INTEGER } = DataTypes;

const Employee = sequelize.define('Employee', {
  name: STRING,
  role: STRING,
  salary: INTEGER,
  superiorId: {
    type: DataTypes.INTEGER,
    field: 'superior_id',
    references: {
      model: this,
      key: 'id',
      deferrable: Deferrable.INITIALLY_IMMEDIATE
    }
  }
}, {
  tableName: 'employees',
  timestamps: false
});

Employee.prototype.getTree = function getTree(levels) {
  const attributes = Object.keys(Employee.rawAttributes);
  const qNodeId = getModelAttributeColumn(Employee, 'superiorId', 'employee');
  const qEmployeeFields = attributes
    .map(attr => getModelAttributeColumn(Employee, attr, 'employee'))
    .join(', ');
  const levelLimitFilter = levels ? `and tree.lvl < ${levels}` : '';
  const query = `
    WITH RECURSIVE tree(id, name, role, salary, parent_id, lvl, path)
    AS (
      SELECT
        ${qEmployeeFields},
        0,
        employee.id::text::ltree
      FROM ${Employee.tableName} employee
      WHERE employee.id = ${this.id}
      UNION ALL
      SELECT ${qEmployeeFields}, tree.lvl + 1, tree.path || ${qNodeId}::text
      FROM ${Employee.tableName} employee
      JOIN tree
      ON ${qNodeId} = tree.id
      WHERE ${qNodeId} IS NOT NULL ${levelLimitFilter}
    )
    SELECT * FROM tree;
  `;

  return sequelize.query(query, { mapToModel: true, model: Employee });
};

module.exports = Employee;

function getModelAttributeColumn(model, attribute, prefix) {
  const { field } = model.rawAttributes[attribute];
  return prefix ? `${prefix}.${field}` : field;
}
