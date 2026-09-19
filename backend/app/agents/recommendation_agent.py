from typing import Dict, Any, List

class RecommendationAgent:
    """
    Recommendation Agent: Answers "What should I study now?"
    Integrates Exam Urgency, PYQ High-Yield Weightage, and Student Weak Topics.
    """
    
    @classmethod
    def recommend_next_action(
        cls, 
        subjects: List[Dict[str, Any]], 
        exams: List[Dict[str, Any]], 
        weak_topics: List[str] = None,
        pyq_topics: List[Dict[str, Any]] = None,
        has_documents: bool = False,
        has_syllabus: bool = False
    ) -> Dict[str, Any]:
        weak_topics = weak_topics or []
        pyq_topics = pyq_topics or []
        
        # Determine primary target subject based on nearest exam
        primary_subject = "General Studies"
        nearest_exam_days = 999
        
        for ex in exams:
            days = ex.get("days_left", 999)
            if days < nearest_exam_days:
                nearest_exam_days = days
                primary_subject = ex.get("subject_name", primary_subject)
                
        if primary_subject == "General Studies" and subjects:
            primary_subject = subjects[0]["name"]
            
        # Priority 0: If student has not provided course materials or syllabus yet
        if not has_documents and not has_syllabus:
            target_topic = "Course Materials Setup"
            urgency = "HIGH" if nearest_exam_days <= 14 else "NORMAL"
            recommendation = f"Provide your syllabus or study materials for {primary_subject} to unlock AI analysis."
            reason = f"Before the AI assistant can synthesize customized roadmaps, revision notes, and quizzes, it needs your course documents or syllabus text."
            action_type = "upload_material"
            action_label = "Upload Course Materials"
        # Priority 1: If there is a detected weak topic that also matches an upcoming subject/PYQ
        elif weak_topics:
            target_topic = weak_topics[0]
            urgency = "HIGH" if nearest_exam_days <= 7 else "MEDIUM"
            recommendation = f"Master your flagged weak topic: {target_topic} in {primary_subject}."
            reason = f"Your latest quiz score showed <60% accuracy on {target_topic}. Addressing weak topics yields the fastest score improvement before your exam."
            action_type = "take_quiz"
            action_label = f"Practice 5 MCQs on {target_topic}"
        elif pyq_topics:
            top_pyq = pyq_topics[0]
            target_topic = top_pyq.get("topic", "Core Concepts")
            urgency = "HIGH" if nearest_exam_days <= 10 else "MEDIUM"
            recommendation = f"Study high-frequency PYQ concept: {target_topic}."
            reason = f"This topic has appeared {top_pyq.get('occurrences_past_5_years', 4)} times in past papers with an average of {top_pyq.get('expected_marks', 10)} marks."
            action_type = "review_notes"
            action_label = f"Read High-Yield Notes on {target_topic}"
        else:
            target_topic = f"{primary_subject} Revision"
            if nearest_exam_days <= 14:
                urgency = "HIGH" if nearest_exam_days <= 5 else "MEDIUM"
                recommendation = f"Review your uploaded notes for upcoming {primary_subject} exam ({nearest_exam_days} days remaining)."
                reason = f"Reinforce core concepts and practice active recall using your provided study materials."
                action_type = "review_notes"
                action_label = f"Review {primary_subject} Notes"
            else:
                urgency = "NORMAL"
                recommendation = f"Generate revision notes or practice quizzes for {primary_subject} from your uploaded materials."
                reason = f"Keep your preparation consistent by testing retention on your course concepts."
                action_type = "take_quiz"
                action_label = f"Take Practice Quiz"
            
        return {
            "what_to_study_now": recommendation,
            "recommended_topic": target_topic,
            "subject_name": primary_subject,
            "urgency_level": urgency,
            "reason": reason,
            "action_type": action_type,
            "action_label": action_label,
            "days_to_exam": nearest_exam_days if nearest_exam_days != 999 else None,
            "weak_topics": [{"name": w, "severity": "High"} for w in weak_topics[:5]],
            "high_yield_topics": pyq_topics[:4] if pyq_topics else []
        }

