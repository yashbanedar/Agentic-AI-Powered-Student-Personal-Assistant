import json
import requests
from typing import Dict, Any, List
from app.core.rag import SimpleVectorSearch

class TutorAgent:
    """
    Tutor Agent: Answers student doubts using uploaded study materials through RAG.
    Returns clear explanations, precise source citations, and follow-up conceptual queries.
    """
    
    @classmethod
    def answer_doubt(
        cls, 
        query: str, 
        chunks: List[Dict[str, Any]], 
        gemini_api_key: str = "",
        openai_api_key: str = "",
        chat_history: List[Dict[str, str]] = None
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
        
        # If Gemini API key is configured, call Gemini
        if gemini_api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_api_key}"
                prompt = (
                    f"You are an expert AI Tutor. Answer the student's question accurately, "
                    f"strictly referencing the course context provided below. "
                    f"Use clear formatting with bullet points and bold headers where appropriate.\n\n"
                    f"Context from uploaded study materials:\n{combined_context}\n\n"
                    f"Student Question: {query}\n\n"
                    f"Answer:"
                )
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1000}
                }
                res = requests.post(url, json=payload, timeout=12)
                if res.status_code == 200:
                    data = res.json()
                    ans_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return {
                        "answer": ans_text,
                        "citations": citations,
                        "suggested_followups": [
                            f"Can you explain an example of {query} in practice?",
                            "What are the typical pitfalls or exam questions on this topic?",
                            "How does this relate to the previous unit?"
                        ]
                    }
            except Exception:
                pass
                
        # Grounded semantic response generator
        if combined_context:
            primary_text = relevant_chunks[0].get("content", "") if relevant_chunks else ""
            key_points = [p.strip() for p in primary_text.split(".") if len(p.strip()) > 20][:3]
            points_formatted = "\n".join([f"• **Key Concept:** {p}." for p in key_points]) or "• Refer to the extracted section for details."
            
            top_source = citations[0]["document_name"] if citations else "Study Notes"
            top_page = citations[0]["page_or_slide"] if citations else "Section 1"
            
            answer = (
                f"### Explanation & Core Concept\n\n"
                f"Based on your course materials in **{top_source}** ({top_page}):\n\n"
                f"{points_formatted}\n\n"
                f"### Detailed Context\n"
                f"{primary_text[:400]}...\n\n"
                f"💡 **Exam Tip:** Ensure you remember the key definitions and formulas associated with this concept as they frequently appear in Section A and B exam questions."
            )
        else:
            answer = (
                f"### Guidance on \"{query}\"\n\n"
                f"To answer this directly from your course materials, please upload the relevant chapter PDF, lecture slides, or notes. "
                f"In the meantime, remember the fundamental principle: break down the problem into definitions, operative equations, and application edge cases."
            )
            
        followups = [
            f"What are the key formulas or definitions for {query}?",
            "Can you test me on this topic with a quick MCQ?",
            "How has this topic appeared in Previous Year Questions?"
        ]
        
        return {
            "answer": answer,
            "citations": citations,
            "suggested_followups": followups
        }
