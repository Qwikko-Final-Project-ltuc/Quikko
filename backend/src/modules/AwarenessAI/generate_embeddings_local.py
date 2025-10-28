import os
import json
from sentence_transformers import SentenceTransformer
import psycopg2
from psycopg2.extras import Json
from time import sleep
from dotenv import load_dotenv



load_dotenv()  

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")


if not all([DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME]):
    raise ValueError(f"Missing DB env vars! Current values: "
                     f"DB_USER={DB_USER}, DB_PASSWORD={DB_PASSWORD}, "
                     f"DB_HOST={DB_HOST}, DB_PORT={DB_PORT}, DB_NAME={DB_NAME}")


DB_PORT = int(DB_PORT)

DB_DSN = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"



BATCH_SIZE = 32 
WAIT_SEC = 1.0   

model = SentenceTransformer('all-MiniLM-L6-v2')


def chunk(lst, n):
    """تقسيم قائمة إلى دفعات"""
    for i in range(0, len(lst), n):
        yield lst[i:i+n]



def main():
    conn = psycopg2.connect(DB_DSN)
    cur = conn.cursor()

    cur.execute("""
        SELECT p.id, p.name, p.description, c.name AS category
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.is_deleted = false
    """)
    rows = cur.fetchall()

    products = [
        {
            "id": r[0],
            "text": f"{r[1]} - {r[2] or ''} - Category: {r[3]}"
        }
        for r in rows
    ]

    print(f"Found {len(products)} products.")

    for batch in chunk(products, BATCH_SIZE):
        texts = [p["text"] for p in batch]
        embeddings = model.encode(texts, show_progress_bar=False)

        for product, emb in zip(batch, embeddings):
            cur.execute(
                "UPDATE products SET vector_embedding = %s WHERE id = %s",
                (Json(emb.tolist()), product["id"])
            )

        conn.commit()
        print(f" Processed batch of {len(batch)} products")
        sleep(WAIT_SEC)

    cur.close()
    conn.close()
    print(" Embeddings generated and saved successfully!")



if __name__ == "__main__":
    main()
