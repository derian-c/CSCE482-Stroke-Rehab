from models.base import Base
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy(model_class=Base)