# Pregenerated Data

Upload following 3 files to db if they are not exists with following command:

```sh
MONGO_CONNECTION_STRING="<connection string>"
mongoimport --uri=$MONGO_CONNECTION_STRING --collection=menus --file=**/menus.json
mongoimport --uri=$MONGO_CONNECTION_STRING --collection=roles --file=**/roles.json
mongoimport --uri=$MONGO_CONNECTION_STRING --collection=users --file=**/users.json
```

Or do it manually...