# Technology Stack Summary

| Technology | Purpose |
| --- | --- |
| Python 3.x | Primary language – leverages modern syntax, typing support, and extensive ecosystem. |
| Flask | Lightweight WSGI web framework for routing, request/response handling, and middleware support. |
| Flask-RESTful | Extension that simplifies building REST APIs by introducing Resource classes and automatic routing. |
| Flask-JWT | Adds JSON Web Token authentication endpoints (`/auth`) and decorators (`@jwt_required`) for route protection. |
| Flask-SQLAlchemy | Integrates SQLAlchemy ORM with Flask’s application context, managing sessions and models. |
| SQLite | Default file-based relational database for rapid prototyping and zero-configuration setup. |


---

## Python 3.x

Python 3.x is the backbone of this project, offering:

- Modern syntax (f-strings, type hints)  
- Rich standard library (multiprocessing, datetime, `sqlite3`)  
- Vast ecosystem via PyPI (Flask, SQLAlchemy, JWT libraries)

Example (project entrypoint):  

```python
# app.py
from flask import Flask
# ...
if __name__ == '__main__':
    from db import db
    db.init_app(app)
    app.run(port=5000, debug=True)
```

This script runs under Python 3.x to launch the Flask development server .

---

## Flask

Flask provides the core web framework:

- Routing & dispatching via decorators  
- Request/response objects for JSON, headers, status codes  
- Configuration management through `app.config`

Configuration in `app.py`:

```python
app = Flask(__name__)
app.config['PROPAGATE_EXCEPTIONS'] = True
app.secret_key = 'SapanCrackle'
```

These settings enable exception propagation and define the signing key for sessions and JWT .

---

## Flask-RESTful

The Flask-RESTful extension streamlines REST API development:

- Defines `Resource` classes with methods (`get`, `post`, `put`, `delete`)  
- Automatically maps resources to endpoints via `api.add_resource()`

Example of resource routing in `app.py`:

```python
from flask_restful import Api
from resources.book import Book, BookList

api = Api(app)
api.add_resource(Book,     '/book/<string:title>')
api.add_resource(BookList, '/books')
```

Clients interact with these endpoints to manage book entities .

---

## Flask-JWT

Flask-JWT integrates JWT-based authentication:

- Registers an `/auth` endpoint that returns an access token  
- Provides `@jwt_required()` decorator for protecting routes  

Setup in `app.py`:

```python
from flask_jwt import JWT
from security import authenticate, identity

jwt = JWT(app, authenticate, identity)  # exposes /auth
```

The `authenticate` and `identity` callbacks live in `security.py`, using `UserModel` lookup and `safestrcmp` to validate credentials .

Protected endpoint example in `resources/book.py`:

```python
from flask_jwt import jwt_required

class Book(Resource):
    @jwt_required()
    def get(self, title):
        # returns book data or 404
```

This ensures only authenticated users can fetch individual book records .

---

## Flask-SQLAlchemy

Flask-SQLAlchemy wraps SQLAlchemy ORM for Flask:

- Manages the database session lifecycle  
- Binds models to `app` using `db.init_app(app)`  
- Offers declarative model definitions and simple query APIs

Initialization in `db.py`:

```python
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
```

Configuration in `app.py`:

```python
app.config['SQLALCHEMY_DATABASE_URI']        = 'sqlite:///data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
```

Models import `db` to define tables and relationships:

```python
class BookModel(db.Model):
    __tablename__ = 'books'
    id       = db.Column(db.Integer, primary_key=True)
    title    = db.Column(db.String(80))
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'))
    store    = db.relationship('StoreModel')
    # ...
```

This pattern is repeated across `models/user.py`, `models/store.py`, etc., leveraging SQLAlchemy’s ORM API for CRUD operations .

---

## SQLite

SQLite is chosen as the default database for:

- Zero-configuration: no separate server required  
- Lightweight: ideal for demos and small applications  
- Portability: data stored in a single file (`data.db`)

By specifying:

```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
```

the application automatically reads from and writes to `data.db` in the project root. Flask-SQLAlchemy handles connection pooling and migrations transparently. 

---

End of Overview