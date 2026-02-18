# Data Models

## Index
1. [Overview](#overview)  
2. [Table Definition](#table-definition)  
3. [Model Attributes](#model-attributes)  
4. [Constructor](#constructor)  
5. [Persistence Methods](#persistence-methods)  
6. [Lookup Methods](#lookup-methods)  
7. [Integration & Usage](#integration--usage)  

---

## 1. Overview
The **UserModel** represents the `users` table in the database. It encapsulates all operations related to user persistence and lookup within the application. This model is a central piece for:
- **User Registration** (`/register` endpoint)  
- **Authentication** via JWT (`/auth` endpoint)  

The model is defined using SQLAlchemy’s declarative base and integrates seamlessly with Flask-RESTful resources and Flask-JWT for authentication.  

---

## 2. Table Definition

```python
from db import db

class UserModel(db.Model):
    __tablename__ = 'users'
    id       = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80))
    password = db.Column(db.String(80))
```


- **`__tablename__`**  
  Maps this class to the `users` table in the database.  

---

## 3. Model Attributes

| Attribute  | Type             | Constraints             | Description                       |
|------------|------------------|-------------------------|-----------------------------------|
| **id**       | `Integer`        | `primary_key=True`      | Unique identifier for each user.  |
| **username** | `String(80)`     | —                       | Username chosen by the user.      |
| **password** | `String(80)`     | —                       | User’s password (stored in plain text in this demo). |

---

## 4. Constructor

```python
def __init__(self, username, password):
    self.username = username
    self.password = password
```
- Initializes a new `UserModel` instance with a **username** and **password**.   

---

## 5. Persistence Methods

### save_to_db
```python
def save_to_db(self):
    db.session.add(self)
    db.session.commit()
```
- **Purpose:** Inserts a new record or updates an existing one in the `users` table.  
- **Usage:** Called internally by resources when creating users.   

---

## 6. Lookup Methods

| Method                    | Signature                                | Returns                | Description                                 |
|---------------------------|------------------------------------------|------------------------|---------------------------------------------|
| **find_by_username**      | `@classmethod def find_by_username(cls, username)` | `UserModel` or `None` | Fetches the first user matching the given username. |
| **find_by_id**            | `@classmethod def find_by_id(cls, _id)`  | `UserModel` or `None` | Fetches the user matching the given primary key.   |

```python
@classmethod
def find_by_username(cls, username):
    return cls.query.filter_by(username=username).first()

@classmethod
def find_by_id(cls, _id):
    return cls.query.filter_by(id=_id).first()
```
- Utilized by both **user registration** (to prevent duplicates) and **authentication** routines.   

---

## 7. Integration & Usage

### 7.1. User Registration Endpoint

The `UserRegister` resource handles new user sign-ups:

```python
from flask_restful import Resource, reqparse
from models.user import UserModel

class UserRegister(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('username', type=str, required=True, help="This field cannot be blank.")
    parser.add_argument('password', type=str, required=True, help="This field cannot be blank.")

    def post(self):
        data = UserRegister.parser.parse_args()
        if UserModel.find_by_username(data['username']):
            return {"message": "A user with that username already exists"}, 400
        
        user = UserModel(data['username'], data['password'])
        user.save_to_db()
        return {"message": "User created successfully."}, 201
```
- **Endpoint:** `POST /register`  
- **Dependency:** `UserModel.find_by_username` and `save_to_db`   

### 7.2. Authentication Flow

Flask-JWT uses two functions—`authenticate` and `identity`—to handle JWT-based authentication:

```python
from werkzeug.security import safe_str_cmp
from models.user import UserModel

def authenticate(username, password):
    user = UserModel.find_by_username(username)
    if user and safe_str_cmp(user.password, password):
        return user

def identity(payload):
    user_id = payload['identity']
    return UserModel.find_by_id(user_id)
```
- **`authenticate`** validates credentials by fetching the user via **find_by_username** and comparing passwords.  
- **`identity`** retrieves the user object from JWT payload using **find_by_id**.  
- Registered in **app.py** as:
  ```python
  jwt = JWT(app, authenticate, identity)  # /auth
  ```  
     

---

**Note:**  
- In production, passwords should be **hashed** (e.g., using `bcrypt`) rather than stored in plain text.  
- The model does not define relationships to other tables; it is a standalone entity.  

---  
*End of UserModel documentation.*