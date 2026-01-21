"""
FocusReward 主窗口模块
包含仪表盘、设置和历史三个主要页面
"""

import os
from datetime import date, timedelta
from PyQt5.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QPushButton, QProgressBar, QTabWidget, QSlider, QCheckBox,
    QFileDialog, QLineEdit, QMessageBox, QFrame, QGridLayout,
    QTableWidget, QTableWidgetItem, QHeaderView, QSpacerItem,
    QSizePolicy, QGroupBox, QComboBox
)
from PyQt5.QtCore import Qt, pyqtSignal
from PyQt5.QtGui import QFont, QPalette, QColor

# 尝试导入 matplotlib
try:
    from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
    from matplotlib.figure import Figure
    import matplotlib.pyplot as plt
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False


class StatusIndicator(QWidget):
    """状态指示器组件"""

    def __init__(self, label: str, parent=None):
        super().__init__(parent)
        self.label = label
        self._is_running = False
        self._duration_text = ""
        self._setup_ui()

    def _setup_ui(self):
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)

        # 状态圆点
        self.dot = QLabel("●")
        self.dot.setStyleSheet("color: #888888; font-size: 16px;")
        layout.addWidget(self.dot)

        # 标签
        self.label_widget = QLabel(self.label)
        self.label_widget.setStyleSheet("font-size: 14px;")
        layout.addWidget(self.label_widget)

        # 时长
        self.duration_label = QLabel("")
        self.duration_label.setStyleSheet("color: #666666; font-size: 12px;")
        layout.addWidget(self.duration_label)

        layout.addStretch()

    def set_running(self, is_running: bool, duration_text: str = "", game_name: str = ""):
        self._is_running = is_running
        self._duration_text = duration_text

        if is_running:
            self.dot.setStyleSheet("color: #22c55e; font-size: 16px;")  # 绿色
            if game_name:
                # 显示游戏名（截断过长的名称）
                display_name = game_name[:20] + "..." if len(game_name) > 20 else game_name
                self.label_widget.setText(f"{self.label}: {display_name}")
            else:
                self.label_widget.setText(f"{self.label}: 运行中")
        else:
            self.dot.setStyleSheet("color: #888888; font-size: 16px;")  # 灰色
            self.label_widget.setText(f"{self.label}: 未运行")

        self.duration_label.setText(duration_text)


