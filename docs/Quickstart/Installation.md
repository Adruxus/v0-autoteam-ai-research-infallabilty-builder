# Quickstart – Installation

Welcome to the REST-API-PYTHON-demo Quickstart guide! This section walks you through getting the project up and running on your local machine in just a few simple steps.

---

## 📑 Index

1. Prerequisites
1. Clone the Repository
1. Set Up a Virtual Environment (Recommended)
1. Install Dependencies
1. Verify Installation

---

## 1. Prerequisites

Before you begin, ensure you have the following installed:

- Git (for cloning the repo)
- Python 3.6+
- pip (Python package manager)

Optionally, it’s highly recommended to use a virtual environment to isolate project dependencies.

---

## 2. Clone the Repository

Start by cloning the demo API from GitHub:

```bash
git clone https://github.com/magarrent/REST-API-PYTHON-demo.git
```

Then navigate into the project’s Python folder:

```bash
cd REST-API-PYTHON-demo/PYTHON
```

---

## 3. Set Up a Virtual Environment (Recommended)

A virtual environment helps avoid version conflicts:

```bash
# Create a venv named 'venv'
python3 -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1
```

Once activated, your shell prompt will be prefixed with <code>(venv)</code>.

---

## 4. Install Dependencies

All required Python packages are listed in requirements.txt. Install them with:

```bash
pip install -r requirements.txt
```

> What’s inside <code>requirements.txt</code>?

The file pins the core libraries used throughout the project:

| Package           | Purpose                                                        |
|-------------------|----------------------------------------------------------------|
| Flask         | Lightweight web framework                 |
| Flask-RESTful | Extension for building REST APIs                               |
| Flask-JWT     | JSON Web Token authentication                                  |
| Flask-SQLAlchemy | ORM support for Flask (database models &amp; sessions)  |
| Werkzeug      | WSGI utilities &amp; security helpers (e.g., <code>safestrcmp</code>)        |

---

## 5. Verify Installation

1. Ensure the virtual environment is active (see step 3).
1. Run the application:

```bash
   python app.py
```

1. You should see output similar to:

```plaintext
   * Serving Flask app "app"
   * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
```

1. Open your browser or API client (e.g., Postman) to http://localhost:5000 and test any endpoint.

---

Congratulations! 🎉 You’ve successfully installed and launched the demo RESTful API. Proceed to the <a href="#">Usage</a> section to explore available endpoints, authentication workflows, and data models.