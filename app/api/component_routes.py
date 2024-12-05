from flask import request, jsonify
from datetime import datetime
from . import api_bp
from ..models import (
    Kit, BaseComponent, Phone, SimCard, RightSensor, LeftSensor,
    Headphone, db
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
            'headphone': Headphone
        }

        component_model = model_mapping.get(component_type.lower())
        if not component_model:
            return jsonify({"error": f"Invalid component type: {component_type}"}), 400

        components_data = data.get('ids', [])
        if not components_data:
            return jsonify({"error": "No ids provided in the request"}), 400

        created_components = []
        for component_data in components_data:
            component_id = component_data.get('id')
            if component_id:
                new_component = component_model(
                    id=component_id,
                    batch_number='0',  # the batch number need to be adjusted
                    status='available'
                )
                db.session.add(new_component)
                created_components.append(new_component)

        db.session.commit()

        return jsonify({
            "message": f"Successfully created {len(created_components)} {component_type}(s).",
            "data": [{"id": comp.id, "status": comp.status} for comp in created_components]
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

