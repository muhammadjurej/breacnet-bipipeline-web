from flask import Flask, request, jsonify, send_from_directory
import requests, os


app = Flask(__name__, static_folder="static")

SEG_URL = os.getenv("SEG_URL")
CLS_URL = os.getenv("CLS_URL")
API_KEY = os.getenv("API_KEY")

@app.route("/")
def index():
    return send_from_directory("static", "index.html")

@app.route("/segment", methods=["POST"])
def segment():
    payload = request.get_json(silent=True) or {}
    try:
        res = requests.post(
            SEG_URL,
            headers={"Content-Type": "application/json", "X-API-Key": API_KEY},
            json=payload, timeout=60
        )
        return (res.text, res.status_code, res.headers.items())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/classify", methods=["POST"])
def classify():
    payload = request.get_json(silent=True) or {}
    try:
        res = requests.post(
            CLS_URL,
            headers={"Content-Type": "application/json", "X-API-Key": API_KEY},
            json=payload, timeout=60
        )
        return (res.text, res.status_code, res.headers.items())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health check
@app.route("/healthz")
def health():
    return jsonify({"ok": True})

# Jalankan
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
