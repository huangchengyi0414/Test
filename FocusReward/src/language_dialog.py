"""
FocusReward 语言选择对话框
首次启动时显示，让用户选择界面语言
"""

from PyQt5.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel,
    QPushButton, QComboBox, QFrame
)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont

from .i18n import LANGUAGE_CODES


class LanguageDialog(QDialog):
    """语言选择对话框"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.selected_language = 'zh_CN'  # 默认简体中文
        self._setup_ui()

    def _setup_ui(self):
        self.setWindowTitle("Select Language / 选择语言")
        self.setFixedSize(400, 300)
        self.setWindowFlags(self.windowFlags() & ~Qt.WindowContextHelpButtonHint)

        layout = QVBoxLayout(self)
        layout.setSpacing(20)
        layout.setContentsMargins(30, 30, 30, 30)

        # 标题
        title = QLabel("FocusReward")
        title.setAlignment(Qt.AlignCenter)
        title.setFont(QFont("Arial", 24, QFont.Bold))
        title.setStyleSheet("color: #3b82f6;")
        layout.addWidget(title)

        # 副标题（多语言）
        subtitle = QLabel(
            "Please select your language\n"
            "请选择您的语言\n"
            "言語を選択してください\n"
            "언어를 선택하세요"
        )
        subtitle.setAlignment(Qt.AlignCenter)
        subtitle.setStyleSheet("color: #666666; font-size: 12px;")
        layout.addWidget(subtitle)

        # 分隔线
        line = QFrame()
        line.setFrameShape(QFrame.HLine)
        line.setStyleSheet("background-color: #e0e0e0;")
        layout.addWidget(line)

        # 语言选择下拉框
        combo_layout = QHBoxLayout()
        combo_layout.addStretch()

        self.language_combo = QComboBox()
        self.language_combo.setMinimumWidth(200)
        self.language_combo.setStyleSheet("""
            QComboBox {
                padding: 10px 15px;
                border: 2px solid #d0d0d0;
                border-radius: 6px;
                font-size: 16px;
                background-color: white;
            }
            QComboBox:hover {
                border-color: #3b82f6;
            }
            QComboBox::drop-down {
                border: none;
                width: 40px;
            }
            QComboBox QAbstractItemView {
                border: 1px solid #d0d0d0;
                selection-background-color: #3b82f6;
                selection-color: white;
            }
        """)

        # 添加语言选项
        for lang_name in LANGUAGE_CODES.keys():
            self.language_combo.addItem(lang_name)

        combo_layout.addWidget(self.language_combo)
        combo_layout.addStretch()
        layout.addLayout(combo_layout)

        layout.addStretch()

        # 确认按钮
        btn_layout = QHBoxLayout()
        btn_layout.addStretch()

        self.confirm_btn = QPushButton("OK / 确定")
        self.confirm_btn.setMinimumWidth(150)
        self.confirm_btn.setStyleSheet("""
            QPushButton {
                background-color: #3b82f6;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 6px;
                font-size: 16px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #2563eb;
            }
        """)
        self.confirm_btn.clicked.connect(self._on_confirm)
        btn_layout.addWidget(self.confirm_btn)

        btn_layout.addStretch()
        layout.addLayout(btn_layout)

    def _on_confirm(self):
        """确认按钮点击"""
        lang_name = self.language_combo.currentText()
        self.selected_language = LANGUAGE_CODES.get(lang_name, 'zh_CN')
        self.accept()

    def get_selected_language(self) -> str:
        """获取选择的语言代码"""
        return self.selected_language

    @staticmethod
    def get_language(parent=None) -> str:
        """
        静态方法：显示对话框并返回选择的语言代码

        Returns:
            语言代码 (如 'zh_CN', 'en' 等)
        """
        dialog = LanguageDialog(parent)
        dialog.exec_()
        return dialog.get_selected_language()
