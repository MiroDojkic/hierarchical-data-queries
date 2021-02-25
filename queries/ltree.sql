DROP MATERIALIZED VIEW tree;
CREATE MATERIALIZED VIEW tree AS
WITH RECURSIVE tree(id, name, role, salary, parent_id, lvl, path)
AS (
  SELECT e.*, 1, e.id::text::ltree
  FROM employees e
  WHERE e.superior_id IS NULL
  UNION ALL
  SELECT e.*, t.lvl + 1, path || e.id::text
  FROM employees e
  JOIN tree t
  ON e.superior_id = t.id
)
SELECT * from tree;
