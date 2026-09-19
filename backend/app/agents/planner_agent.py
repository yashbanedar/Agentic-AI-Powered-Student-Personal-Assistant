from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any

class StudyPlannerAgent:
    """
    Study Planner Agent: Generates adaptive day-by-day preparation plans
    distributed across Morning, Afternoon, and Evening slots.
    """
    
    @classmethod
    def generate_plan(
        cls, 
        subjects: List[Dict[str, Any]], 
        exams: List[Dict[str, Any]], 
        weak_topics: List[str] = None,
        days_ahead: int = 7,
        subject_topics: Dict[int, List[str]] = None
    ) -> List[Dict[str, Any]]:
        plan = []
        today = datetime.now(timezone.utc).date()
        weak_topics = weak_topics or []
        subject_topics = subject_topics or {}
        
        if not subjects:
            return []
            
        # If user has no syllabus topics and no exams scheduled, do not fabricate a fake roadmap
        has_any_topics = any(len(t_list) > 0 for t_list in subject_topics.values())
        if not has_any_topics and not exams:
            return []
            
        # Prioritize subjects by closest exam
        subject_urgency = {}
        for s in subjects:
            subject_urgency[s["id"]] = 50
            
        for ex in exams:
            sid = ex.get("subject_id")
            if sid in subject_urgency:
                days = ex.get("days_left", 30)
                subject_urgency[sid] = max(subject_urgency[sid], 100 - min(90, days * 3))
                
        sorted_subjects = sorted(subjects, key=lambda s: subject_urgency.get(s["id"], 50), reverse=True)
        
        slot_templates = [
            ("Morning", 60, "Theory & Deep Concept Review", "High"),
            ("Afternoon", 75, "PYQ Practice & Numerical Problem Solving", "High"),
            ("Evening", 45, "Rapid MCQ Quiz & Active Recall", "Medium")
        ]
        
        sub_index = 0
        topic_counters = {s["id"]: 0 for s in subjects}
        
        for day_offset in range(days_ahead):
            current_date = today + timedelta(days=day_offset)
            date_str = current_date.strftime("%Y-%m-%d")
            
            for slot_name, duration, default_task, priority in slot_templates:
                sub = sorted_subjects[sub_index % len(sorted_subjects)]
                sub_index += 1
                
                # Fetch actual syllabus topic for this subject if available
                sub_real_topics = subject_topics.get(sub["id"], [])
                cur_topic = None
                if sub_real_topics:
                    t_idx = topic_counters[sub["id"]] % len(sub_real_topics)
                    cur_topic = sub_real_topics[t_idx]
                    if slot_name == "Evening":
                        topic_counters[sub["id"]] += 1
                        
                # Check if there is a weak topic to inject
                topic_focus = None
                if weak_topics and day_offset < 3 and slot_name == "Evening":
                    topic_focus = weak_topics[day_offset % len(weak_topics)]
                    task_title = f"Targeted Revision & Drill: {topic_focus} (Flagged Weak Topic)"
                    priority = "High"
                elif cur_topic:
                    if slot_name == "Morning":
                        task_title = f"Curriculum Review: {cur_topic} ({sub['name']})"
                    elif slot_name == "Afternoon":
                        task_title = f"PYQ & Analytical Practice: {cur_topic} ({sub['name']})"
                    else:
                        task_title = f"Active Recall & Quiz: {cur_topic} ({sub['name']})"
                else:
                    if slot_name == "Morning":
                        task_title = f"Module Preparation & Reading: {sub['name']}"
                    elif slot_name == "Afternoon":
                        task_title = f"Problem Solving & Exercise Practice: {sub['name']}"
                    else:
                        task_title = f"Review Notes & Self-Assessment: {sub['name']}"
                    
                plan.append({
                    "date": date_str,
                    "time_slot": slot_name,
                    "subject_id": sub["id"],
                    "subject_name": sub["name"],
                    "title": task_title,
                    "duration_minutes": duration,
                    "topic_name": topic_focus or cur_topic or sub.get("code") or sub["name"],
                    "priority": priority,
                    "completed": False
                })
                
        return plan

