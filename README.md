# CampusAssist AI

AI-powered Campus Assistant for Academic, Administrative, and Placement Support.

---

## 📄 Overview
**CampusAssist AI** is an intelligent, context-aware campus assistant designed to bridge the gap between students and university information systems. Leveraging **Retrieval-Augmented Generation (RAG)**, it parses course documents, administrative handbooks, and placement criteria to deliver instant, institutional-specific answers to students. 

Additionally, the system features a "human-in-the-loop" administration workflow. When the AI is unable to resolve a query, it logs the question in a moderation queue for administrator review. The administrator's manual response is automatically compiled back into the knowledge base, enabling continuous learning and refinement of the assistant's knowledge.

---

## ⚠️ Problem Statement
In modern educational institutions, students face delays and friction when seeking answers to critical queries:
* **Scattered Information**: Academic policies, placement criteria, and course schedules are scattered across different portals, PDFs, and handbooks.
* **Support Bottlenecks**: Administrative and faculty support staff are overwhelmed by repetitive, identical queries, leading to long response times.
* **Information Decay**: Static FAQ sheets and manuals become outdated quickly, and updating them requires manual redeployment of portals.

**CampusAssist AI** solves these issues by providing a unified, RAG-powered chatbot interface that references the latest uploaded PDFs, while logging unresolved questions for admin moderation, automatically learning from their answers to prevent future bottlenecks.

---

## 🚀 Features

### 🤖 Intelligent Chat & RAG Support
* **RAG-Powered Conversational AI**: Instant answers generated based on uploaded documents.
* **Multi-Turn Chat Memory**: Keeps track of conversational context across multiple exchanges.
* **Smart General Chat Filter**: Detects general greetings and pleasantries to provide direct, low-latency responses without querying the LLM.

### 🎛️ Administrator Dashboard
* **Document Management**: Upload, delete, and preview PDF files directly in the browser via Cloudinary.
* **Ad-Hoc Vector Reindexing**: Rebuild Pinecone vector database embeddings with a single click.
* **Unanswered Query Queue**: View, delete, or respond directly to logged questions from students.
* **Auto-Learning Vector Store**: When an administrator responds to a question, it is appended to a persistent Q&A document cache, updating the knowledge base.
* **SMTP Email Notifications**: Automated emails sent to students once their unanswered queries are resolved by staff.
* **Text Analytics**: Sentiment analysis and trending topic keywords displayed on the dashboard.

### 🔐 Security & Access Control
* **JWT-Based Authentication**: Secure token-based session management for users and admins.
* **Password Encryption**: Password hashing using Bcrypt.
* **Role-Based Routing**: Protected routes and decorators mapping specific views to student or admin users.

---

## 🏗️ Architecture

```
[Student Interface] ──> API Call (Axios) ──> [Flask API Gateway]
                                                    │
                                           (Authorization Guard)
                                                    │
                                                    ▼
                                           [ChatService Handler]
                                           /                   \
                                  (RAG Matches)            (Unknown Query)
                                   /                             \
                       [Pinecone Similarity search]       [Save to MongoDB Unanswered]
                                   │                                     │
                             (Context Found)                  [Admin writes response]
                                   │                                     │
                                   ▼                           [Append to extra.pdf]
                          [Call Groq LLM API]             [& Send SMTP email notification]
```

### Request Flow Layering
1. **Frontend Client**: SPA React client making network calls using Axios.
2. **Blueprints (Routes)**: Handles endpoint bindings, path parameter extraction, and authorization decorators.
3. **Controllers**: Validates JSON payloads, maps incoming data parameters, and delegates to service classes.
4. **Services**: Core logic processing (SMTP connections, Cloudinary upload commands, RAG search orchestrations).
5. **Database Models**: MongoDB collections (`users`, `queries`, `chat_history`) managed via the PyMongo driver.

---

## 🛠️ Technology Stack

### Frontend
* **Core**: React.js (Vite)
* **Styling**: Tailwind CSS & Vanilla CSS variable overrides
* **State Management**: Local React state hooks (`useState`, `useEffect`) and Contexts
* **Visual Components**: Premium styling templates (ShinyText, Magnet, SpotlightCard, Squares, StarBorder)
* **API Client**: Axios with global interceptors

### Backend
* **API Framework**: Flask (Python)
* **CORS**: Flask-CORS
* **Server**: Gunicorn (WSGI Server)
* **Authentication**: PyJWT (JSON Web Tokens)
* **Encryption**: Flask-Bcrypt
* **Database Driver**: PyMongo (MongoDB native driver)
* **Email Broker**: smtplib & Flask-Mail wrappers

### AI & ML Pipeline
* **Orchestrator**: LangChain framework
* **LLM API Provider**: Groq Cloud (`llama-3.3-70b-versatile`)
* **Vector Database**: Pinecone
* **Embedding Model**: HuggingFace `sentence-transformers/all-MiniLM-L6-v2` (run locally on CPU)
* **Document Parsing**: PyPDF2
* **Dynamic PDF Generator**: ReportLab (used to generate QA documents for admin replies)

---

## 📦 Installation & Setup

### Prerequisites
* **Python 3.10+** (recommended Python 3.13)
* **Node.js 18+** and npm
* **MongoDB** (Atlas account or local instance)
* **Groq API Key** / **Pinecone API Key**
* **Cloudinary Account**
* **SMTP Gmail Credentials** (Gmail account with App Password configured)

### 🔧 Backend Configuration

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```

2. **Initialize a python virtual environment**:
   ```bash
   # Create environment
   python3 -m venv .venv

   # Activate environment
   source .venv/bin/activate
   ```

3. **Install python packages**:
   ```bash
   .venv/bin/pip install -r requirements.txt
   ```

4. **Set up backend environment variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   # Application Configuration
   SECRET_KEY=your_secret_key_here
   FLASK_ENV=development
   PORT=5000

   # Database Configuration
   MONGO_URI=mongodb://localhost:27017/chatbot

   # AI Provider Configuration ('groq', 'google', or 'huggingface')
   AI_PROVIDER=groq
   GROQ_API_KEY=your_groq_api_key_here

   # Pinecone configuration
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_INDEX_NAME=student-chatbot

   # Cloudinary configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Email Configuration (SMTP)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   
   # Admin Credentials
   ADMIN_EMAIL=admin@campusassist.edu
   ADMIN_PASSWORD=your_secure_admin_password
   ```

5. **Run the backend API server**:
   ```bash
   flask run
   ```

### 💻 Frontend Configuration

1. **Navigate to the frontend folder**:
   ```bash
   cd ../frontend
   ```

2. **Install node dependencies**:
   ```bash
   npm install
   ```

3. **Set up frontend environment variables**:
   Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. **Start the frontend application**:
   ```bash
   npm run dev
   ```

---

## 🖼️ Screenshots
*(Placeholders - update with your actual UI captures)*

| Dashboard Interface | Chat Panel |
| :---: | :---: |
| ![Dashboard Interface](https://via.placeholder.com/600x400.png?text=Campus+Assist+Dashboard) | ![Chat Panel](https://via.placeholder.com/300x500.png?text=Campus+Assist+Chatbot) |

---

## 🗺️ Roadmap
* **Visual Data Panels**: Integrate Chart.js/Recharts on the admin analytics tab.
* **Token Streaming**: Add response token streaming using Server-Sent Events (SSE).
* **Auto-Reindexing for Single Files**: Rebuild vectors on Pinecone for individual documents on upload/deletion.
* **Local SQLite Fallback**: Support local in-memory vector storage if Pinecone keys are not supplied.

---

## 📄 License
This project is licensed under the Apache 2.0 License.
