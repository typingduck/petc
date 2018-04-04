# Pannus et Circulos API Server

An API for storing and retrieving a JSON document as well as applying JSON patches
[rfc6902](https://tools.ietf.org/html/rfc6902) through API patch requests and
websockets (for realtime collaboration).

## API

* **POST** `/docs`

> Create a new JSON document.

* **PUT** `/docs/:docId`

> Store a new JSON document.

* **GET** `/docs/:docId`

> Retrieve a JSON document.

* **PATCH** `/docs/:docId`

> Patch a JSON document. See [json patch reference](http://jsonpatch.com/) E.g
> 
> ```bash
> curl -X PATCH -d '
> [
>   { "op": "replace", "path": "/baz", "value": "boo" },
>   { "op": "add", "path": "/hello", "value": ["world"] },
>   { "op": "remove", "path": "/foo"}
> ]
>' http://api-server/docs/$DOCID
> ```

## Sockets

Uses [socket.io](https://socket.io/) for websockets to push document updates to
web clients. Events:

* **'doc-select'**

> Used by clients to select which document they want to listen to updates for.
Currently a client only listens to updates for one document at a time.

* **'doc-patch'**

> A JSON-patch emitted by a client over websockets or using the PATCH API.
