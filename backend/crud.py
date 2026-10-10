from sqlalchemy.orm import Session
from models import ContactSubmission
from schemas import ContactCreate

def create_contact_submission(db: Session, contact: ContactCreate) -> ContactSubmission:
    db_obj = ContactSubmission(
        name=contact.name.strip(),
        email=contact.email.strip(),
        phone=contact.phone.strip() if contact.phone else None,
        message=contact.message.strip()
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_contact_submissions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(ContactSubmission).order_by(ContactSubmission.created_at.desc()).offset(skip).limit(limit).all()
