import datetime
import math
from typing import Dict, Any, List
from config.database import db_instance

class AdminDocumentService:
    """Service layer handling administrative PDF document listing and statistics"""

    def __init__(self):
        self.collection = db_instance.get_collection("pdfs")

    def list_documents(self, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """Retrieve paginated, sorted document metadata records from MongoDB"""
        # Validate parameters
        if page < 1:
            page = 1
        if not (1 <= page_size <= 100):
            page_size = 20

        total = self.collection.count_documents({})
        pages = math.ceil(total / page_size) if total > 0 else 0

        if page > pages and pages > 0:
            page = pages

        skip = (page - 1) * page_size
        
        # Sort stably: uploaded_at DESC, filename ASC, public_id ASC
        cursor = self.collection.find({}).sort([
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

            documents.append({
                "public_id": doc.get("public_id"),
                "filename": doc.get("filename"),
                "url": doc.get("url"),
                "department": doc.get("department", ""),
                "semester": doc.get("semester"),
                "subject": doc.get("subject", ""),
                "academic_year": doc.get("academic_year"),
                "status": doc.get("status", "READY").upper(),
                "size": doc.get("size") or doc.get("bytes"),
                "uploaded_at": uploaded_at_iso
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
