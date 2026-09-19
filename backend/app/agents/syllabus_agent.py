import re
from typing import Dict, Any, List

class SyllabusAgent:
    """
    Syllabus Agent: Parses curriculum and syllabus into Units/Modules and Topics.
    Assigns estimated study hours, difficulty, and weightage.
    """
    
    @classmethod
    def parse_syllabus(cls, text: str, subject_name: str = "") -> List[Dict[str, Any]]:
        units = []
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        
        current_unit = None
        unit_counter = 1
        
        # Regex patterns to detect units or chapters
        unit_pattern = re.compile(r'^(unit|module|chapter|part)\s*([0-9ivxlcdm]+)?[:\s\-]*(.*)', re.IGNORECASE)
        
        for line in lines:
            match = unit_pattern.match(line)
            if match:
                if current_unit:
                    units.append(current_unit)
                
                title = match.group(3).strip() or f"Module {unit_counter}"
                current_unit = {
                    "unit_number": unit_counter,
                    "title": title if len(title) > 2 else f"Unit {unit_counter}: Core Fundamentals",
                    "description": f"Key concepts and methodologies for {title or subject_name}",
                    "weightage_pct": 20.0,
                    "topics": []
                }
                unit_counter += 1
            else:
                # If we have a current unit, lines might be topics
                if current_unit:
                    # Clean bullets, numbers
                    clean_line = re.sub(r'^[-*•\d\.\)\s]+', '', line).strip()
                    if clean_line and len(clean_line) > 3 and not clean_line.lower().startswith(("hours:", "weightage:", "references")):
                        subtopics = [t.strip() for t in clean_line.split(",") if len(t.strip()) > 3]
                        for sub in subtopics[:4]:
                            diff = "Hard" if any(w in sub.lower() for w in ["advanced", "complex", "algorithm", "design", "security"]) else ("Easy" if any(w in sub.lower() for w in ["introduction", "basics", "overview", "history"]) else "Medium")
                            current_unit["topics"].append({
                                "title": sub,
                                "estimated_hours": 3.0 if diff == "Hard" else (1.5 if diff == "Easy" else 2.0),
                                "difficulty": diff,
                                "mastery_level": 0.0,
                                "completed": False
                            })
                            
        if current_unit:
            units.append(current_unit)
            
        # If no units detected from explicit "Unit/Module" regex, parse directly from user lines
        if not units and lines:
            # Group lines into sensible units based on the student's provided text
            topics_per_unit = max(2, len(lines) // 4 + 1)
            chunked_lines = [lines[i:i + topics_per_unit] for i in range(0, len(lines), topics_per_unit)]
            
            for idx, chunk in enumerate(chunked_lines, start=1):
                first_line = re.sub(r'^[-*•\d\.\)\s]+', '', chunk[0]).strip()
                unit_title = f"Module {idx}: {first_line[:40]}" if first_line else f"Module {idx}"
                
                module_topics = []
                for l in chunk:
                    clean_line = re.sub(r'^[-*•\d\.\)\s]+', '', l).strip()
                    if clean_line and len(clean_line) > 2:
                        subtopics = [t.strip() for t in clean_line.split(",") if len(t.strip()) > 2]
                        for sub in subtopics[:4]:
                            diff = "Hard" if any(w in sub.lower() for w in ["advanced", "complex", "analysis", "synthesis", "critical"]) else ("Easy" if any(w in sub.lower() for w in ["intro", "basics", "overview", "definition"]) else "Medium")
                            module_topics.append({
                                "title": sub,
                                "estimated_hours": 3.0 if diff == "Hard" else (1.5 if diff == "Easy" else 2.0),
                                "difficulty": diff,
                                "mastery_level": 0.0,
                                "completed": False
                            })
                            
                if module_topics:
                    units.append({
                        "unit_number": idx,
                        "title": unit_title,
                        "description": f"Structured module for {subject_name or 'Course'}",
                        "weightage_pct": 25.0,
                        "topics": module_topics
                    })
                    
        if not units:
            return []
            
        # Normalize weightage
        total_units = len(units)
        pct_per_unit = round(100.0 / total_units, 1)
        for u in units:
            u["weightage_pct"] = pct_per_unit
            
        return units
