from models.base import Base
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO

db = SQLAlchemy(model_class=Base)
socket = SocketIO()