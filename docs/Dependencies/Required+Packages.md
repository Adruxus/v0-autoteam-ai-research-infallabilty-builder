# Dependencies – Required Packages

**Index**  
- [Overview](#overview)  
- [requirements.txt](#requirementstxt)  
- [Package Details](#package-details)  
  - [Flask](#flask)  
  - [Flask-RESTful](#flask-restful)  
  - [Flask-JWT](#flask-jwt)  
  - [Flask-SQLAlchemy](#flask-sqlalchemy)  
  - [Werkzeug](#werkzeug)  
- [Installation](#installation)  

---

## Overview

This demo RESTful API leverages several key Python packages to provide a structured, secure, and database‐backed web service:

- **Flask**: Core microframework for request handling and server runtime.  
- **Flask-RESTful**: Extension adding resource‐oriented routing and request parsing.  
- **Flask-JWT**: Provides JSON Web Token (JWT) authentication integration.  
- **Flask-SQLAlchemy**: ORM layer simplifying database models and sessions.  
- **Werkzeug**: Utility library used here for secure string comparison.

These dependencies are declared in `requirements.txt` and imported throughout the codebase to fulfill specific roles.

---

## requirements.txt

```text
Flask
Flask-RESTful
Flask-JWT
Flask-SQLAlchemy
Werkzeug
```

---

## Package Details

| **Package**           | **Purpose**                                              | **Imported In**         | **Key Usage**                                                                                                 |
|-----------------------|----------------------------------------------------------|-------------------------|---------------------------------------------------------------------------------------------------------------|
| **Flask**             | Foundation web framework                                | `app.py`                | Create `Flask` app instance, configure settings, and run server                             |
| **Flask-RESTful**     | Resource routing & request parsing                      | `app.py`, `resources/*` | Instantiate `Api(app)`, subclass `Resource`, use `reqparse.RequestParser` for payload validation  |
| **Flask-JWT**         | JWT-based authentication                                | `app.py`, `resources/book.py` | Initialize `JWT(app, authenticate, identity)` for `/auth` endpoint; use `@jwt_required()` decorator  |
| **Flask-SQLAlchemy**  | ORM for defining models & database sessions              | `db.py`, `models/*`     | Create `SQLAlchemy()` instance, define model classes inheriting `db.Model`, manage `db.session` operations  |
| **Werkzeug**          | Utility functions (e.g., secure string comparison)       | `security.py`           | Use `safe_str_cmp` to compare plaintext passwords securely during authentication             |

---

### Flask

- **Installation**: `pip install Flask`  
- **Role**: Serves as the core HTTP server and routing engine.  
- **Example Import**:
  ```python
  from flask import Flask
  app = Flask(__name__)
  ```
- **Configuration & Usage**:
  ```python
  app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
  app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
  app.secret_key = 'YourSecretKey'
  ```

### Flask-RESTful

- **Installation**: `pip install Flask-RESTful`  
- **Role**: Simplifies creation of RESTful endpoints via Resource classes.  
- **Example Import**:
  ```python
  from flask_restful import Api, Resource, reqparse
  api = Api(app)
  ```
- **Key Concepts**:
  - `Resource` subclasses define HTTP methods (`get`, `post`, `put`, `delete`).  
  - `reqparse.RequestParser` handles request payload validation.

### Flask-JWT

- **Installation**: `pip install Flask-JWT`  
- **Role**: Integrates JWT authentication, providing `/auth` endpoint and `@jwt_required()` decorator.  
- **Example Import & Initialization**:
  ```python
  from flask_jwt import JWT
  jwt = JWT(app, authenticate, identity)  # creates /auth
  ```
- **Authentication Flow**:
  1. Client posts credentials to `/auth`.  
  2. `authenticate(username, password)` verifies via `UserModel`.  
  3. On success, returns JWT for protected endpoints.  
  4. Decorated resources (`@jwt_required()`) enforce token validation.

### Flask-SQLAlchemy

- **Installation**: `pip install Flask-SQLAlchemy`  
- **Role**: Bridges Flask app with SQLAlchemy ORM for model definitions and database sessions.  
- **Example Import & Setup**:
  ```python
  from flask_sqlalchemy import SQLAlchemy
  db = SQLAlchemy(app)
  ```
- **Model Definition**:
  ```python
  class UserModel(db.Model):
      __tablename__ = 'users'
      id = db.Column(db.Integer, primary_key=True)
      username = db.Column(db.String(80))
      password = db.Column(db.String(80))
      # ...
  ```
- **Session Management**:
  - `db.session.add()`, `db.session.commit()` for persistence.  
  - `db.session.delete()` for removals.

### Werkzeug

- **Installation**: Installed as a Flask dependency; can explicitly `pip install Werkzeug`.  
- **Role**: Provides low‐level utilities; here used for secure string comparisons.  
- **Example Import**:
  ```python
  from werkzeug.security import safe_str_cmp
  ```
- **Usage in `security.py`**:
  ```python
  def authenticate(username, password):
      user = UserModel.find_by_username(username)
      if user and safe_str_cmp(user.password, password):
          return user
  ```

---

## Installation

To install all required dependencies, run:

```bash
pip install -r requirements.txt
```

This ensures that **Flask**, **Flask-RESTful**, **Flask-JWT**, **Flask-SQLAlchemy**, and **Werkzeug** are available for the application to run correctly.