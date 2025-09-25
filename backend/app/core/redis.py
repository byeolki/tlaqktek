import redis
from datetime import timedelta
from app.core.config import settings

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

class RedisTokenBlacklist:
    @staticmethod
    def add_token(token: str, expire_minutes: int = 30):
        redis_client.setex(f"blacklist:{token}", timedelta(minutes=expire_minutes), "blacklisted")

    @staticmethod
    def is_blacklisted(token: str) -> bool:
        return redis_client.exists(f"blacklist:{token}") > 0

def redis_connection():
    try:
        redis_client.ping()
        print("Redis connection successful!")
        return True
    except Exception as e:
        print(f"Redis connection failed: {e}")
        return False
