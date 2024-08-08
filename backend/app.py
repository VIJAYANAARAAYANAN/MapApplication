from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/dashboard/api": {"origins": "*"}})

db_config = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'database': os.getenv('DB_NAME')
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except mysql.connector.Error as err:
        print(f"Error connecting to database: {err}")
        return None

def validate_url(url):
    if not url:
        return False
    return url.startswith("http") and (url.endswith(".jpg") or url.endswith(".jpeg") or url.endswith(".png") or url.endswith(".gif"))

@app.route('/dashboard/api', methods=['GET'])
def get_sellers():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        
        query = """
        SELECT 
            seller_id,
            seller_name,
            GROUP_CONCAT(DISTINCT category_name SEPARATOR ', ') AS category_name,
            COUNT(*) AS product_count,
            MAX(seller_lat_long) AS seller_lat_long,
            MAX(seller_pincode) AS seller_pincode,
            MAX(seller_city) AS seller_city,
            GROUP_CONCAT(DISTINCT product_image_link ORDER BY product_id SEPARATOR '|') AS product_images,
            MAX(seller_url) AS seller_url
        FROM cartesian_catalog_data_flat
        GROUP BY seller_id, seller_name
        """
        cursor.execute(query)
        sellers = cursor.fetchall()
        cursor.close()
        connection.close()

        for seller in sellers:
            urls = seller['product_images'].split('|')
            valid_urls = [url for url in urls if validate_url(url)]
            seller['product_images'] = valid_urls[:20]
            seller['seller_url'] = f"https://www.khojle.com{seller['seller_url']}"

        return jsonify(sellers)
    except mysql.connector.Error as err:
        print(f"Error executing query: {err}")
        return jsonify({"error": str(err)}), 500

if __name__ == '__main__':
    app.run(debug=True)
