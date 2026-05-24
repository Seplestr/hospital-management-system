class Admit:
    def admit_patient(self, patient, room):
        print(patient.name, "admitted to Room", room.get_room())

    def discharge_patient(self, patient):
        print(patient.name, "discharged")