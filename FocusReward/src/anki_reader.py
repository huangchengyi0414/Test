"""
FocusReward Anki 数据库读取模块
负责读取 Anki 的 SQLite 数据库，统计复习卡片数量
"""

import sqlite3
import os
import shutil
import tempfile
from datetime import datetime, date
from typing import Optional, Dict, List
from PyQt5.QtCore import QObject, QTimer, pyqtSignal


class AnkiReader(QObject):
    """
    Anki 数据库读取器
    读取 Anki 的 collection.anki2 数据库，统计每日复习卡片数量
    """

    # 信号定义
    cards_updated = pyqtSignal(int)  # 卡片数量更新信号
    error_occurred = pyqtSignal(str)  # 错误信号

    # Anki 数据库的默认位置
    DEFAULT_ANKI_PATHS = [
        os.path.expanduser('~\\AppData\\Roaming\\Anki2'),  # Windows
        os.path.expanduser('~/Library/Application Support/Anki2'),  # macOS
        os.path.expanduser('~/.local/share/Anki2'),  # Linux
    ]

    def __init__(self, db_path: str = None, update_interval: int = 300):
        """
        初始化 Anki 读取器

        Args:
            db_path: Anki 数据库路径，如果为 None 则自动检测
            update_interval: 更新间隔（秒），默认 5 分钟
        """
        super().__init__()

        self.db_path = db_path
        self.update_interval = update_interval * 1000  # 转换为毫秒

        # 今日复习卡片数
        self.today_cards = 0

        # 定时器
        self.timer = QTimer()
        self.timer.timeout.connect(self._update_cards)

        # 如果没有指定路径，尝试自动检测
        if not self.db_path:
            self.db_path = self._auto_detect_anki_db()

    def _auto_detect_anki_db(self) -> Optional[str]:
        """
        自动检测 Anki 数据库位置

        Returns:
            数据库路径或 None
        """
        for base_path in self.DEFAULT_ANKI_PATHS:
            if os.path.exists(base_path):
                # 查找配置文件目录
                try:
                    for profile in os.listdir(base_path):
                        profile_path = os.path.join(base_path, profile)
                        if os.path.isdir(profile_path) and profile != 'addons21':
                            db_file = os.path.join(profile_path, 'collection.anki2')
                            if os.path.exists(db_file):
                                return db_file
                except PermissionError:
                    continue
        return None

    def set_db_path(self, path: str):
        """
        设置 Anki 数据库路径

        Args:
            path: 数据库路径
        """
        self.db_path = path

    def get_db_path(self) -> Optional[str]:
        """获取当前数据库路径"""
        return self.db_path

    def start(self):
        """开始定时更新"""
        self._update_cards()  # 立即更新一次
        self.timer.start(self.update_interval)

    def stop(self):
        """停止定时更新"""
        self.timer.stop()

    def set_update_interval(self, seconds: int):
        """
        设置更新间隔

        Args:
            seconds: 间隔秒数
        """
        self.update_interval = seconds * 1000
        if self.timer.isActive():
            self.timer.stop()
            self.timer.start(self.update_interval)

    def _update_cards(self):
        """更新今日卡片数"""
        cards = self.get_today_reviewed_cards()
        if cards >= 0:
            self.today_cards = cards
            self.cards_updated.emit(cards)

    def _copy_db_for_reading(self) -> Optional[str]:
        """
        复制数据库文件以避免锁定问题

        Returns:
            临时文件路径或 None
        """
        if not self.db_path or not os.path.exists(self.db_path):
            return None

        try:
            # 创建临时文件
            temp_fd, temp_path = tempfile.mkstemp(suffix='.anki2')
            os.close(temp_fd)

            # 复制数据库文件
            shutil.copy2(self.db_path, temp_path)
            return temp_path
        except Exception as e:
            self.error_occurred.emit(f"无法复制 Anki 数据库: {str(e)}")
            return None

    def get_today_reviewed_cards(self) -> int:
        """
        获取今日复习的卡片数量

        Returns:
            复习卡片数量，如果出错返回 -1
        """
        if not self.db_path:
            self.error_occurred.emit("未设置 Anki 数据库路径")
            return -1

        if not os.path.exists(self.db_path):
            self.error_occurred.emit(f"Anki 数据库文件不存在: {self.db_path}")
            return -1

        temp_db = None
        try:
            # 复制数据库以避免锁定
            temp_db = self._copy_db_for_reading()
            if not temp_db:
                return -1

            conn = sqlite3.connect(temp_db)
            cursor = conn.cursor()

            # Anki 使用毫秒时间戳
            # 计算今天的开始时间（本地时间午夜）
            today = date.today()
            today_start = datetime(today.year, today.month, today.day)
            today_start_ms = int(today_start.timestamp() * 1000)

            # 从 revlog 表统计今日复习数
            # revlog 表结构: id (时间戳), cid (卡片id), usn, ease, ivl, lastIvl, factor, time, type
            # id 是复习的时间戳（毫秒）
            cursor.execute('''
                SELECT COUNT(*) FROM revlog
                WHERE id >= ?
            ''', (today_start_ms,))

            result = cursor.fetchone()
            conn.close()

            return result[0] if result else 0

        except sqlite3.Error as e:
            self.error_occurred.emit(f"读取 Anki 数据库出错: {str(e)}")
            return -1
        except Exception as e:
            self.error_occurred.emit(f"发生错误: {str(e)}")
            return -1
        finally:
            # 清理临时文件
            if temp_db and os.path.exists(temp_db):
                try:
                    os.remove(temp_db)
                except Exception:
                    pass

    def get_review_stats(self, days: int = 7) -> List[Dict]:
        """
        获取最近几天的复习统计

        Args:
            days: 天数

        Returns:
            每日统计列表
        """
        if not self.db_path or not os.path.exists(self.db_path):
            return []

        temp_db = None
        try:
            temp_db = self._copy_db_for_reading()
            if not temp_db:
                return []

            conn = sqlite3.connect(temp_db)
            cursor = conn.cursor()

            stats = []
            today = date.today()

            for i in range(days):
                day = date.fromordinal(today.toordinal() - i)
                day_start = datetime(day.year, day.month, day.day)
                day_end = datetime(day.year, day.month, day.day, 23, 59, 59)

                day_start_ms = int(day_start.timestamp() * 1000)
                day_end_ms = int(day_end.timestamp() * 1000)

                cursor.execute('''
                    SELECT COUNT(*) FROM revlog
                    WHERE id >= ? AND id <= ?
                ''', (day_start_ms, day_end_ms))

                result = cursor.fetchone()
                count = result[0] if result else 0

                stats.append({
                    'date': day.isoformat(),
                    'cards_reviewed': count
                })

            conn.close()
            return stats[::-1]  # 按日期正序返回

        except Exception as e:
            self.error_occurred.emit(f"获取统计数据出错: {str(e)}")
            return []
        finally:
            if temp_db and os.path.exists(temp_db):
                try:
                    os.remove(temp_db)
                except Exception:
                    pass

    def is_db_accessible(self) -> bool:
        """
        检查数据库是否可访问

        Returns:
            是否可访问
        """
        if not self.db_path:
            return False

        if not os.path.exists(self.db_path):
            return False

        try:
            temp_db = self._copy_db_for_reading()
            if temp_db:
                os.remove(temp_db)
                return True
        except Exception:
            pass

        return False

    def find_anki_profiles(self) -> List[Dict[str, str]]:
        """
        查找所有 Anki 配置文件

        Returns:
            配置文件列表 [{'name': '...', 'path': '...'}]
        """
        profiles = []

        for base_path in self.DEFAULT_ANKI_PATHS:
            if os.path.exists(base_path):
                try:
                    for profile in os.listdir(base_path):
                        profile_path = os.path.join(base_path, profile)
                        if os.path.isdir(profile_path) and profile != 'addons21':
                            db_file = os.path.join(profile_path, 'collection.anki2')
                            if os.path.exists(db_file):
                                profiles.append({
                                    'name': profile,
                                    'path': db_file
                                })
                except PermissionError:
                    continue

        return profiles

    def get_today_cards(self) -> int:
        """获取缓存的今日卡片数"""
        return self.today_cards

    def refresh(self):
        """手动刷新数据"""
        self._update_cards()
