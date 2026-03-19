from services.gemini_service import generate_embedding

emb = generate_embedding("Ingeniero de software con experiencia en Python")

print(len(emb))
print(type(emb))