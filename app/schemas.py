from pydantic import BaseModel

class login_schema(BaseModel):
    username: str
    password: str

class logout_schema(BaseModel):
    session_id: str
    session_token: str
    uuid: str

class session_schma(BaseModel):
    session_id: str
    session_token: str
    uuid: str

class renewSess(BaseModel):
    uuid: str
    sessionId: str
    sessionToken: str

class gettoken(BaseModel):
    uuid: str
    sessionId: str
    sessionToken: str

class checkToken(BaseModel):
    Token: str

class PasswordToken(BaseModel):
    email: str

class ResetToken(BaseModel):
    Token: str
    password: str

class signup_schema(BaseModel):
    username: str
    email: str
    password: str

class notes_schema(BaseModel):
    noteTitle: str
    noteContent: str
    uuid: str
    session_id: str
    session_token: str

class loan(BaseModel):
    uuid: str
    loanAmount: int
    session_id: str
    session_token: str

class LoanPayments(BaseModel):
    payment_amount: int
    uuid: str
    loan_id: str
    session_id: str
    session_token: str

class GetLoans(BaseModel):
    uuid: str
    session_id: str
    session_token: str

class rloan(BaseModel):
    uuid: str
    loan_id: str
    session_id: str
    session_token: str

class rloanpayment(BaseModel):
    uuid: str
    payment_id: str
    session_id: str
    session_token: str

class TodoList(BaseModel):
    uuid: str
    ToDoListTitle: str
    session_id: str
    session_token: str

class getTod(BaseModel):
    uuid: str
    session_id: str
    session_token: str

class RtodoItem(BaseModel):
    uuid: str
    item_id: str
    session_id: str
    session_token: str

class Rtodo(BaseModel):
    uuid: str
    todo_id: str
    session_id: str
    session_token: str

class TodoListItem(BaseModel):
    uuid: str
    todolist_id: str
    item_name: str
    item_content: str
    session_id: str
    session_token: str


    