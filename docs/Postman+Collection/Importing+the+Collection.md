# Postman Collection – Importing the Collection

This section explains how to import and configure the provided Postman collection, **Python Rest API**, to exercise every endpoint of the demo RESTful API (built with Flask, Flask-RESTful, Flask-JWT, and SQLAlchemy). The collection includes requests for user registration, authentication, and full CRUD operations on **books** and **stores**, complete with tests that capture and reuse the JWT access token.

---

## 📑 Index

1. [Prerequisites](#prerequisites)  
2. [Importing the Collection](#importing-the-collection)  
3. [Configuring Environment Variables](#configuring-environment-variables)  
4. [Exploring the Collection Structure](#exploring-the-collection-structure)  
5. [Built-in Tests & Scripts](#built-in-tests--scripts)  
6. [Quick-Start Workflow](#quick-start-workflow)  

---

## Prerequisites

- **Postman** (v7.0+) installed on your machine.  
- The API running locally (default: `http://localhost:5000`) or remotely.  
- Access to the JSON file:  
  `postman-collections/Python Rest API.postman_collection.json` .

---

## Importing the Collection

1. Open **Postman**.  
2. Click **Import** (top-left).  
3. Select **File** → **Choose Files**.  
4. Navigate to the repository and pick  
   ```
   postman-collections/Python Rest API.postman_collection.json
   ```  
5. Click **Open** → **Import**.  

Once imported, you’ll see a new collection named **Python Rest API** with all predefined requests.

<details>
<summary><strong>Raw Collection Info (excerpt)</strong></summary>

```json
{
  "info": {
    "_postman_id": "cc4b0006-42be-4ace-8ef4-5c7f79653d34",
    "name": "Python Rest API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [ … ]
}
```

</details>

---

## Configuring Environment Variables

The collection relies on two variables:

| Variable    | Description                        | Example Value             |
|-------------|------------------------------------|---------------------------|
| **url**     | Base URL of your running API       | `http://localhost:5000`   |
| **jwt_token** | JWT access token (populated by `/auth` test) | *—*                       |

### Setting Variables

1. Click the **Environment** dropdown (top-right) → **Manage Environments**.  
2. Create a new environment (e.g., **Python-API-Env**).  
3. Add two variables:

   | Key        | Initial Value             | Current Value |
   |------------|---------------------------|---------------|
   | `url`      | `http://localhost:5000`   |               |
   | `jwt_token`| *(leave blank)*           |               |

4. Save and select **Python-API-Env**.

All endpoints use `{{url}}` in their URLs; those requiring authentication append an **Authorization** header:

```
Authorization: JWT {{jwt_token}}
```

---

## Exploring the Collection Structure

| Request Name            | Method | Endpoint                 | Auth Required? | Body     |
|-------------------------|--------|--------------------------|----------------|----------|
| **Register User**       | POST   | `/register`              | No             | JSON     |
| **Authenticate (Auth)** | POST   | `/auth`                  | No             | JSON     |
| **List Stores**         | GET    | `/stores`                | No             | —        |
| **Create Store**        | POST   | `/store/:name`           | Yes            | —        |
| **Get Store**           | GET    | `/store/:name`           | No             | —        |
| **Delete Store**        | DELETE | `/store/:name`           | No             | —        |
| **List Books**          | GET    | `/books`                 | No             | —        |
| **Get Book**            | GET    | `/book/:title`           | Yes            | —        |
| **Create Book**         | POST   | `/book/:title`           | Yes            | JSON     |
| **Update Book**         | PUT    | `/book/:title`           | No             | JSON*    |
| **Delete Book**         | DELETE | `/book/:title`           | No             | —        |

\* The **Update Book** request in this collection has no body by default; you can toggle **Body → raw (JSON)** and supply fields as needed. 

---

## Built-in Tests & Scripts

The **Authenticate** request (`POST /auth`) includes a test script that:

1. **Asserts** the returned `access_token` is not empty.  
2. **Stores** the token into the `jwt_token` global variable for subsequent requests.

```javascript
pm.test("JWT Token Not Empty", function () {
    var jsonData = pm.response.json();
    pm.globals.set("jwt_token", jsonData.access_token);
});
```
This snippet is defined under the `event` → `test` section in the JSON: 

---

## Quick-Start Workflow

1. **Register** a new user  
2. **Authenticate** to obtain a JWT  
3. **Create** stores and books (using the token)  
4. **Query**, **update**, and **delete** resources  

> **Tip:** Use **Runner** in Postman to execute all requests in sequence.

---

**Happy Testing!**