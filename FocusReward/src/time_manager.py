"""
FocusReward 时间管理模块
负责时间兑换计算和游戏时间限制控制
"""

from datetime import datetime
from typing import Optional, Callable
from PyQt5.QtCore import QObject, QTimer, pyqtSignal


class TimeManager(QObject):
    """
    时间管理器
    处理学习时间到游戏时间的转换，以及游戏时间限制
    """

    # 信号定义
    time_updated = pyqtSignal(dict)  # 时间更新信号
    warning_triggered = pyqtSignal(int)  # 警告信号，参数为剩余分钟数
    time_expired = pyqtSignal()  # 时间耗尽信号
    countdown_tick = pyqtSignal(int)  # 倒计时信号，参数为剩余秒数
    steam_should_close = pyqtSignal()  # Steam 应该被关闭的信号

    def __init__(self):
        """初始化时间管理器"""
        super().__init__()

        # 兑换设置
        self.cards_per_exchange = 10  # 每次兑换需要的卡片数
        self.minutes_per_exchange = 5  # 每次兑换获得的分钟数

        # 当前状态
        self.anki_cards = 0  # 今日 Anki 复习卡片数
        self.steam_minutes_used = 0  # 今日 Steam 使用分钟数

        # 特殊状态
        self.emergency_pause_used = False  # 今日是否使用过紧急暂停
        self.emergency_unlock_used = False  # 今日是否使用过紧急解锁
        self.pause_end_time: Optional[datetime] = None  # 暂停结束时间

        # 警告设置
        self.warning_minutes = 5  # 剩余多少分钟时警告
        self.countdown_seconds = 10  # 关闭前倒数秒数
        self._warning_shown = False  # 是否已显示警告

        # 倒计时定时器
        self.countdown_timer = QTimer()
        self.countdown_timer.timeout.connect(self._countdown_tick)
        self.countdown_remaining = 0

        # 检查定时器（每秒检查一次时间状态）
        self.check_timer = QTimer()
        self.check_timer.timeout.connect(self._check_time_status)

        # Steam 运行状态
        self.is_steam_running = False

    def start(self):
        """开始时间管理"""
        self.check_timer.start(1000)  # 每秒检查一次

    def stop(self):
        """停止时间管理"""
        self.check_timer.stop()
        self.countdown_timer.stop()

    # ===== 设置方法 =====

    def set_exchange_rate(self, cards: int, minutes: int):
        """
        设置兑换比例

        Args:
            cards: 每次兑换需要的卡片数
            minutes: 每次兑换获得的分钟数
        """
        self.cards_per_exchange = max(1, min(100, cards))
        self.minutes_per_exchange = max(1, min(60, minutes))
        self._emit_time_update()

    def set_warning_minutes(self, minutes: int):
        """设置警告阈值"""
        self.warning_minutes = minutes

    def set_countdown_seconds(self, seconds: int):
        """设置关闭倒计时秒数"""
        self.countdown_seconds = seconds

    # ===== 数据更新方法 =====

    def update_anki_cards(self, cards: int):
        """更新 Anki 卡片数"""
        self.anki_cards = cards
        self._emit_time_update()

    def update_steam_minutes(self, minutes: int):
        """更新 Steam 使用分钟数"""
        self.steam_minutes_used = minutes
        self._emit_time_update()

    def set_steam_running(self, is_running: bool):
        """设置 Steam 运行状态"""
        was_running = self.is_steam_running
        self.is_steam_running = is_running

        # 如果 Steam 刚启动，重置警告状态
        if is_running and not was_running:
            self._warning_shown = False

    # ===== 时间计算方法 =====

    def get_earned_minutes(self) -> int:
        """
        计算已赚取的游戏时间（分钟）

        Returns:
            已赚取的分钟数
        """
        if self.cards_per_exchange <= 0:
            return 0
        exchanges = self.anki_cards // self.cards_per_exchange
        return exchanges * self.minutes_per_exchange

    def get_remaining_minutes(self) -> int:
        """
        计算剩余可用游戏时间（分钟）

        Returns:
            剩余分钟数
        """
        # 如果使用了紧急解锁，返回无限时间（用 9999 表示）
        if self.emergency_unlock_used:
            return 9999

        earned = self.get_earned_minutes()
        remaining = earned - self.steam_minutes_used

        # 如果在暂停期间，增加暂停时间
        if self.pause_end_time:
            now = datetime.now()
            if now < self.pause_end_time:
                pause_remaining = int((self.pause_end_time - now).total_seconds() / 60)
                remaining += pause_remaining

        return max(0, remaining)

    def get_time_info(self) -> dict:
        """
        获取完整的时间信息

        Returns:
            时间信息字典
        """
        earned = self.get_earned_minutes()
        remaining = self.get_remaining_minutes()

        # 计算进度百分比
        if earned > 0:
            progress = min(100, (self.steam_minutes_used / earned) * 100)
        else:
            progress = 0 if self.steam_minutes_used == 0 else 100

        return {
            'anki_cards': self.anki_cards,
            'earned_minutes': earned,
            'used_minutes': self.steam_minutes_used,
            'remaining_minutes': remaining,
            'progress_percent': progress,
            'is_time_up': remaining <= 0 and not self.emergency_unlock_used,
            'is_warning': 0 < remaining <= self.warning_minutes and not self.emergency_unlock_used,
            'emergency_pause_available': not self.emergency_pause_used,
            'emergency_unlock_used': self.emergency_unlock_used,
            'is_paused': self.pause_end_time is not None and datetime.now() < self.pause_end_time,
        }

    # ===== 紧急功能 =====

    def use_emergency_pause(self, minutes: int = 5) -> bool:
        """
        使用紧急暂停

        Args:
            minutes: 暂停分钟数

        Returns:
            是否成功使用
        """
        if self.emergency_pause_used:
            return False

        self.emergency_pause_used = True
        self.pause_end_time = datetime.now()
        # 增加暂停分钟数到结束时间
        from datetime import timedelta
        self.pause_end_time += timedelta(minutes=minutes)

        self._emit_time_update()
        return True

    def use_emergency_unlock(self) -> bool:
        """
        使用紧急解锁（今日解除限制）

        Returns:
            是否成功使用
        """
        self.emergency_unlock_used = True
        self._emit_time_update()
        return True

    def is_emergency_pause_available(self) -> bool:
        """检查紧急暂停是否可用"""
        return not self.emergency_pause_used

    def is_paused(self) -> bool:
        """检查是否在暂停期间"""
        if not self.pause_end_time:
            return False
        return datetime.now() < self.pause_end_time

    # ===== 重置方法 =====

    def reset_daily(self):
        """重置每日数据"""
        self.anki_cards = 0
        self.steam_minutes_used = 0
        self.emergency_pause_used = False
        self.emergency_unlock_used = False
        self.pause_end_time = None
        self._warning_shown = False
        self._emit_time_update()

    def restore_state(self, anki_cards: int, steam_minutes: int,
                     pause_used: bool, unlock_used: bool):
        """
        恢复状态（从数据库加载时使用）

        Args:
            anki_cards: Anki 卡片数
            steam_minutes: Steam 使用分钟数
            pause_used: 是否使用过紧急暂停
            unlock_used: 是否使用过紧急解锁
        """
        self.anki_cards = anki_cards
        self.steam_minutes_used = steam_minutes
        self.emergency_pause_used = pause_used
        self.emergency_unlock_used = unlock_used
        self._emit_time_update()

    # ===== 内部方法 =====

    def _emit_time_update(self):
        """发出时间更新信号"""
        self.time_updated.emit(self.get_time_info())

    def _check_time_status(self):
        """检查时间状态"""
        if not self.is_steam_running:
            return

        if self.emergency_unlock_used:
            return

        if self.is_paused():
            return

        remaining = self.get_remaining_minutes()

        # 检查是否需要显示警告
        if 0 < remaining <= self.warning_minutes and not self._warning_shown:
            self._warning_shown = True
            self.warning_triggered.emit(remaining)

        # 检查是否时间用尽
        if remaining <= 0 and not self.countdown_timer.isActive():
            self.time_expired.emit()
            self._start_countdown()

    def _start_countdown(self):
        """开始关闭倒计时"""
        if self.countdown_timer.isActive():
            return

        self.countdown_remaining = self.countdown_seconds
        self.countdown_tick.emit(self.countdown_remaining)
        self.countdown_timer.start(1000)

    def _countdown_tick(self):
        """倒计时每秒执行"""
        self.countdown_remaining -= 1
        self.countdown_tick.emit(self.countdown_remaining)

        if self.countdown_remaining <= 0:
            self.countdown_timer.stop()
            self.steam_should_close.emit()

    def cancel_countdown(self):
        """取消倒计时（例如用户获得了更多时间）"""
        self.countdown_timer.stop()
        self.countdown_remaining = 0
