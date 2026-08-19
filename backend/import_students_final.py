import json
import random
import time
import urllib.request
import urllib.error

# Your college ID from the logs
COLLEGE_ID = '677b3f37-6a79-4f9e-bf30-9a1bb1576139'

print('=' * 60)
print('STUDENT IMPORT SCRIPT')
print('=' * 60)

# Login with your credentials
print('\n🔐 Logging in...')
login_data = json.dumps({
    'username': 'adt_admin',
    'password': 'College@134!'
}).encode('utf-8')

login_req = urllib.request.Request(
    'http://localhost:5000/api/auth/login',
    data=login_data,
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(login_req) as response:
        login_resp = json.loads(response.read().decode())
        token = login_resp.get('token')
        print(f'✅ Logged in successfully')
        print(f'   Token: {token[:50]}...')
except urllib.error.HTTPError as e:
    print(f'❌ Login failed: {e.read().decode()}')
    exit()
except Exception as e:
    print(f'❌ Login error: {e}')
    exit()

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Indian names for realistic data
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
        data = json.dumps(student).encode('utf-8')
        req = urllib.request.Request(
            'http://localhost:5000/api/students',
            data=data,
            headers=headers,
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            success += 1
            if i % 20 == 0:
                print(f'  ✅ Imported {i} students...')
                
    except urllib.error.HTTPError as e:
        failed += 1
        error_text = e.read().decode()
        errors.append({
            'name': student['name'],
            'roll': student['roll_number'],
            'error': error_text[:150]
        })
        if i <= 5:
            print(f'  ❌ Failed: {student["name"]} - Status {e.code}')
            print(f'     Error: {error_text[:100]}')
    except Exception as e:
        failed += 1
        errors.append({
            'name': student['name'],
            'roll': student['roll_number'],
            'error': str(e)
        })
        if i <= 5:
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
