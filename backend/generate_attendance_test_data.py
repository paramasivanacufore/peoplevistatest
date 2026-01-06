"""
Script to generate dummy attendance data for testing
- Assigns shifts to employees (one-time setup)
- Generates holidays for 2025 and 2026 (one-time setup)
- Generates daily attendance data (run daily for current date)
- Generates leave requests (run daily)
- Generates regularization requests (run daily)

Usage: 
  python generate_attendance_test_data.py                    # Generate data for today
  python generate_attendance_test_data.py --date 2025-01-15  # Generate data for specific date
  python generate_attendance_test_data.py --setup-only       # Only setup shifts and holidays
"""

import sys
import os
import argparse
from datetime import date, datetime, timedelta, time
import random
from typing import List, Dict, Optional

# Add parent directory to path to import database
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import db
from dotenv import load_dotenv

load_dotenv()

# Common holidays for India (adjust as needed)
INDIA_HOLIDAYS = {
    2025: [
        ('New Year', date(2025, 1, 1), 'Public'),
        ('Republic Day', date(2025, 1, 26), 'Public'),
        ('Holi', date(2025, 3, 14), 'Public'),
        ('Good Friday', date(2025, 4, 18), 'Public'),
        ('Eid ul-Fitr', date(2025, 3, 31), 'Public'),
        ('Independence Day', date(2025, 8, 15), 'Public'),
        ('Gandhi Jayanti', date(2025, 10, 2), 'Public'),
        ('Dussehra', date(2025, 10, 2), 'Public'),
        ('Diwali', date(2025, 10, 20), 'Public'),
        ('Christmas', date(2025, 12, 25), 'Public'),
    ],
    2026: [
        ('New Year', date(2026, 1, 1), 'Public'),
        ('Republic Day', date(2026, 1, 26), 'Public'),
        ('Holi', date(2026, 3, 3), 'Public'),
        ('Good Friday', date(2026, 4, 3), 'Public'),
        ('Eid ul-Fitr', date(2026, 3, 21), 'Public'),
        ('Independence Day', date(2026, 8, 15), 'Public'),
        ('Gandhi Jayanti', date(2026, 10, 2), 'Public'),
        ('Dussehra', date(2026, 10, 9), 'Public'),
        ('Diwali', date(2026, 11, 8), 'Public'),
        ('Christmas', date(2026, 12, 25), 'Public'),
    ],
}

def get_active_employees() -> List[Dict]:
    """Get all active employees"""
    query = """
        SELECT employee_id, company_id, branch_id, department_id, reports_to
        FROM emp_employee 
        WHERE status_id = 1
        ORDER BY RAND()
    """
    return db.execute_query_all(query)

def get_branches() -> List[Dict]:
    """Get all branches"""
    query = """
        SELECT branch_id, company_id, branch_name
        FROM branches
        WHERE status_id = 1
    """
    return db.execute_query_all(query)

def get_leave_types() -> List[Dict]:
    """Get all active leave types"""
    query = """
        SELECT leave_type_id, leave_type_name
        FROM att_leave_type
        WHERE status_id = 1
    """
    return db.execute_query_all(query)

def get_shifts() -> List[Dict]:
    """Get all active shifts"""
    query = """
        SELECT shift_id, shift_name, start_time, end_time, break_duration
        FROM att_shifts
        WHERE status_id = 1
    """
    return db.execute_query_all(query)

def get_managers() -> List[int]:
    """Get manager employee IDs"""
    query = """
        SELECT DISTINCT employee_id 
        FROM emp_employee 
        WHERE status_id = 1
        AND employee_id IN (SELECT DISTINCT reports_to FROM emp_employee WHERE reports_to IS NOT NULL)
        LIMIT 10
    """
    result = db.execute_query_all(query)
    return [r['employee_id'] for r in result] if result else []

