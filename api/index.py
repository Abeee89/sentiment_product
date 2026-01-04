"""
Vercel Serverless Entry Point for Flask API
"""

import sys
import os

# Add parent directory to path to import app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

# Vercel expects the handler to be named 'handler'
# For Vercel Python runtime, we export the Flask app directly
handler = app

