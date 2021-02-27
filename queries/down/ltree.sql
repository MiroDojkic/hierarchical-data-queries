DROP MATERIALIZED VIEW IF EXISTS tree;
DROP TRIGGER IF EXISTS refresh_tree_on_insert ON employees;
DROP FUNCTION IF EXISTS refresh_tree();
