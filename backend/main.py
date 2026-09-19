import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.core.config import settings
from app.core.database import engine, Base
import app.models.database_models

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description='Backend API for Agentic AI-Powered Student Personal Assistant',
    version='1.0.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

from app.api import auth, onboarding, subjects, documents, syllabus, pyq, exams, study_plan, tutor, quizzes, analytics, recommendations, notes, activity

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(onboarding.router, prefix=settings.API_V1_STR)
app.include_router(subjects.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(syllabus.router, prefix=settings.API_V1_STR)
app.include_router(pyq.router, prefix=settings.API_V1_STR)
app.include_router(exams.router, prefix=settings.API_V1_STR)
app.include_router(study_plan.router, prefix=settings.API_V1_STR)
app.include_router(tutor.router, prefix=settings.API_V1_STR)
app.include_router(quizzes.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(recommendations.router, prefix=settings.API_V1_STR)
app.include_router(notes.router, prefix=settings.API_V1_STR)
app.include_router(activity.router, prefix=settings.API_V1_STR)

@app.get('/health')
def health_check():
    return {'status': 'healthy', 'database': str(engine.url).split('@')[-1] if '@' in str(engine.url) else str(engine.url)}

# Locate frontend production build assets
frontend_dist_candidates = [
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'dist'),
    os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist'),
    os.path.join(os.getcwd(), 'frontend', 'dist'),
    os.path.join(os.getcwd(), 'dist')
]

frontend_dist = next((p for p in frontend_dist_candidates if os.path.isdir(p) and os.path.isfile(os.path.join(p, 'index.html'))), None)

if frontend_dist:
    assets_dir = os.path.join(frontend_dist, 'assets')
    if os.path.isdir(assets_dir):
        app.mount('/assets', StaticFiles(directory=assets_dir), name='assets')

    @app.get('/{full_path:path}')
    def serve_frontend_spa(full_path: str = ''):
        # Do not intercept API endpoints or auto-generated documentation
        if full_path.startswith('api/') or full_path in ('docs', 'redoc', 'openapi.json'):
            return {'detail': 'Not Found'}
        
        target_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(target_path):
            return FileResponse(target_path)
        return FileResponse(os.path.join(frontend_dist, 'index.html'))
else:
    @app.get('/')
    def root():
        return {
            'status': 'online',
            'service': settings.PROJECT_NAME,
            'docs': '/docs',
            'version': '1.0.0'
        }

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    uvicorn.run('main:app', host='0.0.0.0', port=port, reload=False)

