import time
import datetime
from typing import Dict, Any, List
from config.database import db_instance
from config.config import Config

# Record application start time
APP_START_TIME = time.time()

class AdminSystemService:
    """Service layer monitoring operational health statuses and system-wide metrics"""

    def __init__(self):
        self.pdfs_col = db_instance.get_collection("pdfs")
        self.users_col = db_instance.get_collection("users")
        self.chat_history_col = db_instance.get_collection("chat_history")
        self.notifications_col = db_instance.get_collection("notifications")

    def get_system_health(self) -> Dict[str, Any]:
        """Verify latency and connection states for internal and external system dependencies"""
        services = []

        # 1. MongoDB Health & Latency
        start_time = time.time()
        try:
            db_instance.db.command('ping')
            latency = int((time.time() - start_time) * 1000)
            services.append({
                "name": "MongoDB",
                "status": "healthy",
                "latency_ms": latency
            })
        except Exception:
            services.append({
                "name": "MongoDB",
                "status": "degraded"
            })

        # 2. Pinecone configuration health
        try:
            if getattr(Config, "PINECONE_API_KEY", None) and getattr(Config, "PINECONE_ENVIRONMENT", None):
                services.append({
                    "name": "Pinecone",
                    "status": "healthy"
                })
            else:
                services.append({
                    "name": "Pinecone",
                    "status": "degraded"
                })
        except Exception:
            services.append({
                "name": "Pinecone",
                "status": "degraded"
            })

        # 3. Cloudinary configuration health
        try:
            if getattr(Config, "CLOUDINARY_CLOUD_NAME", None) and getattr(Config, "CLOUDINARY_API_KEY", None):
                services.append({
                    "name": "Cloudinary",
                    "status": "healthy"
                })
            else:
                services.append({
                    "name": "Cloudinary",
                    "status": "degraded"
                })
        except Exception:
            services.append({
                "name": "Cloudinary",
                "status": "degraded"
            })

        # 4. Backend API check (always healthy if route resolves)
        services.append({
            "name": "Backend API",
            "status": "healthy"
        })

        return {
            "services": services,
            "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

    def get_system_metrics(self) -> Dict[str, Any]:
        """Aggregate data metrics and compute server uptime"""
        # Count collections
        docs_count = self.pdfs_col.count_documents({})
        users_count = self.users_col.count_documents({})
        
        # Unique student conversations
        try:
            conversations_count = len(self.chat_history_col.distinct("user_id"))
        except Exception:
            conversations_count = 0

        # Notifications count
        notifications_count = self.notifications_col.count_documents({})

        # Calculate storage usage MB
        total_bytes = 0
        try:
            for doc in self.pdfs_col.find({}, {"size": 1}):
                sz = doc.get("size")
                if isinstance(sz, (int, float)):
                    total_bytes += sz
                elif isinstance(sz, str):
                    try:
                        if "MB" in sz:
                            total_bytes += float(sz.replace("MB", "").strip()) * 1024 * 1024
                        elif "KB" in sz:
                            total_bytes += float(sz.replace("KB", "").strip()) * 1024
                        else:
                            total_bytes += float(sz.strip())
                    except ValueError:
                        pass
        except Exception:
            pass

        storage_mb = round(total_bytes / (1024 * 1024), 1)

        # Calculate Uptime
        uptime_seconds = int(time.time() - APP_START_TIME)
        days = uptime_seconds // 86400
        hours = (uptime_seconds % 86400) // 3600
        minutes = (uptime_seconds % 3600) // 60
        
        if days > 0:
            uptime_str = f"{days}d {hours}h"
        elif hours > 0:
            uptime_str = f"{hours}h {minutes}m"
        else:
            uptime_str = f"{minutes}m"

        return {
            "documents": docs_count,
            "users": users_count,
            "conversations": conversations_count,
            "notifications": notifications_count,
            "storage_mb": storage_mb,
            "uptime": uptime_str,
            "last_updated": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
