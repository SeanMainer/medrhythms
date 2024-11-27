from datetime import datetime
from . import db

class Kit(db.Model):

    __tablename__ = 'kit'

    id = db.Column(db.String(20), primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    batch_number = db.Column(db.String(255))
    status = db.Column(db.String(50), default='Available')  # Available, Unavailable, Bound, Scrapped, Furbishing, Other
    distributor = db.Column(db.String(25))
    dispense_date = db.Column(db.DateTime)

    # The relationship between components and kits, many to one,allow certain lack of a component
    phone = db.relationship('Phone', backref='kit', uselist=False)
    sim_card = db.relationship('SimCard', backref='kit', uselist=False)
    right_sensor = db.relationship('RightSensor', backref='kit', uselist=False)
    left_sensor = db.relationship('LeftSensor', backref='kit', uselist=False)
    headphone = db.relationship('Headphone', backref='kit', uselist=False)

class BaseComponent(db.Model):
    """base class for all components"""
    __abstract__ = True

    id = db.Column(db.String(20), primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    batch_number = db.Column(db.String(255))
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

            models = [Phone, SimCard, RightSensor, LeftSensor, Headphone]
            component = None
            component_type = None

            for model in models:
                component = model.query.get(component_id)
                if component:
                    component_type = model.__name__.lower()
                    break

            if not component:
                return None, None, f"Component with id {component_id} not found"


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