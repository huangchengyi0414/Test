"""
FocusReward 进程监控模块
负责监控 Anki 和 Steam 进程的运行状态和时长
"""

import psutil
import time
from datetime import datetime
from typing import Optional, Dict, Callable
from PyQt5.QtCore import QObject, QTimer, pyqtSignal


class ProcessMonitor(QObject):
    """
    进程监控器
    监控指定应用程序的运行状态，发出信号通知状态变化
    """

    # 信号定义
    process_started = pyqtSignal(str)  # 进程启动信号，参数为进程名
    process_stopped = pyqtSignal(str)  # 进程停止信号，参数为进程名
    status_updated = pyqtSignal(dict)  # 状态更新信号，参数为状态字典

    def __init__(self, check_interval: int = 30):
        """
        初始化进程监控器

        Args:
            check_interval: 检查间隔（秒），默认 30 秒
        """
        super().__init__()

        self.check_interval = check_interval * 1000  # 转换为毫秒

        # 要监控的进程列表
        self.monitored_processes = {
            'anki': {
                'exe_names': ['anki.exe', 'Anki.exe', 'anki'],
                'is_running': False,
                'start_time': None,
                'session_duration': 0,  # 当前会话时长（秒）
                'today_duration': 0,  # 今日总时长（秒）
            },
            'steam': {
                'exe_names': ['steam.exe', 'Steam.exe', 'steam'],
                'is_running': False,
                'start_time': None,
                'session_duration': 0,
                'today_duration': 0,
            }
        }

        # 定时器
        self.timer = QTimer()
        self.timer.timeout.connect(self._check_processes)

        # 回调函数
        self.on_session_start: Optional[Callable[[str], int]] = None
        self.on_session_end: Optional[Callable[[int], None]] = None

        # 会话 ID 映射
        self.session_ids: Dict[str, Optional[int]] = {
            'anki': None,
            'steam': None
        }

    def start(self):
        """开始监控"""
        self._check_processes()  # 立即检查一次
        self.timer.start(self.check_interval)

    def stop(self):
        """停止监控"""
        self.timer.stop()

    def set_check_interval(self, seconds: int):
        """
        设置检查间隔

        Args:
            seconds: 间隔秒数
        """
        self.check_interval = seconds * 1000
        if self.timer.isActive():
            self.timer.stop()
            self.timer.start(self.check_interval)

    def _is_process_running(self, exe_names: list) -> bool:
        """
        检查进程是否正在运行

        Args:
            exe_names: 可能的可执行文件名列表

        Returns:
            是否正在运行
        """
        try:
            for proc in psutil.process_iter(['name']):
                try:
                    proc_name = proc.info['name']
                    if proc_name and proc_name.lower() in [name.lower() for name in exe_names]:
                        return True
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    continue
        except Exception:
            pass
        return False

    def _check_processes(self):
        """检查所有监控的进程状态"""
        current_time = datetime.now()

        for app_name, info in self.monitored_processes.items():
            was_running = info['is_running']
            is_running = self._is_process_running(info['exe_names'])

            if is_running and not was_running:
                # 进程刚启动
                info['is_running'] = True
                info['start_time'] = current_time
                info['session_duration'] = 0

                # 创建会话记录
                if self.on_session_start:
                    self.session_ids[app_name] = self.on_session_start(app_name)

                self.process_started.emit(app_name)

            elif not is_running and was_running:
                # 进程刚停止
                if info['start_time']:
                    session_duration = int((current_time - info['start_time']).total_seconds())
                    info['today_duration'] += session_duration

                info['is_running'] = False
                info['start_time'] = None
                info['session_duration'] = 0

                # 结束会话记录
                if self.on_session_end and self.session_ids[app_name]:
                    self.on_session_end(self.session_ids[app_name])
                    self.session_ids[app_name] = None

                self.process_stopped.emit(app_name)

            elif is_running and was_running:
                # 进程持续运行中，更新时长
                if info['start_time']:
                    info['session_duration'] = int((current_time - info['start_time']).total_seconds())

        # 发出状态更新信号
        self.status_updated.emit(self.get_status())

    def get_status(self) -> dict:
        """
        获取当前所有进程的状态

        Returns:
            状态字典
        """
        status = {}
        for app_name, info in self.monitored_processes.items():
            total_seconds = info['today_duration'] + info['session_duration']
            status[app_name] = {
                'is_running': info['is_running'],
                'session_duration': info['session_duration'],
                'today_duration': total_seconds,
                'today_minutes': total_seconds // 60,
            }
        return status

    def get_app_status(self, app_name: str) -> dict:
        """
        获取指定应用程序的状态

        Args:
            app_name: 应用程序名称 ('anki' 或 'steam')

        Returns:
            状态字典
        """
        info = self.monitored_processes.get(app_name)
        if not info:
            return {'is_running': False, 'session_duration': 0, 'today_duration': 0, 'today_minutes': 0}

        total_seconds = info['today_duration'] + info['session_duration']
        return {
            'is_running': info['is_running'],
            'session_duration': info['session_duration'],
            'today_duration': total_seconds,
            'today_minutes': total_seconds // 60,
        }

    def set_today_duration(self, app_name: str, seconds: int):
        """
        设置今日累计时长（用于从数据库恢复数据）

        Args:
            app_name: 应用程序名称
            seconds: 秒数
        """
        if app_name in self.monitored_processes:
            self.monitored_processes[app_name]['today_duration'] = seconds

    def reset_today_duration(self, app_name: str = None):
        """
        重置今日时长

        Args:
            app_name: 应用程序名称，如果为 None 则重置所有
        """
        if app_name:
            if app_name in self.monitored_processes:
                self.monitored_processes[app_name]['today_duration'] = 0
        else:
            for info in self.monitored_processes.values():
                info['today_duration'] = 0

    def kill_process(self, app_name: str) -> bool:
        """
        强制关闭指定应用程序

        Args:
            app_name: 应用程序名称

        Returns:
            是否成功关闭
        """
        info = self.monitored_processes.get(app_name)
        if not info:
            return False

        killed = False
        try:
            for proc in psutil.process_iter(['name', 'pid']):
                try:
                    proc_name = proc.info['name']
                    if proc_name and proc_name.lower() in [name.lower() for name in info['exe_names']]:
                        proc.terminate()  # 先尝试正常终止
                        try:
                            proc.wait(timeout=3)  # 等待 3 秒
                        except psutil.TimeoutExpired:
                            proc.kill()  # 强制杀死
                        killed = True
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    continue
        except Exception as e:
            print(f"Error killing process {app_name}: {e}")

        return killed

    def is_steam_running(self) -> bool:
        """检查 Steam 是否正在运行"""
        return self.monitored_processes['steam']['is_running']

    def is_anki_running(self) -> bool:
        """检查 Anki 是否正在运行"""
        return self.monitored_processes['anki']['is_running']

    def get_steam_today_minutes(self) -> int:
        """获取今日 Steam 使用分钟数"""
        info = self.monitored_processes['steam']
        total_seconds = info['today_duration'] + info['session_duration']
        return total_seconds // 60

    def get_anki_today_minutes(self) -> int:
        """获取今日 Anki 使用分钟数"""
        info = self.monitored_processes['anki']
        total_seconds = info['today_duration'] + info['session_duration']
        return total_seconds // 60
