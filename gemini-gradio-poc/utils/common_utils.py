"""
Common utilities and imports to reduce code duplication across the system.
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple, Union
from google import genai
from google.genai import types

# Common typing aliases for better readability
JsonDict = Dict[str, Any]
JsonList = List[JsonDict]
ConfigDict = Dict[str, Any]

# Common error classes
class SystemError(Exception):
    """Base system error class"""
    pass

class ValidationError(SystemError):
    """Data validation error"""
    pass

class ProcessingError(SystemError):
    """Processing operation error"""
    pass