def get_devices() -> List[str]:
    """Get device IDs"""
    query = """
        SELECT device_id 
        FROM att_devices
        WHERE status_id = 1
        LIMIT 5
    """
    result = db.execute_query_all(query)
    return [r['device_id'] for r in result] if result else []

def create_default_shifts() -> List[Dict]:
    """Create default shifts if none exist"""
    shifts = get_shifts()
    if shifts:
        return shifts
    
    print("Creating default shifts...")
    default_shifts = [
        ('General Shift', '09:00:00', '18:00:00', 60, 15),
        ('Morning Shift', '08:00:00', '17:00:00', 60, 15),
        ('Evening Shift', '14:00:00', '23:00:00', 60, 15),
    ]
    
    created_shifts = []
    for shift_name, start_time, end_time, break_duration, grace_time in default_shifts:
        try:
            query = """
                INSERT INTO att_shifts (shift_name, start_time, end_time, break_duration, grace_time_minutes, status_id)
                VALUES (%s, %s, %s, %s, %s, 1)
            """
            shift_id = db.execute_insert(query, (shift_name, start_time, end_time, break_duration, grace_time))
            created_shifts.append({
                'shift_id': shift_id,
                'shift_name': shift_name,
                'start_time': start_time,
                'end_time': end_time,
                'break_duration': break_duration
            })
        except Exception as e:
            print(f"Error creating shift {shift_name}: {e}")
    
    return created_shifts if created_shifts else get_shifts()

def create_default_leave_types() -> List[Dict]:
    """Create default leave types if none exist"""
    leave_types = get_leave_types()
    if leave_types:
        return leave_types
    
    print("Creating default leave types...")
    default_leave_types = [
        ('Sick Leave', 'Medical leave for illness'),
        ('Casual Leave', 'Casual leave for personal reasons'),
        ('Earned Leave', 'Earned/Annual leave'),
        ('Compensatory Leave', 'Compensatory off leave'),
    ]
    
    created_types = []
    for leave_name, description in default_leave_types:
        try:
            query = """
                INSERT INTO att_leave_type (leave_type_name, description, status_id)
                VALUES (%s, %s, 1)
            """
            leave_type_id = db.execute_insert(query, (leave_name, description))
            created_types.append({
                'leave_type_id': leave_type_id,
                'leave_type_name': leave_name
            })
        except Exception as e:
            print(f"Error creating leave type {leave_name}: {e}")
    
    return created_types if created_types else get_leave_types()

def create_default_devices() -> List[str]:
    """Create default devices if none exist"""
    devices = get_devices()
    if devices:
        return devices
    
    print("Creating default attendance devices...")
    default_devices = [
        ('DEV001', '192.168.1.101', 'SN001', 'Main Entrance Device', 'Main Entrance'),
        ('DEV002', '192.168.1.102', 'SN002', 'Back Entrance Device', 'Back Entrance'),
        ('DEV003', '192.168.1.103', 'SN003', 'Parking Area Device', 'Parking Area'),
    ]
    
    created_devices = []
    for device_id, device_ip, serial, name, location in default_devices:
        try:
            query = """
                INSERT INTO att_devices (device_id, device_ip, device_serial_number, device_name, location, status_id)
                VALUES (%s, %s, %s, %s, %s, 1)
                ON DUPLICATE KEY UPDATE device_id=device_id
            """
            db.execute_insert(query, (device_id, device_ip, serial, name, location))
            created_devices.append(device_id)
        except Exception as e:
            print(f"Error creating device {device_id}: {e}")
    
    return created_devices if created_devices else get_devices()

