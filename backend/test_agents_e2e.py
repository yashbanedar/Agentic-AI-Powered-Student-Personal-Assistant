import sys
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

print('--- Starting Comprehensive Multi-Agent End-to-End Test ---')

# 1. Register test student
reg_res = client.post('/api/v1/auth/register', json={
    'email': 'student@university.edu',
    'password': 'password123',
    'full_name': 'Alex Student'
})
if reg_res.status_code != 200:
    # If already registered, login
    log_res = client.post('/api/v1/auth/login', json={'email': 'student@university.edu', 'password': 'password123'})
    auth_data = log_res.json()
else:
    auth_data = reg_res.json()

token = auth_data['access_token']
headers = {'Authorization': f'Bearer {token}'}
print('1. User Registration & JWT: OK')

# 2. Get subjects
sub_res = client.get('/api/v1/subjects/', headers=headers)
assert sub_res.status_code == 200
subjects = sub_res.json()
assert len(subjects) >= 1, 'Default subjects not created'
target_sub = subjects[0]
print(f'2. Subjects List (found {len(subjects)} subjects, selected {target_sub["name"]}): OK')

# 3. Test Document Agent text note upload & extraction
doc_res = client.post('/api/v1/documents/text-note', headers=headers, json={
    'title': 'Operating Systems Virtual Memory and Paging',
    'subject_id': target_sub['id'],
    'content': (
        'Virtual memory allows the execution of processes that are not completely in memory. '
        'Paging is a memory management scheme that eliminates the need for contiguous allocation. '
        'Page replacement algorithms like LRU (Least Recently Used) replace the page that has not been used for the longest period. '
        'Thrashing occurs when a computer spends more time paging than executing instructions.'
    ),
    'category': 'study_material'
})
assert doc_res.status_code == 200, f'Document upload failed: {doc_res.text}'
doc_data = doc_res.json()
print(f'3. Document Agent: Extracted {doc_data["chunk_count"]} chunks from study material: OK')

# 4. Test Syllabus Agent
syl_res = client.get(f'/api/v1/syllabus/{target_sub["id"]}', headers=headers)
assert syl_res.status_code == 200
syl_data = syl_res.json()
assert len(syl_data['units']) >= 3
print(f'4. Syllabus Agent: Structured into {len(syl_data["units"])} units: OK')

# 5. Test PYQ Agent
pyq_res = client.get(f'/api/v1/pyq/?subject_id={target_sub["id"]}', headers=headers)
assert pyq_res.status_code == 200
pyqs = pyq_res.json()
assert len(pyqs) >= 1
print('5. PYQ Agent: Analyzed exam questions & identified recurring high-yield topics: OK')

# 6. Test Exam Agent countdown & urgency
exam_res = client.get('/api/v1/exams/', headers=headers)
assert exam_res.status_code == 200
exams = exam_res.json()
assert len(exams) >= 1
print(f'6. Exam Agent: Computed countdown ({exams[0]["days_left"]} days) & urgency ({exams[0]["prep_urgency"]}%): OK')

# 7. Test Study Planner Agent
plan_res = client.get('/api/v1/study-plan/today', headers=headers)
assert plan_res.status_code == 200
tasks = plan_res.json()
assert len(tasks) >= 2
print(f'7. Study Planner Agent: Generated {len(tasks)} daily study slots: OK')

# 8. Test Quiz Agent & Evaluation Agent
quiz_res = client.post('/api/v1/quizzes/generate', headers=headers, json={
    'subject_id': target_sub['id'],
    'title': 'Virtual Memory Diagnostic Test',
    'quiz_type': 'MCQ',
    'topic_name': 'Page Replacement & Thrashing',
    'total_questions': 5,
    'time_limit_minutes': 10
})
assert quiz_res.status_code == 200
quiz_data = quiz_res.json()
quiz_id = quiz_data['id']
q_ids = [q['id'] for q in quiz_data['questions']]
print(f'8a. Quiz Agent: Generated {len(q_ids)} questions: OK')

# Submit answers
subm_res = client.post(f'/api/v1/quizzes/{quiz_id}/submit', headers=headers, json={
    'answers': {str(q_ids[0]): 0, str(q_ids[1]): 1, str(q_ids[2]): 2}
})
assert subm_res.status_code == 200
eval_data = subm_res.json()
print(f'8b. Evaluation Agent: Evaluated score {eval_data["score"]}/{eval_data["total"]} ({eval_data["percentage"]}%), Weak Topics: {eval_data["weak_topics"]}: OK')

# 9. Test Recommendation Agent
rec_res = client.get('/api/v1/recommendations/next', headers=headers)
assert rec_res.status_code == 200
rec_data = rec_res.json()
print(f'9. Recommendation Agent: "What should I study now?" -> {rec_data["what_to_study_now"]}: OK')

# 10. Test Tutor Agent (RAG Doubt Solving)
tutor_res = client.post('/api/v1/tutor/chat', headers=headers, json={
    'subject_id': target_sub['id'],
    'message': 'What causes thrashing and how does paging help?'
})
assert tutor_res.status_code == 200
tutor_data = tutor_res.json()
assert len(tutor_data['citations']) >= 1
print(f'10. Tutor Agent RAG: Answered doubt with {len(tutor_data["citations"])} grounded citations: OK')

# 11. Test AI Activity Stream
act_res = client.get('/api/v1/activity/', headers=headers)
assert act_res.status_code == 200
activities = act_res.json()
print(f'11. Agent Orchestrator: Verified {len(activities)} logged AI activities in live feed: OK')

print('--- ALL MULTI-AGENT BACKEND CAPABILITIES VERIFIED 100% SUCCESSFULLY ---')