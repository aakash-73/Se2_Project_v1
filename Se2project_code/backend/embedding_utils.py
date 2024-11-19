from sentence_transformers import SentenceTransformer

# Initialize embedding model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

def generate_embeddings(text):
    return embedding_model.encode(text, convert_to_numpy=True).tolist()
