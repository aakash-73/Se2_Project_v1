from flask import Blueprint, request, jsonify
from langchain_huggingface import HuggingFaceEmbeddings  # Updated import
from groq import Groq  # Direct import from Groq SDK
from config import db
import numpy as np
import logging

# Initialize Flask Blueprint for the chatbot controller
chatbot_controller = Blueprint('chatbot_controller', __name__)

# MongoDB Collection and Database Configuration
collection = db["pdf_embeddings"] if db is not None else None  # Explicit check for db

# Initialize Embedding Model
embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Custom MongoDB Vector Store Class
class CustomMongoDBVectorStore:
    def __init__(self, collection, embedding_function):
        self.collection = collection
        self.embedding_function = embedding_function

    def add_document(self, pdf_id, pdf_content):
        try:
            embedding = self.embedding_function.embed_documents([pdf_content])[0]
            vector_data = {
                "pdf_id": pdf_id,
                "embedding": embedding.tolist(),
                "content": pdf_content
            }
            self.collection.insert_one(vector_data)
            logging.info(f"[INFO] Document added successfully with PDF ID: {pdf_id}")
        except Exception as e:
            logging.error(f"[ERROR] Failed to add document: {e}")

    def search(self, query, top_k=5):
        try:
            query_embedding = self.embedding_function.embed_query(query)
            query_vector = np.array(query_embedding)

            results = []
            for doc in self.collection.find():
                doc_embedding = np.array(doc["embedding"])
                similarity = self._cosine_similarity(query_vector, doc_embedding)
                results.append((doc["content"], similarity))

            # Sort results by similarity score
            results.sort(key=lambda x: x[1], reverse=True)
            if not results:
                logging.warning("[WARNING] No documents found in the vector store.")
                return []

            return [content for content, _ in results[:top_k]]
        except Exception as e:
            logging.error(f"[ERROR] Vector store search failed: {e}")
            return []

    def _cosine_similarity(self, vec1, vec2):
        try:
            dot_product = np.dot(vec1, vec2)
            norm_vec1 = np.linalg.norm(vec1)
            norm_vec2 = np.linalg.norm(vec2)
            return dot_product / (norm_vec1 * norm_vec2)
        except Exception as e:
            logging.error(f"[ERROR] Cosine similarity calculation failed: {e}")
            return 0.0

# Initialize Custom MongoDB Vector Store
if collection is not None:
    vector_store = CustomMongoDBVectorStore(collection=collection, embedding_function=embedding_model)
else:
    raise Exception("MongoDB connection failed, 'pdf_embeddings' collection not found.")

# Initialize Groq AI Client
GROQ_API_KEY = "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"
groq_client = Groq(api_key=GROQ_API_KEY)

# Custom conversation memory to keep track of the chat history
class ConversationMemory:
    def __init__(self):
        self.messages = []

    def add_message(self, role, message):
        self.messages.append({"role": role, "message": message})

    def get_context(self):
        return " ".join([msg["message"] for msg in self.messages])

# Initialize memory
memory = ConversationMemory()

@chatbot_controller.route('/chat_with_pdf', methods=['POST'])
def chat_with_pdf():
    try:
        data = request.json
        user_message = data.get("message")
        pdf_content = data.get("pdfContent")
        pdf_id = data.get("pdfId")

        # Input validation
        if not user_message:
            logging.error("[ERROR] User message is missing.")
            return jsonify({"error": "User message is required."}), 400

        if not pdf_content:
            logging.error("[ERROR] PDF content is missing.")
            return jsonify({"error": "PDF content is required."}), 400

        if not pdf_id:
            logging.error("[ERROR] PDF ID is missing.")
            return jsonify({"error": "PDF ID is required."}), 400

        logging.debug(f"[DEBUG] Received message: {user_message}")
        logging.debug(f"[DEBUG] PDF ID: {pdf_id}")

        # Search for relevant documents in the vector store
        try:
            logging.debug("[DEBUG] Starting vector store search.")
            top_documents = vector_store.search(user_message)
            if not top_documents:
                return jsonify({"error": "No relevant documents found."}), 404

            context = " ".join(top_documents)
            logging.debug("[DEBUG] Retrieved context for response generation.")
        except Exception as search_error:
            logging.error(f"[ERROR] Vector store search failed: {search_error}")
            return jsonify({"error": "Failed to retrieve relevant documents."}), 500

        memory.add_message("user", user_message)

        # Generate response using Groq AI SDK
        try:
            logging.debug("[DEBUG] Generating response using Groq AI SDK.")
            response = groq_client.generate({"input": user_message, "context": context})
            bot_response = response.get("output", "I'm not sure about that. Could you rephrase?")
            logging.debug(f"[DEBUG] Bot response: {bot_response}")
        except Exception as generation_error:
            logging.error(f"[ERROR] Groq AI response generation failed: {generation_error}")
            return jsonify({"error": "Failed to generate a response from the chatbot."}), 500

        memory.add_message("bot", bot_response)

        return jsonify({"response": bot_response})

    except Exception as e:
        logging.error(f"[ERROR] Unexpected exception in /chat_with_pdf: {str(e)}", exc_info=True)
        return jsonify({"error": "An internal server error occurred."}), 500

@chatbot_controller.route('/add_pdf_embeddings', methods=['POST'])
def add_pdf_embeddings():
    try:
        data = request.json
        pdf_content = data.get("pdfContent")
        pdf_id = data.get("pdfId")

        if not pdf_content or not pdf_id:
            logging.error("[ERROR] Invalid input data for embedding.")
            return jsonify({"error": "Invalid input. Please provide PDF content and PDF ID."}), 400

        vector_store.add_document(pdf_id, pdf_content)
        logging.info(f"[INFO] PDF content embeddings added successfully for PDF ID: {pdf_id}")
        return jsonify({"message": "PDF content embeddings added successfully."})

    except Exception as e:
        logging.error(f"[ERROR] Exception in /add_pdf_embeddings: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to add PDF embeddings."}), 500
