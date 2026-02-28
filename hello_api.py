"""
hello_api.py - Simple HTTP API server for the Hello World function.

Endpoints:
  GET  /hello          -> {"message": "Hello, World!", "status": "success"}
  GET  /hello?name=X   -> {"message": "Hello, X!", "status": "success"}
  POST /hello          -> body: {"name": "X"} -> {"message": "Hello, X!", "status": "success"}
  GET  /health         -> {"status": "ok"}
  *    (any other)     -> 404 {"error": "Not found", "status": "error"}
"""

import json
import urllib.parse
from http.server import BaseHTTPRequestHandler, HTTPServer

from hello_world import hello_world


class HelloHandler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        # Suppress default request logging
        pass

    def _send_json(self, status_code, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query, keep_blank_values=True)

        if path == "/health":
            self._send_json(200, {"status": "ok"})
            return

        if path == "/hello":
            name = query.get("name", [None])[0]
            try:
                result = hello_world(name)
                self._send_json(200, result)
            except ValueError as e:
                self._send_json(400, {"error": str(e), "status": "error"})
            except TypeError as e:
                self._send_json(400, {"error": str(e), "status": "error"})
            return

        self._send_json(404, {"error": "Not found", "status": "error"})

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/hello":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length) if content_length > 0 else b""
            try:
                data = json.loads(body) if body else {}
            except json.JSONDecodeError:
                self._send_json(400, {"error": "Invalid JSON body", "status": "error"})
                return

            name = data.get("name", None)
            try:
                result = hello_world(name)
                self._send_json(200, result)
            except ValueError as e:
                self._send_json(400, {"error": str(e), "status": "error"})
            except TypeError as e:
                self._send_json(400, {"error": str(e), "status": "error"})
            return

        self._send_json(404, {"error": "Not found", "status": "error"})


def run_server(port=8765):
    server = HTTPServer(("127.0.0.1", port), HelloHandler)
    return server


if __name__ == "__main__":
    server = run_server()
    print(f"Server running on http://127.0.0.1:8765")
    server.serve_forever()
