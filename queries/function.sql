CREATE FUNCTION get_item_tree(search_id INTEGER, levels INTEGER)
RETURNS TABLE (id INTEGER, name VARCHAR, parent_id INTEGER, path INTEGER[], lvl INTEGER)
AS $$
BEGIN
RETURN QUERY
WITH RECURSIVE tree(id, name, parent_id, path, lvl)
AS (
  SELECT a.id, a.name, a.parent_id, ARRAY[]::integer[], 0
  FROM items a
  WHERE a.id = $1
  UNION ALL
  SELECT a.id, a.name, a.parent_id, t.path || a.parent_id, t.lvl + 1
  FROM items a
  JOIN tree t
  ON a.parent_id = t.id
  WHERE a.parent_id IS NOT NULL and t.lvl < $2
)
SELECT * FROM tree;
END;
$$
LANGUAGE plpgsql
IMMUTABLE;
DROP FUNCTION get_item_tree(search_id INTEGER, levels INTEGER);

CREATE INDEX items_parent_id_index ON items(parent_id);
DROP INDEX items_parent_id_index;
