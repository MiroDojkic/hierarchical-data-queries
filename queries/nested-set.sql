DROP MATERIALIZED VIEW nested_set;
CREATE MATERIALIZED VIEW nested_set AS
WITH RECURSIVE tree(id, name, role, salary, parent_id, lvl, path)
AS (
  SELECT e.*, 1, e.id::text::ltree
  FROM employees e
  WHERE e.superior_id IS NULL
  UNION ALL
  SELECT e.*, t.lvl + 1, t.path || e.id::text
  FROM employees e
  JOIN tree t
  ON t.id = e.superior_id
),
cte AS (
  SELECT
  m.*,
  (
    SELECT COUNT(*)
    FROM tree AS d
    WHERE m.path @> d.path
  ) AS descendants,
  (
    SELECT COUNT(*)
    FROM tree AS a
    WHERE a.path @> m.path
  ) AS ancestors,
  ROW_NUMBER() OVER (ORDER BY m.path) AS rn
  FROM tree AS m
)
SELECT cte.*,
       2 * rn - ancestors AS lft,
       2 * rn - ancestors + 2 * descendants - 1 AS rgt
FROM cte
ORDER BY path;

