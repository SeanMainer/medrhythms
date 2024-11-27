from flask import jsonify, request
from datetime import datetime
import time
import random
from . import api_bp
from ..models import (
    Kit, BaseComponent, Phone, SimCard, RightSensor, LeftSensor,
    Headphone, db
)

def create_components_by_batch(model_class, batch_number, count):
    """
    general components generator
    
    Args:
        model_class: component name
        batch_number
        count: numbers of components
    """
    created_items = []
    try:
        for _ in range(count):
            component = model_class(
                batch_number=batch_number,
                status='available',
                created_at=datetime.utcnow()
            )
            db.session.add(component)
            created_items.append(component)
        
        db.session.commit()
        return created_items
    except Exception as e:
        db.session.rollback()
        raise e


def create_component(model_class, batch_number):
    """
    single component generator

    Args:
        model_class
        batch_number
    """
    try:
        # the unique id creation
        component_id = ''.join(random.choices('0123456789', k=5))


        # component creating
        component = model_class(
            id=component_id,
            batch_number=batch_number,
            status='available',
            created_at=datetime.utcnow(),
            discarded_at=None,
            kit_id=None
        )

        db.session.add(component)
        db.session.commit()

        return component
    except Exception as e:
        db.session.rollback()
        raise e


@api_bp.route('/phones/create', methods=['POST'])
def create_phone():
    """creating a phone"""
    try:
        data = request.get_json()
        batch_number = data.get('batch_number')

        if not batch_number:
            return jsonify({
                'message': 'Missing required parameter',
                'details': 'batch_number is required'
            }), 400

        created_phone = create_component(Phone, batch_number)

        return jsonify({
            'message': 'Phone created successfully',
            'created_item': {
                'phone_ID': created_phone.id,
                'created_at': created_phone.created_at,
                'status': created_phone.status,
                'discarded_at': created_phone.discarded_at
            }
        }), 201
    except Exception as e:
        return jsonify({
            'message': 'Error creating phone',
            'details': str(e)
        }), 400


@api_bp.route('/SIM_cards/create', methods=['POST'])
def create_sim_card():
    """creating a sim card"""
    try:
        data = request.get_json()
        batch_number = data.get('batch_number')

        if not batch_number:
            return jsonify({
                'message': 'Missing required parameter',
                'details': 'batch_number is required'
            }), 400

        created_sim_card = create_component(SimCard, batch_number)

        return jsonify({
            'message': 'SIM card created successfully',
            'created_item': {
                'SIM_card_ID': created_sim_card.id,
                'created_at': created_sim_card.created_at,
                'status': created_sim_card.status,
                'discarded_at': created_sim_card.discarded_at
            }
        }), 201
    except Exception as e:
        return jsonify({
            'message': 'Error creating SIM card',
            'details': str(e)
        }), 400


@api_bp.route('/right_sensors/create', methods=['POST'])
def create_right_sensor():
    """creating a right sensor"""
    try:
        data = request.get_json()
        batch_number = data.get('batch_number')

        if not batch_number:
            return jsonify({
                'message': 'Missing required parameter',
                'details': 'batch_number is required'
            }), 400

        created_sensor = create_component(RightSensor, batch_number)

        return jsonify({
            'message': 'Right sensor created successfully',
            'created_item': {
                'right_sensor_ID': created_sensor.id,
                'created_at': created_sensor.created_at,
                'status': created_sensor.status,
                'discarded_at': created_sensor.discarded_at
            }
        }), 201
    except Exception as e:
        return jsonify({
            'message': 'Error creating right sensor',
            'details': str(e)
        }), 400


@api_bp.route('/left_sensors/create', methods=['POST'])
def create_left_sensor():
    """creating a right sensor"""
    try:
        data = request.get_json()
        batch_number = data.get('batch_number')

        if not batch_number:
            return jsonify({
                'message': 'Missing required parameter',
                'details': 'batch_number is required'
            }), 400

        created_sensor = create_component(LeftSensor, batch_number)

        return jsonify({
            'message': 'Left sensor created successfully',
            'created_item': {
                'left_sensor_ID': created_sensor.id,
                'created_at': created_sensor.created_at,
                'status': created_sensor.status,
                'discarded_at': created_sensor.discarded_at
            }
        }), 201
    except Exception as e:
        return jsonify({
            'message': 'Error creating left sensor',
            'details': str(e)
        }), 400


@api_bp.route('/headphones/create', methods=['POST'])
def create_headphone():
    """create a headphone"""
    try:
        data = request.get_json()
        batch_number = data.get('batch_number')

        if not batch_number:
            return jsonify({
                'message': 'Missing required parameter',
                'details': 'batch_number is required'
            }), 400

        created_headphone = create_component(Headphone, batch_number)

        return jsonify({
            'message': 'Headphone created successfully',
            'created_item': {
                'headphone_ID': created_headphone.id,
                'created_at': created_headphone.created_at,
                'status': created_headphone.status,
                'discarded_at': created_headphone.discarded_at
            }
        }), 201
    except Exception as e:
        return jsonify({
            'message': 'Error creating headphone',
            'details': str(e)
        }), 400


