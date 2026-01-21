"""
FocusReward 通知系统模块
负责显示 Windows 系统通知
"""

import sys
from typing import Optional
from PyQt5.QtWidgets import QSystemTrayIcon, QMenu, QAction, QApplication
from PyQt5.QtGui import QIcon
from PyQt5.QtCore import QObject, pyqtSignal


class NotificationManager(QObject):
    """
    通知管理器
    使用系统托盘图标显示通知
    """

    # 信号定义
    tray_activated = pyqtSignal()  # 托盘图标被点击
    show_window_requested = pyqtSignal()  # 请求显示主窗口
    quit_requested = pyqtSignal()  # 请求退出应用

    def __init__(self, app: QApplication, icon_path: str = None):
        """
        初始化通知管理器

        Args:
            app: QApplication 实例
            icon_path: 图标文件路径
        """
        super().__init__()

        self.app = app
        self.tray_icon: Optional[QSystemTrayIcon] = None
        self.icon_path = icon_path

        self._setup_tray_icon()

    def _setup_tray_icon(self):
        """设置系统托盘图标"""
        if not QSystemTrayIcon.isSystemTrayAvailable():
            print("系统托盘不可用")
            return

        self.tray_icon = QSystemTrayIcon(self.app)

        # 设置图标
        if self.icon_path:
            icon = QIcon(self.icon_path)
        else:
            # 使用默认图标
            icon = self.app.style().standardIcon(
                self.app.style().SP_ComputerIcon
            )
        self.tray_icon.setIcon(icon)
        self.tray_icon.setToolTip("FocusReward - 专注学习，赚取娱乐")

        # 创建右键菜单
        menu = QMenu()

        show_action = QAction("显示主窗口", self.app)
        show_action.triggered.connect(self._on_show_window)
        menu.addAction(show_action)

        menu.addSeparator()

        quit_action = QAction("退出", self.app)
        quit_action.triggered.connect(self._on_quit)
        menu.addAction(quit_action)

        self.tray_icon.setContextMenu(menu)

        # 连接点击事件
        self.tray_icon.activated.connect(self._on_tray_activated)

        self.tray_icon.show()

    def _on_tray_activated(self, reason):
        """托盘图标被激活"""
        if reason == QSystemTrayIcon.Trigger:  # 单击
            self.show_window_requested.emit()
        elif reason == QSystemTrayIcon.DoubleClick:  # 双击
            self.show_window_requested.emit()

    def _on_show_window(self):
        """请求显示窗口"""
        self.show_window_requested.emit()

    def _on_quit(self):
        """请求退出"""
        self.quit_requested.emit()

    def show_notification(self, title: str, message: str,
                         icon_type: str = 'info', duration: int = 5000):
        """
        显示系统通知

        Args:
            title: 通知标题
            message: 通知内容
            icon_type: 图标类型 ('info', 'warning', 'critical')
            duration: 显示时长（毫秒）
        """
        if not self.tray_icon:
            return

        icon_map = {
            'info': QSystemTrayIcon.Information,
            'warning': QSystemTrayIcon.Warning,
            'critical': QSystemTrayIcon.Critical,
        }
        icon = icon_map.get(icon_type, QSystemTrayIcon.Information)

        self.tray_icon.showMessage(title, message, icon, duration)

    def show_time_warning(self, remaining_minutes: int):
        """
        显示时间警告通知

        Args:
            remaining_minutes: 剩余分钟数
        """
        self.show_notification(
            "FocusReward - 时间提醒",
            f"游戏时间即将用尽！剩余 {remaining_minutes} 分钟。\n"
            "请保存游戏进度，或复习更多卡片获取更多时间。",
            'warning',
            10000
        )

    def show_time_expired(self):
        """显示时间耗尽通知"""
        self.show_notification(
            "FocusReward - 时间用尽",
            "游戏时间已用完！Steam 将在 10 秒后关闭。\n"
            "复习更多卡片可获取更多游戏时间。",
            'critical',
            10000
        )

    def show_countdown(self, seconds: int):
        """
        显示关闭倒计时

        Args:
            seconds: 剩余秒数
        """
        if seconds > 0 and seconds % 5 == 0:  # 每 5 秒显示一次
            self.show_notification(
                "FocusReward - 即将关闭",
                f"Steam 将在 {seconds} 秒后关闭...",
                'critical',
                3000
            )

    def show_steam_closed(self):
        """显示 Steam 已关闭通知"""
        self.show_notification(
            "FocusReward",
            "Steam 已关闭。复习更多卡片可获取更多游戏时间！",
            'info',
            5000
        )

    def show_pause_started(self, minutes: int):
        """
        显示暂停开始通知

        Args:
            minutes: 暂停分钟数
        """
        self.show_notification(
            "FocusReward - 紧急暂停",
            f"已启用紧急暂停，您有额外 {minutes} 分钟时间。\n"
            "今日紧急暂停机会已用完。",
            'info',
            5000
        )

    def show_unlock_activated(self):
        """显示解锁激活通知"""
        self.show_notification(
            "FocusReward - 今日解锁",
            "已解除今日的时间限制。\n"
            "此操作已被记录。",
            'warning',
            5000
        )

    def show_anki_cards_update(self, cards: int, earned_minutes: int):
        """
        显示 Anki 卡片更新通知

        Args:
            cards: 当前卡片数
            earned_minutes: 已赚取的分钟数
        """
        self.show_notification(
            "FocusReward - 学习进度更新",
            f"今日已复习 {cards} 张卡片\n"
            f"已赚取 {earned_minutes} 分钟游戏时间！",
            'info',
            3000
        )

    def update_tooltip(self, info: dict):
        """
        更新托盘图标提示文字

        Args:
            info: 时间信息字典
        """
        if not self.tray_icon:
            return

        tooltip = (
            f"FocusReward\n"
            f"今日复习: {info.get('anki_cards', 0)} 张卡片\n"
            f"已赚取: {info.get('earned_minutes', 0)} 分钟\n"
            f"剩余: {info.get('remaining_minutes', 0)} 分钟"
        )
        self.tray_icon.setToolTip(tooltip)

    def hide(self):
        """隐藏托盘图标"""
        if self.tray_icon:
            self.tray_icon.hide()

    def show(self):
        """显示托盘图标"""
        if self.tray_icon:
            self.tray_icon.show()
