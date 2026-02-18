# API Reference – User Registration (`POST /register`)

## Index
1. [Overview](#overview)  
2. [Endpoint Definition](#endpoint-definition)  
3. [Request](#request)  
   3.1 [Headers](#headers)  
   3.2 [Body](#body)  
4. [Responses](#responses)  
5. [Implementation Details](#implementation-details)  
6. [Related Components](#related-components)  

---

## Overview
The **User Registration** endpoint allows clients to create a new user account by providing a unique `username` and a `password`. This endpoint is _public_ (no JWT required) and is guarded against duplicate usernames—attempts to register an existing username will result in a `400 Bad Request` error.

---

## Endpoint Definition
In **app.py**, the `UserRegister` resource is bound to `POST /register` as follows:  
```python
api.add_resource(UserRegister, '/register')
```  
This mapping is initialized when the Flask application starts .

---

## Request

### Headers
| Header           | Value                   | Required |
|------------------|-------------------------|----------|
| Content-Type     | application/json        | Yes      |

### Body
Content type: **JSON**  
Clients must supply the following properties:

| Field      | Type   | Required | Description                         |
|------------|--------|----------|-------------------------------------|
| username   | string | Yes      | Desired unique username.            |
| password   | string | Yes      | Secure password for the account.    |

```json
{
  "username": "johndoe",
  "password": "s3cureP@ss"
}
```

---

## Responses

| Status Code | Body                                                                 | Description                                    |
|-------------|----------------------------------------------------------------------|------------------------------------------------|
| 201 Created | `{ "message": "User created successfully." }`                       | New user record created.                       |
| 400 Bad Request | `{ "message": "This field cannot be blank." }`<br/>`{ "message": "A user with that username already exists" }` | Missing fields or duplicate username.           |
| 500 Internal Server Error | `{ "message": "An error occurred creating the user." }` (not currently thrown by this endpoint, but may occur in extended implementations) | Unexpected database or server error.            |

---

## Example

```api
{
  "title": "User Registration",
  "description": "Creates a new user with a unique username and password.",
  "method": "POST",
  "baseUrl": "http://localhost:5000",
  "endpoint": "/register",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "required": true
    }
  ],
  "bodyType": "json",
  "requestBody": "{\n  \"username\": \"johndoe\",\n  \"password\": \"s3cureP@ss\"\n}",
  "responses": {
    "201": {
      "description": "User created successfully",
      "body": "{\n  \"message\": \"User created successfully.\"\n}"
    },
    "400": {
      "description": "Bad request (missing fields or duplicate username)",
      "body": "{\n  \"message\": \"A user with that username already exists\"\n}"
    }
  }
}
```

---

## Implementation Details

```python
# resources/user.py
from flask_restful import Resource, reqparse
from models.user import UserModel

class UserRegister(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'username',
        type=str,
        required=True,
        help="This field cannot be blank."
    )
    parser.add_argument(
        'password',
        type=str,
        required=True,
        help="This field cannot be blank."
    )

    def post(self):
        data = UserRegister.parser.parse_args()
        # Prevent duplicate usernames
        if UserModel.find_by_username(data['username']):
            return {"message": "A user with that username already exists"}, 400

        # Create and persist the new user
        user = UserModel(data['username'], data['password'])
        user.save_to_db()

        return {"message": "User created successfully."}, 201
```
- **Argument Parsing** via Flask-RESTful’s `reqparse` ensures both `username` and `password` are provided and non-empty.   
- Duplicate checks leverage `UserModel.find_by_username`.  
- Persistence is handled by `UserModel.save_to_db()`.  

---

## Related Components

| Component               | Description                                                                             |
|-------------------------|-----------------------------------------------------------------------------------------|
| `app.py`                | Registers the `UserRegister` resource and configures JWT, database, and Flask-RESTful.                       |
| `models/user.py`        | Defines `UserModel` ORM class mapping to the `users` table with helper methods.  |
| `db.py`                 | Initializes SQLAlchemy instance (`db = SQLAlchemy()`).                                  |
| `security.py`           | Exposes `authenticate` and `identity` functions for JWT, utilizing `UserModel`.         |
| Postman Collection      | Contains example requests for `/register` under the “/register” item.                   |

---

**Note:** While this endpoint currently does not wrap the database save in a `try/except`, production-ready implementations should handle potential database errors (e.g., connection issues) and return a `500 Internal Server Error` with an appropriate message.