from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserRegister, UserResponse, ChangePassword, LogoutResponse, LoginResponse, ChangePasswordResponse
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.redis import RedisTokenBlacklist
from app.core.config import settings
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.get("/check/{user_id}")
def check_user_id_availability(user_id: str, db: Session = Depends(get_db)):
    normalized_user_id = user_id.lower()

    existing_user = db.query(User).filter(User.user_id == normalized_user_id).first()

    if existing_user:
        return {"available": False, "message": "이미 사용 중인 아이디입니다"}
    else:
        return {"available": True, "message": "사용 가능한 아이디입니다"}

@router.post("/register", response_model=UserResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.user_id == user_data.user_id).first():
        raise HTTPException(
            status_code=400,
            detail="This user ID is already in use"
        )

    hashed_password = get_password_hash(user_data.password)
    new_user = User(user_id=user_data.user_id, hashed_password=hashed_password)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return UserResponse(user=new_user)

@router.post("/login", response_model=LoginResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == form_data.username.lower()).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.user_id})
    return LoginResponse(access_token=access_token)

@router.post("/change-password", response_model=ChangePasswordResponse)
def change_password(
    password_data: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Your current password is incorrect"
        )

    new_hashed_password = get_password_hash(password_data.new_password)
    current_user.hashed_password = new_hashed_password
    db.commit()

    return ChangePasswordResponse(message="Password changed successfully")

@router.post("/logout", response_model=LogoutResponse)
def logout(
    token: str = Depends(oauth2_scheme),
    current_user: User = Depends(get_current_user), # 토큰 유효성 검증
):
    RedisTokenBlacklist.add_token(token, settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return LogoutResponse(message="Successfully logged out")
