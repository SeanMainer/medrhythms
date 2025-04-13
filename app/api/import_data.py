from flask import Blueprint, request, jsonify
from app import db
from app.models import Kit, Distributor, ComponentUsage
from app.models import Phone, SimCard, RightSensor, LeftSensor, Headphone, Box
import json
from datetime import datetime
from . import api_bp


def parse_datetime(dt_str):
    return datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S") if dt_str else None


@api_bp.route('/import', methods=['POST'])
def import_data():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    data = json.load(file)

    try:
        # Distributors
        for d in data.get('distributors', []):
            distributor = Distributor(
                id=d['id'],
                name=d['name'],
                email=d['email'],
                tel=d['tel'],
                address=d['address'],
                city=d['city'],
                contact_person=d['contact_person'],
                status=d['status'],
                created_at=parse_datetime(d['created_at']),
            )
            db.session.merge(distributor)

        # Kits
        for k in data.get('kits', []):
            kit = Kit(
                id=k['id'],
                created_at=parse_datetime(k['created_at']),
                updated_at=parse_datetime(k['updated_at']),
                status=k['status'],
                distributor_id=k['distributor_id'],
                distributor_name=k['distributor_name'],
                dispense_date=parse_datetime(k['dispense_date']),
            )
            db.session.merge(kit)

        # Component Usages
        for cu in data.get('component_usages', []):
            usage = ComponentUsage(
                id=cu['id'],
                component_id=cu['component_id'],
                component_type=cu['component_type'],
                kit_id=cu['kit_id'],
                distributor_id=cu['distributor_id'],
                start_time=parse_datetime(cu['start_time']),
                end_time=parse_datetime(cu['end_time']),
            )
            db.session.merge(usage)

        # Phones
        for p in data.get('phones', []):
            phone = Phone(
                id=p['id'],
                created_at=parse_datetime(p['created_at']),
                batch_number=p['batch_number'],
                model_number=p['model_number'],
                status=p['status'],
                discarded_at=parse_datetime(p['discarded_at']),
                kit_id=p['kit_id'],
            )
            db.session.merge(phone)

        # SIM Cards
        for s in data.get('sim_cards', []):
            sim = SimCard(
                id=s['id'],
                created_at=parse_datetime(s['created_at']),
                batch_number=s['batch_number'],
                model_number=s['model_number'],
                status=s['status'],
                discarded_at=parse_datetime(s['discarded_at']),
                kit_id=s['kit_id'],
            )
            db.session.merge(sim)

        # Right Sensors
        for rs in data.get('right_sensors', []):
            right_sensor = RightSensor(
                id=rs['id'],
                created_at=parse_datetime(rs['created_at']),
                batch_number=rs['batch_number'],
                model_number=rs['model_number'],
                status=rs['status'],
                discarded_at=parse_datetime(rs['discarded_at']),
                kit_id=rs['kit_id'],
            )
            db.session.merge(right_sensor)

        # Left Sensors
        for ls in data.get('left_sensors', []):
            left_sensor = LeftSensor(
                id=ls['id'],
                created_at=parse_datetime(ls['created_at']),
                batch_number=ls['batch_number'],
                model_number=ls['model_number'],
                status=ls['status'],
                discarded_at=parse_datetime(ls['discarded_at']),
                kit_id=ls['kit_id'],
            )
            db.session.merge(left_sensor)

        # Headphones
        for h in data.get('headphones', []):
            headphone = Headphone(
                id=h['id'],
                created_at=parse_datetime(h['created_at']),
                batch_number=h['batch_number'],
                model_number=h['model_number'],
                status=h['status'],
                discarded_at=parse_datetime(h['discarded_at']),
                kit_id=h['kit_id'],
            )
            db.session.merge(headphone)

        # Boxes
        for b in data.get('boxes', []):
            box = Box(
                id=b['id'],
                created_at=parse_datetime(b['created_at']),
                batch_number=b['batch_number'],
                model_number=b['model_number'],
                status=b['status'],
                discarded_at=parse_datetime(b['discarded_at']),
                kit_id=b['kit_id'],
            )
            db.session.merge(box)

        db.session.commit()
        return jsonify({'message': 'Data imported successfully'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500