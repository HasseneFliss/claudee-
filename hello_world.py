"""
hello_world.py - Simple Hello World function implementation.
"""


def hello_world(name=None):
    """
    Returns a greeting message.

    Args:
        name (str, optional): Name to greet. Defaults to None.

    Returns:
        dict: A response dict with 'message' and 'status' keys.

    Raises:
        TypeError: If name is provided but is not a string.
        ValueError: If name is an empty string.
    """
    if name is not None:
        if not isinstance(name, str):
            raise TypeError("name must be a string")
        if name.strip() == "":
            raise ValueError("name cannot be empty or whitespace")
        return {
            "message": f"Hello, {name.strip()}!",
            "status": "success"
        }
    return {
        "message": "Hello, World!",
        "status": "success"
    }
