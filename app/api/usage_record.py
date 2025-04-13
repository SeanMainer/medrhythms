from flask import jsonify, request
from datetime import datetime
from datetime import datetime, timedelta
from sqlalchemy import extract, func, or_
from . import api_bp
from ..models import (
    Kit, Phone, SimCard, RightSensor, LeftSensor,
    Headphone, db, ComponentUsage, Distributor, Box
)

@api_bp.route('/usage', methods=['GET'])
def get_all_usages():
    """Get all component usage records"""
    usages = ComponentUsage.query.all()
    return jsonify([
        {
            'id': usage.id,
            'component_id': usage.component_id,
            'component_type': usage.component_type,
            'kit_id': usage.kit_id,
            'distributor_id': usage.distributor_id,
            'start_time': usage.start_time,
            'end_time': usage.end_time
        } for usage in usages
    ]), 200

@api_bp.route('/usage/component/<string:component_id>', methods=['GET'])
def get_usage_by_component(component_id):
    """Get usage records by component ID"""
    usages = ComponentUsage.query.filter_by(component_id=component_id).all()
    if not usages:
        return jsonify({'message': f'No usage records found for component {component_id}'}), 404
    return jsonify([
        {
            'id': usage.id,
            'component_id': usage.component_id,
            'component_type': usage.component_type,
            'kit_id': usage.kit_id,
            'distributor_id': usage.distributor_id,
            'start_time': usage.start_time,
            'end_time': usage.end_time
        } for usage in usages
    ]), 200

@api_bp.route('/discard-rate', methods=['GET'])
def get_discard_rate():
    try:
        # Get time range parameters, for example ?months=6"
        months = int(request.args.get('months', 6))
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30 * months)

        component_models = [
            ('phone', Phone),
            ('sim_card', SimCard),
            ('right_sensor', RightSensor),
            ('left_sensor', LeftSensor),
            ('headphone', Headphone),
            ('box', Box),
        ]

        # result set
        monthly_stats = {}

        for i in range(months):
            month_start = (end_date.replace(day=1) - timedelta(days=30 * i)).replace(day=1)
            month_end = (month_start + timedelta(days=32)).replace(day=1)
            key = month_start.strftime("%Y-%m")

            # Collection quantity: component_usage.end_time within the time period
            collected_count = db.session.query(func.count(ComponentUsage.id)).filter(
                ComponentUsage.end_time != None,
                ComponentUsage.end_time >= month_start,
                ComponentUsage.end_time < month_end
            ).scalar()

            total_scrapped = 0
            for _, model in component_models:
                scrapped_count = db.session.query(func.count(model.id)).filter(
                    model.status == 'scrapped',
                    model.discarded_at >= month_start,
                    model.discarded_at < month_end
                ).scalar()
                total_scrapped += scrapped_count

            rate = round((total_scrapped / collected_count) * 100, 2) if collected_count else 0.0
            monthly_stats[key] = {
                "collected": collected_count,
                "scrapped": total_scrapped,
                "rate": rate
            }

        # Sort results by time
        sorted_stats = [
            {"month": key, **monthly_stats[key]}
            for key in sorted(monthly_stats.keys())
        ]

        return jsonify({"data": sorted_stats})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

