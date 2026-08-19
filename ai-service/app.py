import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse
from models.placement_model import PlacementModel

HOST = os.getenv('AI_SERVICE_HOST', '0.0.0.0')
PORT = int(os.getenv('AI_SERVICE_PORT', '8001'))

# Load model pipeline on startup
try:
    placement_model = PlacementModel()
except Exception as e:
    print(f"Failed to initialize PlacementModel: {e}")
    placement_model = None


def compute_probability_deterministic(profile):
    cgpa = float(profile.get('cgpa', 0) or 0)
    coding = int(profile.get('coding', 0) or 0)
    internships = int(profile.get('internships', 0) or 0)
    attendance = int(profile.get('attendance', 0) or 0)
    projects = int(profile.get('projects', 0) or 0)
    communication = int(profile.get('communication', 0) or 0)
    selected_skills = len(profile.get('selectedSkills', []) or [])

    branch_weights = {
        'cse': 8,
        'ece': 6,
        'eee': 5,
        'mech': 4,
        'civil': 3
    }

    probability = 0
    probability += (cgpa / 10) * 32
    probability += (coding / 1000) * 25
    probability += (internships / 3) * 18
    probability += (attendance / 100) * 12
    probability += (projects / 5) * 8
    probability += (communication / 100) * 3
    probability += branch_weights.get((profile.get('branch') or '').lower(), 0)
    probability += (selected_skills / 5) * 2

    return min(int(round(probability)), 98)


def compute_probability(profile):
    print(f"DEBUG: compute_probability called with profile: {profile}")
    print(f"DEBUG: placement_model is None: {placement_model is None}")
    if placement_model is not None:
        print(f"DEBUG: placement_model.pipeline is None: {placement_model.pipeline is None}")
    if placement_model is not None and placement_model.pipeline is not None:
        try:
            prob = placement_model.predict_probability(profile)
            print(f"DEBUG: Model prediction succeeded: {prob}%")
            return prob
        except Exception as e:
            print(f"DEBUG: Model prediction failed: {e}")
            
    print("DEBUG: Falling back to deterministic scoring")
    return compute_probability_deterministic(profile)




def build_prediction(probability):
    if probability >= 75:
        return {
            'probability': probability,
            'label': 'Low Risk - High Probability',
            'description': 'Excellent profile! Strong chances of placement.',
            'color': '#28a745',
            'readiness': 85,
            'recommendations': [
                'Maintain your CGPA above 8.5',
                'Focus on advanced system design',
                'Prepare for dream company interviews',
                'Contribute to open source projects'
            ],
            'companies': ['Google', 'Amazon', 'Microsoft', 'Adobe', 'Goldman Sachs']
        }
    if probability >= 50:
        return {
            'probability': probability,
            'label': 'Medium Risk - Moderate Probability',
            'description': 'Good profile with room for improvement.',
            'color': '#ffc107',
            'readiness': 67,
            'recommendations': [
                'Improve coding score to 700+',
                'Get at least 1 internship',
                'Practice mock interviews weekly',
                'Build 2-3 strong projects'
            ],
            'companies': ['TCS', 'Infosys', 'Cognizant', 'Accenture', 'Capgemini']
        }
    return {
        'probability': probability,
        'label': 'High Risk - Low Probability',
        'description': 'Needs significant improvement to get placed.',
        'color': '#dc3545',
        'readiness': 38,
        'recommendations': [
            'Focus on core subjects immediately',
            'Start competitive coding daily',
            'Attend all placement training sessions',
            'Improve attendance to 90%+',
            'Get mentorship from placed seniors'
        ],
        'companies': ['Startups', 'Local IT Firms', 'Service-based Companies']
    }


class AIServiceHandler(BaseHTTPRequestHandler):
    def _send_json(self, payload, status=200):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self):
        content_length = int(self.headers.get('Content-Length', '0'))
        raw = self.rfile.read(content_length) if content_length else b'{}'
        try:
            return json.loads(raw.decode('utf-8'))
        except json.JSONDecodeError:
            return {}

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/health':
            self._send_json({'status': 'ok', 'service': 'campusplacement-ai'})
            return
        self._send_json({'error': 'Not found'}, 404)

    def do_POST(self):
        parsed = urlparse(self.path)
        payload = self._read_json()

        if parsed.path == '/predict':
            probability = compute_probability(payload.get('profile', payload))
            self._send_json(build_prediction(probability))
            return

        if parsed.path == '/skill-gap':
            company = payload.get('company', '')
            selected_skills = payload.get('selectedSkills', [])
            company_requirements = {
                'google': ['Data Structures', 'Operating Systems', 'Computer Networks', 'System Design'],
                'amazon': ['Data Structures', 'Operating Systems', 'DBMS', 'Leadership'],
                'microsoft': ['Data Structures', 'Operating Systems', 'Computer Networks', 'DBMS'],
                'tcs': ['Data Structures', 'DBMS', 'Communication'],
                'infosys': ['Data Structures', 'Web Development', 'DBMS']
            }
            required = company_requirements.get(company, [])
            missing = [skill for skill in required if skill not in selected_skills]
            self._send_json({
                'company': company,
                'required': required,
                'missing': missing,
                'learningPlan': missing if missing else ['Focus on mock interviews and revision']
            })
            return

        if parsed.path == '/resume':
            filename = payload.get('filename', 'resume.pdf')
            ats_score = 78 if 'resume' in filename.lower() else 64
            self._send_json({
                'atsScore': ats_score,
                'missingKeywords': ['REST APIs', 'Cloud Deployment', 'System Design'] if ats_score >= 70 else ['Resume file is missing or unreadable'],
                'suggestions': [
                    'Add measurable impact/metrics to project bullet points',
                    'Include a dedicated Skills section with proficiency levels',
                    'Use stronger action verbs at the start of each bullet'
                ]
            })
            return

        self._send_json({'error': 'Route not found'}, 404)


if __name__ == '__main__':
    server = HTTPServer((HOST, PORT), AIServiceHandler)
    print(f'AI service running on http://{HOST}:{PORT}')
    server.serve_forever()
