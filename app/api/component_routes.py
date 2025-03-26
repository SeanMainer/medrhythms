from flask import request, jsonify
from datetime import datetime
from . import api_bp
from ..models import (
    Kit, BaseComponent, Phone, SimCard, RightSensor, LeftSensor,
    Headphone, db, Box
)
import logging

logging.basicConfig(level=logging.DEBUG)

@api_bp.route('/<component_type>/createByBatch', methods=['POST'])
def create_by_batch(component_type):
    try:
        data = request.get_json()
        model_mapping = {
            'phone': Phone,
            'sim_card': SimCard,
            'right_sensor': RightSensor,
            'left_sensor': LeftSensor,
            'headphone': Headphone,
            'box': Box
        }

        component_model = model_mapping.get(component_type.lower())
        if not component_model:
            return jsonify({"error": f"Invalid component type: {component_type}"}), 400

        components_data = data.get('ids', [])
        batch_number = data.get('batch_number')
        if not components_data:
            return jsonify({"error": "No ids provided in the request"}), 400
        if not batch_number:
            return jsonify({"error": "Batch number is required"}), 400

        created_components = []
        for component_data in components_data:
            component_id = component_data.get('id')
            model_number = component_data.get('model_number')
            if component_id and model_number:
                new_component = component_model(
                    id=component_id,
                    batch_number=batch_number,
                    model_number=model_number,
                    status='available'
                )
                print(new_component)
                db.session.add(new_component)
                created_components.append(new_component)
                print(component_id, model_number)
            else:
                return jsonify({"error": "Each component must have an id and model_number"}), 400


        db.session.commit()

        return jsonify({
            "message": f"Successfully created {len(created_components)} {component_type}(s).",
            "data": [{"id": comp.id, "model_number": comp.model_number, "batch_number": comp.batch_number, "status": comp.status} for comp in created_components]
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500




@api_bp.route('/components/status_update/<component_id>', methods=['PUT'])
def update_component(component_id):
    '''update the status of a component'''
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
        logging.error(f'Error updating component {component_id}: {str(e)}')
        return jsonify({
            'message': 'Error updating status',
            'details': str(e)
        }), 500

@api_bp.route('/components', methods=['GET'])
def get_all_components():
    '''Get all components'''
    try:
        components = []

        components.append((Phone.query.all(), 'Phone'))
        components.append((SimCard.query.all(), 'SimCard'))
        components.append((RightSensor.query.all(), 'RightSensor'))
        components.append((LeftSensor.query.all(), 'LeftSensor'))
        components.append((Headphone.query.all(), 'Headphone'))
        components.append((Box.query.all(), 'Box'))

        return jsonify({
            'message': 'Components retrieved successfully',
            'components': [{
                'id': component.id,
                'batch_number': component.batch_number,
                'status': component.status,
                'created_at': component.created_at,
                'discarded_at': component.discarded_at,
                'kit_id': component.kit_id,
                'type': component_type
            } for component_list, component_type in components for component in component_list]
        }), 200

    except Exception as e:
        return jsonify({
            'message': 'Error retrieving components',
            'details': str(e)
        }), 500


@api_bp.route('/components/batch_query/<batch_number>', methods=['GET'])
def get_components_by_batch_number(batch_number):
    '''Get all components by batch number'''
    try:
        components = []

        phone_components = Phone.query.filter_by(batch_number=batch_number).all()
        simcard_components = SimCard.query.filter_by(batch_number=batch_number).all()
        right_sensor_components = RightSensor.query.filter_by(batch_number=batch_number).all()
        left_sensor_components = LeftSensor.query.filter_by(batch_number=batch_number).all()
        headphone_components = Headphone.query.filter_by(batch_number=batch_number).all()
        box_components = Box.query.filter_by(batch_number=batch_number).all()


        components.extend([(phone_components, 'Phone')])
        components.extend([(simcard_components, 'SimCard')])
        components.extend([(right_sensor_components, 'RightSensor')])
        components.extend([(left_sensor_components, 'LeftSensor')])
        components.extend([(headphone_components, 'Headphone')])
        components.extend([(box_components, 'Box')])

        response_data = {
            'message': f'Components with batch number {batch_number} retrieved successfully',
            'components': [{
                'id': component.id,
                'batch_number': component.batch_number,
                'status': component.status,
                'created_at': component.created_at,
                'discarded_at': component.discarded_at,
                'kit_id': component.kit_id,
                'type': component_type
            } for component_list, component_type in components for component in component_list]
        }

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({
            'message': 'Error retrieving components by batch number',
            'details': str(e)
        }), 500
