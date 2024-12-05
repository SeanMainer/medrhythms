from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import logging
from logging.handlers import RotatingFileHandler
from flask_cors import CORS
import pymysql
from dotenv import load_dotenv
import os


pymysql.install_as_MySQLdb()

# database initialization
db = SQLAlchemy()

load_dotenv()


def create_app():
    """
    Factory function for creating a Flask instance
    """
    app = Flask(__name__)

    CORS(app)

    # database connection
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # database initialization
    db.init_app(app)
    with app.app_context():
        # check if the database contains tables, if not, create them
        app.logger.info("Database tables created successfully.")
        db.create_all()

    # blueprint registration
    from .api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    # log implementation
    if not os.path.exists('logs'):
        os.mkdir('logs')
    file_handler = RotatingFileHandler('logs/inventory.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('Inventory Management System startup')

    return app
