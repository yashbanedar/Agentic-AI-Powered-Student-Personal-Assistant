import re
import math
from typing import List, Dict, Any, Tuple

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'\r\n', '\n', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def chunk_text(text: str, chunk_size: int = 600, chunk_overlap: int = 100) -> List[str]:
    cleaned = clean_text(text)
    if not cleaned:
        return []
    
    words = cleaned.split()
    chunks = []
    current_idx = 0
    
    while current_idx < len(words):
        end_idx = min(current_idx + chunk_size // 5, len(words)) # approx words
        chunk = " ".join(words[current_idx:end_idx])
        if chunk.strip():
            chunks.append(chunk.strip())
        if end_idx >= len(words):
            break
        current_idx += max(1, (chunk_size - chunk_overlap) // 5)
        
    return chunks

class SimpleVectorSearch:
    """
    Pure Python TF-IDF + Cosine Similarity vector search.
    Provides fast, deterministic, zero-dependency RAG retrieval for documents,
    without requiring heavy binary wheels or network calls.
    """
    @staticmethod
    def tokenize(text: str) -> List[str]:
        return [w.lower() for w in re.findall(r'\b[a-zA-Z0-9_]{2,}\b', text)]

    @classmethod
    def compute_tfidf(cls, documents: List[str]) -> Tuple[List[Dict[str, float]], Dict[str, float]]:
        doc_tokens = [cls.tokenize(doc) for doc in documents]
        df = {}
        for tokens in doc_tokens:
            for word in set(tokens):
                df[word] = df.get(word, 0) + 1
        
        num_docs = len(documents)
        idf = {word: math.log((num_docs + 1) / (count + 1)) + 1 for word, count in df.items()}
        
        tfidf_docs = []
        for tokens in doc_tokens:
            tf = {}
            for word in tokens:
                tf[word] = tf.get(word, 0) + 1
            doc_len = max(1, len(tokens))
            vec = {}
            norm = 0.0
            for word, count in tf.items():
                val = (count / doc_len) * idf.get(word, 1.0)
                vec[word] = val
                norm += val * val
            norm = math.sqrt(norm) if norm > 0 else 1.0
            for word in vec:
                vec[word] /= norm
            tfidf_docs.append(vec)
            
        return tfidf_docs, idf

    @classmethod
    def search(cls, query: str, documents: List[Dict[str, Any]], top_k: int = 4) -> List[Dict[str, Any]]:
        if not documents:
            return []
        
        texts = [doc.get("content", "") for doc in documents]
        tfidf_docs, idf = cls.compute_tfidf(texts)
        
        q_tokens = cls.tokenize(query)
        q_tf = {}
        for word in q_tokens:
            q_tf[word] = q_tf.get(word, 0) + 1
        
        q_len = max(1, len(q_tokens))
        q_vec = {}
        q_norm = 0.0
        for word, count in q_tf.items():
            val = (count / q_len) * idf.get(word, 1.0)
            q_vec[word] = val
            q_norm += val * val
        q_norm = math.sqrt(q_norm) if q_norm > 0 else 1.0
        for word in q_vec:
            q_vec[word] /= q_norm
            
        scores = []
        for i, doc_vec in enumerate(tfidf_docs):
            score = sum(val * doc_vec.get(w, 0.0) for w, val in q_vec.items())
            scores.append((score, documents[i]))
            
        scores.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, doc in scores[:top_k]:
            if score > 0.005 or len(results) == 0:
                doc_copy = dict(doc)
                doc_copy["relevance_score"] = round(float(score), 4)
                results.append(doc_copy)
                
        return results