@api_bp.route('/components/status_update/<component_id>', methods=['PUT'])
def update_component_status(component_id):
    try:
        new_status = request.json.get('status')
        if not new_status:
            return jsonify({
                'message': 'Missing status in request body'
            }), 400

        component, component_type, error = BaseComponent.change_state(component_id, new_status)

        if error:
            return jsonify({
                'message': 'Error updating component status',
                'details': error
            }), 400

        return jsonify({
            'message': 'Status updated successfully',
            'component': {
                'id': component.id,
                'type': component_type,
                'status': component.status,
                'updated_at': datetime.utcnow(),
                'discarded_at': component.discarded_at
            }
        }), 200

    except Exception as e:
        return jsonify({
            'message': 'Error updating status',
            'details': str(e)
        }), 500


    # @api_bp.route('/phones/createByBatch', methods=['POST'])
# def create_phones_by_batch():
#     """Create phones in a batch"""
#     try:
#         data = request.get_json()
#         batch_number = data.get('batch_number')
#         count = data.get('count')
#
#         if not batch_number or not count:
#             return jsonify({
#                 'message': 'Missing required parameters',
#                 'details': 'batch_number and count are required'
#             }), 400
#
#         created_phones = create_components_by_batch(Phone, batch_number, count)
#
#         return jsonify({
#             'message': 'Phones created successfully',
#             'created_items': [{
#                 'phone_ID': phone.id,
#                 'created_at': phone.created_at,
#                 'status': phone.status,
#                 'discarded_at': phone.discarded_at
#             } for phone in created_phones]
#         }), 201
#     except Exception as e:
#         return jsonify({
#             'message': 'Error creating phones',
#             'details': str(e)
#         }), 400
#
# @api_bp.route('/SIM_cards/createByBatch', methods=['POST'])
# def create_sim_cards_by_batch():
#     """Create simcards in a batch"""
#     try:
#         data = request.get_json()
#         batch_number = data.get('batch_number')
#         count = data.get('count')
#
#         if not batch_number or not count:
#             return jsonify({
#                 'message': 'Missing required parameters',
#                 'details': 'batch_number and count are required'
#             }), 400
#
#         created_sim_cards = create_components_by_batch(SimCard, batch_number, count)
#
#         return jsonify({
#             'message': 'SIM cards created successfully',
#             'created_items': [{
#                 'SIM_card_ID': sim.id,
#                 'created_at': sim.created_at,
#                 'status': sim.status,
#                 'discarded_at': sim.discarded_at
#             } for sim in created_sim_cards]
#         }), 201
#     except Exception as e:
#         return jsonify({
#             'message': 'Error creating SIM cards',
#             'details': str(e)
#         }), 400
#
# @api_bp.route('/right_sensors/createByBatch', methods=['POST'])
# def create_right_sensors_by_batch():
#     """Create right-sensors in a batch"""
#     try:
#         data = request.get_json()
#         batch_number = data.get('batch_number')
#         count = data.get('count')
#
#         if not batch_number or not count:
#             return jsonify({
#                 'message': 'Missing required parameters',
#                 'details': 'batch_number and count are required'
#             }), 400
#
#         created_sensors = create_components_by_batch(RightSensor, batch_number, count)
#
#         return jsonify({
#             'message': 'Right sensors created successfully',
#             'created_items': [{
#                 'right_sensor_ID': sensor.id,
#                 'created_at': sensor.created_at,
#                 'status': sensor.status,
#                 'discarded_at': sensor.discarded_at
#             } for sensor in created_sensors]
#         }), 201
#     except Exception as e:
#         return jsonify({
#             'message': 'Error creating right sensors',
#             'details': str(e)
#         }), 400
#
# @api_bp.route('/left_sensors/createByBatch', methods=['POST'])
# def create_left_sensors_by_batch():
#     """Create left sensors in a batch"""
#     try:
#         data = request.get_json()
#         batch_number = data.get('batch_number')
#         count = data.get('count')
#
#         if not batch_number or not count:
#             return jsonify({
#                 'message': 'Missing required parameters',
#                 'details': 'batch_number and count are required'
#             }), 400
#
#         created_sensors = create_components_by_batch(LeftSensor, batch_number, count)
#
#         return jsonify({
#             'message': 'Left sensors created successfully',
#             'created_items': [{
#                 'left_sensor_ID': sensor.id,
#                 'created_at': sensor.created_at,
#                 'status': sensor.status,
#                 'discarded_at': sensor.discarded_at
#             } for sensor in created_sensors]
#         }), 201
#     except Exception as e:
#         return jsonify({
#             'message': 'Error creating left sensors',
#             'details': str(e)
#         }), 400
#
# @api_bp.route('/headphones/createByBatch', methods=['POST'])
# def create_headphones_by_batch():
#     """Create headphones in a batch"""
#     try:
#         data = request.get_json()
#         batch_number = data.get('batch_number')
#         count = data.get('count')
#
#         if not batch_number or not count:
#             return jsonify({
#                 'message': 'Missing required parameters',
#                 'details': 'batch_number and count are required'
#             }), 400
#
#         created_headphones = create_components_by_batch(Headphone, batch_number, count)
#
#         return jsonify({
#             'message': 'Headphones created successfully',
#             'created_items': [{
#                 'headphone_ID': headphone.id,
#                 'created_at': headphone.created_at,
#                 'status': headphone.status,
#                 'discarded_at': headphone.discarded_at
#             } for headphone in created_headphones]
#         }), 201
#     except Exception as e:
#         return jsonify({
#             'message': 'Error creating headphones',
#             'details': str(e)
#         }), 400