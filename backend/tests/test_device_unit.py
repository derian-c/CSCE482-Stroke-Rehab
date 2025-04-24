from extensions import db
from models.device import Device

def test_device_create(app):
  with app.app_context():
    device = Device()
    db.session.add(device)
    db.session.flush()
    assert device.id == 1
    assert device.dict() != {}
    db.session.rollback()

