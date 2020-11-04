import random, secrets, uuid, models, uvicorn, sys
from fastapi import FastAPI, Depends
from schemas import login_schema, TodoList, Rtodo, ResetToken,PasswordToken,RtodoItem, checkToken, gettoken,rloanpayment,getTod, rloan,logout_schema, renewSess, TodoListItem, signup_schema, notes_schema, loan, session_schma, GetLoans,LoanPayments
from database import SessionLocal,engine
from sqlalchemy.orm import Session
from flask_bcrypt import Bcrypt
from models import User, Sessionss, notes, loan_payments, loans, todolistItems, todolist, ResetTokens, PasswordResetTokens
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
from mailclient import SendEmail
from random import sample



models.Base.metadata.create_all(bind=engine)

app = FastAPI()
bcrypt = Bcrypt()
today = date.today()
mail = SendEmail()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def getDB():
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

@app.get("/")
def home():
    return "nerd"

@app.post("/signup")
def signup(sign:signup_schema,db: Session = Depends(getDB)):
    data = sign.dict()
    d1 = today.strftime("%d/%m/%Y")
    uu =  str(uuid.uuid4())
    use = User()
    email = data["email"]
    unhashed = data["password"]
    use.username = data["username"]
    use.uuid = uu
    use.creation_date = d1
    hashed = bcrypt.generate_password_hash(unhashed).decode('utf-8')
    use.email = data["email"]
    use.hashed_password = hashed
    db.add(use)
    try:
        db.commit() 
    except Exception as e:
       return {"msg": "failed Email or username is already in use", "status": False}

    mail.registrationEmail(email)
    return {"status": True}


@app.post("/login")
def login(loig:login_schema,db: Session = Depends(getDB)):
    data = loig.dict()
    d1 = today.strftime("%d/%m/%Y")
    login_token = secrets.token_hex(32)
    login_id = secrets.token_hex(9)
    username = data["username"]
    password = data["password"]
    user = db.query(models.User).filter(models.User.email == username).first()
    if user:
        hashs = user.hashed_password
        uuA = user.uuid
        username = user.username

        if bcrypt.check_password_hash(hashs,password) == True:
            hash_session = bcrypt.generate_password_hash(login_token).decode('utf-8')
            db.add(Sessionss(session_hash=hash_session, uuid=uuA, date_created=d1, session_id=login_id))
            db.commit()

            return {
                "results": {"session_token": f"{login_token}","uuid": f"{uuA}","session_id": f"{login_id}","username": f"{username}"},
                "status": True
                 }
        else:
            return {"results": "invalid email or password","status": False}
    else: 
        return {"results": "user doesnt exist","status": False}   
            

@app.post("/logout")
def logOut(logout: logout_schema,db: Session = Depends(getDB)):
    data = logout.dict()
    sessionID = data["session_id"]
    sessionTok = data["session_token"]
    valid = db.query(models.Sessionss).filter(models.Sessionss.session_id == sessionID).first()
    if valid:
        session_hash = valid.session_hash
        if bcrypt.check_password_hash(session_hash, sessionTok) == True:
            db.query(models.Sessionss).filter(models.Sessionss.session_id == sessionID).delete()
            db.commit()
            return {"results": {"status": True},"status": True}
        else:
            return {"results": "failed authentication","status": False }
    else:
        return {"error_code": "no session", "status": False}
 
@app.post("/token")
def TokenSignin(tok:gettoken, db: Session = Depends(getDB)):
    data = tok.dict()
    uui = data["uuid"]
    session_d = data["sessionId"]
    session_tok = data["sessionToken"]
    login_tok = random.randint(99999, 999999)
    tokenID = secrets.token_hex(16)
    db.add(ResetTokens(token_id=tokenID,token=login_tok,uuid=uui))
    valid = db.query(models.Sessionss).filter(models.Sessionss.session_id == session_d).first()
    if valid:
        uud = valid.uuid
        user = db.query(models.User).filter(models.User.uuid == uui).first()
        email = user.email
        session_hash = valid.session_hash
        if bcrypt.check_password_hash(session_hash, session_tok) == True:
            mail.TokenEmail(email,login_tok)
            db.commit()
            return {"results": {},"status": True}
        else:
            return {"results": {"status": "invalid session"},"status": False}
    else:
        return {"error_code": "no session", "status": False}


