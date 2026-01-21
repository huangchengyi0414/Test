#!/usr/bin/env python3
"""
FocusReward - 专注学习，赚取娱乐

一款帮助用户建立健康生产力习惯的桌面应用程序。
通过完成 Anki 学习任务来"赚取"Steam 游戏时间。

作者: FocusReward Team
版本: 1.0.0
"""

import sys
import os

# 确保可以导入 src 模块
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from PyQt5.QtWidgets import QApplication, QMessageBox
from PyQt5.QtCore import QTimer

from src.database import DatabaseManager
from src.process_monitor import ProcessMonitor
from src.anki_reader import AnkiReader
from src.time_manager import TimeManager
from src.notifications import NotificationManager
from src.main_window import MainWindow


class FocusRewardApp:
    """
    FocusReward 应用程序主类
    负责协调所有组件的运行
    """

    def __init__(self):
        """初始化应用程序"""
        # 创建 Qt 应用
        self.app = QApplication(sys.argv)
        self.app.setApplicationName("FocusReward")
        self.app.setQuitOnLastWindowClosed(False)  # 关闭窗口时不退出

        # 初始化组件
        self._init_components()

        # 连接信号
        self._connect_signals()

        # 加载设置和数据
        self._load_data()

        # 启动监控
        self._start_monitoring()

    def _init_components(self):
        """初始化所有组件"""
        # 数据库管理器
        self.db = DatabaseManager()

        # 进程监控器
        check_interval = int(self.db.get_setting('check_interval', '30'))
        self.process_monitor = ProcessMonitor(check_interval)

        # 设置会话记录回调
        self.process_monitor.on_session_start = self.db.start_session
        self.process_monitor.on_session_end = self.db.end_session

        # Anki 读取器
        anki_path = self.db.get_setting('anki_db_path', '')
        self.anki_reader = AnkiReader(anki_path if anki_path else None)

        # 时间管理器
        self.time_manager = TimeManager()

        # 主窗口
        self.main_window = MainWindow()

        # 通知管理器
        self.notification_manager = NotificationManager(self.app)

        # 数据保存定时器（每分钟保存一次）
        self.save_timer = QTimer()
        self.save_timer.timeout.connect(self._save_data)
        self.save_timer.start(60000)  # 60 秒

    def _connect_signals(self):
        """连接所有信号"""
        # 进程监控信号
        self.process_monitor.process_started.connect(self._on_process_started)
        self.process_monitor.process_stopped.connect(self._on_process_stopped)
        self.process_monitor.status_updated.connect(self._on_status_updated)

        # Anki 读取器信号
        self.anki_reader.cards_updated.connect(self._on_anki_cards_updated)
        self.anki_reader.error_occurred.connect(self._on_anki_error)

        # 时间管理器信号
        self.time_manager.time_updated.connect(self._on_time_updated)
        self.time_manager.warning_triggered.connect(self._on_time_warning)
        self.time_manager.time_expired.connect(self._on_time_expired)
        self.time_manager.countdown_tick.connect(self._on_countdown_tick)
        self.time_manager.steam_should_close.connect(self._on_steam_should_close)

        # 主窗口信号
        self.main_window.emergency_pause_requested.connect(self._on_emergency_pause)
        self.main_window.emergency_unlock_requested.connect(self._on_emergency_unlock)
        self.main_window.settings_changed.connect(self._on_settings_changed)
        self.main_window.reset_data_requested.connect(self._on_reset_data)
        self.main_window.anki_path_changed.connect(self._on_anki_path_changed)

        # 通知管理器信号
        self.notification_manager.show_window_requested.connect(self._show_main_window)
        self.notification_manager.quit_requested.connect(self._quit_app)

    def _load_data(self):
        """加载设置和数据"""
        # 加载设置到 UI
        settings = self.db.get_all_settings()
        self.main_window.set_settings(settings)

        # 加载兑换比例到时间管理器
        cards = int(settings.get('cards_per_exchange', '10'))
        minutes = int(settings.get('minutes_per_exchange', '5'))
        self.time_manager.set_exchange_rate(cards, minutes)

        # 加载今日数据
        today_record = self.db.get_today_record()
        self.time_manager.restore_state(
            anki_cards=today_record.get('anki_cards_reviewed', 0),
            steam_minutes=today_record.get('steam_minutes_used', 0),
            pause_used=today_record.get('emergency_pause_used', False),
            unlock_used=today_record.get('emergency_unlock_used', False)
        )

        # 加载 Steam 今日使用时长
        steam_seconds = self.db.get_today_app_duration('steam')
        self.process_monitor.set_today_duration('steam', steam_seconds)

        # 加载历史数据
        history = self.db.get_history(30)
        self.main_window.update_history(history)

        # 更新显示
        self._update_display()

    def _start_monitoring(self):
        """启动所有监控"""
        self.process_monitor.start()
        self.anki_reader.start()
        self.time_manager.start()

    def _save_data(self):
        """保存当前数据到数据库"""
        # 获取当前状态
        time_info = self.time_manager.get_time_info()
        steam_status = self.process_monitor.get_app_status('steam')

        # 更新数据库
        self.db.update_today_anki_cards(time_info['anki_cards'])
        self.db.update_today_steam_minutes(steam_status['today_minutes'])
        self.db.update_today_earned_minutes(time_info['earned_minutes'])

        if time_info.get('emergency_pause_available') is False:
            self.db.set_emergency_pause_used()
        if time_info.get('emergency_unlock_used'):
            self.db.set_emergency_unlock_used()

    def _update_display(self):
        """更新所有显示"""
        time_info = self.time_manager.get_time_info()
        settings = self.db.get_all_settings()
        target_cards = int(settings.get('cards_per_exchange', '10')) * 3  # 目标设为3倍兑换量

        self.main_window.update_time_display(time_info, target_cards)
        self.notification_manager.update_tooltip(time_info)

    # ===== 进程监控回调 =====

    def _on_process_started(self, app_name: str):
        """进程启动回调"""
        if app_name == 'steam':
            self.time_manager.set_steam_running(True)

    def _on_process_stopped(self, app_name: str):
        """进程停止回调"""
        if app_name == 'steam':
            self.time_manager.set_steam_running(False)
            # 保存 Steam 使用时间
            steam_status = self.process_monitor.get_app_status('steam')
            self.db.update_today_steam_minutes(steam_status['today_minutes'])

    def _on_status_updated(self, status: dict):
        """状态更新回调"""
        # 更新 Steam 使用时间
        steam_minutes = status['steam']['today_minutes']
        self.time_manager.update_steam_minutes(steam_minutes)

        # 更新 UI 中的应用状态
        for app_name, app_status in status.items():
            self.main_window.update_app_status(
                app_name,
                app_status['is_running'],
                app_status['today_minutes']
            )

    # ===== Anki 读取器回调 =====

    def _on_anki_cards_updated(self, cards: int):
        """Anki 卡片数更新回调"""
        old_cards = self.time_manager.anki_cards
        self.time_manager.update_anki_cards(cards)
        self.db.update_today_anki_cards(cards)

        # 如果卡片数增加，显示通知
        if cards > old_cards and cards % 10 == 0:
            time_info = self.time_manager.get_time_info()
            self.notification_manager.show_anki_cards_update(cards, time_info['earned_minutes'])

    def _on_anki_error(self, error_msg: str):
        """Anki 读取错误回调"""
        print(f"Anki Error: {error_msg}")

    # ===== 时间管理器回调 =====

    def _on_time_updated(self, time_info: dict):
        """时间更新回调"""
        self._update_display()

    def _on_time_warning(self, remaining_minutes: int):
        """时间警告回调"""
        self.notification_manager.show_time_warning(remaining_minutes)

    def _on_time_expired(self):
        """时间耗尽回调"""
        self.notification_manager.show_time_expired()

    def _on_countdown_tick(self, seconds: int):
        """倒计时回调"""
        self.notification_manager.show_countdown(seconds)

    def _on_steam_should_close(self):
        """Steam 应该被关闭回调"""
        if self.process_monitor.kill_process('steam'):
            self.notification_manager.show_steam_closed()

    # ===== 主窗口回调 =====

    def _on_emergency_pause(self):
        """紧急暂停回调"""
        if self.time_manager.use_emergency_pause(5):
            self.db.set_emergency_pause_used()
            self.notification_manager.show_pause_started(5)
            self._update_display()

    def _on_emergency_unlock(self):
        """紧急解锁回调"""
        if self.time_manager.use_emergency_unlock():
            self.db.set_emergency_unlock_used()
            self.notification_manager.show_unlock_activated()
            self._update_display()

    def _on_settings_changed(self, settings: dict):
        """设置变更回调"""
        for key, value in settings.items():
            self.db.set_setting(key, value)

        # 更新时间管理器的兑换比例
        cards = int(settings.get('cards_per_exchange', '10'))
        minutes = int(settings.get('minutes_per_exchange', '5'))
        self.time_manager.set_exchange_rate(cards, minutes)

        # 更新 Anki 路径
        anki_path = settings.get('anki_db_path', '')
        if anki_path:
            self.anki_reader.set_db_path(anki_path)
            self.anki_reader.refresh()

        self._update_display()

    def _on_reset_data(self):
        """重置数据回调"""
        self.db.reset_today_data()
        self.time_manager.reset_daily()
        self.process_monitor.reset_today_duration()
        self._update_display()

        # 刷新历史页面
        history = self.db.get_history(30)
        self.main_window.update_history(history)

    def _on_anki_path_changed(self, path: str):
        """Anki 路径变更回调"""
        self.anki_reader.set_db_path(path)
        self.anki_reader.refresh()

    # ===== 通知管理器回调 =====

    def _show_main_window(self):
        """显示主窗口"""
        self.main_window.show()
        self.main_window.activateWindow()
        self.main_window.raise_()

    def _quit_app(self):
        """退出应用"""
        # 保存数据
        self._save_data()

        # 停止所有监控
        self.process_monitor.stop()
        self.anki_reader.stop()
        self.time_manager.stop()
        self.save_timer.stop()

        # 隐藏托盘图标
        self.notification_manager.hide()

        # 退出应用
        self.app.quit()

    def run(self):
        """运行应用程序"""
        # 显示主窗口
        self.main_window.show()

        # 进入事件循环
        return self.app.exec_()


def main():
    """程序入口"""
    try:
        app = FocusRewardApp()
        sys.exit(app.run())
    except Exception as e:
        print(f"程序启动失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
