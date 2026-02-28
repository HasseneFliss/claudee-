"""
test_hello.py - Comprehensive tests for the Hello World function and API.

Test suites:
  1. TestHelloWorldFunction  - Unit tests for hello_world()
  2. TestHelloWorldAPI       - Integration tests for the HTTP API endpoints
"""

import json
import threading
import unittest
import urllib.error
import urllib.parse
import urllib.request

from hello_world import hello_world
from hello_api import run_server

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

TEST_PORT = 8766
BASE_URL = f"http://127.0.0.1:{TEST_PORT}"


def http_get(path, timeout=5):
    url = BASE_URL + path
    try:
        with urllib.request.urlopen(url, timeout=timeout) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())


def http_post(path, payload=None, timeout=5):
    url = BASE_URL + path
    body = json.dumps(payload).encode("utf-8") if payload is not None else b""
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json", "Content-Length": str(len(body))},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())


# ─────────────────────────────────────────────────────────────────────────────
# Unit Tests — hello_world()
# ─────────────────────────────────────────────────────────────────────────────

class TestHelloWorldFunction(unittest.TestCase):
    """Unit tests for the hello_world() function."""

    # --- Success cases -------------------------------------------------------

    def test_no_args_returns_hello_world(self):
        """Calling with no arguments returns the default greeting."""
        result = hello_world()
        self.assertEqual(result["message"], "Hello, World!")
        self.assertEqual(result["status"], "success")

    def test_none_name_returns_hello_world(self):
        """Passing name=None explicitly returns the default greeting."""
        result = hello_world(name=None)
        self.assertEqual(result["message"], "Hello, World!")
        self.assertEqual(result["status"], "success")

    def test_named_greeting(self):
        """Passing a name returns a personalised greeting."""
        result = hello_world("Alice")
        self.assertEqual(result["message"], "Hello, Alice!")
        self.assertEqual(result["status"], "success")

    def test_name_with_leading_trailing_whitespace_is_stripped(self):
        """Name is stripped of surrounding whitespace."""
        result = hello_world("  Bob  ")
        self.assertEqual(result["message"], "Hello, Bob!")

    def test_name_with_numbers(self):
        """Name containing digits is accepted."""
        result = hello_world("R2D2")
        self.assertEqual(result["message"], "Hello, R2D2!")

    def test_name_with_special_characters(self):
        """Name containing punctuation/unicode is accepted."""
        result = hello_world("José")
        self.assertEqual(result["message"], "Hello, José!")

    def test_return_type_is_dict(self):
        """Return value is always a dict."""
        self.assertIsInstance(hello_world(), dict)
        self.assertIsInstance(hello_world("X"), dict)

    def test_return_dict_has_required_keys(self):
        """Return dict always contains 'message' and 'status' keys."""
        result = hello_world()
        self.assertIn("message", result)
        self.assertIn("status", result)

    # --- Error cases ----------------------------------------------------------

    def test_empty_string_raises_value_error(self):
        """An empty string for name raises ValueError."""
        with self.assertRaises(ValueError):
            hello_world("")

    def test_whitespace_only_string_raises_value_error(self):
        """A whitespace-only string raises ValueError."""
        with self.assertRaises(ValueError):
            hello_world("   ")

    def test_integer_name_raises_type_error(self):
        """Passing an integer raises TypeError."""
        with self.assertRaises(TypeError):
            hello_world(42)

    def test_list_name_raises_type_error(self):
        """Passing a list raises TypeError."""
        with self.assertRaises(TypeError):
            hello_world(["Alice"])

    def test_dict_name_raises_type_error(self):
        """Passing a dict raises TypeError."""
        with self.assertRaises(TypeError):
            hello_world({"name": "Alice"})

    def test_bool_name_raises_type_error(self):
        """Passing a bool raises TypeError (bool is subclass of int, not str)."""
        with self.assertRaises(TypeError):
            hello_world(True)


# ─────────────────────────────────────────────────────────────────────────────
# Integration Tests — HTTP API
# ─────────────────────────────────────────────────────────────────────────────

