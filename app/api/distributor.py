from flask import Blueprint, jsonify, request
from ..models import Distributor, db
from datetime import datetime
from . import api_bp

@api_bp.route('/distributors', methods=['GET'])
def get_all_distributors():
    """Get all distributors"""
    try:
        distributors = Distributor.query.all()
        return jsonify([{
            'id': distributor.id,
            'name': distributor.name,
            'email': distributor.email,
            'tel': distributor.tel,
            'address': distributor.address,
            'city': distributor.city,
            'contactPerson': distributor.contact_person,
            'status': distributor.status,
            'createdAt': distributor.created_at
        } for distributor in distributors]), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching distributors', 'details': str(e)}), 500


@api_bp.route('/distributors/<string:distributor_id>', methods=['GET'])
def get_distributor_by_id(distributor_id):
    """Get a distributor by ID"""
    try:
        distributor = Distributor.query.get_or_404(distributor_id)
        return jsonify({
            'id': distributor.id,
            'name': distributor.name,
            'email': distributor.email,
            'tel': distributor.tel,
            'address': distributor.address,
            'city': distributor.city,
            'contactPerson': distributor.contact_person,
            'status': distributor.status,
            'createdAt': distributor.created_at
        }), 200
    except Exception as e:
        return jsonify({'message': 'Distributor not found', 'details': str(e)}), 404


@api_bp.route('/distributors/create', methods=['POST'])
def create_distributor():
    """Create a new distributor"""
    try:
        data = request.get_json()
        new_distributor = Distributor(
            id=data.get('id'),
            name=data.get('name'),
            email=data.get('email'),
            tel=data.get('tel'),
            address=data.get('address'),
            city=data.get('city'),
            contact_person=data.get('contact_person'),
            status=data.get('status', 'active'),
            created_at=datetime.utcnow()
        )
        db.session.add(new_distributor)
        db.session.commit()
        return jsonify({'message': 'Distributor created successfully'}), 201
    except Exception as e:
        return jsonify({'message': 'Error creating distributor', 'details': str(e)}), 500


@api_bp.route('/distributors/<string:distributor_id>', methods=['PUT'])
def update_distributor(distributor_id):
    """Update a distributor by ID"""
    try:
        distributor = Distributor.query.get_or_404(distributor_id)
        data = request.get_json()
        distributor.name = data.get('name', distributor.name)
        distributor.email = data.get('email', distributor.email)
        distributor.tel = data.get('tel', distributor.tel)
        distributor.address = data.get('address', distributor.address)
        distributor.city = data.get('city', distributor.city)
        distributor.contact_person = data.get('contactPerson', distributor.contact_person)
        distributor.status = data.get('status', distributor.status)
        db.session.commit()
        return jsonify({'message': 'Distributor updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Error updating distributor', 'details': str(e)}), 500


@api_bp.route('/distributors/<string:distributor_id>/status', methods=['PATCH'])
def update_distributor_status(distributor_id):
    """Update distributor's status to 'inactive' or 'active'"""
    try:
        distributor = Distributor.query.get_or_404(distributor_id)

        new_status = request.json.get('status')

        if new_status not in ['active', 'inactive']:
            return jsonify({'message': 'Invalid status. Must be "active" or "inactive".'}), 400

        distributor.status = new_status
        db.session.commit()

        return jsonify({'message': f'Distributor status updated to {new_status} successfully.'}), 200

    except Exception as e:
        return jsonify({'message': 'Error updating distributor status', 'details': str(e)}), 500