@app.post("/check/Token")
def checktok(tok:checkToken,db: Session = Depends(getDB)):
    data = tok.dict()
    Tok = data["Token"]
    d1 = today.strftime("%d/%m/%Y")
    login_token = secrets.token_hex(32)
    login_id = secrets.token_hex(9)
    toke = db.query(models.ResetTokens).filter(models.ResetTokens.token == Tok).first()
    if toke:
        uui = toke.uuid
        hash_session = bcrypt.generate_password_hash(login_token).decode('utf-8')
        db.query(models.ResetTokens).filter(models.ResetTokens.token == Tok).delete()
        db.add(Sessionss(session_hash=hash_session, uuid=uui, date_created=d1, session_id=login_id)) 
        db.commit()
        return {
                "results": {"session token": f"{login_token}","uuid": f"{uui}","session_id": f"{login_id}"},
                "status": True
                 }
    else:
        return {"status": False}
  
@app.post("/reset/password")
def ResetpasswordToken(em:PasswordToken, db: Session = Depends(getDB)):
    data = em.dict()
    email = data["email"]
    Token = secrets.token_hex(16)
    TokenID = secrets.token_hex(8)
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        db.add(PasswordResetTokens(email=email,token_id=TokenID,token=Token))
        db.commit()
        mail.passwordresetEmail(email,Token)
        return {"status": True}
    else:
        return {"status": False}
    
@app.post("/password")
def Resetpassword(pas: ResetToken, db: Session = Depends(getDB)):
    data = pas.dict()
    Token = data["Token"]
    password = data["password"]
    valid = db.query(models.PasswordResetTokens).filter(models.PasswordResetTokens.token == Token).first()
    if valid:
        email = valid.email
        hashed = bcrypt.generate_password_hash(password).decode('utf-8')
        user = db.query(models.User).filter(models.User.email == email).first()
        user.hashed_password = hashed
        db.query(models.PasswordResetTokens).filter(models.PasswordResetTokens.token == Token).delete()
        db.commit()
        return {"status": True}
    else:
        return {"status": False}

@app.post("/session")
def checkingSession(sessi: session_schma, db: Session = Depends(getDB)):
    data = sessi.dict()
    uui = data["uuid"]
    session_d = data["session_id"]
    session_tok = data["session_token"]
    user = db.query(models.User).filter(models.User.uuid == uui).first()
    valid = db.query(models.Sessionss).filter(models.Sessionss.session_id == session_d).first()
    if valid:
        Username = user.username
        session_hash = valid.session_hash
        if bcrypt.check_password_hash(session_hash, session_tok) == True:
            return {"results": {"username": f"{Username}","status": "valid session"},"status": True}
        else:
            return {"results": {"status": "invalid session"},"status": False}
    else:
        return {"error_code": "no session", "status": False}

@app.post("/renew/session")
def RewNewSession(new:renewSess, db: Session = Depends(getDB)):
    data = new.dict()
    login_id = secrets.token_hex(9)
    login_token = secrets.token_hex(32)
    d1 = today.strftime("%d/%m/%Y")
    hash_session = bcrypt.generate_password_hash(login_token).decode('utf-8')
    uud = data["uuid"]
    newSessionID = secrets.token_hex(24)
    session_d = data["sessionId"]
    sessionTok = data["sessionToken"]
    valid = db.query(models.Sessionss).filter(models.Sessionss.session_id == session_d).first()
    if valid:
        session_hash = valid.session_hash
        if bcrypt.check_password_hash(session_hash, sessionTok) == True:
            db.query(models.Sessionss).filter(models.Sessionss.session_id == session_d).delete()
            db.add(Sessionss(session_hash=hash_session, uuid= uud, date_created = d1, session_id= login_id))
            db.commit()
            return {"results": {"status": "session renewed","session_id": f"{newSessionID}","session_token":f"{login_token}"},"status": True}
        else:
            return {"results": {"status": "failed to renew session"},"status": False}
    else:
        return {"error_code": "no session", "status": False}

@app.post("/Get/notes")
def GetNotes(note:GetLoans, db: Session = Depends(getDB)):
    data = note.dict()
    uui = data["uuid"]
    session_d = data["session_id"]
    session_tok = data["session_token"]
    valid = db.query(models.Sessionss).filter(models.Sessionss.session_id == session_d).first()
    if valid:
        session_hash = valid.session_hash
        if bcrypt.check_password_hash(session_hash, session_tok) == True:
            results = db.query(models.notes).filter(models.notes.uuid == uui).all()
            if results:
                return {"results": results,"status": True}
            else:
                return {"results": "no results","status": False}
        else:
            return {"results": "failed authentication","status": False }
    else:
        return {"error_code": "no session", "status": False}

