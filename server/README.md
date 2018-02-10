# Server

For storing and retrieving a JSON document as well as applying JSON patches
[rfc6902](https://tools.ietf.org/html/rfc6902).

## API

* **PUT** `/docs/:docId`

> Store a new JSON document.

* **GET** `/docs/:docId`

> Retrieve a JSON document.

* **PATCH** `/docs/:docId`

> Patch a JSON document. See [json patch reference](http://jsonpatch.com/) E.g

```
PATCH /docs/838EE128-CB89-4833-BBB6-CA1E51BB5F28

[
  { "op": "replace", "path": "/baz", "value": "boo" },
  { "op": "add", "path": "/hello", "value": ["world"] },
  { "op": "remove", "path": "/foo"}
]
```

## Sockets

Uses [socket.io](https://socket.io/) to create websockets for pushing update to
web clients. Events:

* **'doc-select'**

> Used by clients to select which document they want to listen to updates for.
Currently a client only listens to updates for one document at a time.

* **'doc-patch'**

> A JSON-patch emitted by a client over websockets or using the PATCH API.
