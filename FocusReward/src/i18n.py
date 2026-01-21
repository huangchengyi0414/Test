"""
FocusReward 多语言支持模块
支持简体中文、繁体中文、英文、日文、韩文
"""

from typing import Dict

# 语言代码映射
LANGUAGE_CODES = {
    '简体中文': 'zh_CN',
    '繁體中文': 'zh_TW',
    'English': 'en',
    '日本語': 'ja',
    '한국어': 'ko',
}

# 翻译字典
TRANSLATIONS: Dict[str, Dict[str, str]] = {
    # ===== 应用程序标题 =====
    'app_title': {
        'zh_CN': 'FocusReward - 专注学习，赚取娱乐',
        'zh_TW': 'FocusReward - 專注學習，賺取娛樂',
        'en': 'FocusReward - Focus to Earn Entertainment',
        'ja': 'FocusReward - 集中して娯楽を獲得',
        'ko': 'FocusReward - 집중하여 엔터테인먼트 획득',
    },

    # ===== 选择语言对话框 =====
    'select_language': {
        'zh_CN': '选择语言',
        'zh_TW': '選擇語言',
        'en': 'Select Language',
        'ja': '言語を選択',
        'ko': '언어 선택',
    },
    'language_prompt': {
        'zh_CN': '请选择界面语言：',
        'zh_TW': '請選擇介面語言：',
        'en': 'Please select interface language:',
        'ja': 'インターフェース言語を選択してください：',
        'ko': '인터페이스 언어를 선택하세요:',
    },
    'confirm': {
        'zh_CN': '确定',
        'zh_TW': '確定',
        'en': 'OK',
        'ja': '確認',
        'ko': '확인',
    },

    # ===== 标签页 =====
    'tab_dashboard': {
        'zh_CN': '主页',
        'zh_TW': '主頁',
        'en': 'Dashboard',
        'ja': 'ダッシュボード',
        'ko': '대시보드',
    },
    'tab_settings': {
        'zh_CN': '设置',
        'zh_TW': '設定',
        'en': 'Settings',
        'ja': '設定',
        'ko': '설정',
    },
    'tab_history': {
        'zh_CN': '历史',
        'zh_TW': '歷史',
        'en': 'History',
        'ja': '履歴',
        'ko': '기록',
    },

    # ===== 仪表盘页面 =====
    'study_progress': {
        'zh_CN': '今日学习进度',
        'zh_TW': '今日學習進度',
        'en': "Today's Study Progress",
        'ja': '今日の学習進捗',
        'ko': '오늘의 학습 진행률',
    },
    'cards_reviewed': {
        'zh_CN': '{0} 张卡片已复习',
        'zh_TW': '{0} 張卡片已複習',
        'en': '{0} cards reviewed',
        'ja': '{0} 枚のカードを復習',
        'ko': '{0}장의 카드 복습 완료',
    },
    'game_time': {
        'zh_CN': '可用游戏时间',
        'zh_TW': '可用遊戲時間',
        'en': 'Available Game Time',
        'ja': '利用可能なゲーム時間',
        'ko': '사용 가능한 게임 시간',
    },
    'earned': {
        'zh_CN': '已赚取',
        'zh_TW': '已賺取',
        'en': 'Earned',
        'ja': '獲得',
        'ko': '획득',
    },
    'used': {
        'zh_CN': '已使用',
        'zh_TW': '已使用',
        'en': 'Used',
        'ja': '使用済み',
        'ko': '사용됨',
    },
    'remaining': {
        'zh_CN': '剩余',
        'zh_TW': '剩餘',
        'en': 'Remaining',
        'ja': '残り',
        'ko': '남음',
    },
    'minutes': {
        'zh_CN': '分钟',
        'zh_TW': '分鐘',
        'en': 'min',
        'ja': '分',
        'ko': '분',
    },
    'app_status': {
        'zh_CN': '应用程序状态',
        'zh_TW': '應用程式狀態',
        'en': 'Application Status',
        'ja': 'アプリケーション状態',
        'ko': '애플리케이션 상태',
    },
    'running': {
        'zh_CN': '运行中',
        'zh_TW': '運行中',
        'en': 'Running',
        'ja': '実行中',
        'ko': '실행 중',
    },
    'not_running': {
        'zh_CN': '未运行',
        'zh_TW': '未運行',
        'en': 'Not Running',
        'ja': '停止中',
        'ko': '실행 안 함',
    },
    'emergency_pause': {
        'zh_CN': '紧急暂停 5 分钟',
        'zh_TW': '緊急暫停 5 分鐘',
        'en': 'Emergency Pause 5 min',
        'ja': '緊急一時停止 5分',
        'ko': '긴급 일시정지 5분',
    },
    'emergency_unlock': {
        'zh_CN': '今日解除限制',
        'zh_TW': '今日解除限制',
        'en': 'Unlock Today',
        'ja': '今日の制限を解除',
        'ko': '오늘 제한 해제',
    },
    'already_used': {
        'zh_CN': '已使用',
        'zh_TW': '已使用',
        'en': 'Used',
        'ja': '使用済み',
        'ko': '사용됨',
    },
    'unlocked': {
        'zh_CN': '已解锁',
        'zh_TW': '已解鎖',
        'en': 'Unlocked',
        'ja': '解除済み',
        'ko': '해제됨',
    },

    # ===== 设置页面 =====
    'anki_profile': {
        'zh_CN': 'Anki 配置文件',
        'zh_TW': 'Anki 設定檔',
        'en': 'Anki Profile',
        'ja': 'Anki プロファイル',
        'ko': 'Anki 프로필',
    },
    'select_profile': {
        'zh_CN': '选择配置文件:',
        'zh_TW': '選擇設定檔:',
        'en': 'Select profile:',
        'ja': 'プロファイルを選択:',
        'ko': '프로필 선택:',
    },
    'refresh': {
        'zh_CN': '刷新',
        'zh_TW': '重新整理',
        'en': 'Refresh',
        'ja': '更新',
        'ko': '새로고침',
    },
    'profiles_found': {
        'zh_CN': '找到 {0} 个配置文件',
        'zh_TW': '找到 {0} 個設定檔',
        'en': 'Found {0} profile(s)',
        'ja': '{0} 件のプロファイルが見つかりました',
        'ko': '{0}개의 프로필 찾음',
    },
    'no_profiles': {
        'zh_CN': '未找到 Anki 配置文件',
        'zh_TW': '未找到 Anki 設定檔',
        'en': 'No Anki profiles found',
        'ja': 'Anki プロファイルが見つかりません',
        'ko': 'Anki 프로필을 찾을 수 없음',
    },
    'anki_not_installed': {
        'zh_CN': '请确认 Anki 已安装并至少运行过一次',
        'zh_TW': '請確認 Anki 已安裝並至少運行過一次',
        'en': 'Please ensure Anki is installed and has been run at least once',
        'ja': 'Anki がインストールされ、少なくとも一度は実行されていることを確認してください',
        'ko': 'Anki가 설치되어 있고 최소 한 번 실행되었는지 확인하세요',
    },
    'path': {
        'zh_CN': '路径: {0}',
        'zh_TW': '路徑: {0}',
        'en': 'Path: {0}',
        'ja': 'パス: {0}',
        'ko': '경로: {0}',
    },
    'exchange_settings': {
        'zh_CN': '兑换比例设置',
        'zh_TW': '兌換比例設定',
        'en': 'Exchange Rate Settings',
        'ja': '交換レート設定',
        'ko': '교환 비율 설정',
    },
    'exchange_ratio': {
        'zh_CN': '复习 {0} 张卡片 = {1} 分钟游戏时间',
        'zh_TW': '複習 {0} 張卡片 = {1} 分鐘遊戲時間',
        'en': 'Review {0} cards = {1} min game time',
        'ja': '{0} 枚のカードを復習 = {1} 分のゲーム時間',
        'ko': '{0}장 카드 복습 = {1}분 게임 시간',
    },
    'cards_count': {
        'zh_CN': '卡片数:',
        'zh_TW': '卡片數:',
        'en': 'Cards:',
        'ja': 'カード数:',
        'ko': '카드 수:',
    },
    'minutes_count': {
        'zh_CN': '分钟数:',
        'zh_TW': '分鐘數:',
        'en': 'Minutes:',
        'ja': '分数:',
        'ko': '분 수:',
    },
    'other_settings': {
        'zh_CN': '其他设置',
        'zh_TW': '其他設定',
        'en': 'Other Settings',
        'ja': 'その他の設定',
        'ko': '기타 설정',
    },
    'auto_start': {
        'zh_CN': '开机自动启动',
        'zh_TW': '開機自動啟動',
        'en': 'Start on system boot',
        'ja': 'システム起動時に開始',
        'ko': '시스템 시작 시 자동 실행',
    },
    'minimize_to_tray': {
        'zh_CN': '关闭时最小化到托盘',
        'zh_TW': '關閉時最小化到系統列',
        'en': 'Minimize to tray on close',
        'ja': '閉じる時にトレイに最小化',
        'ko': '닫을 때 트레이로 최소화',
    },
    'language_setting': {
        'zh_CN': '界面语言',
        'zh_TW': '介面語言',
        'en': 'Interface Language',
        'ja': 'インターフェース言語',
        'ko': '인터페이스 언어',
    },
    'save_settings': {
        'zh_CN': '保存设置',
        'zh_TW': '儲存設定',
        'en': 'Save Settings',
        'ja': '設定を保存',
        'ko': '설정 저장',
    },
    'reset_today': {
        'zh_CN': '重置今日数据',
        'zh_TW': '重置今日資料',
        'en': 'Reset Today\'s Data',
        'ja': '今日のデータをリセット',
        'ko': '오늘의 데이터 초기화',
    },
    'save_success': {
        'zh_CN': '保存成功',
        'zh_TW': '儲存成功',
        'en': 'Save Successful',
        'ja': '保存成功',
        'ko': '저장 성공',
    },
    'settings_saved': {
        'zh_CN': '设置已保存！',
        'zh_TW': '設定已儲存！',
        'en': 'Settings saved!',
        'ja': '設定が保存されました！',
        'ko': '설정이 저장되었습니다!',
    },

    # ===== 历史页面 =====
    'history_7days': {
        'zh_CN': '过去 7 天统计',
        'zh_TW': '過去 7 天統計',
        'en': 'Last 7 Days Statistics',
        'ja': '過去7日間の統計',
        'ko': '최근 7일 통계',
    },
    'summary_7days': {
        'zh_CN': '7 日统计摘要',
        'zh_TW': '7 日統計摘要',
        'en': '7-Day Summary',
        'ja': '7日間のサマリー',
        'ko': '7일 요약',
    },
    'total_cards': {
        'zh_CN': '总复习卡片数',
        'zh_TW': '總複習卡片數',
        'en': 'Total Cards Reviewed',
        'ja': '復習したカードの合計',
        'ko': '총 복습 카드 수',
    },
    'total_game_minutes': {
        'zh_CN': '总游戏分钟数',
        'zh_TW': '總遊戲分鐘數',
        'en': 'Total Game Minutes',
        'ja': '合計ゲーム時間（分）',
        'ko': '총 게임 시간(분)',
    },
    'detailed_records': {
        'zh_CN': '详细记录',
        'zh_TW': '詳細記錄',
        'en': 'Detailed Records',
        'ja': '詳細記録',
        'ko': '상세 기록',
    },
    'date': {
        'zh_CN': '日期',
        'zh_TW': '日期',
        'en': 'Date',
        'ja': '日付',
        'ko': '날짜',
    },
    'cards_reviewed_col': {
        'zh_CN': '复习卡片数',
        'zh_TW': '複習卡片數',
        'en': 'Cards Reviewed',
        'ja': '復習カード数',
        'ko': '복습 카드 수',
    },
    'game_minutes_col': {
        'zh_CN': '游戏分钟数',
        'zh_TW': '遊戲分鐘數',
        'en': 'Game Minutes',
        'ja': 'ゲーム時間（分）',
        'ko': '게임 시간(분)',
    },
    'earned_minutes_col': {
        'zh_CN': '赚取分钟数',
        'zh_TW': '賺取分鐘數',
        'en': 'Earned Minutes',
        'ja': '獲得時間（分）',
        'ko': '획득 시간(분)',
    },
    'special_actions': {
        'zh_CN': '特殊操作',
        'zh_TW': '特殊操作',
        'en': 'Special Actions',
        'ja': '特別操作',
        'ko': '특수 작업',
    },
    'pause': {
        'zh_CN': '暂停',
        'zh_TW': '暫停',
        'en': 'Pause',
        'ja': '一時停止',
        'ko': '일시정지',
    },
    'unlock': {
        'zh_CN': '解锁',
        'zh_TW': '解鎖',
        'en': 'Unlock',
        'ja': '解除',
        'ko': '해제',
    },

    # ===== 对话框 =====
    'confirm_unlock_title': {
        'zh_CN': '确认解除限制',
        'zh_TW': '確認解除限制',
        'en': 'Confirm Unlock',
        'ja': '制限解除の確認',
        'ko': '제한 해제 확인',
    },
    'confirm_unlock_msg': {
        'zh_CN': '确定要解除今日的时间限制吗？\n\n此操作将被记录在历史中。',
        'zh_TW': '確定要解除今日的時間限制嗎？\n\n此操作將被記錄在歷史中。',
        'en': 'Are you sure you want to unlock today\'s time limit?\n\nThis action will be recorded in history.',
        'ja': '今日の時間制限を解除してもよろしいですか？\n\nこの操作は履歴に記録されます。',
        'ko': '오늘의 시간 제한을 해제하시겠습니까?\n\n이 작업은 기록에 저장됩니다.',
    },
    'confirm_reset_title': {
        'zh_CN': '确认重置',
        'zh_TW': '確認重置',
        'en': 'Confirm Reset',
        'ja': 'リセットの確認',
        'ko': '초기화 확인',
    },
    'confirm_reset_msg': {
        'zh_CN': '确定要重置今日的所有数据吗？\n\n这将清除今日的学习记录和游戏时间统计。',
        'zh_TW': '確定要重置今日的所有資料嗎？\n\n這將清除今日的學習記錄和遊戲時間統計。',
        'en': 'Are you sure you want to reset all today\'s data?\n\nThis will clear today\'s study records and game time statistics.',
        'ja': '今日のすべてのデータをリセットしてもよろしいですか？\n\n今日の学習記録とゲーム時間の統計がクリアされます。',
        'ko': '오늘의 모든 데이터를 초기화하시겠습니까?\n\n오늘의 학습 기록과 게임 시간 통계가 삭제됩니다.',
    },

    # ===== 系统托盘 =====
    'show_window': {
        'zh_CN': '显示主窗口',
        'zh_TW': '顯示主視窗',
        'en': 'Show Main Window',
        'ja': 'メインウィンドウを表示',
        'ko': '메인 창 표시',
    },
    'quit': {
        'zh_CN': '退出',
        'zh_TW': '退出',
        'en': 'Quit',
        'ja': '終了',
        'ko': '종료',
    },
    'tray_tooltip': {
        'zh_CN': 'FocusReward - 专注学习，赚取娱乐',
        'zh_TW': 'FocusReward - 專注學習，賺取娛樂',
        'en': 'FocusReward - Focus to Earn Entertainment',
        'ja': 'FocusReward - 集中して娯楽を獲得',
        'ko': 'FocusReward - 집중하여 엔터테인먼트 획득',
    },

    # ===== 通知 =====
    'time_warning_title': {
        'zh_CN': 'FocusReward - 时间提醒',
        'zh_TW': 'FocusReward - 時間提醒',
        'en': 'FocusReward - Time Warning',
        'ja': 'FocusReward - 時間の警告',
        'ko': 'FocusReward - 시간 경고',
    },
    'time_warning_msg': {
        'zh_CN': '游戏时间即将用尽！剩余 {0} 分钟。\n请保存游戏进度，或复习更多卡片获取更多时间。',
        'zh_TW': '遊戲時間即將用盡！剩餘 {0} 分鐘。\n請保存遊戲進度，或複習更多卡片獲取更多時間。',
        'en': 'Game time is running out! {0} minutes remaining.\nPlease save your game progress, or review more cards to earn more time.',
        'ja': 'ゲーム時間がもうすぐ終了します！残り{0}分。\nゲームの進行状況を保存するか、カードを復習して時間を獲得してください。',
        'ko': '게임 시간이 거의 끝났습니다! {0}분 남음.\n게임 진행 상황을 저장하거나 카드를 더 복습하여 시간을 얻으세요.',
    },
    'time_expired_title': {
        'zh_CN': 'FocusReward - 时间用尽',
        'zh_TW': 'FocusReward - 時間用盡',
        'en': 'FocusReward - Time Expired',
        'ja': 'FocusReward - 時間切れ',
        'ko': 'FocusReward - 시간 만료',
    },
    'time_expired_msg': {
        'zh_CN': '游戏时间已用完！Steam 将在 10 秒后关闭。\n复习更多卡片可获取更多游戏时间。',
        'zh_TW': '遊戲時間已用完！Steam 將在 10 秒後關閉。\n複習更多卡片可獲取更多遊戲時間。',
        'en': 'Game time has expired! Steam will close in 10 seconds.\nReview more cards to earn more game time.',
        'ja': 'ゲーム時間が終了しました！Steamは10秒後に閉じます。\nカードを復習してゲーム時間を獲得してください。',
        'ko': '게임 시간이 만료되었습니다! Steam이 10초 후에 종료됩니다.\n카드를 더 복습하여 게임 시간을 얻으세요.',
    },
}


