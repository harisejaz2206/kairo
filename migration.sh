#!/bin/bash

# Last update: 2024-10-09
# Description: This script is used to run, revert or generate TypeORM migrations.
# Usage: sh migration.sh [run|revert|generate] [name of the migration (only for 'generate')]
# Example: sh migration.sh run
# Example: sh migration.sh revert
# Example: sh migration.sh generate create_users_table


if [ -z "$1" ]; then
  echo "Please provide a parameter: 'run', 'revert' or 'generate'."
  exit 1
fi

# Variables
MIGRATION_DIR="src/migrations/"
ORM_CONFIG="dist/ormconfig.js"
TYPEORM_COMMAND="typeorm migration"
PREREQUISITES="npm run build"

# Check if the first parameter is 'run', 'revert' or 'generate'
if [ "$1" == "run" ]; then
  $PREREQUISITES
  # shellcheck disable=SC2086
  $TYPEORM_COMMAND:run -d $ORM_CONFIG --transaction each
elif [ "$1" == "revert" ]; then
  $PREREQUISITES
  # shellcheck disable=SC2086
  $TYPEORM_COMMAND:revert -d $ORM_CONFIG --transaction each
# Check if the first parameter is 'generate' and if the second parameter is not empty
elif [ "$1" == "generate" ] ; then
  if [ -z "$2" ]; then
    echo "Please provide a name for the migration."
  else
    $PREREQUISITES
    # shellcheck disable=SC2086
    $TYPEORM_COMMAND:generate $MIGRATION_DIR/$2 -d $ORM_CONFIG
  fi
else
  echo "Invalid parameter. Please provide 'run', 'revert' or 'generate'."
fi
