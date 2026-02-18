# API Reference

Welcome to the **Store Endpoints** reference for our Flask-RESTful demo API. This section covers all routes related to store management: creating, retrieving, deleting, and listing stores. Internally, stores are represented by the `StoreModel` class (in `models/store.py`) and exposed via the `Store` and `StoreList` resources (in `resources/store.py`) .

---

## Index

- [Overview](#overview)  
- [Endpoint Summary](#endpoint-summary)  
- [GET /store/{name}](#get-storename)  
- [POST /store/{name}](#post-storename)  
- [DELETE /store/{name}](#delete-storename)  
- [GET /stores](#get-stores)  

---

## Overview

The **Store** endpoints allow clients to:

- **Create** a new store by name  
- **Retrieve** a store’s details, including its associated books  
- **Delete** a store  
- **List** all stores in the system  

Each endpoint is registered in `app.py` as follows:

```python
api.add_resource(Store,     '/store/<string:name>')
api.add_resource(StoreList, '/stores')
```


Under the hood, `StoreModel` is a SQLAlchemy model with:

- **id** (Integer, PK)  
- **name** (String)  
- **books** (One-to-many relationship to `BookModel`, lazy loaded)  

Key methods on `StoreModel` include:

- `find_by_name(name)` – lookup by name  
- `json()` – serialize to `{'name': ..., 'books': [...]}`  
- `save_to_db()` / `delete_from_db()` – persistence operations  


---

## Endpoint Summary

| Endpoint              | Method  | Description                                |
|-----------------------|---------|--------------------------------------------|
| **/store/{name}**     | GET     | Retrieve a single store by **name**        |
| **/store/{name}**     | POST    | Create a new store                         |
| **/store/{name}**     | DELETE  | Delete an existing store                   |
| **/stores**           | GET     | List all stores                            |

---

### GET /store/{name}

**Retrieve a store** by its unique **name**, returning its details and associated books.

```api
{
    "title": "Retrieve Store",
    "description": "Fetches a single store and its books by store name.",
    "method": "GET",
    "baseUrl": "http://localhost:5000",
    "endpoint": "/store/{name}",
    "headers": [],
    "queryParams": [],
    "pathParams": [
        {
            "key": "name",
            "value": "The name of the store to retrieve.",
            "required": true
        }
    ],
    "bodyType": "none",
    "requestBody": "",
    "responses": {
        "200": {
            "description": "Store found",
            "body": "{\"name\": \"MyBookstore\", \"books\": []}"
        },
        "404": {
            "description": "Store not found",
            "body": "{\"message\": \"Store not found\"}"
        }
    }
}
```

**Behavior**  
- On success, returns HTTP 200 with the store’s JSON payload.  
- If no store exists with the given name, returns HTTP 404.  

---

### POST /store/{name}

**Create a new store** identified by **name**. Names must be unique.

```api
{
    "title": "Create Store",
    "description": "Creates a new store with the specified name.",
    "method": "POST",
    "baseUrl": "http://localhost:5000",
    "endpoint": "/store/{name}",
    "headers": [
        {
            "key": "Content-Type",
            "value": "application/json",
            "required": false
        }
    ],
    "queryParams": [],
    "pathParams": [
        {
            "key": "name",
            "value": "The unique name for the new store.",
            "required": true
        }
    ],
    "bodyType": "none",
    "requestBody": "",
    "responses": {
        "201": {
            "description": "Store created successfully",
            "body": "{\"name\": \"NewStore\", \"books\": []}"
        },
        "400": {
            "description": "Store already exists",
            "body": "{\"message\": \"A store with name 'NewStore' already exists.\"}"
        },
        "500": {
            "description": "Server error on creation",
            "body": "{\"message\": \"An error occurred creating the store.\"}"
        }
    }
}
```

**Behavior**  
- Returns HTTP 201 with the new store’s JSON when creation succeeds.  
- Returns HTTP 400 if a store with that name already exists.  
- Returns HTTP 500 if a database error occurs during save.  

---

### DELETE /store/{name}

**Delete an existing store** by its **name**.

```api
{
    "title": "Delete Store",
    "description": "Removes the store with the given name.",
    "method": "DELETE",
    "baseUrl": "http://localhost:5000",
    "endpoint": "/store/{name}",
    "headers": [],
    "queryParams": [],
    "pathParams": [
        {
            "key": "name",
            "value": "The name of the store to delete.",
            "required": true
        }
    ],
    "bodyType": "none",
    "requestBody": "",
    "responses": {
        "200": {
            "description": "Store deleted (if it existed)",
            "body": "{\"message\": \"Store deleted\"}"
        }
    }
}
```

**Behavior**  
- Always returns HTTP 200 with a deletion confirmation message.  
- If the store did not exist, the same confirmation message is returned.  

---

### GET /stores

**List all stores** currently in the database.

```api
{
    "title": "List All Stores",
    "description": "Retrieves a list of all stores, each with its books.",
    "method": "GET",
    "baseUrl": "http://localhost:5000",
    "endpoint": "/stores",
    "headers": [],
    "queryParams": [],
    "pathParams": [],
    "bodyType": "none",
    "requestBody": "",
    "responses": {
        "200": {
            "description": "A list of stores",
            "body": "{\"stores\": [{\"name\": \"Store1\", \"books\": []}, {\"name\": \"Store2\", \"books\": []}]}"
        }
    }
}
```

**Behavior**  
- Returns HTTP 200 with an array of all stores and their book listings.  

---

## Implementation Details

- **Resource Classes**  
  - `Store` handles **GET**, **POST**, **DELETE** for `/store/<name>`.  
  - `StoreList` handles **GET** for `/stores`.  
  Both extend `flask_restful.Resource` and interact with the `StoreModel` .

- **Model Layer**  
  - `StoreModel` (in `models/store.py`) defines the database schema and provides helper methods like `find_by_name`, `save_to_db`, and `delete_from_db` .

- **Error Handling**  
  - Standard HTTP codes are used:  
    - **200**: Success (retrieval, deletion).  
    - **201**: Resource created.  
    - **400**: Bad request (duplicate name).  
    - **404**: Not found.  
    - **500**: Server/database errors.

This completes the **Store Endpoints** documentation. For more information on authentication, book resources, or user registration, refer to their respective sections.