# Duplicate GraphQL Operation Names

`duplicate-operation-name` is a simple cli tool that makes it easy to check if there are any duplicate operation names in GraphQL projects that use statically analyze-able GraphQL queries.

It can be called on individual files, or recurisvely step through directories. It is compatible with `.graphql`, `.ts`, and `.js` files.


# Installation
```shell
npm install -g duplicate-operation-name
```

# Usage

The build tool binary is called `duplicate-operation-name`. Running it with no other arguments should give:

```
Usage: duplicate-operation-name <input_path> [--graphql] [--js] [--ts]
```

**input_path**: can be a directory or file path

**flags**: at least one must be passed in

### Results

If any **duplicate** operation names are found, the script will exit with an error and print:
```
Error: Found duplicate operation names:
   3 x myOperationName1
   2 x myOperationName2
```

If **no duplicate** operation names are found, the script will exit without error and print:
```
No duplicates found!
```

If **no queries** are found, the script will exit without error and print:
```
No queries found.
```


### Analyzing Queries from GraphQL files

```shell
duplicate-operation-name queries.graphql --graphql
```

### Analyzing Queries from TypeScript

```shell
duplicate-operation-name src/index.ts --ts
```

### Analyzing Queries from JavaScript

```shell
duplicate-operation-name src/index.js --js
```


### Analyzing Queries from Folders
It is also possible to analyze a directory, perhaps containing `.graphql`, `.ts.`, and `.js` files:

```shell
duplicate-operation-name src/ --graphql --ts --js
```

# Acknowledgements
This is really just a repurposed version of https://github.com/apollographql/persistgraphql. Thanks to everyone who helped make that project happen.
