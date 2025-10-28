import os
import json
import psycopg2
from psycopg2.extras import Json
from sentence_transformers import SentenceTransformer
from time import sleep
from dotenv import load_dotenv



load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_NAME = os.getenv("DB_NAME")

BATCH_SIZE = 32
WAIT_SEC = 10 


def get_connection():
    return psycopg2.connect(
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME
    )


model = SentenceTransformer('all-MiniLM-L6-v2')


def process_queue():
    conn = get_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT pq.product_id, p.name, p.description, c.name AS category
        FROM product_embedding_queue pq
        JOIN products p ON p.id = pq.product_id
        JOIN categories c ON c.id = p.category_id
        WHERE pq.processed = false
        LIMIT %s
    """, (BATCH_SIZE,))
    
    queue_items = cur.fetchall()
    
    if not queue_items:
        cur.close()
        conn.close()
        return
    
    texts = [f"{row[1]} - {row[2] or ''} - Category: {row[3]}" for row in queue_items]
    embeddings = model.encode(texts, show_progress_bar=False)
    
    for i, row in enumerate(queue_items):
        product_id = row[0]
        emb_json = Json(embeddings[i].tolist())
        
        cur.execute("UPDATE products SET vector_embedding = %s WHERE id = %s", (emb_json, product_id))
        cur.execute("UPDATE product_embedding_queue SET processed = true WHERE product_id = %s", (product_id,))
    
    conn.commit()
    cur.close()
    conn.close()
    print(f" Processed {len(queue_items)} products")


if __name__ == "__main__":
    while True:
        process_queue()
        sleep(WAIT_SEC)
