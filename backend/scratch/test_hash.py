from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

hashed = "$pbkdf2-sha256$29000$fE.p9T7HOOc8pxRi7B3D.A$Iz6S9KfmvmTQ.MgABm6J3jdBCDgUJVpB2EdOfNvIdPo"
passwords_to_test = ["Srikar@0417", "password123", "Srikar@0417 ", " Srikar@0417"]

for p in passwords_to_test:
    print(f"Testing '{p}': {verify_password(p, hashed)}")