def assign_shifts_to_employees(employees: List[Dict], shifts: List[Dict], start_date: date):
    """Assign shifts to employees"""
    print(f"\n📅 Assigning shifts to employees (effective from {start_date})...")
    
    assigned_count = 0
    for emp in employees:
        # Check if employee already has an active shift assignment
        check_query = """
            SELECT assignment_id 
            FROM att_emp_shift_assignments 
            WHERE employee_id = %s 
            AND (effective_to IS NULL OR effective_to >= %s)
        """
        existing = db.execute_query_one(check_query, (emp['employee_id'], start_date))
        
        if existing:
            continue  # Skip if already assigned
        
        # Randomly assign a shift (70% get first shift, 20% second, 10% third)
        rand = random.random()
        if rand < 0.7:
            shift = shifts[0] if shifts else None
        elif rand < 0.9:
            shift = shifts[1] if len(shifts) > 1 else shifts[0] if shifts else None
        else:
            shift = shifts[2] if len(shifts) > 2 else shifts[0] if shifts else None
        
        if not shift:
            continue
        
        try:
            query = """
                INSERT INTO att_emp_shift_assignments 
                (employee_id, shift_id, effective_from, effective_to)
                VALUES (%s, %s, %s, NULL)
            """
            db.execute_insert(query, (emp['employee_id'], shift['shift_id'], start_date))
            assigned_count += 1
        except Exception as e:
            print(f"Error assigning shift to employee {emp['employee_id']}: {e}")
    
    print(f"✅ Assigned shifts to {assigned_count} employees")

def get_employee_shift(employee_id: int, check_date: date) -> Optional[Dict]:
    """Get the shift assigned to an employee for a specific date"""
    query = """
        SELECT s.shift_id, s.shift_name, s.start_time, s.end_time, s.break_duration
        FROM att_emp_shift_assignments esa
        JOIN att_shifts s ON s.shift_id = esa.shift_id
        WHERE esa.employee_id = %s
        AND esa.effective_from <= %s
        AND (esa.effective_to IS NULL OR esa.effective_to >= %s)
        ORDER BY esa.effective_from DESC
        LIMIT 1
    """
    return db.execute_query_one(query, (employee_id, check_date, check_date))

def generate_biometric_logs(employee_id: int, attendance_date: date, shift: Dict, device_id: str):
    """Generate biometric logs for an employee"""
    # Random number of punches (2-4)
    num_punches = random.randint(2, 4)
    
    # Parse shift times
    if isinstance(shift['start_time'], str):
        start_parts = shift['start_time'].split(':')
        shift_start_hour = int(start_parts[0])
        shift_start_minute = int(start_parts[1])
    else:
        shift_start_hour = shift['start_time'].hour
        shift_start_minute = shift['start_time'].minute
    
    if isinstance(shift['end_time'], str):
        end_parts = shift['end_time'].split(':')
        shift_end_hour = int(end_parts[0])
        shift_end_minute = int(end_parts[1])
    else:
        shift_end_hour = shift['end_time'].hour
        shift_end_minute = shift['end_time'].minute
    
    # First IN punch - slightly before or at shift start (with grace time)
    first_in_hour = shift_start_hour
    first_in_minute = max(0, shift_start_minute - random.randint(0, 15))
    first_in = datetime.combine(attendance_date, time(first_in_hour, first_in_minute))
    
    # Last OUT punch - at or after shift end
    last_out_hour = shift_end_hour
    last_out_minute = min(59, shift_end_minute + random.randint(0, 30))
    last_out = datetime.combine(attendance_date, time(last_out_hour, last_out_minute))
    
    punch_times = [('IN', first_in)]
    
    # Generate intermediate punches if num_punches > 2
    if num_punches > 2:
        # Add lunch break OUT
        lunch_out = first_in + timedelta(hours=4, minutes=random.randint(0, 30))
        punch_times.append(('OUT', lunch_out))
        
        # Add lunch break IN
        lunch_in = lunch_out + timedelta(hours=1)
        punch_times.append(('IN', lunch_in))
    
    # Add final OUT punch
    punch_times.append(('OUT', last_out))
    
    # Insert biometric logs
    for punch_type, punch_time in punch_times:
        query = """
            INSERT INTO att_biometric_logs (employee_id, device_id, punch_time, punch_type)
            VALUES (%s, %s, %s, %s)
        """
        try:
            db.execute_insert(query, (employee_id, device_id, punch_time, punch_type))
        except Exception as e:
            pass  # Skip errors silently

