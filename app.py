from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import jwt
from functools import wraps
from datetime import datetime, timedelta
from dotenv import find_dotenv, load_dotenv
import google.generativeai as genai
import fitz  # PyMuPDF
import os
import requests
app = Flask(__name__)
app.secret_key = "change_this_key"  # also used as JWT secret; change in production
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config.update(
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_COOKIE_SECURE=False
)

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# --- DB model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

with app.app_context():
    db.create_all()

# --- Helper: create token
def create_access_token(user_id, expires_delta=None):
    if not expires_delta:
        expires_delta = timedelta(days=1)  # token lifetime
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + expires_delta,
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, app.secret_key, algorithm="HS256")
    # PyJWT in v2 returns str (token); in older versions it returns bytes.
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token

# --- Decorator for protected routes
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", None)
        if not auth_header:
            return jsonify({"message": "Token is missing"}), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"message": "Authorization header must be Bearer token"}), 401

        token = parts[1]
        try:
            data = jwt.decode(token, app.secret_key, algorithms=["HS256"])
            user_id = data.get("user_id")
            # fetch user (optional check)
            user = User.query.get(user_id)
            if not user:
                return jsonify({"message": "User not found"}), 401
            # pass current_user as positional argument
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        return f(user, *args, **kwargs)
    return decorated

# --- Signup
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Missing JSON body"}), 400

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not (name and email and password):
        return jsonify({"message": "name, email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(name=name, email=email, password=hashed_pw)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

# --- Login: returns JWT token
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Missing JSON body"}), 400

    email = data.get('email')
    password = data.get('password')

    if not (email and password):
        return jsonify({"message": "email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        token = create_access_token(user.id, expires_delta=timedelta(days=1))
        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {"name": user.name, "email": user.email}
        }), 200

    return jsonify({"message": "Invalid email or password"}), 401

@app.route('/me', methods=['GET'])
@token_required
def me(current_user):
    return jsonify({
        "user_name": current_user.name,
        "user_email": current_user.email
    }), 200

# --- Logout note (stateless JWT)
@app.route('/logout', methods=['POST'])
def logout():
    # With stateless JWT, "logout" is handled on client (delete token).
    # If you need server-side invalidation, implement a token blacklist/store.
    return jsonify({"message": "Client should delete token to logout (or implement server blacklist)"}), 200

load_dotenv(find_dotenv())
API_KEY = os.getenv("API_KEY")
if not API_KEY:
    raise ValueError("API_KEY not found in .env")

# Use a valid Gemini model
MODEL_NAME = "gemini-2.5-pro"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={API_KEY}"

app = Flask(__name__)
CORS(app)

# Personality for the bot

BOT_PERSONALITY = """
You are a highly professional education consultant.
You provide clear, accurate, and structured advice about career choices, courses, skills, and education systems worldwide.
You understand all academic backgrounds and guide students from school level to professional career paths.
Always respond in a short, numbered, and bullet-point format.
"""

@app.route("/generate_milestone", methods=["POST"])
def generate_milestone():
    try:
        question = request.form.get("question", "").strip()
        file = request.files.get("file")

        if not question and not file:
            return jsonify({"error": "No input provided"}), 400

        file_text = ""
        if file and file.filename.lower().endswith(".pdf"):
            os.makedirs("uploads", exist_ok=True)
            file_path = os.path.join("uploads", file.filename)
            file.save(file_path)
            reader = PdfReader(file_path)
            file_text = "\n".join(
                [p.extract_text() for p in reader.pages if p.extract_text()]
            )

        # Create final prompt
       # Combine personality, user question, and file content
        final_prompt = f"""
        {BOT_PERSONALITY}

        User Question:
        {question}

        {"File Content:\n" + file_text if file_text else ""}

        ---
        RESPONSE INSTRUCTIONS:
        You MUST respond in the following exact format:
        1. **Section Title**
        - Bullet point 1
        - Bullet point 2
        2. **Section Title**
        - Bullet point 1
        - Bullet point 2
        3. **Section Title**
        - Bullet point 1
        - Bullet point 2

        Rules:
        - Each section number (1, 2, 3...) must be followed by a bold title (**...**).
        - Each section must contain bullet points with short, clear sentences.
        - No paragraphs, only numbered sections with bullets.
        - Do not add extra sections that are not relevant to the question.
        - Use professional, clear, and concise language.

        Now, generate the answer strictly in that format.
        ---
        """

        payload = {"contents": [{"parts": [{"text": final_prompt}]}]}

        response = requests.post(API_URL, headers={"Content-Type": "application/json"}, json=payload)

        if response.status_code != 200:
            return jsonify({"error": f"API error: {response.text}"}), 500

        data = response.json()
        answer = data["candidates"][0]["content"]["parts"][0]["text"]

        return jsonify({"answer": answer})

    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)
