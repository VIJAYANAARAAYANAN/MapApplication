from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
import redis
import os
from dotenv import load_dotenv
import json
import hashlib

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/dashboard/api": {"origins": "*"}})

# Redis client setup
redis_client = redis.StrictRedis(
    host=os.getenv('REDIS_HOST'),
    port=os.getenv('REDIS_PORT', 6379),
    password=os.getenv('REDIS_PASSWORD'),
    decode_responses=True
)

# MySQL database configuration
db_config = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'database': os.getenv('DB_NAME')
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        print("Database connection successful")
        return connection
    except mysql.connector.Error as err:
        print(f"Error connecting to database: {err}")
        return None

def validate_url(url):
    if not url:
        return False
    return url.startswith("http") and (url.endswith(".jpg") or url.endswith(".jpeg") or url.endswith(".png") or url.endswith(".gif"))

def generate_cache_key(query):
    """ Generate a unique cache key based on the query """
    return hashlib.md5(query.encode()).hexdigest()

@app.route('/dashboard/api', methods=['GET'])
def get_sellers():
    cache_key = generate_cache_key("""
        SELECT 
    seller_id,
    seller_name,
    GROUP_CONCAT(DISTINCT category_name SEPARATOR ', ') AS seller_categories,
    COUNT(*) AS product_count,
    MAX(seller_lat_long) AS seller_lat_long,
    MAX(seller_pincode) AS seller_pincode,
    MAX(seller_city) AS seller_city,
    GROUP_CONCAT(product_image_link SEPARATOR '|') AS product_images,
    GROUP_CONCAT(product_name SEPARATOR '|') AS product_names,
    GROUP_CONCAT(product_mrp SEPARATOR '|') AS product_mrps,
    GROUP_CONCAT(product_sale_price SEPARATOR '|') AS product_sale_prices,
    GROUP_CONCAT(category_name SEPARATOR '|') AS product_categories, -- Fetch product category names
    MAX(seller_url) AS seller_url
FROM (
    SELECT 
        seller_id,
        seller_name,
        category_name,
        seller_lat_long,
        seller_pincode,
        seller_city,
        product_image_link,
        product_name,
        product_mrp,
        product_sale_price,
        seller_url,
        ROW_NUMBER() OVER (PARTITION BY seller_id ORDER BY product_id) AS row_num
    FROM cartesian_catalog_data_flat
) AS subquery
WHERE row_num <= 7
GROUP BY seller_id, seller_name;


    """)

    # Check if data is in cache
    try:
        cached_data = redis_client.get(cache_key)
        if cached_data:
            print("Data fetched from Redis cache")
            return jsonify(json.loads(cached_data))
        else:
            print("No cached data found, querying database")
    except redis.exceptions.ConnectionError as e:
        print(f"Redis connection error: {e}")
        return jsonify({"error": "Redis connection failed"}), 500

    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        query = """
        SELECT 
    seller_id,
    seller_name,
    GROUP_CONCAT(DISTINCT category_name SEPARATOR ', ') AS seller_categories,
    COUNT(*) AS product_count,
    MAX(seller_lat_long) AS seller_lat_long,
    MAX(seller_pincode) AS seller_pincode,
    MAX(seller_city) AS seller_city,
    GROUP_CONCAT(product_image_link SEPARATOR '|') AS product_images,
    GROUP_CONCAT(product_name SEPARATOR '|') AS product_names,
    GROUP_CONCAT(product_mrp SEPARATOR '|') AS product_mrps,
    GROUP_CONCAT(product_sale_price SEPARATOR '|') AS product_sale_prices,
    GROUP_CONCAT(category_name SEPARATOR '|') AS product_categories, -- Fetch product category names
    MAX(seller_url) AS seller_url
FROM (
    SELECT 
        seller_id,
        seller_name,
        category_name,
        seller_lat_long,
        seller_pincode,
        seller_city,
        product_image_link,
        product_name,
        product_mrp,
        product_sale_price,
        seller_url,
        ROW_NUMBER() OVER (PARTITION BY seller_id ORDER BY product_id) AS row_num
    FROM cartesian_catalog_data_flat
) AS subquery
WHERE row_num <= 7
GROUP BY seller_id, seller_name;


        """
        cursor.execute(query)
        sellers = cursor.fetchall()
        print("Data fetched from MySQL database")
        cursor.close()
        connection.close()

        for seller in sellers:
            urls = seller['product_images'].split('|')
            valid_urls = [url for url in urls if validate_url(url)]
            seller['product_images'] = valid_urls[:20]

            # Split and limit product_names, product_mrps, product_sale_prices
            seller['product_names'] = seller['product_names'].split('|')[:20]
            seller['product_mrps'] = seller['product_mrps'].split('|')[:20]
            seller['product_sale_prices'] = seller['product_sale_prices'].split('|')[:20]
            
            seller['seller_url'] = f"https://www.khojle.com{seller['seller_url']}"

        # Cache the data in Redis for 1 hour
        try:
            redis_client.setex(cache_key, 3600, json.dumps(sellers))
            print("Data cached in Redis")
        except redis.exceptions.ConnectionError as e:
            print(f"Failed to cache data in Redis: {e}")

        return jsonify(sellers)
    except mysql.connector.Error as err:
        print(f"Error executing query: {err}")
        return jsonify({"error": str(err)}), 500

if __name__ == '__main__':
    # Test Redis connection at startup
    try:
        redis_client.ping()
        print("Connected to Redis")
    except redis.exceptions.ConnectionError as e:
        print(f"Redis connection error: {e}")
    
    app.run(debug=True)
