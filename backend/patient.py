from abc import ABC, abstractmethod

class Person(ABC):
    @abstractmethod  #decorator
    def show_info(self):
        pass
class Patient(Person):
    def __init__(self, name, disease):
        self.name = name
        self.disease = disease
    
    def show_info(self):
        print("Patient:", self.name)
        print("Disease:", self.disease)
        
        
        
        
        
           