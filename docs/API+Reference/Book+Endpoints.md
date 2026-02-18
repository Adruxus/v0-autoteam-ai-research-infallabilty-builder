# API Reference – Book Endpoints

This section covers the **Book** resource for managing books in the demo RESTful API. It includes the full CRUD operations on individual books and listing all books. The Book endpoints are implemented in `resources/book.py` using Flask-RESTful’s `Resource` class and secured with JWT where noted. Under the hood, they delegate persistence to the `BookModel` ORM class in `models/book.py`.  

**Route Registration**  
The endpoints are registered in the application entrypoint:  
```python
api.add_resource(Book, '/book/<string:title>')
api.add_resource(BookList, '/books')
```  
– app configuration in `app.py` 

---

## Index

- [Data Model](#data-model)
- [Retrieve Book Details](#retrieve-book-details)
- [Create a New Book](#create-a-new-book)
- [Update or Create Book](#update-or-create-book)
- [Delete a Book](#delete-a-book)
- [List All Books](#list-all-books)

---

## Data Model

The `BookModel` defines the database schema and JSON representation for a book :

| Field         | Type    | Required | Description                    |
| ------------- | ------- | -------- | ------------------------------ |
| **id**        | Integer | Yes      | Auto-incremented primary key   |
| **title**     | String (80) | Yes  | Title of the book (unique)     |
| **author**    | String (80) | Yes  | Author’s name                  |
| **isbn**      | String (40) | Yes  | ISBN identifier                |
| **release_date** | String (10) | No | Release date (YYYY-MM-DD)      |
| **price**     | Float   | Yes      | Price of the book              |
| **store_id**  | Integer | Yes      | Foreign key to `stores.id`     |

```python
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
    …
```  
– `BookModel` in `models/book.py` 

---

## Retrieve Book Details

**GET /book/{title}**  
Retrieves the details of a book by its title.  
> **Authentication:** JWT required  
> **Decorator:** `@jwt_required()` 

```api
{
    "title": "Retrieve Book Details",
    "description": "Fetch a book’s full details by title. Requires a valid JWT token.",
    "method": "GET",
    "baseUrl": "http://localhost:5000",
    "endpoint": "/book/{title}",
    "headers": [
        {
            "key": "Authorization",
            "value": "JWT <token>",
            "required": true
        }
    ],
    "pathParams": [
        {
            "key": "title",
            "value": "Title of the book to retrieve",
            "required": true
        }
    ],
    "bodyType": "none",
    "requestBody": "",
    "responses": {
        "200": {
            "description": "Book found",
            "body": "{\n  \"title\": \"Kalinga\",\n  \"price\": 200.0,\n  \"author\": \"sapan mohanty\",\n  \"isbn\": \"WER3455\",\n  \"release_date\": \"2020-12-12\"\n}"
        },
        "404": {
            "description": "Book not found",
            "body": "{\n  \"message\": \"book not found\"\n}"
        },
        "401": {
            "description": "Missing or invalid JWT",
            "body": "{\n  \"message\": \"Could not authorize.\"\n}"
        }
    }
}
```

---

## Create a New Book

**POST /book/{title}**  
Creates a new book record with the given title and JSON payload.  
> **Validation:**  
> - `price` (float, required)  
> - `store_id` (int, required)  
> - `author` (string, required)  
> - `isbn` (string, required)  
> - `release_date` (string, optional)  
>  
> **Error Cases:**  
> - 400 if a book with the same title already exists  
> - 500 on database insertion error  

```api
{
    "title": "Create a New Book",
    "description": "Add a new book under the specified title.",
    "method": "POST",
    "baseUrl": "http://localhost:5000",
    "endpoint": "/book/{title}",
    "headers": [
        {
            "key": "Content-Type",
            "value": "application/json",
            "required": true
        }
    ],
    "pathParams": [
        {
            "key": "title",
            "value": "Unique title for the new book",
            "required": true
        }
    ],
    "bodyType": "json",
    "requestBody": "{\n  \"price\": 29.99,\n  \"store_id\": 2,\n  \"author\": \"Jane Doe\",\n  \"isbn\": \"1234567890\",\n  \"release_date\": \"2021-08-15\"\n}",
    "responses": {
        "201": {
            "description": "Book successfully created",
            "body": "{\n  \"title\": \"NewBook\",\n  \"price\": 29.99,\n  \"author\": \"Jane Doe\",\n  \"isbn\": \"1234567890\",\n  \"release_date\": \"2021-08-15\"\n}"
        },
        "400": {
            "description": "Book with title already exists",
            "body": "{\n  \"message\": \"An book with title 'NewBook' already exists.\" \n}"
        },
        "500": {
            "description": "Database insertion error",
            "body": "{\n  \"message\": \"An error occurred inserting the book.\" \n}"
        }
    }
}
```

---

## Update or Create Book

**PUT /book/{title}**  
Updates the price of an existing book or creates a new one if not found.  
> **Payload:** Same as **POST** (all required except `release_date`)  

```api
{
    "title": "Update or Create Book",
    "description": "If the book exists, update its price; otherwise create it.",
    "method": "PUT",
    "baseUrl": "http://localhost:5000",
    "endpoint": "/book/{title}",
    "headers": [
        {
            "key": "Content-Type",
            "value": "application/json",
            "required": true
        }
    ],
    "pathParams": [
        {
            "key": "title",
            "value": "Title of the book to update or create",
            "required": true
        }
    ],
    "bodyType": "json",
    "requestBody": "{\n  \"price\": 19.99,\n  \"store_id\": 3,\n  \"author\": \"John Smith\",\n  \"isbn\": \"0987654321\",\n  \"release_date\": \"2022-01-01\"\n}",
    "responses": {
        "200": {
            "description": "Book created or updated",
            "body": "{\n  \"title\": \"MyBook\",\n  \"price\": 19.99,\n  \"author\": \"John Smith\",\n  \"isbn\": \"0987654321\",\n  \"release_date\": \"2022-01-01\"\n}"
        }
    }
}
```

---

## Delete a Book

**DELETE /book/{title}**  
Removes a book by title.  

```api
{
    "title": "Delete a Book",
    "description": "Delete the specified book if it exists.",
    "method": "DELETE",
    "baseUrl": "http://localhost:5000",
    "endpoint": "/book/{title}",
    "headers": [],
    "pathParams": [
        {
            "key": "title",
            "value": "Title of the book to delete",
            "required": true
        }
    ],
    "bodyType": "none",
    "requestBody": "",
    "responses": {
        "200": {
            "description": "Book deleted successfully",
            "body": "{\n  \"message\": \"Item deleted.\" \n}"
        },
        "404": {
            "description": "Book not found",
            "body": "{\n  \"message\": \"Item not found.\" \n}"
        }
    }
}
```

---

## List All Books

**GET /books**  
Retrieves a list of all books in the database. No authentication required. 

```api
{
    "title": "List All Books",
    "description": "Fetch all books. Public endpoint.",
    "method": "GET",
    "baseUrl": "http://localhost:5000",
    "endpoint": "/books",
    "headers": [],
    "queryParams": [],
    "pathParams": [],
    "bodyType": "none",
    "requestBody": "",
    "responses": {
        "200": {
            "description": "Array of book objects",
            "body": "{\n  \"books\": [\n    {\n      \"title\": \"Kalinga\",\n      \"price\": 200.0,\n      \"author\": \"sapan mohanty\",\n      \"isbn\": \"WER3455\",\n      \"release_date\": \"2020-12-12\"\n    },\n    …\n  ]\n}"
        }
    }
}
```

---

**Implementation Notes:**

- **Parsing & Validation**  
  All create/update endpoints use a shared `reqparse.RequestParser` to enforce required fields (`price`, `store_id`, `author`, `isbn`) and optional `release_date` .
- **Authentication**  
  Only the **GET /book/{title}** route is protected by JWT (`@jwt_required()`).
- **Persistence Layer**  
  `BookModel.find_by_title()`, `save_to_db()`, and `delete_from_db()` encapsulate database interactions with SQLAlchemy .
- **Error Handling**  
  Consistent HTTP status codes:  
  - `200 OK` for successful reads, updates, deletes  
  - `201 Created` for successful creation  
  - `400 Bad Request` for duplicate creation attempts  
  - `404 Not Found` when a resource is missing  
  - `500 Internal Server Error` on unexpected failures  

This comprehensive reference provides everything you need to integrate, test, and extend the **Book** endpoints in your Flask RESTful API demo.