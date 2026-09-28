import json
import requests
from typing import Dict, Any, List
from app.core.rag import SimpleVectorSearch

class TutorAgent:
    """
    Tutor Agent: Answers student doubts using uploaded study materials through RAG.
    Supports Multi-Language (English, Hindi, Marathi) and adapts tone for any level
    from 1st Standard to PhD and Competitive Exams (UPSC, MPSC, JEE, NEET).
    """
    
    @classmethod
    def get_level_directive(cls, student_level: str) -> str:
        lvl = (student_level or "").lower()
        if "1st" in lvl or "primary" in lvl or "5th" in lvl:
            return (
                "STUDENT LEVEL: Primary School (Class 1-5).\n"
                "PEDAGOGICAL DIRECTIVE: Use very simple and cheerful language. Use intuitive real-world analogies, "
                "story examples, short friendly bullet points, and encouraging emojis (🌟, 📚, ✨). Avoid difficult academic jargon."
            )
        elif "6th" in lvl or "middle" in lvl or "8th" in lvl:
            return (
                "STUDENT LEVEL: Middle School (Class 6-8).\n"
                "PEDAGOGICAL DIRECTIVE: Explain step-by-step with clear definitions and relatable daily-life examples. "
                "Highlight key concepts clearly in bold and provide simple memory tips."
            )
        elif "9th" in lvl or "10th" in lvl or "secondary" in lvl or "board" in lvl:
            return (
                "STUDENT LEVEL: Secondary School (Class 9-10 / 10th Board Examination).\n"
                "PEDAGOGICAL DIRECTIVE: Focus on board exam scoring standards (NCERT / State Board). "
                "Provide precise definitions, standard formulas, step-by-step numerical/theoretical breakdowns, and exam answer-writing tips."
            )
        elif "11th" in lvl or "12th" in lvl or "hsc" in lvl or "higher" in lvl:
            return (
                "STUDENT LEVEL: Higher Secondary (Class 11-12 / HSC / Pre-University).\n"
                "PEDAGOGICAL DIRECTIVE: Emphasize deep conceptual clarity, mathematical derivations, core laws, "
                "and competitive entrance tips (JEE/NEET/CET problem-solving shortcuts)."
            )
        elif "phd" in lvl or "research" in lvl or "doctorate" in lvl:
            return (
                "STUDENT LEVEL: Ph.D. Candidate & Research Scholar.\n"
                "PEDAGOGICAL DIRECTIVE: Provide critical academic synthesis, methodology evaluation, research literature context, "
                "empirical validation considerations, and publication-standard framing."
            )
        elif "postgrad" in lvl or "master" in lvl:
            return (
                "STUDENT LEVEL: Postgraduate / Master's Degree (M.Tech / MBA / M.Sc).\n"
                "PEDAGOGICAL DIRECTIVE: Deliver high-level domain synthesis, advanced architectural/theoretical trade-offs, "
                "and state-of-the-art industry benchmarks."
            )
        elif "competitive" in lvl or "upsc" in lvl or "mpsc" in lvl or "jee" in lvl or "neet" in lvl or "gate" in lvl:
            return (
                "STUDENT LEVEL: Competitive Examination Aspirant (UPSC / MPSC / JEE / NEET / GATE / Banking).\n"
                "PEDAGOGICAL DIRECTIVE: Focus strictly on high-yield exam points, recurring PYQ patterns, option elimination techniques, "
                "concise factual tables, and rapid-revision mnemonics."
            )
        else:
            return (
                "STUDENT LEVEL: University Undergraduate (College Degree).\n"
                "PEDAGOGICAL DIRECTIVE: Balance theoretical rigour with practical implementation, architectural diagrams, "
                "and standard textbook conventions."
            )

    @classmethod
    def get_language_directive(cls, language: str) -> str:
        lang = (language or "en").lower()
        if lang == "hi":
            return (
                "TARGET LANGUAGE: HINDI (हिन्दी).\n"
                "INSTRUCTION: You MUST write the entire answer in fluent, clear Hindi using Devanagari script. "
                "Keep technical terms in brackets or standard Hindi (e.g. गुरुत्वाकर्षण (Gravity)). "
                "All explanations, headings, and tips must be in Hindi."
            )
        elif lang == "mr":
            return (
                "TARGET LANGUAGE: MARATHI (मराठी).\n"
                "INSTRUCTION: You MUST write the entire answer in fluent, grammatically sound Marathi using Devanagari script. "
                "Keep technical terms in brackets or standard Marathi (e.g. गुरुत्वाकर्षण (Gravity)). "
                "All explanations, headings, and tips must be in Marathi."
            )
        else:
            return (
                "TARGET LANGUAGE: ENGLISH.\n"
                "INSTRUCTION: Write clearly in modern, engaging English with crisp formatting."
            )

    @classmethod
    def answer_doubt(
        cls, 
        query: str, 
        chunks: List[Dict[str, Any]], 
        gemini_api_key: str = "",
        openai_api_key: str = "",
        chat_history: List[Dict[str, str]] = None,
        language: str = "en",
        student_level: str = "undergraduate"
    ) -> Dict[str, Any]:
        # Perform vector similarity search over chunks
        relevant_chunks = SimpleVectorSearch.search(query, chunks, top_k=4)
        
        citations = []
        context_snippets = []
        
        for c in relevant_chunks:
            meta = c.get("metadata_json") or {}
            page_slide = meta.get("page_or_slide", f"Chunk {c.get('chunk_index', 0) + 1}")
            doc_name = c.get("document_name", "Uploaded Material")
            
            snippet = c.get("content", "")[:180] + "..."
            citations.append({
                "document_name": doc_name,
                "chunk_index": c.get("chunk_index", 0),
                "snippet": snippet,
                "page_or_slide": page_slide
            })
            context_snippets.append(f"Source [{doc_name}, {page_slide}]:\n{c.get('content', '')}")
            
        combined_context = "\n\n".join(context_snippets)
        level_directive = cls.get_level_directive(student_level)
        lang_directive = cls.get_language_directive(language)
        
        # If Gemini API key is configured, call Gemini with multi-language & level instructions
        if gemini_api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_api_key}"
                prompt = (
                    f"You are an expert, compassionate AI Student Tutor.\n\n"
                    f"{lang_directive}\n\n"
                    f"{level_directive}\n\n"
                    f"Context from student's uploaded study materials:\n{combined_context or 'No direct course files uploaded yet. Provide grounded universal syllabus knowledge.'}\n\n"
                    f"Student Question: {query}\n\n"
                    f"Structure your response with:\n"
                    f"1. A direct, clear conceptual explanation matched to the student level.\n"
                    f"2. Structured bullet points or key steps.\n"
                    f"3. A practical example or exam tip.\n\n"
                    f"Answer:"
                )
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1200}
                }
                res = requests.post(url, json=payload, timeout=12)
                if res.status_code == 200:
                    data = res.json()
                    ans_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    
                    # Localized followups
                    if language == "hi":
                        followups = [
                            f"क्या आप {query} का एक व्यावहारिक उदाहरण दे सकते हैं?",
                            "इस विषय पर परीक्षा में कौन-से महत्वपूर्ण प्रश्न आते हैं?",
                            "मुझे इसका सरल सारांश और सूत्र बताएं।"
                        ]
                    elif language == "mr":
                        followups = [
                            f"{query} चे एक सोपे व्यावहारिक उदाहरण देऊ शकता का?",
                            "या विषयावर परीक्षेत कोणते महत्त्वाचे प्रश्न विचारले जातात?",
                            "या संकल्पनेचे सूत्र आणि संक्षिप्त मुद्दे सांगा."
                        ]
                    else:
                        followups = [
                            f"Can you explain an example of {query} in practice?",
                            "What are the typical high-yield exam questions on this topic?",
                            "How can I memorize the key points and formulas easily?"
                        ]

                    return {
                        "answer": ans_text,
                        "citations": citations,
                        "suggested_followups": followups
                    }
            except Exception:
                pass
                
        # Grounded semantic response generator with Multi-Language & Level adaptation
        top_source = citations[0]["document_name"] if citations else "Course Materials"
        top_page = citations[0]["page_or_slide"] if citations else "Unit 1"
        primary_text = relevant_chunks[0].get("content", "") if relevant_chunks else ""

        if language == "hi":
            # Hindi response
            if combined_context:
                key_points = [p.strip() for p in primary_text.split(".") if len(p.strip()) > 20][:3]
                points_formatted = "\n".join([f"• **मुख्य बिंदु:** {p}." for p in key_points]) or "• विस्तृत विवरण के लिए संबंधित अध्याय देखें।"
                
                answer = (
                    f"### 📖 मुख्य संकल्पना एवं व्याख्या\n\n"
                    f"आपकी अध्ययन सामग्री **{top_source}** ({top_page}) के अनुसार:\n\n"
                    f"{points_formatted}\n\n"
                    f"### 🔍 विस्तृत संदर्भ\n"
                    f"{primary_text[:400]}...\n\n"
                    f"💡 **परीक्षा टिप:** इस संकल्पना से संबंधित मुख्य परिभाषाएं और सूत्र याद रखें, क्योंकि यह परीक्षा में अक्सर पूछे जाते हैं।"
                )
            else:
                answer = (
                    f"### 💡 \"{query}\" पर मार्गदर्शन\n\n"
                    f"इस विषय का आपकी पाठ्यपुस्तकों से सटीक संदर्भ प्राप्त करने के लिए कृपया संबंधित अध्याय की पीडीएफ या नोट्स अपलोड करें।\n\n"
                    f"**महत्वपूर्ण सूत्र एवं दृष्टिकोण:**\n"
                    f"1. मूल परिभाषा और मुख्य सिद्धांतों को समझें।\n"
                    f"2. चरणबद्ध तरीके से समस्या का समाधान निकालें।\n"
                    f"3. पिछले वर्षों के प्रश्न-पत्रों (PYQ) का अभ्यास करें।"
                )

            followups = [
                f"{query} का एक सरल उदाहरण देकर समझाएं।",
                "इस विषय से संबंधित महत्वपूर्ण सूत्र क्या हैं?",
                "परीक्षा में इस पर कैसे प्रश्न पूछे जाते हैं?"
            ]

        elif language == "mr":
            # Marathi response
            if combined_context:
                key_points = [p.strip() for p in primary_text.split(".") if len(p.strip()) > 20][:3]
                points_formatted = "\n".join([f"• **महत्त्वाचा मुद्दा:** {p}." for p in key_points]) or "• सविस्तर माहितीसाठी संबंधित घटक पहा."
                
                answer = (
                    f"### 📖 मुख्य संकल्पना आणि स्पष्टीकरण\n\n"
                    f"तुमच्या अभ्यास साहित्यातील **{top_source}** ({top_page}) संदर्भानुसार:\n\n"
                    f"{points_formatted}\n\n"
                    f"### 🔍 सविस्तर संदर्भ\n"
                    f"{primary_text[:400]}...\n\n"
                    f"💡 **परीक्षेसाठी महत्त्वाची टीप:** या घटकाशी संबंधित व्याख्या आणि मुख्य सूत्रे आवर्जून लक्षात ठेवा, कारण ही परीक्षेच्या दृष्टीने अत्यंत महत्त्वाची आहेत."
                )
            else:
                answer = (
                    f"### 💡 \"{query}\" बाबत मार्गदर्शन\n\n"
                    f"तुमच्या अभ्यासक्रमातील नेमका संदर्भ शोधण्यासाठी कृपया संबंधित घटकाची पीडीएफ किंवा नोट्स अपलोड करा.\n\n"
                    f"**अभ्यासाचा महत्त्वाचा दृष्टिकोन:**\n"
                    f"1. मूळ संकल्पना आणि व्याख्या समजून घ्या.\n"
                    f"2. पायरी-पायरीने विश्लेषण करा आणि प्रत्यक्ष उदाहरणे जोडा.\n"
                    f"3. मागील परीक्षांमधील प्रश्नांचा नियमित सराव करा."
                )

            followups = [
                f"{query} चे एक सोपे उदाहरण सांगा.",
                "या विषयातील महत्त्वाची सूत्रे आणि व्याख्या कोणत्या?",
                "परीक्षेच्या दृष्टीने यात काय जास्त महत्त्वाचे आहे?"
            ]

        else:
            # English response
            if combined_context:
                key_points = [p.strip() for p in primary_text.split(".") if len(p.strip()) > 20][:3]
                points_formatted = "\n".join([f"• **Key Concept:** {p}." for p in key_points]) or "• Refer to the extracted section for details."
                
                answer = (
                    f"### 📖 Explanation & Core Concept\n\n"
                    f"Based on your course materials in **{top_source}** ({top_page}):\n\n"
                    f"{points_formatted}\n\n"
                    f"### 🔍 Detailed Context\n"
                    f"{primary_text[:400]}...\n\n"
                    f"💡 **Exam Tip:** Ensure you remember the key definitions, laws, and formulas associated with this concept as they frequently appear in exam assessments."
                )
            else:
                answer = (
                    f"### 💡 Guidance on \"{query}\"\n\n"
                    f"To answer this directly from your course curriculum, please upload the relevant chapter PDF, slides, or syllabus notes. "
                    f"In the meantime, remember the fundamental approach: decompose the problem into core principles, standard formulas, and practical edge cases."
                )
                
            followups = [
                f"What are the core definitions and formulas for {query}?",
                "Can you test me on this topic with a quick practice question?",
                "How has this topic appeared in Previous Year Questions (PYQs)?"
            ]
            
        return {
            "answer": answer,
            "citations": citations,
            "suggested_followups": followups
        }
