from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, username, password):
        self.username = username
        self.password = password
        self.active = True
        self.is_admin = False
        self.is_assistant_admin = False
        self.token = None
    def get_id(self):
        return self.username
    
    @property
    def is_active(self):
        return self.active