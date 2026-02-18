# Project Structure – Directory Layout

Below is an overview of the directory layout for the magarrent/REST-API-PYTHON-demo project. This section explains the purpose of each file and folder, and how they fit into the overall architecture.

## Index

1. <a href="#directory-tree">Directory Tree</a>
1. <a href="#top-level-files">Top-Level Files</a>
1. <a href="#models-directory">Models Directory</a>
1. <a href="#resources-directory">Resources Directory</a>
1. <a href="#postman-collections">Postman Collections</a>

---

## Directory Tree

```bash
PYTHON/
├── app.py            # Application entry point
├── db.py             # SQLAlchemy instance
├── security.py       # JWT authenticate/identity functions
├── models/           # ORM models
│   ├── book.py
│   ├── store.py
│   └── user.py
└── resources/        # REST resource definitions
    ├── book.py
    ├── store.py
    └── user.py

postman-collections/   # Postman collection for API testing
```

---

## Top-Level Files

| File | Purpose | Key Notes |
| --- | --- | --- |
| app.py | Entry point for the Flask application. Configures the app, JWT, and routes. | • Initializes <code>Flask</code>, <code>Api</code>, and JWT• Registers resources |
| db.py | Creates and exports the global <code>SQLAlchemy</code> instance used across models. | • <code>db = SQLAlchemy()</code> |
| security.py | Defines authentication and identity functions for Flask-JWT. | • <code>authenticate()</code> and <code>identity()</code> implementations |

### app.py

```python
from flask import Flask
from flask_restful import Api
from flask_jwt import JWT

from security import authenticate, identity
from resources.user import UserRegister
from resources.book import Book, BookList
from resources.store import Store, StoreList

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['PROPAGATE_EXCEPTIONS'] = True
app.secret_key = 'SapanCrackle'

api = Api(app)

@app.before_first_request
def create_tables():
    db.create_all()

jwt = JWT(app, authenticate, identity)  # /auth

# Resource routing
api.add_resource(Store, '/store/<string:name>')
api.add_resource(StoreList, '/stores')
api.add_resource(Book, '/book/<string:title>')
api.add_resource(BookList, '/books')
api.add_resource(UserRegister, '/register')

if __name__ == '__main__':
    from db import db
    db.init_app(app)
    app.run(port=5000, debug=True)
```

- Purpose: Bootstraps the app, sets up database tables, JWT authentication endpoint (<code>/auth</code>), and RESTful routes for stores, books, and user registration .

---

## Models Directory

Contains the ORM models mapping Python classes to database tables using SQLAlchemy.

| File | Model | Table Name | Relations |
| --- | --- | --- | --- |
| book.py | <code>BookModel</code> | <code>books</code> | FK → <code>stores.id</code>, relationship to <code>StoreModel</code> |
| store.py | <code>StoreModel</code> | <code>stores</code> | One-to-many with <code>BookModel</code> |
| user.py | <code>UserModel</code> | <code>users</code> | — |

### Sample: book.py

```python
from db import db

class BookModel(db.Model):
    __tablename__ = 'books'

    id           = db.Column(db.Integer, primary_key=True)
    title        = db.Column(db.String(80))
    author       = db.Column(db.String(80))
    isbn         = db.Column(db.String(40))
    release_date = db.Column(db.String(10))
    price        = db.Column(db.Float(precision=2))
    store_id     = db.Column(db.Integer, db.ForeignKey('stores.id'))
    store        = db.relationship('StoreModel')

    def json(self):
        return {
            'title': self.title,
            'price': self.price,
            'author': self.author,
            'isbn': self.isbn,
            'release_date': self.release_date
        }

    @classmethod
    def find_by_title(cls, title):
        return cls.query.filter_by(title=title).first()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()
```

- Responsibilities:
    - CRUD operations via <code>savetodb()</code>, <code>deletefromdb()</code>.
    - Query helpers like <code>findbytitle()</code>.
    - Serialization through <code>json()</code> method .

---

## Resources Directory

Implements RESTful resource controllers using Flask-RESTful. Each file defines endpoints and request parsing.

| File | Resource(s) | Endpoints |
| --- | --- | --- |
| user.py | <code>UserRegister</code> | POST <code>/register</code> |
| book.py | <code>Book</code>, <code>BookList</code> | GET/POST/PUT/DELETE <code>/book/&lt;/code&gt;&lt;br&gt;GET &lt;code&gt;/books&lt;/code&gt;</code> |
| store.py | <code>Store</code>, <code>StoreList</code> | GET/POST/DELETE <code>/store/</code>GET <code>/stores</code> |

### Sample: resources/book.py

```python
from flask_restful import Resource, reqparse
from flask_jwt import jwt_required
from models.book import BookModel

class Book(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('price', type=float, required=True, help="This field cannot be left blank!")
    parser.add_argument('store_id', type=int,   required=True, help="Every item needs a store_id.")
    parser.add_argument('author',   type=str,   required=True, help="Every item needs an author.")
    parser.add_argument('isbn',     type=str,   required=True, help="Every item needs an ISBN.")
    parser.add_argument('release_date', type=str)

    @jwt_required()
    def get(self, title):
        book = BookModel.find_by_title(title)
        if book:
            return book.json()
        return {'message': 'Book not found'}, 404

    def post(self, title):
        if BookModel.find_by_title(title):
            return {'message': f"Book '{title}' already exists."}, 400
        data = Book.parser.parse_args()
        book = BookModel(title, **data)
        try:
            book.save_to_db()
        except:
            return {"message": "An error occurred inserting the book."}, 500
        return book.json(), 201

    def delete(self, title):
        book = BookModel.find_by_title(title)
        if book:
            book.delete_from_db()
            return {'message': 'Book deleted.'}
        return {'message': 'Book not found.'}, 404

    def put(self, title):
        data = Book.parser.parse_args()
        book = BookModel.find_by_title(title)
        if book:
            book.price = data['price']
        else:
            book = BookModel(title, **data)
        book.save_to_db()
        return book.json()

class BookList(Resource):
    def get(self):
        return {'books': [b.json() for b in BookModel.query.all()]}
```

- Key Patterns:
    - Request parsing with <code>reqparse</code> ensures valid inputs.
    - JWT protection (<code>@jwt_required()</code>) on sensitive endpoints.
    - Resource routing declared in <code>app.py</code>.

---

## Postman Collections

Located under <code>postman-collections/</code>, this folder contains a Postman collection (<code>Python Rest API.postman_collection.json</code>) that bundles all endpoints for easy testing.

- Usage: Import into Postman to run and automate API calls.
- Includes: <code>/auth</code>, <code>/register</code>, <code>/books</code>, <code>/book/&lt;/code&gt;, &lt;code&gt;/stores&lt;/code&gt;, &lt;code&gt;/store/&lt;name&gt;&lt;/code&gt; with example requests and tests. </code>

---

This directory layout enforces a clear separation of concerns:

- <code>app.py</code> ties everything together.
- <code>db.py</code> centralizes database setup.
- <code>security.py</code> handles authentication logic.
- <code>models/</code> defines data schemas and persistence methods.
- <code>resources/</code> maps HTTP requests to business logic.
- <code>postman-collections/</code> aids in testing.

Together, these components form a modular, maintainable RESTful API built with Flask, Flask-RESTful, Flask-JWT, and SQLAlchemy.