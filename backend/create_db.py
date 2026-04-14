import pymysql

try:
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='4117keno'
    )
    cursor = connection.cursor()
    cursor.execute("CREATE DATABASE IF NOT EXISTS followflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    print("Database followflow created or already exists.")
    connection.close()
except Exception as e:
    print(f"Error creating database: {e}")
