# Hierarchical data queries

Trying out different approaches in querying hierarchical data structures. 🗃

## Setup 🔧
Install dependencies
```
npm install
```

Initialize and seed database
```
npm run setup -- -s 5 -l 8
```

#### Options
* `-s, --size` (default 5) - number of items per level
* `-l, --levels` (default 5) - number of levels

## Run 🚀
Fetch tree by root node ID
```
npm start -- -id 3 -l 5
```
#### Options
* `-id, --id` (required) - root node ID
* `-l, --levels` (default 5) - number of levels