@app.post("/add/Notes")
def addNotes(note:notes_schema, db: Session = Depends(getDB)):
    data = note.dict()
    d1 = today.strftime("%m/%d/%Y")
    noteId = secrets.token_hex(8)
    uui = data["uuid"]
    sess_id = data["session_id"]
    sess_token = data["session_token"]
    titl = data["noteTitle"]
    content = data["noteContent"]
    valid = db.query(models.Sessionss).filter(models.Sessionss.session_id == sess_id).first()
    if valid:
        session_hash = valid.session_hash
        if bcrypt.check_password_hash(session_hash, sess_token) == True:
            db.add(notes(title=titl, note_id=noteId, note_content=content, creation_date=d1, uuid=uui))
            db.commit()
            return {"status": True}
        else:
            return {"status": False}
    else:
        return {"error_code": "no session", "status": False}

@app.post("/Get/loans")
def getLoans(loan:GetLoans, db: Session = Depends(getDB)):
    data = loan.dict()
    uui = data["uuid"]
    sess_id = data["session_id"]
    session_tok = data["session_token"]
    valid = db.query(models.Sessionss).filter(models.Sessionss.session_id == sess_id).first()
    if valid:
        session_hash = valid.session_hash
        if bcrypt.check_password_hash(session_hash, session_tok) == True:
            results = db.query(models.loans).filter(models.loans.uuid == uui).all()
            payments = db.query(models.loan_payments).filter(models.loan_payments.uuid == uui).all()
            if results:
                return {"results": {"loan": results,"payments": payments},"status": True}
            else:
                return {"results": "no results","status": False}
        else:
            return {"results": "failed authentication","status": False }
    else:
        return {"error_code": "no session", "status": False}

@app.post("/add/loan")
def ADDloan(l:loan, db: Session = Depends(getDB)):
    data = l.dict()
    loanId = secrets.token_hex(16)
    loanAmount = data["loanAmount"]
    uui = data["uuid"]
    SessionId = data["session_id"]
    session_tok = data["session_token"]
    valid = db.query(models.Sessionss).filter(models.Sessionss.session_id == SessionId).first()
    if valid:
        session_hash = valid.session_hash
        if bcrypt.check_password_hash(session_hash, session_tok) == True:
            db.add(loans(loan_id=loanId,loan_amount=loanAmount,uuid=uui))
            db.commit()
        else:
            return {"results": "failed authentication","status": False }
    else:
        return {"error_code": "no session", "status": False}

@app.post("/add/loanPayment")
def addLoanPayment(loan: LoanPayments, db: Session = Depends(getDB)):
    data = loan.dict()
    paymentID = secrets.token_hex(16)
    uui = data["uuid"]
    SessionId = data["session_id"]
    session_tok = data["session_token"]
    payment_amounts = data["payment_amount"]
    loanID = data["loan_id"]
    d1 = today.strftime("%m/%d/%Y")
    valid = db.query(models.Sessionss).filter(models.Sessionss.session_id == SessionId).first()
    if valid:
        session_hash = valid.session_hash
        if bcrypt.check_password_hash(session_hash, session_tok) == True:
            db.add(loan_payments(loan_id=loanID,payment_amount=payment_amounts,payment_date=d1,payment_id=paymentID,uuid=uui))
            db.commit()
            return {"status": True}
        else:
            return {"results": "failed authentication","status": False }
    else:
        return {"error_code": "no session", "status": False}

@app.post("/Remove/loan")
def removeloan(rlo:rloan, db: Session = Depends(getDB)):
    data = rlo.dict()
    uui = data["uuid"]
    loand = data["loan_id"]
    sessionID = data["session_id"]
    sessionTok = data["session_token"]
    valid = db.query(models.Sessionss).filter(models.Sessionss.session_id == sessionID).first()
    if valid:
        session_hash = valid.session_hash
        if bcrypt.check_password_hash(session_hash, sessionTok) == True:
            db.query(models.loans).filter(models.loans.loan_id == loand).delete()
            db.commit()
            return {"results": {"status": True},"status": True}
        else:
            return {"results": "failed authentication","status": False }
    else:
        return {"error_code": "no session", "status": False}

@app.post("/Remove/loanpayment")
def removeloanpayment(rlo:rloanpayment, db: Session = Depends(getDB)):
    data = rlo.dict()
    uui = data["uuid"]
    loand = data["payment_id"]
    sessionID = data["session_id"]
    sessionTok = data["session_token"]
    valid = db.query(models.Sessionss).filter(models.Sessionss.session_id == sessionID).first()
    if valid:
        session_hash = valid.session_hash
        if bcrypt.check_password_hash(session_hash, sessionTok) == True:
            db.query(models.loan_payments).filter(models.loan_payments.payment_id == loand).delete()
            db.commit()
            return {"results": {"status": True},"status": True}
        else:
            return {"results": "failed authentication","status": False }
    else:
        return {"error_code": "no session", "status": False}

