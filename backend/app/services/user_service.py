from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    """Service class for user management operations"""

    @staticmethod
    def create_user(db: Session, user_create: UserCreate) -> User:
        """Create a new user"""
        # Hash the password
        hashed_password = get_password_hash(user_create.password)

        # Create user object
        db_user = User(
            email=user_create.email,
            username=user_create.username,
            password_hash=hashed_password,
            is_active=user_create.is_active,
        )

        # Add to database
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return db_user

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User | None:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User | None:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> User | None:
        """Get user by username"""
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def update_user(db: Session, user_id: int, user_update: UserUpdate) -> User | None:
        """Update user information"""
        db_user = UserService.get_user_by_id(db, user_id)
        if not db_user:
            return None

        # Update fields if provided
        update_data = user_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)

        db.commit()
        db.refresh(db_user)

        return db_user

    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        """Delete a user"""
        db_user = UserService.get_user_by_id(db, user_id)
        if not db_user:
            return False

        db.delete(db_user)
        db.commit()

        return True

    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> User | None:
        """Authenticate user with username and password"""
        user = UserService.get_user_by_username(db, username)
        if not user:
            return None

        if not verify_password(password, user.password_hash):
            return None

        if not user.is_active:
            return None

        return user
