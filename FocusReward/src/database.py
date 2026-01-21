"""
FocusReward 数据库管理模块
负责本地 SQLite 数据库的创建、读取和写入操作
"""

import sqlite3
import os
from datetime import datetime, date
from typing import Optional, Dict, Any, List


class DatabaseManager:
    """管理 FocusReward 本地数据库的所有操作"""

    def __init__(self, db_path: str = None):
        """
        初始化数据库管理器

        Args:
            db_path: 数据库文件路径，默认为 data/focusreward.db
        """
        if db_path is None:
            # 获取应用程序目录
            app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_dir = os.path.join(app_dir, 'data')
            os.makedirs(data_dir, exist_ok=True)
            db_path = os.path.join(data_dir, 'focusreward.db')

        self.db_path = db_path
        self._init_database()

    def _get_connection(self) -> sqlite3.Connection:
        """获取数据库连接"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_database(self):
        """初始化数据库表结构"""
        conn = self._get_connection()
        cursor = conn.cursor()

        # 创建每日记录表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS daily_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE UNIQUE NOT NULL,
                anki_cards_reviewed INTEGER DEFAULT 0,
                steam_minutes_used INTEGER DEFAULT 0,
                earned_minutes INTEGER DEFAULT 0,
                emergency_pause_used BOOLEAN DEFAULT 0,
                emergency_unlock_used BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # 创建设置表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # 创建会话记录表（用于追踪应用程序使用时长）
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                app_name TEXT NOT NULL,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP,
                duration_seconds INTEGER DEFAULT 0,
                date DATE NOT NULL
            )
        ''')

        conn.commit()
        conn.close()

        # 初始化默认设置
        self._init_default_settings()

    def _init_default_settings(self):
        """初始化默认设置值"""
        default_settings = {
            'anki_db_path': '',  # Anki 数据库路径
            'cards_per_exchange': '10',  # 每次兑换所需卡片数
            'minutes_per_exchange': '5',  # 每次兑换获得的分钟数
            'auto_start': 'false',  # 开机自动启动
            'check_interval': '30',  # 监控检查间隔（秒）
            'warning_minutes': '5',  # 剩余多少分钟时警告
            'countdown_seconds': '10',  # 关闭前倒数秒数
        }

        for key, value in default_settings.items():
            self.set_setting(key, value, overwrite=False)

    # ===== 设置相关方法 =====

    def get_setting(self, key: str, default: str = None) -> Optional[str]:
        """
        获取设置值

        Args:
            key: 设置键名
            default: 默认值

        Returns:
            设置值或默认值
        """
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT value FROM settings WHERE key = ?', (key,))
        row = cursor.fetchone()
        conn.close()

        if row:
            return row['value']
        return default

    def set_setting(self, key: str, value: str, overwrite: bool = True):
        """
        设置配置值

        Args:
            key: 设置键名
            value: 设置值
            overwrite: 是否覆盖已有值
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        if overwrite:
            cursor.execute('''
                INSERT OR REPLACE INTO settings (key, value, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            ''', (key, value))
        else:
            cursor.execute('''
                INSERT OR IGNORE INTO settings (key, value, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            ''', (key, value))

        conn.commit()
        conn.close()

    def get_all_settings(self) -> Dict[str, str]:
        """获取所有设置"""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT key, value FROM settings')
        rows = cursor.fetchall()
        conn.close()

        return {row['key']: row['value'] for row in rows}

    # ===== 每日记录相关方法 =====

    def get_today_record(self) -> Dict[str, Any]:
        """
        获取今日记录，如果不存在则创建

        Returns:
            今日记录字典
        """
        today = date.today().isoformat()
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM daily_records WHERE date = ?', (today,))
        row = cursor.fetchone()

        if not row:
            # 创建今日记录
            cursor.execute('''
                INSERT INTO daily_records (date, anki_cards_reviewed, steam_minutes_used,
                                          earned_minutes, emergency_pause_used, emergency_unlock_used)
                VALUES (?, 0, 0, 0, 0, 0)
            ''', (today,))
            conn.commit()
            cursor.execute('SELECT * FROM daily_records WHERE date = ?', (today,))
            row = cursor.fetchone()

        conn.close()

        return dict(row)

    def update_today_anki_cards(self, cards_count: int):
        """
        更新今日 Anki 复习卡片数

        Args:
            cards_count: 卡片数量
        """
        today = date.today().isoformat()
        self.get_today_record()  # 确保今日记录存在

        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE daily_records
            SET anki_cards_reviewed = ?, updated_at = CURRENT_TIMESTAMP
            WHERE date = ?
        ''', (cards_count, today))
        conn.commit()
        conn.close()

    def update_today_steam_minutes(self, minutes: int):
        """
        更新今日 Steam 使用分钟数

        Args:
            minutes: 分钟数
        """
        today = date.today().isoformat()
        self.get_today_record()  # 确保今日记录存在

        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE daily_records
            SET steam_minutes_used = ?, updated_at = CURRENT_TIMESTAMP
            WHERE date = ?
        ''', (minutes, today))
        conn.commit()
        conn.close()

    def update_today_earned_minutes(self, minutes: int):
        """
        更新今日赚取的分钟数

        Args:
            minutes: 分钟数
        """
        today = date.today().isoformat()
        self.get_today_record()  # 确保今日记录存在

        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE daily_records
            SET earned_minutes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE date = ?
        ''', (minutes, today))
        conn.commit()
        conn.close()

    def set_emergency_pause_used(self):
        """标记今日已使用紧急暂停"""
        today = date.today().isoformat()
        self.get_today_record()

        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE daily_records
            SET emergency_pause_used = 1, updated_at = CURRENT_TIMESTAMP
            WHERE date = ?
        ''', (today,))
        conn.commit()
        conn.close()

    def set_emergency_unlock_used(self):
        """标记今日已使用紧急解锁"""
        today = date.today().isoformat()
        self.get_today_record()

        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE daily_records
            SET emergency_unlock_used = 1, updated_at = CURRENT_TIMESTAMP
            WHERE date = ?
        ''', (today,))
        conn.commit()
        conn.close()

    def reset_today_data(self):
        """重置今日数据"""
        today = date.today().isoformat()

        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE daily_records
            SET anki_cards_reviewed = 0, steam_minutes_used = 0, earned_minutes = 0,
                emergency_pause_used = 0, emergency_unlock_used = 0,
                updated_at = CURRENT_TIMESTAMP
            WHERE date = ?
        ''', (today,))
        conn.commit()
        conn.close()

    # ===== 历史记录相关方法 =====

    def get_history(self, days: int = 30) -> List[Dict[str, Any]]:
        """
        获取历史记录

        Args:
            days: 获取多少天的记录

        Returns:
            历史记录列表
        """
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM daily_records
            ORDER BY date DESC
            LIMIT ?
        ''', (days,))
        rows = cursor.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    def get_history_range(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """
        获取指定日期范围的历史记录

        Args:
            start_date: 开始日期 (YYYY-MM-DD)
            end_date: 结束日期 (YYYY-MM-DD)

        Returns:
            历史记录列表
        """
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM daily_records
            WHERE date BETWEEN ? AND ?
            ORDER BY date ASC
        ''', (start_date, end_date))
        rows = cursor.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    # ===== 会话记录相关方法 =====

    def start_session(self, app_name: str) -> int:
        """
        开始一个应用程序会话

        Args:
            app_name: 应用程序名称

        Returns:
            会话 ID
        """
        today = date.today().isoformat()
        now = datetime.now().isoformat()

        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO sessions (app_name, start_time, date)
            VALUES (?, ?, ?)
        ''', (app_name, now, today))
        session_id = cursor.lastrowid
        conn.commit()
        conn.close()

        return session_id

    def end_session(self, session_id: int):
        """
        结束一个应用程序会话

        Args:
            session_id: 会话 ID
        """
        now = datetime.now()

        conn = self._get_connection()
        cursor = conn.cursor()

        # 获取会话开始时间
        cursor.execute('SELECT start_time FROM sessions WHERE id = ?', (session_id,))
        row = cursor.fetchone()

        if row:
            start_time = datetime.fromisoformat(row['start_time'])
            duration = int((now - start_time).total_seconds())

            cursor.execute('''
                UPDATE sessions
                SET end_time = ?, duration_seconds = ?
                WHERE id = ?
            ''', (now.isoformat(), duration, session_id))
            conn.commit()

        conn.close()

    def get_today_app_duration(self, app_name: str) -> int:
        """
        获取今日某应用程序的总使用时长（秒）

        Args:
            app_name: 应用程序名称

        Returns:
            使用时长（秒）
        """
        today = date.today().isoformat()

        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT SUM(duration_seconds) as total
            FROM sessions
            WHERE app_name = ? AND date = ? AND end_time IS NOT NULL
        ''', (app_name, today))
        row = cursor.fetchone()
        conn.close()

        return row['total'] if row and row['total'] else 0
