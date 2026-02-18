# Quickstart

Index

1. <a href="#prerequisites">Prerequisites</a>

## Prerequisites

Before you can run the REST-API-PYTHON-demo, ensure your development environment meets the following requirements:

| Software | Minimum Version | Purpose |
| --- | --- | --- |
| Python | 3.x | Core runtime for the application |
| pip | 9.0+ (bundled with Python 3.x) | Package installer for Python |

---

### 1. Verify Python Installation

Ensure Python 3.x is installed and on your <code>PATH</code>:

```bash
python --version
```

You should see output similar to:

```text
Python 3.8.10
```

> Tip: If you have both Python 2 and Python 3 installed, you may need to run <code>python3 --version</code> instead.

---

### 2. Verify pip Installation

Check that pip (the Python package manager) is available:

```bash
pip --version
```

Expected output:

```text
pip 21.1.1 from /usr/local/lib/python3.8/site-packages (python 3.8)
```

If <code>pip</code> is not found, install it following the <a href="https://pip.pypa.io/en/stable/installation/">official guide</a>.

---

### 3. (Optional) Create and Activate a Virtual Environment

A virtual environment helps isolate project dependencies:

```bash
# Create a new venv in the project directory
python -m venv venv

# Activate on macOS/Linux
source venv/bin/activate

# Activate on Windows
venv\Scripts\activate
```

Once activated, any <code>pip install</code> commands will install packages into this isolated environment.

---

### 4. Required Python Packages

The demo application relies on several key Python libraries. These will be installed via <code>pip</code> in a later step, but it’s useful to know what they are:

| Package | Imported In | Role in Project |
| --- | --- | --- |
| Flask | <code>from flask import Flask</code> | Core web framework |
| Flask-RESTful | <code>from flask_restful import Api, Resource</code> | Simplifies resource routing over HTTP |
| Flask-JWT | <code>from flask_jwt import JWT</code> | Provides JWT-based authentication |
| Flask-SQLAlchemy | <code>from flask_sqlalchemy import SQLAlchemy</code> | Object–Relational Mapping (ORM) layer |
| Werkzeug | <code>from werkzeug.security import safestrcmp</code> | Secure password comparison for authentication |

These imports are visible in app.py, db.py, and security.py  .

---

With Python 3.x and pip in place, you’re ready to proceed to the next Quickstart step: installing dependencies and running the application.