class I18n:
    """国际化管理类"""

    def __init__(self, language_code: str = 'zh_CN'):
        self.language_code = language_code

    def set_language(self, language_code: str):
        """设置当前语言"""
        self.language_code = language_code

    def get(self, key: str, *args) -> str:
        """
        获取翻译文本

        Args:
            key: 翻译键
            *args: 格式化参数

        Returns:
            翻译后的文本
        """
        if key not in TRANSLATIONS:
            return key

        text = TRANSLATIONS[key].get(self.language_code, TRANSLATIONS[key].get('en', key))

        if args:
            try:
                return text.format(*args)
            except (IndexError, KeyError):
                return text

        return text

    def __call__(self, key: str, *args) -> str:
        """快捷方式获取翻译"""
        return self.get(key, *args)


# 全局翻译实例
_i18n = I18n()


def set_language(language_code: str):
    """设置全局语言"""
    _i18n.set_language(language_code)


def tr(key: str, *args) -> str:
    """获取翻译文本的快捷函数"""
    return _i18n.get(key, *args)


def get_language_code() -> str:
    """获取当前语言代码"""
    return _i18n.language_code


def get_language_name(code: str) -> str:
    """从语言代码获取语言名称"""
    for name, c in LANGUAGE_CODES.items():
        if c == code:
            return name
    return 'English'
