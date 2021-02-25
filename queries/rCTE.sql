WITH RECURSIVE tree(id, name, role, salary, parent_id, lvl, path)
AS (
  SELECT e.*, 1, ARRAY[e.id]
  FROM employees e
  WHERE e.superior_id IS NULL
  UNION ALL
  SELECT e.*, t.lvl + 1, path || e.id
  FROM employees e
  JOIN tree t
  ON e.superior_id = t.id
)
SELECT * FROM tree;

DROP INDEX employees_superior_id_index;
CREATE INDEX employees_superior_id_index ON employees(superior_id);
