from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String,index=True)
    uuid = Column(String, unique=True, index=True)
    creation_date = Column(String, index=True)

class notes(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    note_id = Column(String)
    note_content = Column(String, index=True)
    creation_date = Column(String, index=True)
    uuid = Column(String, index=True)

class loans(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(String, index=True)
    loan_amount = Column(Integer, index=True)
    uuid = Column(String, index=True)

class loan_payments(Base):
    __tablename__ = "loanPayments"

    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(String, index=True)
    payment_id = Column(String)
    payment_amount = Column(Integer, index=True)
    payment_date = Column(String, index=True)
    payment_status = Column(String, index=True)
    uuid = Column(String)

class Sessionss(Base):
    __tablename__= "sesions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String)
    session_hash = Column(String)
    date_created = Column(String)
    uuid = Column(String)

class todolist(Base):
    __tablename__ = "todo"

    id = Column(Integer, primary_key=True, index=True)
    todolist_name = Column(String)
    todolist_id = Column(String)
    uuid = Column(String)

class todolistItems(Base):
    __tablename__ = "todoItems"

    id = Column(Integer, primary_key=True, index=True)
    todolist_id = Column(String)
    item_id = Column(String)
    item_name = Column(String)
    item_content = Column(String)
    uuid = Column(String)

class PasswordResetTokens(Base):
    __tablename__ = "PasswordResetTokens"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String)
    token_id = Column(String)
    token = Column(String)

class ResetTokens(Base):
    __tablename__ = "ResetTokens"
    
    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(String)
    token = Column(String)
    uuid = Column(String)
