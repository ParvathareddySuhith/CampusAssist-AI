from services.ai.handlers.campus_handler import CampusHandler
from services.ai.handlers.academic_handler import AcademicHandler
from services.ai.handlers.placement_handler import PlacementHandler
from services.ai.handlers.document_handler import DocumentHandler
from services.ai.handlers.general_handler import GeneralHandler

# Handler registry mapping intents to execution classes
HANDLER_REGISTRY = {
    "CAMPUS": CampusHandler,
    "ACADEMIC": AcademicHandler,
    "PLACEMENT": PlacementHandler,
    "DOCUMENT": DocumentHandler,
    "GENERAL": GeneralHandler
}
