import datetime
from typing import Dict, Any, Optional, Set
from services.learning_path.learning_path_models import LearningPath, LearningStep
from services.learning_progress.learning_progress_models import LearningProgress
from services.learning_progress.learning_progress_store import LearningProgressStore

class LearningProgressEngine:
    """Core progress tracking engine resolving active step indexing and completion telemetry"""

    def __init__(self, store: LearningProgressStore):
        self.store = store

    def get_or_initialize_progress(self, user_id: str, learning_path: LearningPath) -> LearningProgress:
        """Retrieves active progress state or starts new tracking if not present"""
        progress = self.store.get_progress(user_id, learning_path.topic)
        if not progress:
            progress = self._initialize_progress(user_id, learning_path)
        return progress

    def mark_step_completed(self, user_id: str, topic: str, step_id: str, learning_path: LearningPath) -> LearningProgress:
        """Marks a path step as completed, updates statistics, and saves state"""
        progress = self.store.get_progress(user_id, topic)
        if not progress:
            # Fallback initialization if progress doesn't exist yet
            progress = self._initialize_progress(user_id, learning_path)

        self._mark_completed(progress, step_id, learning_path)
        self._persist_progress(progress)
        self._log_telemetry(progress, learning_path)
        return progress

    def format_progress_response(self, progress: LearningProgress, learning_path: LearningPath) -> Dict[str, Any]:
        """Exposes formatted response dictionary payload for public APIs"""
        return self._format_progress(progress, learning_path)

    # Private Helpers (encapsulated logic)
    def _initialize_progress(self, user_id: str, learning_path: LearningPath) -> LearningProgress:
        """Initializes a new LearningProgress object for a user and topic"""
        now = datetime.datetime.now(datetime.timezone.utc)
        progress = LearningProgress(
            user_id=user_id,
            topic=learning_path.topic,
            completed_steps=set(),
            current_step_index=0,
            completion_percentage=0.0,
            started_at=now,
            updated_at=now,
            last_completed_step=None
        )
        self._persist_progress(progress)
        return progress

    def _mark_completed(self, progress: LearningProgress, step_id: str, learning_path: LearningPath) -> None:
        """Helper to append step to completed set and calculate new progress states"""
        # Validate that the step ID is actually part of this topic's learning path
        valid_step_ids = {step.id for step in learning_path.steps}
        if step_id not in valid_step_ids:
            raise ValueError(f"Invalid step id: '{step_id}' is not part of '{learning_path.topic}' learning path.")

        # Ignore duplicate completion events
        if step_id in progress.completed_steps:
            return

        progress.completed_steps.add(step_id)
        progress.last_completed_step = step_id
        progress.updated_at = datetime.datetime.now(datetime.timezone.utc)

        total_steps = len(learning_path.steps)
        progress.completion_percentage = self._calculate_completion(progress.completed_steps, total_steps)

        # Find the next uncompleted step index (first step index whose ID is not in completed_steps)
        next_active_idx = total_steps
        for idx, step in enumerate(learning_path.steps):
            if step.id not in progress.completed_steps:
                next_active_idx = idx
                break
        progress.current_step_index = next_active_idx

    def _calculate_completion(self, completed_steps: Set[str], total_steps_count: int) -> float:
        """Calculates completion percentage defending against division-by-zero errors"""
        if total_steps_count <= 0:
            return 0.0
        return round((len(completed_steps) / total_steps_count) * 100, 2)

    def _get_current_step(self, progress: LearningProgress, learning_path: LearningPath) -> Optional[LearningStep]:
        """Returns the active uncompleted step object"""
        total_steps = len(learning_path.steps)
        if 0 <= progress.current_step_index < total_steps:
            return learning_path.steps[progress.current_step_index]
        return None

    def _get_next_step(self, progress: LearningProgress, learning_path: LearningPath) -> Optional[LearningStep]:
        """Returns the next step object immediately following the active uncompleted step"""
        total_steps = len(learning_path.steps)
        # Next step is the one after the active uncompleted step index
        next_idx = progress.current_step_index + 1
        if 0 <= next_idx < total_steps:
            return learning_path.steps[next_idx]
        return None

    def _format_progress(self, progress: LearningProgress, learning_path: LearningPath) -> Dict[str, Any]:
        """Constructs API-compliant progress summary dictionaries"""
        total_steps = len(learning_path.steps)
        completed_count = len(progress.completed_steps)
        remaining_steps = max(0, total_steps - completed_count)

        current_step_obj = self._get_current_step(progress, learning_path)
        next_step_obj = self._get_next_step(progress, learning_path)

        return {
            "completion_percentage": int(progress.completion_percentage),
            "completed_count": completed_count,
            "remaining_steps": remaining_steps,
            "total_steps": total_steps,
            "current_step_index": progress.current_step_index,
            "completed_steps": sorted(list(progress.completed_steps)),
            "current_step": {
                "id": current_step_obj.id,
                "title": current_step_obj.title,
                "difficulty": current_step_obj.difficulty
            } if current_step_obj else None,
            "next_step": {
                "id": next_step_obj.id,
                "title": next_step_obj.title,
                "difficulty": next_step_obj.difficulty
            } if next_step_obj else None
        }

    def _persist_progress(self, progress: LearningProgress) -> None:
        """Saves active progress context to backend store"""
        self.store.update_progress(progress)

    def _log_telemetry(self, progress: LearningProgress, learning_path: LearningPath) -> None:
        """Prints learning progress metrics to the console"""
        total_steps = len(learning_path.steps)
        completed_count = len(progress.completed_steps)

        current_step_obj = self._get_current_step(progress, learning_path)
        next_step_obj = self._get_next_step(progress, learning_path)

        current_display = current_step_obj.title if current_step_obj else "Completed"
        next_display = next_step_obj.title if next_step_obj else "None"

        user_display = progress.user_id
        if len(user_display) > 12:
            user_display = user_display[:8] + "..."

        print("\n" + "="*40)
        print("Learning Progress")
        print(f"\nUser\n{user_display}")
        print(f"\nTopic\n{progress.topic}")
        print(f"\nCompleted\n{completed_count} / {total_steps}")
        print(f"\nCompletion\n{int(progress.completion_percentage)}%")
        print(f"\nCurrent Step\n{current_display}")
        print(f"\nNext Step\n{next_display}")
        print("="*40 + "\n")
