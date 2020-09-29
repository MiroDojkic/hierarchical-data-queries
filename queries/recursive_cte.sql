WITH RECURSIVE tree(id, name, parent_id, path, lvl)
AS (
  SELECT a.id, a.name, a.parent_id, ARRAY[]::integer[], 0
  FROM items a
  WHERE a.parent_id IS NULL
  UNION ALL
  SELECT a.id, a.name, a.parent_id, t.path || a.parent_id, t.lvl + 1
  FROM items a
  JOIN tree t
  ON a.parent_id = t.id
  WHERE a.parent_id IS NOT NULL
)
SELECT * FROM tree;

-- CREATE INDEX items_parent_id_index ON items(parent_id);
-- DROP INDEX items_parent_id_index;
