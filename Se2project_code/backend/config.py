import os
from mongoengine import connect
import gridfs

class Config:
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://reddyaakash0702:JUTOEc16xfmEgk7f@cluster0.h8hzh.mongodb.net/syllabusdb?retryWrites=true&w=majority&ssl=true&tls=true&tls=true&tlsAllowInvalidCertificates=true")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "syllabusdb")

try:
    # Establish a connection to MongoDB Atlas with explicit TLS options
    client = connect(Config.DATABASE_NAME, host=Config.MONGODB_URI)
    print("Successfully connected to MongoDB Atlas.")
    db = client[Config.DATABASE_NAME]
    fs = gridfs.GridFS(db)
    CONNECTION_SUCCESS = True
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    db, fs = None, None
    CONNECTION_SUCCESS = False
