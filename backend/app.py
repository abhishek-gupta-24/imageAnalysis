from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from gradcam import generate_heatmap

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
STATIC_FOLDER = "static"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(STATIC_FOLDER, exist_ok=True)

@app.route("/upload", methods=["POST"])
def upload():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    image_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(image_path)

    label = generate_heatmap(image_path)
    return jsonify({"label": label})

@app.route("/heatmap.jpg")
def serve_heatmap():
    return send_from_directory(STATIC_FOLDER, "heatmap.jpg")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Use 5000 locally, $PORT on Render
    app.run(host="0.0.0.0", port=port)
