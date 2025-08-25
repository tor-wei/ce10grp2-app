from flask import Flask, request, Response
from werkzeug.utils import secure_filename
import boto3, os, logging

app = Flask(__name__)
log = logging.getLogger(__name__)

# Environment
AWS_REGION = os.environ.get("AWS_REGION", "ap-southeast-1")
BUCKET_NAME = os.environ["BUCKET_NAME"]  # must be set

s3 = boto3.client("s3", region_name=AWS_REGION)

@app.route("/", methods=["GET"])
def index():
    return (
        f"Flask S3 service is running.<br>"
        f"Bucket: {BUCKET_NAME}<br>"
        f"Try <a href='/upload'>/upload</a> or <a href='/upload2'>/upload2</a>.",
        200,
    )

def _handle_upload(form_field: str):
    if form_field not in request.files:
        return Response(f"No file field named '{form_field}' in form", status=400)
    f = request.files[form_field]
    if f.filename == "":
        return Response("No file selected", status=400)

    filename = secure_filename(f.filename)
    try:
        s3.upload_fileobj(f, BUCKET_NAME, filename)
        log.info("Uploaded %s to s3://%s/%s", filename, BUCKET_NAME, filename)
        return f"Uploaded {filename} to s3://{BUCKET_NAME}/{filename}\n", 200
    except Exception as e:
        log.exception("Upload failed")
        return Response(f"Upload failed: {e}", status=500)

@app.route("/upload", methods=["GET", "POST"])
def upload():
    if request.method == "GET":
        return '''
        <h1>Upload a File to S3 (/upload)</h1>
        <form method="POST" enctype="multipart/form-data">
          <input type="file" name="file">
          <button type="submit">Upload</button>
        </form>
        ''', 200
    return _handle_upload("file")

@app.route("/upload2", methods=["GET", "POST"])
def upload2():
    if request.method == "GET":
        return '''
        <h1>Upload a File to S3 (/upload2)</h1>
        <form method="POST" enctype="multipart/form-data">
          <input type="file" name="file">
          <button type="submit">Upload</button>
        </form>
        ''', 200
    return _handle_upload("file")

@app.route("/health", methods=["GET"])
def health():
    return "ok", 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
