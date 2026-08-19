import requests
import json
import random
import time
from datetime import datetime

# Your college ID from the logs
COLLEGE_ID = '677b3f37-6a79-4f9e-bf30-9a1bb1576139'

print('=' * 60)
print('STUDENT IMPORT SCRIPT')
print('=' * 60)

# Login
print('\n🔐 Logging in...')
login_resp = requests.post('http://localhost:5000/api/auth/login', json={
    'username': 'adt_admin',
    'password': 'admin123'
})

if login_resp.status_code != 200:
    print(f'❌ Login failed: {login_resp.text}')
    # Try alternative password
    print('Trying alternative password...')
    login_resp = requests.post('http://localhost:5000/api/auth/login', json={
        'username': 'adt_admin',
        'password': 'Admin@123'
    })
    if login_resp.status_code != 200:
        print(f'❌ Login failed again: {login_resp.text}')
        exit()

token = login_resp.json().get('token')
print(f'✅ Logged in successfully')

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Indian names
first_names = [
    'Aarav', 'Ananya', 'Aditya', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Kavya',
    'Arjun', 'Divya', 'Suresh', 'Meera', 'Naveen', 'Pooja', 'Karthik', 'Lakshmi',
    'Ganesh', 'Sowmya', 'Mohan', 'Radhika', 'Deepak', 'Anjali', 'Ravi', 'Sita',
    'Gopal', 'Kiran', 'Chandra', 'Prakash', 'Uma', 'Saravanan', 'Muthu', 'Kannan',
    'Subramanian', 'Nalini', 'Sundar', 'Bhuvaneswari', 'Harish', 'Pavithra',
    'Murali', 'Shanthi', 'Kesavan', 'Jayaprakash', 'Vasanthi', 'Rajendran',
    'Madhavi', 'Giridharan', 'Mathangi', 'Srinivasan', 'Anitha', 'Baskaran',
    'Chitra', 'Dinesh', 'Eswari', 'Francis', 'Gayathri', 'Hariharan', 'Indira',
    'Jagan', 'Kalaivani', 'Lalitha', 'Mahendran', 'Nandhini', 'Omprakash',
    'Prabhakaran', 'Rajalakshmi', 'Sakthivel', 'Thenmozhi', 'Udhayakumar',
    'Vimala', 'Yogeshwari', 'Arumugam', 'Bharathi', 'Chandrika', 'Devarajan',
    'Elangovan', 'Gowri', 'Hemalatha', 'Ilavarasan', 'Jothi', 'Kalidasan',
    'Kumaresan', 'Lakshmanan', 'Mala', 'Nagarajan', 'Padmavathi', 'Raghunathan',
    'Santhosh', 'Thilagavathi', 'Umapathy', 'Valliammai', 'Yasodha', 'Arulmozhi',
    'Balasubramanian', 'Chellammal', 'Duraisamy', 'Ezhilarasi', 'Gunasekaran',
    'Indumathi', 'Jeyalakshmi', 'Karthikeyan', 'Latha', 'Manikandan', 'Nirmala',
    'Palanisamy', 'Rajeswari', 'Sivakumar', 'Thangamani'
]

last_names = ['Sharma', 'Reddy', 'Singh', 'Patel', 'Kumar', 'Gupta', 'Raj', 'Nair',
              'Menon', 'Krishnan', 'Babu', 'Iyer', 'Verma', 'Rao', 'Narayan', 'Prasad',
              'Rajan', 'Krishna']

branches = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL']
companies = ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Accenture', 'Wipro', 'Cognizant']
placement_statuses = ['placed', 'unplaced', 'at_risk', 'in_process']

# Generate 200 students
print('\n📊 Generating 200 students...')
students = []

for i in range(1, 201):
    first_name = random.choice(first_names)
    last_name = random.choice(last_names)
    name = f'{first_name} {last_name}'
    roll_number = f'202{i+1000}'
    branch = random.choice(branches)
    cgpa = round(random.uniform(5.0, 9.8), 1)
    attendance = round(random.uniform(65, 98))
    coding_score = random.randint(200, 950)
    communication_score = random.randint(40, 95)
    projects_count = random.randint(0, 5)
    internships_count = random.randint(0, 3)
    
    # Determine placement status based on CGPA
    if cgpa >= 8.5:
        status = 'placed'
    elif cgpa >= 7.5:
        status = random.choices(['placed', 'unplaced'], weights=[80, 20])[0]
    elif cgpa >= 6.5:
        status = random.choices(['placed', 'unplaced', 'at_risk'], weights=[40, 40, 20])[0]
    elif cgpa >= 5.5:
        status = random.choices(['unplaced', 'at_risk'], weights=[60, 40])[0]
    else:
        status = 'unplaced'
    
    if status == 'placed':
        company = random.choice(companies)
        package = round(random.uniform(10.0, 36.0), 1)
    else:
        company = None
        package = None
    
    # Generate email and phone
    email = f'{first_name.lower()}.{last_name.lower()}@college.edu'
    phone = f'+91{random.randint(7000000000, 9999999999)}'
    batch = '2024'
    
    student = {
        'roll_number': roll_number,
        'name': name,
        'email': email,
        'phone': phone,
        'branch': branch,
        'batch': batch,
        'cgpa': cgpa,
        'attendance_percentage': attendance,
        'coding_score': coding_score,
        'communication_score': communication_score,
        'projects_count': projects_count,
        'internships_count': internships_count,
        'company': company,
        'package': str(package) if package else None,
        'placement_status': status,
        'college_id': COLLEGE_ID
    }
    students.append(student)

print(f'✅ Generated {len(students)} students')

# Import students
print('\n📤 Importing students...')
print('=' * 60)

success = 0
failed = 0
errors = []

for i, student in enumerate(students, 1):
    try:
        resp = requests.post('http://localhost:5000/api/students', 
                            json=student, 
                            headers=headers,
                            timeout=10)
        
        if resp.status_code in [200, 201]:
            success += 1
            if i % 20 == 0:
                print(f'  ✅ Imported {i} students...')
        else:
            failed += 1
            errors.append({
                'name': student['name'],
                'roll': student['roll_number'],
                'error': resp.text[:150]
            })
            if i <= 5:  # Show first 5 errors
                print(f'  ❌ Failed: {student["name"]} - {resp.status_code}')
                print(f'     Error: {resp.text[:100]}')
            
    except requests.exceptions.Timeout:
        failed += 1
        print(f'  ⏰ Timeout: {student["name"]}')
    except Exception as e:
        failed += 1
        errors.append({
            'name': student['name'],
            'roll': student['roll_number'],
            'error': str(e)
        })
        print(f'  ❌ Error: {student["name"]} - {str(e)[:100]}')
    
    # Rate limiting - small delay
    if i % 10 == 0:
        time.sleep(0.05)

print('\n' + '=' * 60)
print('📊 IMPORT SUMMARY')
print('=' * 60)
print(f'✅ Successfully added: {success} students')
print(f'❌ Failed: {failed} students')
print(f'📝 Total attempted: {len(students)}')

if errors and len(errors) > 0:
    print(f'\n🔍 First 5 errors:')
    for err in errors[:5]:
        print(f'  - {err["name"]} ({err["roll"]}): {err["error"]}')

print('=' * 60)