class TestHelloWorldAPI(unittest.TestCase):
    """Integration tests for the Hello World HTTP API."""

    @classmethod
    def setUpClass(cls):
        """Start the test server in a background daemon thread."""
        cls.server = run_server(port=TEST_PORT)
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()

    @classmethod
    def tearDownClass(cls):
        """Shut down the test server."""
        cls.server.shutdown()
        cls.server_thread.join(timeout=5)

    # --- GET /health ----------------------------------------------------------

    def test_health_check_returns_200(self):
        """GET /health returns HTTP 200."""
        status, body = http_get("/health")
        self.assertEqual(status, 200)

    def test_health_check_returns_ok_status(self):
        """GET /health body contains status=ok."""
        _, body = http_get("/health")
        self.assertEqual(body.get("status"), "ok")

    # --- GET /hello (no name) -------------------------------------------------

    def test_get_hello_no_name_returns_200(self):
        """GET /hello with no query param returns HTTP 200."""
        status, _ = http_get("/hello")
        self.assertEqual(status, 200)

    def test_get_hello_no_name_returns_hello_world(self):
        """GET /hello with no query param returns default greeting."""
        _, body = http_get("/hello")
        self.assertEqual(body["message"], "Hello, World!")
        self.assertEqual(body["status"], "success")

    # --- GET /hello?name=X ----------------------------------------------------

    def test_get_hello_with_name_returns_200(self):
        """GET /hello?name=Alice returns HTTP 200."""
        status, _ = http_get("/hello?name=Alice")
        self.assertEqual(status, 200)

    def test_get_hello_with_name_returns_personalised_greeting(self):
        """GET /hello?name=Alice returns personalised message."""
        _, body = http_get("/hello?name=Alice")
        self.assertEqual(body["message"], "Hello, Alice!")
        self.assertEqual(body["status"], "success")

    def test_get_hello_with_url_encoded_name(self):
        """GET /hello?name=John+Doe handles URL encoding."""
        _, body = http_get("/hello?name=John%20Doe")
        self.assertEqual(body["message"], "Hello, John Doe!")

    def test_get_hello_empty_name_returns_400(self):
        """GET /hello?name= (empty) returns HTTP 400."""
        status, body = http_get("/hello?name=")
        self.assertEqual(status, 400)
        self.assertEqual(body["status"], "error")
        self.assertIn("error", body)

    # --- POST /hello ----------------------------------------------------------

    def test_post_hello_no_body_returns_200(self):
        """POST /hello with empty body returns HTTP 200 with default greeting."""
        status, body = http_post("/hello", payload={})
        self.assertEqual(status, 200)
        self.assertEqual(body["message"], "Hello, World!")

    def test_post_hello_with_name_returns_200(self):
        """POST /hello with {"name": "Bob"} returns HTTP 200."""
        status, _ = http_post("/hello", payload={"name": "Bob"})
        self.assertEqual(status, 200)

    def test_post_hello_with_name_returns_personalised_greeting(self):
        """POST /hello with {"name": "Bob"} returns personalised message."""
        _, body = http_post("/hello", payload={"name": "Bob"})
        self.assertEqual(body["message"], "Hello, Bob!")
        self.assertEqual(body["status"], "success")

    def test_post_hello_empty_name_returns_400(self):
        """POST /hello with {"name": ""} returns HTTP 400."""
        status, body = http_post("/hello", payload={"name": ""})
        self.assertEqual(status, 400)
        self.assertEqual(body["status"], "error")

    def test_post_hello_non_string_name_returns_400(self):
        """POST /hello with {"name": 123} returns HTTP 400."""
        status, body = http_post("/hello", payload={"name": 123})
        self.assertEqual(status, 400)
        self.assertEqual(body["status"], "error")

    # --- 404 for unknown routes -----------------------------------------------

    def test_get_unknown_route_returns_404(self):
        """GET on an unknown path returns HTTP 404."""
        status, body = http_get("/unknown")
        self.assertEqual(status, 404)
        self.assertEqual(body["status"], "error")

    def test_post_unknown_route_returns_404(self):
        """POST on an unknown path returns HTTP 404."""
        status, body = http_post("/unknown", payload={})
        self.assertEqual(status, 404)
        self.assertEqual(body["status"], "error")

    # --- Response format validation -------------------------------------------

    def test_response_content_type_is_json(self):
        """GET /hello returns Content-Type: application/json."""
        url = BASE_URL + "/hello"
        with urllib.request.urlopen(url) as resp:
            ct = resp.headers.get("Content-Type", "")
        self.assertIn("application/json", ct)

    def test_health_response_content_type_is_json(self):
        """GET /health returns Content-Type: application/json."""
        url = BASE_URL + "/health"
        with urllib.request.urlopen(url) as resp:
            ct = resp.headers.get("Content-Type", "")
        self.assertIn("application/json", ct)


# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    unittest.main(verbosity=2)
