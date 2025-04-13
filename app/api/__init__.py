from flask import Blueprint

api_bp = Blueprint('api', __name__)

@api_bp.route('/')
def home():
    return "Hello World"

from . import kit_routes, component_routes,kit_assembly, distributor,usage_record, export, import_data