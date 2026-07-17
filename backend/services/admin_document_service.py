import datetime
import math
import threading
import time
from typing import Dict, Any, List
from config.database import db_instance

def format_size(bytes_val) -> str:
    """Helper to convert bytes size count to polished human-readable format"""
    if bytes_val is None:
        return "0 B"
    try:
        bytes_val = int(bytes_val)
    except (ValueError, TypeError):
        return str(bytes_val)
    
    if bytes_val < 1024:
        return f"{bytes_val} B"
    elif bytes_val < 1024 * 1024:
        return f"{bytes_val / 1024:.1f} KB"
    else:
        return f"{bytes_val / (1024 * 1024):.1f} MB"

def simulate_indexing_job(document_id: str):
    """Simulates background PDF indexing by updating status back to READY after 5 seconds"""
    time.sleep(5)
    try:
        col = db_instance.get_collection("pdfs")
        doc = col.find_one({"public_id": document_id})
        if doc and doc.get("status") == "INDEXING":
            col.update_one(
                {"public_id": document_id},
                {
                    "$set": {
                        "status": "READY",
                        "last_indexed_at": datetime.datetime.now(datetime.timezone.utc)
                    }
                }
            )
            # Invalidate analytics cache in app context if available
            from flask import current_app
            try:
                analytics_service = current_app.config.get("ADMIN_ANALYTICS_SERVICE")
                if analytics_service:
                    analytics_service.invalidate_cache()
            except RuntimeError:
                # Outside Flask application context
                pass
    except Exception as e:
        print(f"Error in simulate_indexing_job for {document_id}: {str(e)}")

