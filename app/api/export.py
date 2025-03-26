from flask import Blueprint, jsonify, send_file, request
from io import BytesIO, StringIO
import json
import csv
import zipfile
from ..models import Kit, Distributor, ComponentUsage, Phone, SimCard, RightSensor, LeftSensor, Headphone, Box
from . import api_bp


def serialize_model(model):
    return {col.name: getattr(model, col.name) for col in model.__table__.columns}

def export_json():
    data = {
        'kits': [serialize_model(kit) for kit in Kit.query.all()],
        'distributors': [serialize_model(d) for d in Distributor.query.all()],
        'component_usages': [serialize_model(cu) for cu in ComponentUsage.query.all()],
        'phones': [serialize_model(p) for p in Phone.query.all()],
        'sim_cards': [serialize_model(p) for p in SimCard.query.all()],
        'right_sensors': [serialize_model(p) for p in RightSensor.query.all()],
        'left_sensors': [serialize_model(p) for p in LeftSensor.query.all()],
        'headphones': [serialize_model(p) for p in Headphone.query.all()],
        'boxes': [serialize_model(p) for p in Box.query.all()]
    }

    json_data = json.dumps(data, indent=2, default=str)
    buffer = BytesIO()
    buffer.write(json_data.encode('utf-8'))
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name='database_export.json', mimetype='application/json')

def export_csv():
    data_sources = {
        'kits': Kit.query.all(),
        'distributors': Distributor.query.all(),
        'component_usages': ComponentUsage.query.all(),
        'phones': Phone.query.all(),
        'sim_cards': SimCard.query.all(),
        'right_sensors': RightSensor.query.all(),
        'left_sensors': LeftSensor.query.all(),
        'headphones': Headphone.query.all(),
        'boxes': Box.query.all()
    }

    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for name, records in data_sources.items():
            if not records:
                continue

            output = StringIO()
            writer = csv.DictWriter(output, fieldnames=serialize_model(records[0]).keys())
            writer.writeheader()
            for record in records:
                writer.writerow(serialize_model(record))

            zip_file.writestr(f'{name}.csv', output.getvalue())

    zip_buffer.seek(0)
    return send_file(zip_buffer, as_attachment=True, download_name='database_export.zip', mimetype='application/zip')
@api_bp.route('/exportdb', methods=['GET'])
def export_all():
    format = request.args.get('format', 'json').lower()

    try:
        if format == 'json':
            return export_json()
        elif format == 'csv':
            return export_csv()
        else:
            return jsonify({'error': 'Invalid format. Supported formats: json, csv'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

