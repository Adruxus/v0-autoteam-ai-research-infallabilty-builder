## Quickstart – Running the Application

Kick off your demo RESTful API in seconds by following this Quickstart guide. You’ll learn how to prepare your environment, install dependencies, and launch the Flask server (with JWT-protected endpoints) out of the box.

---

### Index

- <a href="#prerequisites">Prerequisites</a>
- <a href="#installation">Installation</a>
- <a href="#running-the-application">Running the Application</a>
- <a href="#verifying-the-setup">Verifying the Setup</a>
- <a href="#default-configuration">Default Configuration</a>
- <a href="#database-initialization">Database Initialization</a>

---

### Prerequisites

Before you begin, ensure you have:

- Python 3.6+ installed and available on your <code>PATH</code>.
- An environment tool of your choice (e.g., <code>venv</code>, <code>virtualenv</code>, <code>conda</code>).
- (Optional) <a href="https://www.postman.com/">Postman</a> or <code>curl</code> for testing endpoints.

---

### Installation

1. Clone the repository

```bash
   git clone https://github.com/magarrent/REST-API-PYTHON-demo.git
   cd REST-API-PYTHON-demo/PYTHON
```

1. Create &amp; activate a virtual environment

```bash
   python3 -m venv .venv
   source .venv/bin/activate      # Linux/macOS
   .venv\Scripts\activate         # Windows
```

1. Install dependencies

```bash
   pip install Flask Flask-RESTful Flask-JWT Flask-SQLAlchemy
```

> No <code>requirements.txt</code> is provided; the core dependencies are inferred from the main entry-point.

---

### Running the Application

Start the server with a single command:

```bash
python app.py
```

Behind the scenes, this executes the following snippet in <code>app.py</code>:

```python
if __name__ == '__main__':
    from db import db
    db.init_app(app)
    app.run(port=5000, debug=True)
```

- Port: 5000 (default)
- Debug mode: Enabled (auto-reload &amp; detailed error pages)

---

### Verifying the Setup

Once running, you should see console output similar to:

```plaintext
 * Serving Flask app "app" (lazy loading)
 * Environment: development
 * Debug mode: on
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
```

Open your browser or use <code>curl</code> to hit an unprotected endpoint:

```bash
curl http://localhost:5000/books
```

Response:

```json
{"books": []}
```

---

### Default Configuration

The application bootstraps with sensible defaults defined in <code>app.py</code>:

| Configuration Key | Default Value | Purpose |
| --- | --- | --- |
| SQLALCHEMYDATABASEURI | <code>'sqlite:///data.db'</code> | Location of the SQLite database file |
| SQLALCHEMYTRACKMODIFICATIONS | <code>True</code> | Enable SQLAlchemy event system (may impact performance) |
| PROPAGATE_EXCEPTIONS | <code>True</code> | Allow exceptions to bubble up to Flask’s error handlers |
| secret_key | <code>'SapanCrackle'</code> | Used to sign JWT tokens and session cookies |

```python
app.config['SQLALCHEMY_DATABASE_URI']    = 'sqlite:///data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['PROPAGATE_EXCEPTIONS']       = True
app.secret_key                          = 'SapanCrackle'
```

---

### Database Initialization

A built-in hook ensures your SQLite schema is created before the first request:

```python
@app.before_first_request
def create_tables():
    db.create_all()
```

- When? Runs once, immediately before handling the very first HTTP request.
- What? Invokes SQLAlchemy’s <code>create_all()</code> to generate tables for all registered models (User, Book, Store).

---

That's it – your RESTful API is now live on <code>http://localhost:5000/</code>, ready for registration, authentication, and managing users, books, and stores!