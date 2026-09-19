from typing import Dict, Any, List

class EvaluationAgent:
    """
    Evaluation Agent: Grades tests, calculates topic-level accuracy,
    and identifies student weak areas requiring targeted revision.
    """
    
    @classmethod
    def evaluate_quiz(
        cls, 
        questions: List[Dict[str, Any]], 
        user_answers: Dict[str, int]
    ) -> Dict[str, Any]:
        total = len(questions)
        score = 0
        topic_stats = {} # topic_name: {"correct": 0, "total": 0}
        question_results = []
        
        for q in questions:
            qid = str(q.get("id", ""))
            chosen = user_answers.get(qid)
            if chosen is None:
                # also try integer key
                chosen = user_answers.get(int(qid)) if qid.isdigit() else None
                
            correct_idx = q.get("correct_option_index", 0)
            is_correct = (chosen == correct_idx)
            if is_correct:
                score += 1
                
            topic = q.get("topic_name") or "General"
            if topic not in topic_stats:
                topic_stats[topic] = {"correct": 0, "total": 0}
            topic_stats[topic]["total"] += 1
            if is_correct:
                topic_stats[topic]["correct"] += 1
                
            question_results.append({
                "question_id": qid,
                "question_text": q.get("question_text"),
                "chosen_option": chosen,
                "correct_option": correct_idx,
                "is_correct": is_correct,
                "explanation": q.get("explanation"),
                "topic_name": topic
            })
            
        pct = round((score / total * 100.0), 1) if total > 0 else 0.0
        
        weak_topics = []
        mastered_topics = []
        for topic, stat in topic_stats.items():
            topic_pct = (stat["correct"] / stat["total"]) * 100.0
            if topic_pct < 60.0:
                weak_topics.append({
                    "topic": topic,
                    "accuracy": round(topic_pct, 1),
                    "missed_questions": stat["total"] - stat["correct"],
                    "status": "Needs Revision"
                })
            else:
                mastered_topics.append({
                    "topic": topic,
                    "accuracy": round(topic_pct, 1),
                    "status": "Mastered"
                })
                
        return {
            "score": score,
            "total": total,
            "percentage": pct,
            "question_results": question_results,
            "weak_topics": [w["topic"] for w in weak_topics],
            "weak_topic_details": weak_topics,
            "mastered_topics": mastered_topics,
            "summary_feedback": (
                f"Scored {score}/{total} ({pct}%). "
                + (f"Identified {len(weak_topics)} weak topics needing immediate review: {', '.join([w['topic'] for w in weak_topics])}." if weak_topics else "Outstanding performance! All tested concepts showed strong mastery.")
            )
        }
