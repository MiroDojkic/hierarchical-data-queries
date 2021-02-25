DROP FUNCTION get_employee_tree(search_id INTEGER, levels INTEGER);
CREATE FUNCTION get_employee_tree(search_id INTEGER, levels INTEGER)
RETURNS TABLE (id INTEGER, name VARCHAR, role VARCHAR, salary INTEGER, superior_id INTEGER, lvl INTEGER, path INTEGER[])
AS $$
BEGIN
RETURN QUERY
  WITH RECURSIVE tree(id, name, role, salary, parent_id, lvl, path)
  AS (
    SELECT e.*, 1, ARRAY[e.id]
    FROM employees e
    WHERE e.id = $1
    UNION ALL
    SELECT e.*, t.lvl + 1, t.path || e.id
    FROM employees e
    JOIN tree t
    ON e.superior_id = t.id
    WHERE t.lvl < $2
  )
  SELECT * FROM tree;
END;
$$
LANGUAGE plpgsql
IMMUTABLE;

