import os
import sqlite3
from datetime import datetime
from datetime import timedelta

class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


# Connect to db
conn = sqlite3.connect("db/events.db")
c = conn.cursor()

# Get time interval
now = datetime.now()
in_hour = now + timedelta(hours=1)

# Fetch all events happening in the next hour
c.execute("SELECT name, date FROM events WHERE date BETWEEN ? AND ?;", (now, in_hour))

# Get all the events
res = c.fetchall()

# Check if any events going on
if len(res) > 0:
    print(f"{bcolors.FAIL}=== UPDATE UNSAFE ==={bcolors.ENDC}", "")

# Pull if ok
else:
    print(f"{bcolors.OKGREEN}=== Pulling ==={bcolors.ENDC}")
    os.system("git pull")

# Print what went wrong
for event in res:
    print(f"Event {bcolors.WARNING}{event[0]}{bcolors.ENDC} happening at {bcolors.WARNING}{event[1]}{bcolors.ENDC}")

# Close connection
conn.close()