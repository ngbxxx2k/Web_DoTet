import pymysql
import logging
from config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE

logger = logging.getLogger(__name__)


def get_connection():
    """Tạo kết nối MySQL"""
    try:
        connection = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE,
            cursorclass=pymysql.cursors.DictCursor
        )
        return connection
    except Exception as e:
        logger.error(f"[Database] Lỗi kết nối MySQL: {e}")
        raise


def update_file_status(file_id: int, status: str):
    """Cập nhật trạng thái file trong MySQL"""
    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            sql = "UPDATE chatbot_files SET status = %s WHERE id = %s"
            cursor.execute(sql, (status, file_id))
        connection.commit()
        logger.info(f"[Database] Cập nhật status file_id={file_id} -> {status}")
    except Exception as e:
        logger.error(f"[Database] Lỗi cập nhật status file_id={file_id}: {e}")
        raise
    finally:
        if connection:
            connection.close()