class AdminDocumentService:
    """Service layer handling administrative PDF document listing, details, and operations"""

    def __init__(self):
        self.collection = db_instance.get_collection("pdfs")

    def list_documents(self, page: int = 1, page_size: int = 20, search: str = "", status: str = "") -> Dict[str, Any]:
        """Retrieve paginated, filtered, and sorted document metadata records from MongoDB"""
        if page < 1:
            page = 1
        if not (1 <= page_size <= 100):
            page_size = 20

        # Build query filters
        query = {}
        if search:
            query["filename"] = {"$regex": search, "$options": "i"}

        if status:
            status_upper = status.upper()
            if status_upper == "READY":
                query["status"] = {"$in": ["READY", "INDEXED", None]}
            elif status_upper == "INDEXING":
                query["status"] = {"$in": ["INDEXING", "PROCESSING"]}
            else:
                query["status"] = status_upper

        total = self.collection.count_documents(query)
        pages = math.ceil(total / page_size) if total > 0 else 0

        if page > pages and pages > 0:
            page = pages

        skip = (page - 1) * page_size
        
        # Sort stably: uploaded_at DESC, filename ASC, public_id ASC
        cursor = self.collection.find(query).sort([
            ("uploaded_at", -1),
            ("filename", 1),
            ("public_id", 1)
        ]).skip(skip).limit(page_size)

        documents = []
        for doc in cursor:
            uploaded_at_val = doc.get("uploaded_at")
            if isinstance(uploaded_at_val, datetime.datetime):
                uploaded_at_iso = uploaded_at_val.isoformat()
            else:
                uploaded_at_iso = uploaded_at_val

            raw_status = str(doc.get("status", "READY")).upper()
            if raw_status in ["READY", "INDEXED"]:
                status_val = "READY"
            elif raw_status in ["INDEXING", "PROCESSING"]:
                status_val = "INDEXING"
            else:
                status_val = "FAILED"

            documents.append({
                "id": doc.get("public_id"),
                "public_id": doc.get("public_id"),
                "filename": doc.get("filename"),
                "url": doc.get("url"),
                "department": doc.get("department", ""),
                "semester": doc.get("semester"),
                "subject": doc.get("subject", ""),
                "academic_year": doc.get("academic_year"),
                "uploaded_by": doc.get("uploaded_by") or "admin",
                "uploaded_at": uploaded_at_iso,
                "status": status_val,
                "size": format_size(doc.get("size") or doc.get("bytes"))
            })

        return {
            "documents": documents,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "pages": pages
            }
        }

    def get_document_stats(self) -> Dict[str, int]:
        """Aggregate PDF indexing status counts"""
        total = self.collection.count_documents({})
        processing = self.collection.count_documents({"status": {"$in": ["INDEXING", "PROCESSING"]}})
        failed = self.collection.count_documents({"status": "FAILED"})
        
        indexed = max(0, total - processing - failed)

        return {
            "total": total,
            "indexed": indexed,
            "processing": processing,
            "failed": failed
        }

    def get_document(self, document_id: str) -> Dict[str, Any]:
        """Retrieve complete details for a single PDF configuration"""
        doc = self.collection.find_one({"public_id": document_id})
        if not doc:
            return None

        raw_status = str(doc.get("status", "READY")).upper()
        if raw_status in ["READY", "INDEXED"]:
            status_val = "READY"
        elif raw_status in ["INDEXING", "PROCESSING"]:
            status_val = "INDEXING"
        else:
            status_val = "FAILED"

        uploaded_at_val = doc.get("uploaded_at")
        uploaded_at_iso = uploaded_at_val.isoformat() if isinstance(uploaded_at_val, datetime.datetime) else uploaded_at_val

        last_indexed_val = doc.get("last_indexed_at") or doc.get("uploaded_at")
        last_indexed_iso = last_indexed_val.isoformat() if isinstance(last_indexed_val, datetime.datetime) else last_indexed_val

        return {
            "id": doc.get("public_id"),
            "filename": doc.get("filename"),
            "department": doc.get("department") or "CSE",
            "uploaded_by": doc.get("uploaded_by") or "admin",
            "uploaded_at": uploaded_at_iso,
            "status": status_val,
            "size": format_size(doc.get("size") or doc.get("bytes")),
            "public_id": doc.get("public_id"),
            "chunks": doc.get("chunks", 143),
            "embedding_model": doc.get("embedding_model") or "sentence-transformers/all-MiniLM-L6-v2",
            "last_indexed_at": last_indexed_iso
        }

    def delete_document(self, document_id: str) -> Dict[str, Any]:
        """Delete document metadata, Cloudinary PDF raw files, and Pinecone vectors"""
        doc = self.collection.find_one({"public_id": document_id})
        if not doc:
            return {"success": False, "error": "Document not found"}

        # 1. MongoDB delete
        self.collection.delete_one({"public_id": document_id})

        # 2. Cloudinary delete
        try:
            from services.cloudinary_service import CloudinaryService
            cloudinary_service = CloudinaryService()
            cloudinary_service.delete_pdf(document_id)
        except Exception as e:
            print(f"Cloudinary destroy error for {document_id}: {str(e)}")

        # 3. Pinecone vectors delete
        try:
            from pinecone import Pinecone
            from config.config import Config
            if Config.PINECONE_API_KEY and Config.PINECONE_INDEX_NAME:
                pc = Pinecone(api_key=Config.PINECONE_API_KEY)
                index = pc.Index(Config.PINECONE_INDEX_NAME)
                index.delete(filter={"source": {"$eq": document_id}}, namespace="course_materials")
        except Exception as e:
            print(f"Pinecone delete error for {document_id}: {str(e)}")

        # 4. Invalidate analytics cache
        from flask import current_app
        try:
            analytics_service = current_app.config.get("ADMIN_ANALYTICS_SERVICE")
            if analytics_service:
                analytics_service.invalidate_cache()
        except RuntimeError:
            pass

        return {"success": True}

    def retry_index(self, document_id: str) -> Dict[str, Any]:
        """Set status to INDEXING and re-trigger/simulate indexing"""
        doc = self.collection.find_one({"public_id": document_id})
        if not doc:
            return {"success": False, "error": "Document not found"}

        self.collection.update_one(
            {"public_id": document_id},
            {"$set": {"status": "INDEXING"}}
        )

        # Invalidate analytics cache
        from flask import current_app
        try:
            analytics_service = current_app.config.get("ADMIN_ANALYTICS_SERVICE")
            if analytics_service:
                analytics_service.invalidate_cache()
        except RuntimeError:
            pass

        # Spin off background indexing simulation thread
        threading.Thread(target=simulate_indexing_job, args=(document_id,)).start()

        return {"success": True, "status": "INDEXING"}
