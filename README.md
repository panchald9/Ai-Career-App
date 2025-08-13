# AI Career App

AI Career App is a full-stack web application that provides personalized career guidance using AI-powered chat. Users can register, login, and interact with an AI assistant to get career advice tailored to their skills and interests.

---

## Features

- User registration and authentication (signup/login)
- AI-powered chat interface for career counseling
- Responsive React frontend with modern UI
- Flask backend API handling authentication and AI requests
- Secure JWT-based user sessions
- Option to upload files for enhanced personalized advice
- Persistent user data storage in a database

---

## Tech Stack

- **Frontend:** React, JavaScript, HTML, CSS
- **Backend:** Flask (Python), Flask-RESTful
- **AI Integration:** OpenAI / Google Generative AI API
- **Database:** SQLite / PostgreSQL (configurable)
- **Authentication:** JWT (JSON Web Tokens)

---

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Python (v3.8 or later)
- Git

### Setup Backend (Flask)

1. Navigate to backend folder (if separated):

    ```bash
    cd backend
    ```

2. Create and activate a virtual environment:

    ```bash
    python -m venv venv
    source venv/bin/activate  # Linux/macOS
    venv\Scripts\activate     # Windows
    ```

3. Install dependencies:

    ```bash
    pip install -r requirements.txt
    ```

4. Set environment variables (e.g., API keys, secret keys):

    Create a `.env` file or export variables as needed.

5. Run the Flask server:

    ```bash
    flask run
    ```

### Setup Frontend (React)

1. Navigate to frontend folder:

    ```bash
    cd frontend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the React development server:

    ```bash
    npm start
    ```

---

## Usage

- Register or login to your account.
- Use the chat interface to ask career-related questions.
- Upload files (if applicable) to get personalized AI advice.
- Explore personalized recommendations and insights.

---

## Folder Structure
/backend # Flask backend API code
/frontend # React frontend code


---

## API Reference

- `POST /api/signup` — Register a new user
- `POST /api/login` — Authenticate user and get JWT token
- `POST /api/chat` — Send career questions to AI assistant and receive responses
- `POST /api/upload` — Upload files for analysis (optional)

---

## Environment Variables

| Variable             | Description                      |
|----------------------|--------------------------------|
| `FLASK_SECRET_KEY`   | Secret key for Flask app        |
| `AI_API_KEY`         | API key for AI service          |
| `DATABASE_URL`       | Database connection string      |

---

## Contributing

Contributions are welcome! Please open issues or pull requests.

---

## License

This project is licensed under the MIT License.

---

## Contact

Created by [Dhruv Panchal ] — [dp148026@gmail.com]

