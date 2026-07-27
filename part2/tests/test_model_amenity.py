#!/usr/bin/python3
"""
This is a module for interpreting python3
"""

from app.models.amenity import Amenity

def test_amenity_creation():
    """
    This is a test for create amenity with name and description.
    """
    amenity = Amenity(name="Wi-Fi", description="This is a description")
    assert amenity.name == "Wi-Fi"
    print("Amenity creation test passed!")

test_amenity_creation()
