from backend.patient import Person

class Staff(Person):
    def __init__(self, name, role):
        self.name = name
        self.role = role

    def show_info(self):
        print("Staff:", self.name)
        print("Role:", self.role)
        
        