@app.post("/add/todo")
def addTodo(todo:TodoList, db: Session = Depends(getDB)):
    data = todo.dict()
    uui = data["uuid"]
    sessionID = data["session_id"]
    sessionTok = data["session_token"]
    title = data["ToDoListTitle"]
    listID = secrets.token_hex(16)
    valid = db.query(models.Sessionss).filter(models.Sessionss.session_id == sessionID).first()
    if valid:
        session_hash = valid.session_hash
        if bcrypt.check_password_hash(session_hash, sessionTok) == True:
            db.add(models.todolist(todolist_name=title,todolist_id=listID,uuid=uui))
            db.commit()
            return {"results": {"status": "sucessfully created todolist","todo_id": f"{listID}"},"status": True}
        else:
            return {"results": "failed authentication","status": False }
    else:
        return {"error_code": "no session", "status": False}

@app.post("/Get/todo")
def getToDo(tod:getTod, db: Session = Depends(getDB)):
    data = tod.dict()
    uui = data["uuid"]
    sessionTok = data["session_token"]
    sessionID = data["session_id"]
    valid = db.query(models.Sessionss).filter(models.Sessionss.session_id == sessionID).first()
    if valid:
        session_hash = valid.session_hash
        if bcrypt.check_password_hash(session_hash, sessionTok) == True:
            results = db.query(models.todolist).filter(models.todolist.uuid == uui).all()
            listitems = db.query(models.todolistItems).filter(models.todolistItems.uuid == uui).all()
            return {"results": [{"todo": results, "items": listitems}], "status": True}
        else:
            return {"results": "failed authentication","status": False }
    else:
        return {"error_code": "no session", "status": False}

@app.post("/Remove/todoitem")
def removetodoitem(item:RtodoItem, db: Session = Depends(getDB)):
    data = item.dict()
    uui = data["uuid"]
    itemID = data["item_id"]
    sessionTok = data["session_token"]
    sessionID = data["session_id"]
    valid = db.query(models.Sessionss).filter(models.Sessionss.session_id == sessionID).first()
    if valid:
        session_hash = valid.session_hash
        if bcrypt.check_password_hash(session_hash, sessionTok) == True:
            db.query(models.todolistItems).filter(models.todolistItems.item_id == itemID).delete()
            db.commit()
            return {"results": {"status": True},"status": True}
        else:
            return {"results": "failed authentication","status": False }
    else:
        return {"error_code": "no session", "status": False}

@app.post("/Remove/todo")
def removetodo(item:Rtodo, db: Session = Depends(getDB)):
    data = item.dict()
    uui = data["uuid"]
    todoid = data["todo_id"]
    sessionTok = data["session_token"]
    sessionID = data["session_id"]
    valid = db.query(models.Sessionss).filter(models.Sessionss.session_id == sessionID).first()
    if valid:
        session_hash = valid.session_hash
        if bcrypt.check_password_hash(session_hash, sessionTok) == True:
            db.query(models.todolist).filter(models.todolist.todolist_id == todoid).delete()
            db.commit()
            return {"results": {"status": True},"status": True}
        else:
            return {"results": "failed authentication","status": False }
    else:
        return {"error_code": "no session", "status": False}

@app.post("/add/todoListItem")
def addToDoItem(item:TodoListItem, db: Session = Depends(getDB)):
    data = item.dict()
    ToDoID = data["todolist_id"]
    listID = secrets.token_hex(8)
    sessionTok = data["session_token"]
    sessionID = data["session_id"]
    itemName = data["item_name"]
    ItemContent = data["item_content"]
    uui = data["uuid"]
    valid = db.query(models.Sessionss).filter(models.Sessionss.session_id == sessionID).first()
    if valid:
        session_hash = valid.session_hash
        if bcrypt.check_password_hash(session_hash, sessionTok) == True:
            db.add(models.todolistItems(todolist_id=ToDoID,item_id=listID,item_name=itemName,item_content=ItemContent,uuid=uui))
            db.commit()
            return {"results": {"status": True},"status": True}
        else:
            return {"results": "failed authentication","status": False }
    else:
        return {"error_code": "no session", "status": False}


# uncomment if you need to run it on a different port 
# also doesnt allow reload on modification of a file
#if __name__ == "__main__":
    #uvicorn.run(app, host="0.0.0.0", port=69)


