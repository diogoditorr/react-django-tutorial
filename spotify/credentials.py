import os
from pathlib import Path

from dotenv import dotenv_values

env_path = Path(os.path.dirname(__file__)).resolve().parent.parent / '.env'
if not env_path.exists():
    print("Could not find '.env' on root directory. Please create one.")
    exit()

__ENV = dotenv_values(dotenv_path=env_path)

CLIENT_SECRET = __ENV['CLIENT_SECRET']
CLIENT_ID = __ENV['CLIENT_ID']
REDIRECT_URI = __ENV['REDIRECT_URI']