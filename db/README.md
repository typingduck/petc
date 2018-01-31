# Database

Uses couchdb for quick iteration. Not sure if a good long-term solution but
good enough to start with.

## To run:

    docker-compose up -d

(runs database on port 9999)

The very first time when starting need to create the database:

    curl -X PUT "http://admin:password@127.0.0.1:9999/petc

(data goes into `data/` folder by default so is saved between restarts).


## Useful commands

#### Add document

    curl -X POST -H 'Content-Type: application/json' -d '{"some": "json"}' 'http://admin:password@127.0.0.1:9999/petc'

or

    curl -X PUT -H 'Content-Type: application/json' -d '{"some": "json"}' 'http://admin:password@127.0.0.1:9999/petc/mydocid'

#### Show number of documents

    curl -X GET 'http://admin:password@127.0.0.1:9999/petc'  | jq .doc_count

#### Get all document ids

    curl -X GET 'http://admin:password@127.0.0.1:9999/petc/_all_docs' | jq '.rows | map(.id)'