class DashboardPage(QWidget):
    """仪表盘页面"""

    emergency_pause_clicked = pyqtSignal()
    emergency_unlock_clicked = pyqtSignal()

    def __init__(self, parent=None):
        super().__init__(parent)
        self._setup_ui()

    def _setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setSpacing(20)
        layout.setContentsMargins(20, 20, 20, 20)

        # ===== 学习进度区域 =====
        study_group = QGroupBox("今日学习进度")
        study_group.setStyleSheet("""
            QGroupBox {
                font-size: 16px;
                font-weight: bold;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                margin-top: 10px;
                padding-top: 10px;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 15px;
                padding: 0 5px;
            }
        """)
        study_layout = QVBoxLayout(study_group)

        # Anki 卡片数显示
        self.cards_label = QLabel("0 / 0 张卡片")
        self.cards_label.setStyleSheet("font-size: 24px; font-weight: bold; color: #3b82f6;")
        self.cards_label.setAlignment(Qt.AlignCenter)
        study_layout.addWidget(self.cards_label)

        # 学习进度条
        self.study_progress = QProgressBar()
        self.study_progress.setMinimum(0)
        self.study_progress.setMaximum(100)
        self.study_progress.setValue(0)
        self.study_progress.setStyleSheet("""
            QProgressBar {
                border: 2px solid #e0e0e0;
                border-radius: 5px;
                text-align: center;
                height: 25px;
            }
            QProgressBar::chunk {
                background-color: #3b82f6;
                border-radius: 3px;
            }
        """)
        study_layout.addWidget(self.study_progress)

        layout.addWidget(study_group)

        # ===== 游戏时间区域 =====
        game_group = QGroupBox("可用游戏时间")
        game_group.setStyleSheet("""
            QGroupBox {
                font-size: 16px;
                font-weight: bold;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                margin-top: 10px;
                padding-top: 10px;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 15px;
                padding: 0 5px;
            }
        """)
        game_layout = QVBoxLayout(game_group)

        # 时间显示网格
        time_grid = QGridLayout()

        # 已赚取
        earned_label = QLabel("已赚取")
        earned_label.setStyleSheet("color: #666666;")
        earned_label.setAlignment(Qt.AlignCenter)
        time_grid.addWidget(earned_label, 0, 0)

        self.earned_value = QLabel("0")
        self.earned_value.setStyleSheet("font-size: 28px; font-weight: bold; color: #22c55e;")
        self.earned_value.setAlignment(Qt.AlignCenter)
        time_grid.addWidget(self.earned_value, 1, 0)

        earned_unit = QLabel("分钟")
        earned_unit.setStyleSheet("color: #666666;")
        earned_unit.setAlignment(Qt.AlignCenter)
        time_grid.addWidget(earned_unit, 2, 0)

        # 已使用
        used_label = QLabel("已使用")
        used_label.setStyleSheet("color: #666666;")
        used_label.setAlignment(Qt.AlignCenter)
        time_grid.addWidget(used_label, 0, 1)

        self.used_value = QLabel("0")
        self.used_value.setStyleSheet("font-size: 28px; font-weight: bold; color: #f59e0b;")
        self.used_value.setAlignment(Qt.AlignCenter)
        time_grid.addWidget(self.used_value, 1, 1)

        used_unit = QLabel("分钟")
        used_unit.setStyleSheet("color: #666666;")
        used_unit.setAlignment(Qt.AlignCenter)
        time_grid.addWidget(used_unit, 2, 1)

        # 剩余
        remaining_label = QLabel("剩余")
        remaining_label.setStyleSheet("color: #666666;")
        remaining_label.setAlignment(Qt.AlignCenter)
        time_grid.addWidget(remaining_label, 0, 2)

        self.remaining_value = QLabel("0")
        self.remaining_value.setStyleSheet("font-size: 28px; font-weight: bold; color: #22c55e;")
        self.remaining_value.setAlignment(Qt.AlignCenter)
        time_grid.addWidget(self.remaining_value, 1, 2)

        remaining_unit = QLabel("分钟")
        remaining_unit.setStyleSheet("color: #666666;")
        remaining_unit.setAlignment(Qt.AlignCenter)
        time_grid.addWidget(remaining_unit, 2, 2)

        game_layout.addLayout(time_grid)

        # 游戏时间进度条
        self.game_progress = QProgressBar()
        self.game_progress.setMinimum(0)
        self.game_progress.setMaximum(100)
        self.game_progress.setValue(0)
        self.game_progress.setStyleSheet("""
            QProgressBar {
                border: 2px solid #e0e0e0;
                border-radius: 5px;
                text-align: center;
                height: 25px;
            }
            QProgressBar::chunk {
                background-color: #22c55e;
                border-radius: 3px;
            }
        """)
        game_layout.addWidget(self.game_progress)

        layout.addWidget(game_group)

        # ===== 应用程序状态区域 =====
        status_group = QGroupBox("应用程序状态")
        status_group.setStyleSheet("""
            QGroupBox {
                font-size: 14px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                margin-top: 10px;
                padding-top: 10px;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 15px;
                padding: 0 5px;
            }
        """)
        status_layout = QVBoxLayout(status_group)

        self.anki_status = StatusIndicator("Anki")
        status_layout.addWidget(self.anki_status)

        self.steam_status = StatusIndicator("Steam")
        status_layout.addWidget(self.steam_status)

        layout.addWidget(status_group)

        # ===== 紧急操作按钮 =====
        button_layout = QHBoxLayout()

        self.pause_button = QPushButton("紧急暂停 5 分钟")
        self.pause_button.setStyleSheet("""
            QPushButton {
                background-color: #f59e0b;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #d97706;
            }
            QPushButton:disabled {
                background-color: #cccccc;
            }
        """)
        self.pause_button.clicked.connect(self.emergency_pause_clicked.emit)
        button_layout.addWidget(self.pause_button)

        self.unlock_button = QPushButton("今日解除限制")
        self.unlock_button.setStyleSheet("""
            QPushButton {
                background-color: #ef4444;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #dc2626;
            }
            QPushButton:disabled {
                background-color: #cccccc;
            }
        """)
        self.unlock_button.clicked.connect(self._on_unlock_clicked)
        button_layout.addWidget(self.unlock_button)

        layout.addLayout(button_layout)

        # 弹簧
        layout.addStretch()

    def _on_unlock_clicked(self):
        """解锁按钮点击处理"""
        reply = QMessageBox.warning(
            self,
            "确认解除限制",
            "确定要解除今日的时间限制吗？\n\n"
            "此操作将被记录在历史中。",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        if reply == QMessageBox.Yes:
            self.emergency_unlock_clicked.emit()

    def update_display(self, time_info: dict, anki_cards_target: int = 30):
        """更新显示内容"""
        cards = time_info.get('anki_cards', 0)
        earned = time_info.get('earned_minutes', 0)
        used = time_info.get('used_minutes', 0)
        remaining = time_info.get('remaining_minutes', 0)
        is_warning = time_info.get('is_warning', False)
        is_time_up = time_info.get('is_time_up', False)
        pause_available = time_info.get('emergency_pause_available', True)
        unlock_used = time_info.get('emergency_unlock_used', False)

        # 更新卡片数
        self.cards_label.setText(f"{cards} 张卡片已复习")

        # 更新学习进度条
        if anki_cards_target > 0:
            study_progress = min(100, int((cards / anki_cards_target) * 100))
        else:
            study_progress = 0
        self.study_progress.setValue(study_progress)

        # 更新时间显示
        self.earned_value.setText(str(earned))
        self.used_value.setText(str(used))

        if unlock_used:
            self.remaining_value.setText("∞")
            self.remaining_value.setStyleSheet("font-size: 28px; font-weight: bold; color: #22c55e;")
        else:
            self.remaining_value.setText(str(remaining))
            if is_time_up:
                self.remaining_value.setStyleSheet("font-size: 28px; font-weight: bold; color: #ef4444;")
            elif is_warning:
                self.remaining_value.setStyleSheet("font-size: 28px; font-weight: bold; color: #f59e0b;")
            else:
                self.remaining_value.setStyleSheet("font-size: 28px; font-weight: bold; color: #22c55e;")

        # 更新游戏进度条
        progress = time_info.get('progress_percent', 0)
        self.game_progress.setValue(int(progress))

        # 根据状态更新进度条颜色
        if is_time_up:
            self.game_progress.setStyleSheet("""
                QProgressBar {
                    border: 2px solid #e0e0e0;
                    border-radius: 5px;
                    text-align: center;
                    height: 25px;
                }
                QProgressBar::chunk {
                    background-color: #ef4444;
                    border-radius: 3px;
                }
            """)
        elif is_warning:
            self.game_progress.setStyleSheet("""
                QProgressBar {
                    border: 2px solid #e0e0e0;
                    border-radius: 5px;
                    text-align: center;
                    height: 25px;
                }
                QProgressBar::chunk {
                    background-color: #f59e0b;
                    border-radius: 3px;
                }
            """)
        else:
            self.game_progress.setStyleSheet("""
                QProgressBar {
                    border: 2px solid #e0e0e0;
                    border-radius: 5px;
                    text-align: center;
                    height: 25px;
                }
                QProgressBar::chunk {
                    background-color: #22c55e;
                    border-radius: 3px;
                }
            """)

        # 更新按钮状态
        self.pause_button.setEnabled(pause_available and not unlock_used)
        self.unlock_button.setEnabled(not unlock_used)

        if not pause_available:
            self.pause_button.setText("已使用")
        if unlock_used:
            self.unlock_button.setText("已解锁")

    def update_app_status(self, app_name: str, is_running: bool, duration_text: str, game_name: str = ""):
        """更新应用程序状态显示"""
        if app_name == 'anki':
            self.anki_status.set_running(is_running, duration_text)
        elif app_name == 'steam':
            self.steam_status.set_running(is_running, duration_text, game_name)


class SettingsPage(QWidget):
    """设置页面"""

    settings_changed = pyqtSignal(dict)
    reset_data_clicked = pyqtSignal()
    anki_profile_changed = pyqtSignal(str)

    # Anki 数据库的默认位置
    ANKI_BASE_PATHS = [
        os.path.expandvars('%APPDATA%\\Anki2'),  # Windows
        os.path.expanduser('~/Library/Application Support/Anki2'),  # macOS
        os.path.expanduser('~/.local/share/Anki2'),  # Linux
    ]

    def __init__(self, parent=None):
        super().__init__(parent)
        self._anki_profiles = {}  # {显示名称: 路径}
        self._setup_ui()
        self._scan_anki_profiles()

    def _scan_anki_profiles(self):
        """扫描系统中的 Anki 配置文件"""
        self._anki_profiles = {}
        self.profile_combo.clear()

        for base_path in self.ANKI_BASE_PATHS:
            if os.path.exists(base_path):
                try:
                    for profile_name in os.listdir(base_path):
                        profile_path = os.path.join(base_path, profile_name)
                        if os.path.isdir(profile_path) and profile_name != 'addons21':
                            db_file = os.path.join(profile_path, 'collection.anki2')
                            if os.path.exists(db_file):
                                # 显示名称包含配置文件名
                                display_name = f"{profile_name}"
                                self._anki_profiles[display_name] = db_file
                except PermissionError:
                    continue

        # 添加到下拉选单
        if self._anki_profiles:
            for display_name in self._anki_profiles.keys():
                self.profile_combo.addItem(display_name)
            self.profile_status.setText(f"找到 {len(self._anki_profiles)} 个配置文件")
            self.profile_status.setStyleSheet("color: #22c55e;")
        else:
            self.profile_combo.addItem("未找到 Anki 配置文件")
            self.profile_status.setText("请确认 Anki 已安装并至少运行过一次")
            self.profile_status.setStyleSheet("color: #ef4444;")

    def _setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setSpacing(20)
        layout.setContentsMargins(20, 20, 20, 20)

        # ===== Anki 配置文件选择 =====
        path_group = QGroupBox("Anki 配置文件")
        path_group.setStyleSheet("""
            QGroupBox {
                font-size: 14px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                margin-top: 10px;
                padding-top: 10px;
            }
        """)
        path_layout = QVBoxLayout(path_group)

        # 下拉选单
        combo_layout = QHBoxLayout()
        combo_layout.addWidget(QLabel("选择配置文件:"))
        self.profile_combo = QComboBox()
        self.profile_combo.setMinimumWidth(200)
        self.profile_combo.setStyleSheet("""
            QComboBox {
                padding: 8px;
                border: 1px solid #d0d0d0;
                border-radius: 4px;
                font-size: 14px;
            }
            QComboBox:hover {
                border-color: #3b82f6;
            }
            QComboBox::drop-down {
                border: none;
                width: 30px;
            }
        """)
        self.profile_combo.currentIndexChanged.connect(self._on_profile_changed)
        combo_layout.addWidget(self.profile_combo, 1)

        # 刷新按钮
        refresh_btn = QPushButton("刷新")
        refresh_btn.setStyleSheet("""
            QPushButton {
                padding: 8px 16px;
                border: 1px solid #d0d0d0;
                border-radius: 4px;
            }
            QPushButton:hover {
                background-color: #f0f0f0;
            }
        """)
        refresh_btn.clicked.connect(self._scan_anki_profiles)
        combo_layout.addWidget(refresh_btn)
        path_layout.addLayout(combo_layout)

        # 状态提示
        self.profile_status = QLabel("")
        self.profile_status.setStyleSheet("color: #666666; font-size: 12px;")
        path_layout.addWidget(self.profile_status)

        # 显示当前路径
        self.path_display = QLabel("")
        self.path_display.setStyleSheet("color: #888888; font-size: 11px;")
        self.path_display.setWordWrap(True)
        path_layout.addWidget(self.path_display)

        layout.addWidget(path_group)

        # ===== 兑换比例设置 =====
        exchange_group = QGroupBox("兑换比例设置")
        exchange_group.setStyleSheet("""
            QGroupBox {
                font-size: 14px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                margin-top: 10px;
                padding-top: 10px;
            }
        """)
        exchange_layout = QVBoxLayout(exchange_group)

        # 当前比例显示
        self.ratio_label = QLabel("复习 10 张卡片 = 5 分钟游戏时间")
        self.ratio_label.setStyleSheet("font-size: 16px; font-weight: bold; color: #3b82f6;")
        self.ratio_label.setAlignment(Qt.AlignCenter)
        exchange_layout.addWidget(self.ratio_label)

        # 卡片数滑块
        cards_layout = QHBoxLayout()
        cards_layout.addWidget(QLabel("卡片数:"))
        self.cards_slider = QSlider(Qt.Horizontal)
        self.cards_slider.setMinimum(1)
        self.cards_slider.setMaximum(100)
        self.cards_slider.setValue(10)
        self.cards_slider.valueChanged.connect(self._on_slider_changed)
        cards_layout.addWidget(self.cards_slider)
        self.cards_value_label = QLabel("10")
        self.cards_value_label.setMinimumWidth(30)
        cards_layout.addWidget(self.cards_value_label)
        exchange_layout.addLayout(cards_layout)

        # 分钟数滑块
        minutes_layout = QHBoxLayout()
        minutes_layout.addWidget(QLabel("分钟数:"))
        self.minutes_slider = QSlider(Qt.Horizontal)
        self.minutes_slider.setMinimum(1)
        self.minutes_slider.setMaximum(60)
        self.minutes_slider.setValue(5)
        self.minutes_slider.valueChanged.connect(self._on_slider_changed)
        minutes_layout.addWidget(self.minutes_slider)
        self.minutes_value_label = QLabel("5")
        self.minutes_value_label.setMinimumWidth(30)
        minutes_layout.addWidget(self.minutes_value_label)
        exchange_layout.addLayout(minutes_layout)

        layout.addWidget(exchange_group)

        # ===== 其他设置 =====
        other_group = QGroupBox("其他设置")
        other_group.setStyleSheet("""
            QGroupBox {
                font-size: 14px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                margin-top: 10px;
                padding-top: 10px;
            }
        """)
        other_layout = QVBoxLayout(other_group)

        # 语言选择
        lang_layout = QHBoxLayout()
        lang_layout.addWidget(QLabel("界面语言:"))
        self.language_combo = QComboBox()
        self.language_combo.addItems(['简体中文', '繁體中文', 'English', '日本語', '한국어'])
        self.language_combo.setStyleSheet("""
            QComboBox {
                padding: 5px 10px;
                border: 1px solid #d0d0d0;
                border-radius: 4px;
            }
        """)
        lang_layout.addWidget(self.language_combo)
        lang_layout.addWidget(QLabel("(重启后生效)"))
        lang_layout.addStretch()
        other_layout.addLayout(lang_layout)

        self.auto_start_checkbox = QCheckBox("开机自动启动")
        other_layout.addWidget(self.auto_start_checkbox)

        self.minimize_to_tray_checkbox = QCheckBox("关闭时最小化到托盘")
        self.minimize_to_tray_checkbox.setChecked(True)
        other_layout.addWidget(self.minimize_to_tray_checkbox)

        layout.addWidget(other_group)

        # ===== 保存和重置按钮 =====
        button_layout = QHBoxLayout()

        save_btn = QPushButton("保存设置")
        save_btn.setStyleSheet("""
            QPushButton {
                background-color: #3b82f6;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #2563eb;
            }
        """)
        save_btn.clicked.connect(self._on_save_clicked)
        button_layout.addWidget(save_btn)

        reset_btn = QPushButton("重置今日数据")
        reset_btn.setStyleSheet("""
            QPushButton {
                background-color: #ef4444;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #dc2626;
            }
        """)
        reset_btn.clicked.connect(self._on_reset_clicked)
        button_layout.addWidget(reset_btn)

        layout.addLayout(button_layout)

        # 弹簧
        layout.addStretch()

    def _on_slider_changed(self):
        """滑块值变化处理"""
        cards = self.cards_slider.value()
        minutes = self.minutes_slider.value()
        self.cards_value_label.setText(str(cards))
        self.minutes_value_label.setText(str(minutes))
        self.ratio_label.setText(f"复习 {cards} 张卡片 = {minutes} 分钟游戏时间")

    def _on_profile_changed(self, index):
        """配置文件选择变化处理"""
        profile_name = self.profile_combo.currentText()
        if profile_name in self._anki_profiles:
            path = self._anki_profiles[profile_name]
            self.path_display.setText(f"路径: {path}")
            self.anki_profile_changed.emit(path)
        else:
            self.path_display.setText("")

    def _on_save_clicked(self):
        """保存按钮点击处理"""
        # 语言代码映射
        lang_codes = {
            '简体中文': 'zh_CN',
            '繁體中文': 'zh_TW',
            'English': 'en',
            '日本語': 'ja',
            '한국어': 'ko',
        }
        selected_lang = self.language_combo.currentText()

        settings = {
            'anki_db_path': self.get_anki_path(),
            'cards_per_exchange': str(self.cards_slider.value()),
            'minutes_per_exchange': str(self.minutes_slider.value()),
            'auto_start': 'true' if self.auto_start_checkbox.isChecked() else 'false',
            'language': lang_codes.get(selected_lang, 'zh_CN'),
        }
        self.settings_changed.emit(settings)
        QMessageBox.information(self, "保存成功", "设置已保存！\n语言变更将在重启后生效。")

    def _on_reset_clicked(self):
        """重置按钮点击处理"""
        reply = QMessageBox.warning(
            self,
            "确认重置",
            "确定要重置今日的所有数据吗？\n\n"
            "这将清除今日的学习记录和游戏时间统计。",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        if reply == QMessageBox.Yes:
            self.reset_data_clicked.emit()

    def set_settings(self, settings: dict):
        """设置当前值"""
        # 设置 Anki 配置文件选择
        saved_path = settings.get('anki_db_path', '')
        if saved_path:
            # 查找匹配的配置文件
            for display_name, path in self._anki_profiles.items():
                if path == saved_path:
                    index = self.profile_combo.findText(display_name)
                    if index >= 0:
                        self.profile_combo.setCurrentIndex(index)
                    break
            self.path_display.setText(f"路径: {saved_path}")

        self.cards_slider.setValue(int(settings.get('cards_per_exchange', '10')))
        self.minutes_slider.setValue(int(settings.get('minutes_per_exchange', '5')))
        self.auto_start_checkbox.setChecked(settings.get('auto_start', 'false') == 'true')
        self._on_slider_changed()

        # 设置语言选择
        lang_names = {
            'zh_CN': '简体中文',
            'zh_TW': '繁體中文',
            'en': 'English',
            'ja': '日本語',
            'ko': '한국어',
        }
        saved_lang = settings.get('language', 'zh_CN')
        lang_name = lang_names.get(saved_lang, '简体中文')
        index = self.language_combo.findText(lang_name)
        if index >= 0:
            self.language_combo.setCurrentIndex(index)

    def get_anki_path(self) -> str:
        """获取当前选择的 Anki 数据库路径"""
        profile_name = self.profile_combo.currentText()
        return self._anki_profiles.get(profile_name, '')


class HistoryPage(QWidget):
    """历史页面"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self._setup_ui()

    def _setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setSpacing(20)
        layout.setContentsMargins(20, 20, 20, 20)

        # ===== 图表区域 =====
        if MATPLOTLIB_AVAILABLE:
            chart_group = QGroupBox("过去 7 天统计")
            chart_group.setStyleSheet("""
                QGroupBox {
                    font-size: 14px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    margin-top: 10px;
                    padding-top: 10px;
                }
            """)
            chart_layout = QVBoxLayout(chart_group)

            # 创建 matplotlib 图表
            self.figure = Figure(figsize=(8, 4), dpi=100)
            self.canvas = FigureCanvas(self.figure)
            chart_layout.addWidget(self.canvas)

            layout.addWidget(chart_group)
        else:
            no_chart_label = QLabel("图表功能需要安装 matplotlib 库")
            no_chart_label.setStyleSheet("color: #666666; font-style: italic;")
            no_chart_label.setAlignment(Qt.AlignCenter)
            layout.addWidget(no_chart_label)

        # ===== 统计摘要 =====
        summary_group = QGroupBox("7 日统计摘要")
        summary_group.setStyleSheet("""
            QGroupBox {
                font-size: 14px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                margin-top: 10px;
                padding-top: 10px;
            }
        """)
        summary_layout = QHBoxLayout(summary_group)

        # 总复习卡片数
        cards_frame = QFrame()
        cards_frame_layout = QVBoxLayout(cards_frame)
        cards_title = QLabel("总复习卡片数")
        cards_title.setAlignment(Qt.AlignCenter)
        cards_frame_layout.addWidget(cards_title)
        self.total_cards_label = QLabel("0")
        self.total_cards_label.setStyleSheet("font-size: 24px; font-weight: bold; color: #3b82f6;")
        self.total_cards_label.setAlignment(Qt.AlignCenter)
        cards_frame_layout.addWidget(self.total_cards_label)
        summary_layout.addWidget(cards_frame)

        # 总游戏时间
        game_frame = QFrame()
        game_frame_layout = QVBoxLayout(game_frame)
        game_title = QLabel("总游戏分钟数")
        game_title.setAlignment(Qt.AlignCenter)
        game_frame_layout.addWidget(game_title)
        self.total_game_label = QLabel("0")
        self.total_game_label.setStyleSheet("font-size: 24px; font-weight: bold; color: #22c55e;")
        self.total_game_label.setAlignment(Qt.AlignCenter)
        game_frame_layout.addWidget(self.total_game_label)
        summary_layout.addWidget(game_frame)

        layout.addWidget(summary_group)

        # ===== 数据表格 =====
        table_group = QGroupBox("详细记录")
        table_group.setStyleSheet("""
            QGroupBox {
                font-size: 14px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                margin-top: 10px;
                padding-top: 10px;
            }
        """)
        table_layout = QVBoxLayout(table_group)

        self.history_table = QTableWidget()
        self.history_table.setColumnCount(5)
        self.history_table.setHorizontalHeaderLabels([
            "日期", "复习卡片数", "游戏分钟数", "赚取分钟数", "特殊操作"
        ])
        self.history_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.history_table.setAlternatingRowColors(True)
        self.history_table.setStyleSheet("""
            QTableWidget {
                border: none;
                gridline-color: #e0e0e0;
            }
            QHeaderView::section {
                background-color: #f5f5f5;
                padding: 8px;
                border: none;
                font-weight: bold;
            }
        """)
        table_layout.addWidget(self.history_table)

        layout.addWidget(table_group)

    def update_history(self, history_data: list):
        """更新历史数据显示"""
        # 更新表格
        self.history_table.setRowCount(len(history_data))
        total_cards = 0
        total_game = 0

        for i, record in enumerate(history_data):
            date_item = QTableWidgetItem(record.get('date', ''))
            cards = record.get('anki_cards_reviewed', 0)
            game = record.get('steam_minutes_used', 0)
            earned = record.get('earned_minutes', 0)

            total_cards += cards
            total_game += game

            cards_item = QTableWidgetItem(str(cards))
            game_item = QTableWidgetItem(str(game))
            earned_item = QTableWidgetItem(str(earned))

            special = []
            if record.get('emergency_pause_used'):
                special.append("暂停")
            if record.get('emergency_unlock_used'):
                special.append("解锁")
            special_item = QTableWidgetItem(", ".join(special) if special else "-")

            # 设置对齐
            for item in [date_item, cards_item, game_item, earned_item, special_item]:
                item.setTextAlignment(Qt.AlignCenter)

            self.history_table.setItem(i, 0, date_item)
            self.history_table.setItem(i, 1, cards_item)
            self.history_table.setItem(i, 2, game_item)
            self.history_table.setItem(i, 3, earned_item)
            self.history_table.setItem(i, 4, special_item)

        # 更新统计摘要
        self.total_cards_label.setText(str(total_cards))
        self.total_game_label.setText(str(total_game))

        # 更新图表
        if MATPLOTLIB_AVAILABLE:
            self._update_chart(history_data[-7:] if len(history_data) > 7 else history_data)

    def _update_chart(self, data: list):
        """更新图表"""
        self.figure.clear()
        ax = self.figure.add_subplot(111)

        if not data:
            ax.text(0.5, 0.5, '暂无数据', ha='center', va='center', fontsize=14)
            self.canvas.draw()
            return

        dates = [d.get('date', '')[-5:] for d in data]  # 只显示月-日
        cards = [d.get('anki_cards_reviewed', 0) for d in data]
        game = [d.get('steam_minutes_used', 0) for d in data]

        x = range(len(dates))
        width = 0.35

        bars1 = ax.bar([i - width/2 for i in x], cards, width, label='复习卡片数', color='#3b82f6')
        bars2 = ax.bar([i + width/2 for i in x], game, width, label='游戏分钟数', color='#22c55e')

        ax.set_ylabel('数量')
        ax.set_xticks(x)
        ax.set_xticklabels(dates)
        ax.legend()
        ax.grid(axis='y', linestyle='--', alpha=0.7)

        self.figure.tight_layout()
        self.canvas.draw()


class MainWindow(QMainWindow):
    """主窗口"""

    # 信号定义
    emergency_pause_requested = pyqtSignal()
    emergency_unlock_requested = pyqtSignal()
    settings_changed = pyqtSignal(dict)
    reset_data_requested = pyqtSignal()
    anki_path_changed = pyqtSignal(str)

    def __init__(self):
        super().__init__()
        self._setup_ui()
        self._connect_signals()

    def _setup_ui(self):
        self.setWindowTitle("FocusReward - 专注学习，赚取娱乐")
        self.setMinimumSize(500, 600)
        self.resize(500, 700)

        # 设置窗口样式
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f5f5f5;
            }
            QTabWidget::pane {
                border: none;
                background-color: white;
            }
            QTabBar::tab {
                background-color: #e0e0e0;
                padding: 10px 30px;
                margin-right: 2px;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
            }
            QTabBar::tab:selected {
                background-color: white;
            }
        """)

        # 中央部件
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)

        # 标签页
        self.tab_widget = QTabWidget()

        self.dashboard_page = DashboardPage()
        self.tab_widget.addTab(self.dashboard_page, "主页")

        self.settings_page = SettingsPage()
        self.tab_widget.addTab(self.settings_page, "设置")

        self.history_page = HistoryPage()
        self.tab_widget.addTab(self.history_page, "历史")

        main_layout.addWidget(self.tab_widget)

    def _connect_signals(self):
        """连接内部信号"""
        self.dashboard_page.emergency_pause_clicked.connect(self.emergency_pause_requested.emit)
        self.dashboard_page.emergency_unlock_clicked.connect(self.emergency_unlock_requested.emit)
        self.settings_page.settings_changed.connect(self.settings_changed.emit)
        self.settings_page.reset_data_clicked.connect(self.reset_data_requested.emit)
        self.settings_page.anki_profile_changed.connect(self.anki_path_changed.emit)

    def update_time_display(self, time_info: dict, target_cards: int = 30):
        """更新时间显示"""
        self.dashboard_page.update_display(time_info, target_cards)

    def update_app_status(self, app_name: str, is_running: bool, minutes: int, game_name: str = ""):
        """更新应用程序状态"""
        if minutes > 0:
            duration_text = f"({minutes} 分钟)"
        else:
            duration_text = ""
        self.dashboard_page.update_app_status(app_name, is_running, duration_text, game_name)

    def update_history(self, history_data: list):
        """更新历史数据"""
        self.history_page.update_history(history_data)

    def set_settings(self, settings: dict):
        """设置当前设置值"""
        self.settings_page.set_settings(settings)

    def closeEvent(self, event):
        """窗口关闭事件"""
        # 最小化到托盘而不是退出
        event.ignore()
        self.hide()
