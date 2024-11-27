from flask import jsonify, request
from datetime import datetime
from . import api_bp
from ..models import Kit

@api_bp.route('/kits/getAll', methods=['GET'])
def get_all_kits():
    """get all kits"""
    try:
        kits = Kit.query.all()
        return jsonify([{
            'id': kit.id,
            'created_at': kit.created_at,
            'status': kit.status,
            'batch_number': kit.batch_number,
            'distributor': kit.distributor,
            'dispense_date': kit.dispense_date
        } for kit in kits]), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching kits', 'details': str(e)}), 500

@api_bp.route('/kits/<string:kit_id>', methods=['GET'])
def get_kit_by_id(kit_id):
    """get kit by id"""
    try:
        kit = Kit.query.get_or_404(kit_id)
        return jsonify({
            'id': kit.id,
            'created_at': kit.created_at,
            'status': kit.status,
            'batch_number': kit.batch_number,
            'distributor': kit.distributor,
            'dispense_date': kit.dispense_date,
            'components': {
                'phone': kit.phone.id if kit.phone else None,
                'sim_card': kit.sim_card.id if kit.sim_card else None,
                'right_sensor': kit.right_sensor.id if kit.right_sensor else None,
                'left_sensor': kit.left_sensor.id if kit.left_sensor else None,
                'headphone': kit.headphone.id if kit.headphone else None
            }
        }), 200
    except Exception as e:
        return jsonify({'message': 'Kit not found', 'details': str(e)}), 404

@api_bp.route('/kits/sortByCreatedAtDesc', methods=['GET'])
def get_kits_by_created_at_desc():
    """get all kits in descending order by its creating timestamp"""
    try:
        kits = Kit.query.order_by(Kit.created_at.desc()).all()
        return jsonify([{
            'id': kit.id,
            'created_at': kit.created_at,
            'status': kit.status,
            'batch_number': kit.batch_number
        } for kit in kits]), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching kits', 'details': str(e)}), 500

@api_bp.route('/kits/filterByCreatedAtRange', methods=['GET'])
def get_kits_by_date_range():
    """get kits by its creation date range"""
    try:
        start_date = datetime.strptime(request.args.get('startDate'), '%Y-%m-%d')
        end_date = datetime.strptime(request.args.get('endDate'), '%Y-%m-%d')
        
        kits = Kit.query.filter(
            Kit.created_at.between(start_date, end_date)
        ).all()
        
        return jsonify([{
            'id': kit.id,
            'created_at': kit.created_at,
            'status': kit.status,
            'batch_number': kit.batch_number
        } for kit in kits]), 200
    except ValueError:
        return jsonify({'message': 'Invalid date format'}), 400
    except Exception as e:
        return jsonify({'message': 'Error fetching kits', 'details': str(e)}), 500

# @api_bp.route('/kits/filterByBatchNumber', methods=['GET'])
# def get_kits_by_batch_number():
#     """get kits by batch number"""
#     try:
#         batch_number = request.args.get('batchNumber')
#         kits = Kit.query.filter_by(batch_number=batch_number).all()
#
#         if not kits:
#             return jsonify({'message': 'No kits found with this batch number'}), 404
#
#         return jsonify([{
#             'id': kit.id,
#             'created_at': kit.created_at,
#             'status': kit.status,
#             'batch_number': kit.batch_number
#         } for kit in kits]), 200
#     except Exception as e:
#         return jsonify({'message': 'Error fetching kits', 'details': str(e)}), 500

@api_bp.route('/kits/filterByStatus', methods=['GET'])
def get_kits_by_status():
    """get kits by its status"""
    valid_statuses = ['Available', 'Unavailable', 'Bound', 'Scrapped', 'Furbishing', 'Other']
    try:
        status = request.args.get('status')
        if status not in valid_statuses:
            return jsonify({'message': 'Invalid status'}), 400
            
        kits = Kit.query.filter_by(status=status).all()
        return jsonify([{
            'id': kit.id,
            'created_at': kit.created_at,
            'status': kit.status,
            'batch_number': kit.batch_number
        } for kit in kits]), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching kits', 'details': str(e)}), 500

@api_bp.route('/kits/filterByDistributor', methods=['GET'])
def get_kits_by_distributor():
    """根据分销商查询kit"""
    try:
        distributor = request.args.get('distributor')
        kits = Kit.query.filter_by(distributor=distributor).all()
        
        if not kits:
            return jsonify({'message': 'No kits found for this distributor'}), 404
            
        return jsonify([{
            'id': kit.id,
            'created_at': kit.created_at,
            'status': kit.status,
            'distributor': kit.distributor
        } for kit in kits]), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching kits', 'details': str(e)}), 500
