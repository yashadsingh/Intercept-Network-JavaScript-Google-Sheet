import os
import json
from glob import glob

# Folder with script and JSON files
FOLDER_PATH = os.getcwd()
OUTPUT_SQL = os.path.join(FOLDER_PATH, "insert_leads.sql")
TABLE_NAME = "LeadsTable"

# Find all JSON files
json_files = glob(os.path.join(FOLDER_PATH, "*.json"))

# Helper: prepare SQL-safe value
def to_sql_value(val):
    if val is None or str(val).strip() == "":
        return "NULL"
    escaped_val = str(val).replace("'", "''")  # Escape single quotes for SQL
    return f"'{escaped_val}'"

with open(OUTPUT_SQL, "w", encoding="utf-8") as sql_file:
    sql_file.write(f"-- SQL INSERTS for table: {TABLE_NAME}\n\n")

    for file_path in json_files:
        base_file_name = os.path.splitext(os.path.basename(file_path))[0]  # e.g. "New (1)"
        file_name_sql = to_sql_value(base_file_name)

        with open(file_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError as e:
                print(f"⚠️ Skipping {file_path} due to error: {e}")
                continue

        if not isinstance(data, list):
            print(f"⚠️ Skipping {file_path}: JSON root is not a list.")
            continue

        for lead in data:
            name = to_sql_value(lead.get("prospectName"))
            mobile = to_sql_value(lead.get("mobileNumber"))
            email = to_sql_value(lead.get("email"))
            comments = to_sql_value(
                ", ".join(
                    [m.get("comments", "") for m in lead.get("milestones", []) if m.get("comments")]
                )
            )

            sql = f"INSERT INTO {TABLE_NAME} (ProspectName, MobileNumber, Email, Comments, FileName)\n"
            sql += f"VALUES ({name}, {mobile}, {email}, {comments}, {file_name_sql});\n\n"
            sql_file.write(sql)

print(f"✅ SQL script generated: {OUTPUT_SQL}")
