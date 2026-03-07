"""
Pytest configuration and shared fixtures.
"""
import pytest


# Configure pytest-asyncio mode
def pytest_configure(config):
    """Register custom markers."""
    config.addinivalue_line("markers", "asyncio: mark test as async")
