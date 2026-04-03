import redis
import logging
import time
from config import settings

# simple logger for redis issues
logger = logging.getLogger(__name__)

class RedisClient:
    def __init__(self):
        self.client = None
        self.is_connected = False
        # in-memory store for when redis is down
        # format: {key: (value, expiry_time)}
        self.mem_store = {}
        self.connect()

    def connect(self):
        try:
            # try connecting to redis
            self.client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                decode_responses=True,
                socket_timeout=1
            )
            # ping to check connection
            self.client.ping()
            self.is_connected = True
            logger.info("Successfully connected to Redis")
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}. Using in-memory fallback.")
            self.is_connected = False
            self.client = None

    def get(self, key):
        if self.is_connected and self.client:
            try:
                return self.client.get(key)
            except:
                pass
        
        # fallback to in-memory
        if key in self.mem_store:
            val, expiry = self.mem_store[key]
            if expiry and time.time() > expiry:
                del self.mem_store[key]
                return None
            return val
        return None

    def set(self, key, value, ex=None):
        if self.is_connected and self.client:
            try:
                return self.client.set(key, value, ex=ex)
            except:
                pass
        
        # fallback to in-memory
        expiry_time = time.time() + ex if ex else None
        self.mem_store[key] = (value, expiry_time)
        return True

    def delete(self, key):
        if self.is_connected and self.client:
            try:
                return self.client.delete(key)
            except:
                pass
        
        if key in self.mem_store:
            del self.mem_store[key]
        return True

# singleton instance
redis_client = RedisClient()
