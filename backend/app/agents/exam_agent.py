from datetime import datetime, timezone
from typing import Dict, Any, List

class ExamAgent:
    """
    Exam Agent: Analyzes exam schedules, deadlines, remaining preparation window,
    and calculates preparation urgency metrics.
    """
    
    @classmethod
    def calculate_urgency(cls, exam_date: datetime, target_score: float = 90.0, current_mastery: float = 50.0) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        if exam_date.tzinfo is None:
            exam_date = exam_date.replace(tzinfo=timezone.utc)
            
        time_diff = exam_date - now
        total_seconds = time_diff.total_seconds()
        
        days_left = int(total_seconds // 86400)
        hours_left = int((total_seconds % 86400) // 3600)
        
        if total_seconds <= 0:
            return {
                "days_left": 0,
                "hours_left": 0,
                "prep_urgency": 100.0,
                "urgency_level": "COMPLETED_OR_TODAY",
                "badge_color": "rose",
                "status_text": "Exam today or passed"
            }
            
        # Formula: Urgency increases as days decrease and as gap between target and mastery increases
        gap = max(10.0, target_score - current_mastery)
        
        if days_left <= 3:
            urgency = min(100.0, 85.0 + (gap * 0.15))
            level = "CRITICAL"
            color = "red"
        elif days_left <= 7:
            urgency = min(90.0, 70.0 + (gap * 0.2))
            level = "HIGH"
            color = "amber"
        elif days_left <= 14:
            urgency = min(75.0, 50.0 + (gap * 0.25))
            level = "MODERATE"
            color = "blue"
        else:
            urgency = max(20.0, min(50.0, (100.0 / max(1, days_left)) + (gap * 0.2)))
            level = "NORMAL"
            color = "emerald"
            
        return {
            "days_left": days_left,
            "hours_left": hours_left,
            "prep_urgency": round(urgency, 1),
            "urgency_level": level,
            "badge_color": color,
            "status_text": f"{days_left} days {hours_left} hrs remaining"
        }
