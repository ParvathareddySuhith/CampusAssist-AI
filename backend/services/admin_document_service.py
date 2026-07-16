import datetime
import math
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

class AdminDocumentService:
    """Service layer handling administrative PDF document listing and statistics"""

    def __init__(self):
        self.collection = db_instance.get_collection("pdfs")

    def list_documents(self, page: int = 1, page_size: int = 20, search: str = "", status: str = "") -> Dict[str, Any]:
        """Retrieve paginated, filtered, and sorted document metadata records from MongoDB"""
        # Validate parameters
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

            # Standardize status to READY, INDEXING, FAILED
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
        
        # Everything else is considered indexed/ready
        indexed = max(0, total - processing - failed)

        return {
            "total": total,
            "indexed": indexed,
            "processing": processing,
            "failed": failed
        }