def generate_daily_attendance(employee_id: int, attendance_date: date, attendance_status: str, shift: Optional[Dict] = None):
    """Generate daily attendance record"""
    # Skip if record already exists
    check_query = """
        SELECT attendance_id FROM att_daily_attendance 
        WHERE employee_id = %s AND date = %s
    """
    existing = db.execute_query_one(check_query, (employee_id, attendance_date))
    if existing:
        return
    
    if attendance_status == 'Present':
        if not shift:
            # Default times if no shift
            start_hour = 9
            start_minute = random.randint(0, 30)
            end_hour = 18
            end_minute = random.randint(0, 59)
        else:
            # Parse shift times
            if isinstance(shift['start_time'], str):
                start_parts = shift['start_time'].split(':')
                start_hour = int(start_parts[0])
                start_minute = int(start_parts[1])
            else:
                start_hour = shift['start_time'].hour
                start_minute = shift['start_time'].minute
            
            if isinstance(shift['end_time'], str):
                end_parts = shift['end_time'].split(':')
                end_hour = int(end_parts[0])
                end_minute = int(end_parts[1])
            else:
                end_hour = shift['end_time'].hour
                end_minute = shift['end_time'].minute
            
            # Add some variation
            start_minute = max(0, start_minute - random.randint(0, 15))
            end_minute = min(59, end_minute + random.randint(0, 30))
        
        first_in_time = datetime.combine(attendance_date, time(start_hour, start_minute))
        last_out_time = datetime.combine(attendance_date, time(end_hour, end_minute))
        
        # Calculate working hours
        work_duration = last_out_time - first_in_time
        total_hours = work_duration.total_seconds() / 3600
        
        # Subtract break duration if available
        if shift and shift.get('break_duration'):
            break_hours = shift['break_duration'] / 60
            total_hours = max(0, total_hours - break_hours)
        else:
            total_hours = max(0, total_hours - 1)  # Default 1 hour break
        
        hours = int(total_hours)
        minutes = int((total_hours % 1) * 60)
        total_working_hours = time(hours, minutes)
        total_punches = random.randint(2, 4)
        
        query = """
            INSERT INTO att_daily_attendance 
            (employee_id, date, first_in_time, last_out_time, total_working_hours, total_punches, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        db.execute_insert(query, (
            employee_id, attendance_date, first_in_time, last_out_time, 
            total_working_hours, total_punches, attendance_status
        ))
    else:
        query = """
            INSERT INTO att_daily_attendance 
            (employee_id, date, status)
            VALUES (%s, %s, %s)
        """
        db.execute_insert(query, (employee_id, attendance_date, attendance_status))

def generate_attendance_for_date(employees: List[Dict], shifts: List[Dict], devices: List[str], attendance_date: date):
    """Generate attendance data for a specific date"""
    print(f"\n📊 Generating attendance data for {attendance_date}...")
    
    # Skip weekends (Saturday=5, Sunday=6)
    day_of_week = attendance_date.weekday()
    is_weekend = day_of_week >= 5
    
    # Check if it's a holiday
    holiday_check = """
        SELECT holiday_id FROM att_holiday_calendar 
        WHERE holiday_date = %s AND status_id = 1
    """
    is_holiday = db.execute_query_one(holiday_check, (attendance_date,)) is not None
    
    present_count = 0
    absent_count = 0
    leave_count = 0
    holiday_count = 0
    weekend_count = 0
    
    for emp in employees:
        if is_holiday:
            status = 'Holiday'
            holiday_count += 1
        elif is_weekend:
            status = 'Week Off'
            weekend_count += 1
        else:
            # Random attendance status (75% Present, 10% Absent, 10% Leave, 5% other)
            rand = random.random()
            if rand < 0.75:
                status = 'Present'
                present_count += 1
            elif rand < 0.85:
                status = 'Absent'
                absent_count += 1
            elif rand < 0.95:
                status = 'Leave'
                leave_count += 1
            else:
                status = random.choice(['Holiday', 'Week Off'])
                if status == 'Holiday':
                    holiday_count += 1
        
        try:
            # Get employee's shift for this date
            shift = get_employee_shift(emp['employee_id'], attendance_date)
            
            # Generate daily attendance
            generate_daily_attendance(emp['employee_id'], attendance_date, status, shift)
            
            # Generate biometric logs for present employees
            if status == 'Present':
                device_id = random.choice(devices) if devices else None
                if device_id and shift:
                    generate_biometric_logs(emp['employee_id'], attendance_date, shift, device_id)
        except Exception as e:
            pass  # Skip errors silently
    
    print(f"✅ Generated attendance for {attendance_date}")
    print(f"   - Present: {present_count}, Absent: {absent_count}, Leave: {leave_count}")
    if holiday_count > 0:
        print(f"   - Holidays: {holiday_count}")
    if weekend_count > 0:
        print(f"   - Week Off: {weekend_count}")

def generate_leave_requests(employees: List[Dict], leave_types: List[Dict], managers: List[int], today: date):
    """Generate some leave requests for today (new requests)"""
    print(f"\n🏖️  Generating leave requests...")
    
    if not leave_types:
        print("⚠️  No leave types found, skipping leave requests")
        return
    
    # Generate 2-5 new leave requests per day
    num_requests = random.randint(2, 5)
    selected_employees = random.sample(employees, min(num_requests, len(employees)))
    
    generated_count = 0
    
    for emp in selected_employees:
        leave_type = random.choice(leave_types)
        
        # Get manager - use reports_to if available, otherwise pick a random manager or employee
        manager = emp.get('reports_to')
        if not manager and managers:
            manager = random.choice(managers)
        elif not manager and employees:
            other_employees = [e for e in employees if e['employee_id'] != emp['employee_id']]
            if other_employees:
                manager = random.choice(other_employees)['employee_id']
            else:
                manager = emp['employee_id']  # Fallback to self
        
        # Future dates for leave (1-30 days from today)
        start_date = today + timedelta(days=random.randint(1, 30))
        end_date = start_date + timedelta(days=random.randint(1, 5))
        request_date = today - timedelta(days=random.randint(0, 7))  # Requested recently
        
        # Most new requests are Pending (80%), some Approved (15%), few Rejected (5%)
        status_rand = random.random()
        if status_rand < 0.8:
            status = 'Pending'
            approved_by = None
            approved_date = None
        elif status_rand < 0.95:
            status = 'Approved'
            approved_by = manager
            approved_date = today - timedelta(days=random.randint(0, 2))
        else:
            status = 'Rejected'
            approved_by = manager
            approved_date = today - timedelta(days=random.randint(0, 2))
        
        query = """
            INSERT INTO att_leaves_request 
            (employee_id, leave_type_id, requested_to, start_date, end_date, request_date, 
             status, comments, approved_by, approved_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        comments = f"Leave request for {leave_type['leave_type_name']}"
        try:
            db.execute_insert(query, (
                emp['employee_id'], leave_type['leave_type_id'], manager,
                start_date, end_date, request_date, status, comments,
                approved_by, approved_date
            ))
            generated_count += 1
        except Exception as e:
            pass  # Skip duplicates
    
    print(f"✅ Generated {generated_count} leave requests")

def generate_regularization_requests(employees: List[Dict], today: date):
    """Generate some regularization requests for past dates (within last 30 days)"""
    print(f"\n📝 Generating regularization requests...")
    
    generated_count = 0
    skipped_count = 0
    error_count = 0
    regularization_types = ['forgot to checkin', 'forgot to checkout', 'Work From Home']
    
    # Generate 1-3 regularization requests per day
    num_requests = random.randint(1, 3)
    selected_employees = random.sample(employees, min(num_requests, len(employees)))
    
    # Generate list of valid weekdays within last 30 days (excluding holidays)
    valid_dates = []
    for days_ago in range(1, 31):
        check_date = today - timedelta(days=days_ago)
        # Only include weekdays
        if check_date.weekday() < 5:  # Monday=0 to Friday=4
            # Check if it's not a holiday
            holiday_check = """
                SELECT holiday_id FROM att_holiday_calendar 
                WHERE holiday_date = %s AND status_id = 1
            """
            if not db.execute_query_one(holiday_check, (check_date,)):
                valid_dates.append(check_date)
    
    if not valid_dates:
        print("  ⚠️  No valid weekdays found in the last 30 days (all are holidays/weekends)")
        return
    
    for emp in selected_employees:
        # Try up to 10 different dates from valid dates list
        attempts = 0
        max_attempts = min(10, len(valid_dates))
        inserted = False
        
        while attempts < max_attempts and not inserted:
            attempts += 1
            
            # Pick a random date from valid dates
            reg_date = random.choice(valid_dates)
            
            # Check if request already exists for this employee and date
            check_query = """
                SELECT request_id FROM att_regularization_requests 
                WHERE employee_id = %s AND date = %s
            """
            if db.execute_query_one(check_query, (emp['employee_id'], reg_date)):
                skipped_count += 1
                continue  # Skip if already exists
            
            # Random regularization type
            reg_type = random.choice(regularization_types)
            
            # Generate old and corrected times based on regularization type
            if reg_type == 'forgot to checkin':
                old_check_in = None
                old_check_out = time(random.randint(18, 19), random.randint(0, 59))
                corrected_check_in = time(random.randint(8, 9), random.randint(0, 59))
                corrected_check_out = old_check_out
            elif reg_type == 'forgot to checkout':
                old_check_in = time(random.randint(9, 10), random.randint(0, 59))
                old_check_out = None
                corrected_check_in = old_check_in
                corrected_check_out = time(random.randint(17, 19), random.randint(0, 59))
            else:  # Work From Home
                old_check_in = None
                old_check_out = None
                corrected_check_in = time(random.randint(9, 10), random.randint(0, 59))
                corrected_check_out = time(random.randint(18, 19), random.randint(0, 59))
            
            # Random status (60% Pending, 30% Approved, 10% Rejected)
            status_rand = random.random()
            if status_rand < 0.6:
                status = 'Pending'
                approved_by = None
            elif status_rand < 0.9:
                status = 'Approved'
                manager = emp.get('reports_to')
                approved_by = manager if manager else None
            else:
                status = 'Rejected'
                manager = emp.get('reports_to')
                approved_by = manager if manager else None
            
            reason = f"Regularization request for {reg_date.strftime('%Y-%m-%d')} - {reg_type}"
            
            query = """
                INSERT INTO att_regularization_requests 
                (employee_id, date, old_check_in, old_check_out, 
                 corrected_check_in, corrected_check_out, regularization_type, reason, status, approved_by)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            try:
                db.execute_insert(query, (
                    emp['employee_id'],
                    reg_date, old_check_in, old_check_out,
                    corrected_check_in, corrected_check_out,
                    reg_type, reason, status, approved_by
                ))
                generated_count += 1
                inserted = True
            except Exception as e:
                error_count += 1
                print(f"  ⚠️  Error inserting regularization for employee {emp['employee_id']}: {e}")
                # Continue to try another date
    
    print(f"✅ Generated {generated_count} regularization requests")
    if skipped_count > 0:
        print(f"   ⏭️  Skipped {skipped_count} existing requests")
    if error_count > 0:
        print(f"   ❌ {error_count} errors encountered")

def generate_holidays(branches: List[Dict], start_year: int, end_year: int):
    """Generate holidays for 2025 and 2026 (one-time setup, checks for existing)"""
    print(f"\n🎉 Setting up holidays for {start_year}-{end_year}...")
    
    generated_count = 0
    skipped_count = 0
    
    for year in range(start_year, end_year + 1):
        holidays = INDIA_HOLIDAYS.get(year, [])
        
        for holiday_name, holiday_date, holiday_type in holidays:
            # Check if holiday already exists
            check_query = """
                SELECT holiday_id FROM att_holiday_calendar 
                WHERE holiday_date = %s AND holiday_name = %s
            """
            existing = db.execute_query_one(check_query, (holiday_date, holiday_name))
            
            if existing:
                skipped_count += 1
                continue
            
            # Insert as global holiday (branch_id = NULL)
            query = """
                INSERT INTO att_holiday_calendar 
                (holiday_name, holiday_date, holiday_type, branch_id, description, status_id)
                VALUES (%s, %s, %s, %s, %s, 1)
            """
            description = f"{holiday_name} - {holiday_type} holiday"
            try:
                db.execute_insert(query, (holiday_name, holiday_date, holiday_type, None, description))
                generated_count += 1
            except Exception as e:
                pass  # Skip duplicates
    
    if generated_count > 0:
        print(f"✅ Generated {generated_count} new holiday entries")
    if skipped_count > 0:
        print(f"⏭️  Skipped {skipped_count} existing holidays")

def main():
    """Main function to generate dummy attendance data"""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Generate attendance test data')
    parser.add_argument('--date', type=str, help='Date to generate data for (YYYY-MM-DD). Defaults to today')
    parser.add_argument('--setup-only', action='store_true', help='Only setup shifts and holidays (one-time)')
    args = parser.parse_args()
    
    # Determine target date
    if args.date:
        try:
            target_date = datetime.strptime(args.date, '%Y-%m-%d').date()
        except ValueError:
            print(f"❌ Invalid date format: {args.date}. Use YYYY-MM-DD")
            return
    else:
        target_date = date.today()
    
    print("=" * 60)
    print("🚀 Starting Attendance Test Data Generation")
    print("=" * 60)
    
    # Get reference data
    employees = get_active_employees()
    if not employees:
        print("❌ No active employees found!")
        return
    
    print(f"\n👥 Found {len(employees)} active employees")
    
    # Create defaults if needed
    shifts = create_default_shifts()
    print(f"🕐 Found {len(shifts)} shifts")
    
    leave_types = create_default_leave_types()
    print(f"📋 Found {len(leave_types)} leave types")
    
    devices = create_default_devices()
    print(f"📱 Found {len(devices)} devices")
    
    branches = get_branches()
    print(f"🏢 Found {len(branches)} branches")
    
    managers = get_managers()
    print(f"👔 Found {len(managers)} managers")
    
    # Step 1: Assign shifts to employees (one-time setup, effective from Jan 1, 2025)
    shift_start_date = date(2025, 1, 1)
    assign_shifts_to_employees(employees, shifts, shift_start_date)
    
    # Step 2: Generate holidays for 2025 and 2026 (one-time setup)
    generate_holidays(branches, 2025, 2026)
    
    # If setup-only mode, exit here
    if args.setup_only:
        print("\n" + "=" * 60)
        print("✅ Setup complete! Shifts and holidays configured.")
        print("=" * 60)
        return
    
    # Step 3: Generate attendance data for target date
    generate_attendance_for_date(employees, shifts, devices, target_date)
    
    # Step 4: Generate leave requests (for today)
    generate_leave_requests(employees, leave_types, managers, target_date)
    
    # Step 5: Generate regularization requests (for today)
    generate_regularization_requests(employees, target_date)
    
    print("\n" + "=" * 60)
    print(f"✅ Successfully generated attendance data for {target_date}!")
    print("=" * 60)
    print(f"\n💡 Tip: Run this script daily to add fresh data for each day.")
    print(f"   Usage: python generate_attendance_test_data.py")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

