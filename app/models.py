from datetime import datetime
from . import db
from sqlalchemy.orm import validates

class Kit(db.Model):

    __tablename__ = 'kit'

    id = db.Column(db.String(20), primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    status = db.Column(db.String(50), default='Available')  # Available, Unavailable, In-use, Used
    distributor_id = db.Column(db.String(20), db.ForeignKey('distributor.id'), nullable=True)
    distributor_name = db.Column(db.String(255), nullable=True)
    dispense_date = db.Column(db.DateTime)

    # The relationship between components and kits
    phone = db.relationship('Phone', backref='kit', uselist=False)
    sim_card = db.relationship('SimCard', backref='kit', uselist=False)
    right_sensor = db.relationship('RightSensor', backref='kit', uselist=False)
    left_sensor = db.relationship('LeftSensor', backref='kit', uselist=False)
    headphone = db.relationship('Headphone', backref='kit', uselist=False)
    box = db.relationship('Box', backref='kit', uselist=False)

    @validates('distributor_id')
    def validate_distributor_id(self, key, value):
        """When distributor_id is set, automatically update distributor_name."""
        distributor = Distributor.query.get(value)
        if distributor:
            self.distributor_name = distributor.name
        else:
            self.distributor_name = None
        return value

class Distributor(db.Model):
    __tablename__ = 'distributor'

    id = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    tel = db.Column(db.String(50), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    contact_person = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(10), nullable=False, default='active')  # active, inactive
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    kits = db.relationship('Kit', backref='distributor', lazy=True)

class ComponentUsage(db.Model):
    __tablename__ = 'component_usage'

    id = db.Column(db.Integer, primary_key=True)
    component_id = db.Column(db.String(20), nullable=False)
    component_type = db.Column(db.String(50), nullable=False)
    kit_id = db.Column(db.String(20), db.ForeignKey('kit.id'), nullable=True)
    distributor_id = db.Column(db.String(20), db.ForeignKey('distributor.id'), nullable=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=True)

    __table_args__ = (
        db.Index(
            'idx_component_usage_composite_key',
            'component_id',
            'component_type',
            'kit_id',
            db.desc('start_time')
        ),
    )

    # kit = db.relationship('Kit', backref='component_usages')
    # distributor = db.relationship('Distributor', backref='component_usages')



class BaseComponent(db.Model):
    """base class for all components"""
    __abstract__ = True

    id = db.Column(db.String(20), primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    batch_number = db.Column(db.String(255))
    model_number = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), default='available')  # available, in-kit, refurbishing, scrapped
    discarded_at = db.Column(db.DateTime)
    kit_id = db.Column(db.String(20), db.ForeignKey('kit.id'))

    @staticmethod
    def change_state(component_id, status):
        """
        Args:
            component_id:
            status: ('available', 'in-kit', 'refurbishing', 'scrapped')

        Returns:
            tuple: (component_id, status)
        """
        try:

            models = [Phone, SimCard, RightSensor, LeftSensor, Headphone, Box]
            component = None
            component_type = None

            for model in models:
                component = model.query.get(component_id)
                if component:
                    component_type = model.__name__.lower()
                    break

            if not component:
                return None, None, f"Component with id {component_id} not found"

            if component.status == 'in-kit' and status == 'scrapped':
                return None, None, "Cannot scrap a component currently 'in-kit'"

            if component.status == 'in-kit' and status == 'available':
                return None, None, "Cannot change a component from 'in-kit' back to 'available'"

            valid_statuses = ['available', 'in-kit', 'refurbishing', 'scrapped']
            if status not in valid_statuses:
                return None, None, f"Invalid status. Must be one of: {', '.join(valid_statuses)}"

            component.status = status
            if status == 'scrapped':
                component.discarded_at = datetime.utcnow()

            db.session.commit()
            return component, component_type, None

        except Exception as e:
            db.session.rollback()
            return None, None, str(e)


class Phone(BaseComponent):
    __tablename__ = 'phone'

class SimCard(BaseComponent):
    __tablename__ = 'sim_card'

class RightSensor(BaseComponent):
    __tablename__ = 'right_sensor'

class LeftSensor(BaseComponent):
    __tablename__ = 'left_sensor'

class Headphone(BaseComponent):
    __tablename__ = 'headphone'
class Box(BaseComponent):
    __tablename__ = 'box'