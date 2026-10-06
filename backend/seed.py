import os
import random
from app.database import engine, Base, SessionLocal
from app import models

def seed_data():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Seeding database...")
    customers_data = [
        {"name": "Alice Smith", "email": "alice@example.com"},
        {"name": "Bob Jones", "email": "bob@example.com"},
        {"name": "Charlie Brown", "email": "charlie@example.com"},
        {"name": "Diana Prince", "email": "diana@example.com"}
    ]

    customers = []
    for cd in customers_data:
        c = models.Customer(**cd)
        db.add(c)
        db.commit()
        db.refresh(c)
        customers.append(c)

    tickets_data = [
        ("I was charged twice for my subscription this month", "billing", "high", customers[0]),
        ("The API is returning a 500 internal server error when I try to create an order.", "technical", "urgent", customers[1]),
        ("I can't log into my account. It says invalid password but I just reset it.", "account", "high", customers[2]),
        ("I need a refund for my last purchase. It was accidental.", "refund", "normal", customers[3]),
        ("I think someone else accessed my account. There are weird charges.", "security", "urgent", customers[0]),
        ("How do I change my billing address?", "billing", "low", customers[1]),
        ("The dashboard is loading very slowly today.", "technical", "normal", customers[2]),
        ("Can I upgrade my plan to enterprise?", "account", "normal", customers[3]),
        ("My order #12345 never arrived.", "order", "high", customers[0]),
        ("Just wanted to say I love the new features!", "general", "low", customers[1])
    ]

    for subject, category, priority, customer in tickets_data:
        t = models.Ticket(
            customer_id=customer.id,
            subject=subject[:30] + "...",
            description=subject,
            category=category,
            priority=priority,
            status=random.choice(["open", "resolved", "escalated"]),
            sentiment=random.choice(["positive", "neutral", "negative"]),
            confidence=round(random.uniform(0.7, 0.99), 2)
        )
        db.add(t)
        db.commit()
        db.refresh(t)

        msg = models.TicketMessage(
            ticket_id=t.id,
            sender_type="customer",
            sender_name=customer.name,
            message=subject
        )
        db.add(msg)
        db.commit()

    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_data()
