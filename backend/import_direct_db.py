import psycopg2
import random
import uuid
from datetime import datetime

# ============================================================
# YOUR DATABASE SETTINGS
# ============================================================
DB_NAME = 'campusplacement'
DB_USER = 'postgres'
DB_PASSWORD = 'Ilove@gt650'
DB_HOST = 'localhost'
DB_PORT = '5432'
# ============================================================

print('=' * 60)
print('DIRECT DATABASE IMPORT')
print('=' * 60)
print(f'📊 Database: {DB_NAME}')
print(f'👤 User: {DB_USER}')
print(f'🔗 Host: {DB_HOST}:{DB_PORT}')

# Connect to database
try:
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cursor = conn.cursor()
    print('✅ Connected to database')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    exit()

COLLEGE_ID = '677b3f37-6a79-4f9e-bf30-9a1bb1576139'
CREATED_BY = '2e967197-f173-44d1-9d77-8fa4c76c6d74'

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

print('\n📊 Generating 200 students...')
success = 0
failed = 0

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
    
    student_id = str(uuid.uuid4())
    email = f'{first_name.lower()}.{last_name.lower()}@college.edu'
    phone = f'+91{random.randint(7000000000, 9999999999)}'
    now = datetime.now()
    
    try:
        # Using the exact column names from your model (camelCase)
        cursor.execute('''
            INSERT INTO students (
                id, roll_number, name, email, phone, branch, batch, cgpa,
                attendance_percentage, coding_score, communication_score,
                projects_count, internships_count, company, package,
                placement_status, college_id, created_by, "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            student_id, roll_number, name, email, phone, branch, '2024', cgpa,
            attendance, coding_score, communication_score,
            projects_count, internships_count, company,
            str(package) if package else None, status,
            COLLEGE_ID, CREATED_BY, now, now
        ))
        success += 1
        if success % 20 == 0:
            print(f'  ✅ Inserted {success} students...')
    except Exception as e:
        failed += 1
        if failed <= 5:
            print(f'  ❌ Error on student {i}: {e}')

conn.commit()
print('\n' + '=' * 60)
print('📊 IMPORT SUMMARY')
print('=' * 60)
print(f'✅ Successfully inserted: {success} students')
print(f'❌ Failed: {failed} students')
print('=' * 60)

cursor.close()
conn.close()
print('\n🎉 Done!')
