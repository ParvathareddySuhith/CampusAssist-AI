# CampusAssist AI - Backend

This directory contains the Flask backend for the CampusAssist AI system. The backend powers the RAG (Retrieval Augmented Generation) system, PDF processing, and admin features.

## 🚀 Key Features

- **RAG-based Query Processing**: Combines Pinecone vector search with Google AI generation
- **PDF Management**: Cloudinary-based PDF storage and processing
- **Admin API**: Comprehensive admin controls for query management
- **Email Notifications**: Automated alerts for query responses

## 📂 Directory Structure

```
backend/
├── app.py                 # Main application entry point
├── config/                # Configuration settings
│   ├── config.py          # Environment and application settings
│   └── database.py        # MongoDB connection handling
├── controllers/           # API controllers (request handling)
│   ├── admin_controller.py
│   ├── auth_controller.py
│   ├── chat_controller.py
│   └── pdf_controller.py
├── middleware/            # Request middleware
│   ├── auth_middleware.py # Authentication middleware
│   └── middleware.py      # General middleware functions
├── models/                # Data models
│   └── models.py          # MongoDB data models
├── routes/                # API route definitions
│   ├── admin_routes.py
│   ├── auth_routes.py
│   ├── chat_routes.py
│   └── pdf_routes.py
├── services/              # Business logic
│   ├── admin_service.py
│   ├── auth_service.py
│   ├── chat_service.py
│   ├── cloudinary_service.py
│   └── email_service.py
└── utils/                 # Utility functions
    ├── auth.py            # Authentication utilities
    ├── cloudinary_utils.py# Cloudinary integration
    ├── helpers.py         # General helper functions
    └── pdf_utils.py       # PDF processing utilities
```

## 🌟 Key Components

### RAG System
- **Embeddings**: Google Generative AI embeddings for semantic search
- **Vector Storage**: Pinecone for production-ready vector storage
- **PDF Processing**: Extraction, chunking, and metadata handling

### Cloudinary Integration
- PDF storage with public/private access control
- Original filename preservation
- Secure URL generation and management

### Admin Features
- Dashboard statistics and analytics
- Query management and response handling
- PDF management (upload, list, delete)
- Embedding rebuilding for knowledge base updates

## 🛠️ Setup Instructions

1. **Create a virtual environment**:
   ```bash
   python -m venv chatbotEnv
   source chatbotEnv/bin/activate  # On Windows: chatbotEnv\\Scripts\\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   Create a `.env` file with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=student_chatbot
   SECRET_KEY=your_secret_key
   GOOGLE_API_KEY=your_google_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX_NAME=your_pinecone_index
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   PDF_FOLDER=pdfs
   ```

4. **Run the application**:
   ```bash
   flask run
   ```



## 📦 Embedding Management

Embeddings for the RAG system are:
1. Created on initial startup if they don't exist
2. Only updated manually via the "Rebuild Embeddings" endpoint
3. Not automatically updated with each admin answer (to improve performance)
4. Stored in Pinecone for production-ready retrieval

## 📧 Email Configuration

Configure the email settings in `config.py` to enable email notifications:
```python
MAIL_SERVER = 'smtp.gmail.com'
MAIL_PORT = 587
MAIL_USE_TLS = True
MAIL_USERNAME = 'your_email@gmail.com'
MAIL_PASSWORD = 'your_app_password'
MAIL_DEFAULT_SENDER = 'your_email@gmail.com'
```
