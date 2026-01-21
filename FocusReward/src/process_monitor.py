"""
FocusReward 进程监控模块
负责监控 Anki 和游戏进程的运行状态和时长
支持 Steam、Epic、GOG、EA、Ubisoft、Battle.net、Xbox 等平台
"""

import psutil
import os
from datetime import datetime
from typing import Optional, Dict, Callable, List, Set
from PyQt5.QtCore import QObject, QTimer, pyqtSignal

# Windows 注册表（仅在 Windows 上可用）
try:
    import winreg
    HAS_WINREG = True
except ImportError:
    HAS_WINREG = False


class ProcessMonitor(QObject):
    """
    进程监控器
    监控指定应用程序的运行状态，发出信号通知状态变化
    支持多个游戏平台的游戏进程检测
    """

    # 信号定义
    process_started = pyqtSignal(str)  # 进程启动信号，参数为进程名
    process_stopped = pyqtSignal(str)  # 进程停止信号，参数为进程名
    status_updated = pyqtSignal(dict)  # 状态更新信号，参数为状态字典
    game_detected = pyqtSignal(str)    # 检测到新游戏信号

    # 常见的游戏进程（跨平台热门游戏）
    COMMON_GAME_PROCESSES = {
        # === Steam 热门游戏 ===
        'dota2.exe', 'csgo.exe', 'cs2.exe', 'hl2.exe',
        'gta5.exe', 'gtav.exe', 'playgtav.exe',
        'witcher3.exe', 'cyberpunk2077.exe',
        'eldenring.exe', 'darksoulsiii.exe', 'sekiro.exe',
        'baldursgate3.exe', 'bg3.exe', 'bg3_dx11.exe',
        'terraria.exe', 'starbound.exe',
        'stardewvalley.exe', 'stardew valley.exe',
        'factorio.exe', 'rimworld.exe', 'rimworldwin64.exe',
        'valheim.exe', 'rust.exe',
        'portal2.exe', 'portal.exe',
        'left4dead2.exe', 'left4dead.exe',
        'deadcells.exe', 'hollowknight.exe', 'celeste.exe',
        'cuphead.exe', 'hades.exe', 'hadesii.exe',
        'civilization6.exe', 'civ6.exe', 'civilizationvi.exe',
        'eu4.exe', 'ck3.exe', 'hoi4.exe', 'stellaris.exe',
        'cities.exe', 'cities2.exe',
        'footballmanager2024.exe', 'fm.exe',
        'rocketleague.exe',
        'monsterhunterworld.exe', 'monsterhunterrise.exe',
        'nioh2.exe', 'nierautomata.exe',
        'persona5.exe', 'persona4.exe', 'persona3.exe',
        'residentevil.exe', 're2.exe', 're3.exe', 're4.exe', 're8.exe',
        'dyinglight.exe', 'dyinglight2.exe',
        'subnautica.exe', 'subnauticabelowzero.exe',
        'satisfactory.exe', 'astroneer.exe',
        'nomansky.exe', 'nomanssky.exe',
        'palworld.exe', 'palworld-win64-shipping.exe',
        'lethalcompany.exe',

        # === Epic Games 热门游戏 ===
        'fortniteclient-win64-shipping.exe', 'fortnitelauncher.exe',
        'rocketleague.exe',
        'fallguys_client.exe', 'fallguys_client_shipping.exe',
        'alangame-win64-shipping.exe',  # Alan Wake
        'control.exe', 'control_dx12.exe',
        'godfall.exe', 'godfall-win64-shipping.exe',
        'hitman3.exe',
        'kingdomhearts3.exe', 'kh3.exe',
        'sifu.exe', 'sifu-win64-shipping.exe',
        'tinytinaswonderlands.exe',
        'thesink-win64-shipping.exe',  # The Sinking City

        # === EA / Origin 热门游戏 ===
        'fifa24.exe', 'fifa23.exe', 'fifa22.exe',
        'fc24.exe',  # EA Sports FC
        'apex_legends.exe', 'r5apex.exe',
        'bf2042.exe', 'battlefield2042.exe',
        'battlefieldv.exe', 'bfv.exe',
        'nfs.exe', 'needforspeed.exe', 'nfsheat.exe', 'nfsunbound.exe',
        'masseffect.exe', 'masseffectlegendary.exe',
        'deadspace.exe', 'deadspace2023.exe',
        'starwarsjedifallenorder.exe', 'jedifallenorder.exe',
        'starwarsjedifsurvivor.exe', 'jedisurvivor.exe',
        'simcity.exe', 'thesims4.exe', 'ts4_x64.exe',
        'madden24.exe', 'madden23.exe',
        'nhl24.exe', 'nhl23.exe',
        'titanfall2.exe',
        'dragonage.exe', 'dai.exe',
        'pvz.exe', 'plantsvszombies.exe',
        'itstp.exe',  # It Takes Two

        # === Ubisoft Connect 热门游戏 ===
        'assassinscreed.exe', 'acmirage.exe', 'acvalhalla.exe', 'acodyssey.exe',
        'farcry6.exe', 'farcry5.exe', 'farcry.exe',
        'watchdogs.exe', 'watchdogslegion.exe',
        'r6-siegeops.exe', 'rainbowsix.exe',
        'ghostrecon.exe', 'grb.exe', 'grbreakpoint.exe',
        'division2.exe', 'thedivision2.exe',
        'immortalsfenyxrising.exe',
        'anno1800.exe', 'anno.exe',
        'starlinkbfda.exe',  # Starlink
        'riders_republic.exe',

        # === Battle.net / Blizzard 热门游戏 ===
        'wow.exe', 'wowclassic.exe', 'world of warcraft.exe',
        'diablo iv.exe', 'diablo4.exe', 'diablo3.exe', 'diablo iii.exe',
        'overwatch.exe', 'overwatch2.exe',
        'hearthstone.exe',
        'starcraft.exe', 'sc2.exe', 'sc2_x64.exe',
        'heroes of the storm.exe', 'heroesofthestorm.exe',
        'modern warfare.exe', 'codmw.exe', 'cod.exe',
        'blackops.exe', 'bocw.exe',
        'warzone.exe', 'codwarzone.exe',

        # === Xbox Game Pass / Microsoft 热门游戏 ===
        'minecraft.exe', 'minecraftlauncher.exe',
        'halo infinite.exe', 'haloinfinite.exe',
        'forza_gaming.exe', 'forzahorizon5.exe', 'forzahorizon4.exe',
        'msfs.exe', 'flightsimulator.exe',
        'seaofthieves.exe',
        'ageofempires2de.exe', 'aoe2de.exe',
        'ageofempires4.exe', 'aoe4.exe',
        'oriandthewillofthewisps.exe', 'oriandtheblindforest.exe',
        'psychonauts2.exe',
        'grounded.exe',
        'deathloop.exe',
        'starfield.exe',
        'hi-fi rush.exe', 'hifirush.exe',

        # === Riot Games ===
        'league of legends.exe', 'leagueoflegends.exe', 'leagueclient.exe',
        'valorant.exe', 'valorant-win64-shipping.exe',
        'riotclientservices.exe',
        'lor.exe',  # Legends of Runeterra
        'tft.exe',  # Teamfight Tactics

        # === GOG Galaxy 热门游戏 ===
        'galaxy64.exe',  # 排除：这是启动器
        'gwent.exe',
        'thronebreaker.exe',

        # === 其他独立游戏 / 常见游戏 ===
        'amongus.exe',
        'phasmophobia.exe',
        'thefinals.exe',
        'deeprockgalactic.exe',
        'readyornot.exe',
        'helldivers2.exe',
        'enshrouded.exe',
    }

    # 排除的进程（启动器和非游戏进程）
    EXCLUDED_PROCESSES = {
        # Steam
        'steam.exe', 'steamservice.exe', 'steamwebhelper.exe',
        'gameoverlayui.exe', 'steamerrorreporter.exe',
        'steamvr.exe', 'vrserver.exe', 'vrdashboard.exe',

        # Epic Games
        'epicgameslauncher.exe', 'epicwebhelper.exe',
        'unrealcefsubprocess.exe',
        'eaborhelperservice.exe',
        'epiconlineservices.exe',

        # EA / Origin
        'origin.exe', 'originwebhelperservice.exe',
        'eadesktop.exe', 'eabackgroundservice.exe',
        'link2ea.exe',

        # Ubisoft
        'upc.exe', 'ubisoft game launcher.exe',
        'ubisoftconnect.exe', 'ubisoftgamelauncher.exe',
        'uplaywebcore.exe',

        # Battle.net
        'battle.net.exe', 'agent.exe',
        'blizzard error reporter.exe',

        # GOG Galaxy
        'galaxyclient.exe', 'galaxyclient helper.exe',
        'galaxycommunication.exe',

        # Xbox / Microsoft
        'xbox.exe', 'gamingservices.exe',
        'xboxapp.exe', 'gamebar.exe', 'gamebarpresencewriter.exe',

        # Riot Games
        'riotclientux.exe', 'riotclientuxrender.exe',
        'riotclientcrashhandler.exe',

        # 通用排除
        'crash_reporter.exe', 'crashhandler.exe', 'crashhandler64.exe',
        'uninstall.exe', 'setup.exe', 'installer.exe',
        'launcher.exe', 'bootstrapper.exe',
        'vc_redist.exe', 'dxsetup.exe',
        'updater.exe', 'update.exe',
        'cefsubprocess.exe', 'webhelper.exe',
    }

    def __init__(self, check_interval: int = 30):
        """
        初始化进程监控器

        Args:
            check_interval: 检查间隔（秒），默认 30 秒
        """
        super().__init__()

        self.check_interval = check_interval * 1000  # 转换为毫秒

        # 游戏安装目录（所有平台）
        self.game_install_paths: Set[str] = set()
        self._find_all_game_paths()

        # 用户自定义的游戏进程列表
        self.custom_game_processes: Set[str] = set()

        # 当前运行的游戏进程
        self.running_games: Dict[str, dict] = {}  # {进程名: {pid, start_time}}

        # 要监控的进程列表
        self.monitored_processes = {
            'anki': {
                'exe_names': ['anki.exe', 'Anki.exe', 'anki'],
                'is_running': False,
                'start_time': None,
                'session_duration': 0,
                'today_duration': 0,
            },
            'steam_games': {  # 改为监控 Steam 游戏而非 Steam 客户端
                'exe_names': [],  # 动态填充
                'is_running': False,
                'start_time': None,
                'session_duration': 0,
                'today_duration': 0,
                'current_game': None,  # 当前运行的游戏名
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
            'steam_games': None
        }

    def _find_all_game_paths(self):
        """查找所有游戏平台的安装目录"""
        self.game_install_paths = set()

        # === Steam ===
        self._find_steam_paths()

        # === Epic Games ===
        self._find_epic_paths()

        # === EA / Origin ===
        self._find_ea_paths()

        # === Ubisoft Connect ===
        self._find_ubisoft_paths()

        # === GOG Galaxy ===
        self._find_gog_paths()

        # === Battle.net ===
        self._find_battlenet_paths()

        # === Riot Games ===
        self._find_riot_paths()

        # === Xbox Game Pass ===
        self._find_xbox_paths()

    def _find_steam_paths(self):
        """查找 Steam 游戏安装目录"""
        if not HAS_WINREG:
            return

        # 从注册表读取 Steam 安装路径
        registry_paths = [
            (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\WOW6432Node\Valve\Steam"),
            (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Valve\Steam"),
            (winreg.HKEY_CURRENT_USER, r"SOFTWARE\Valve\Steam"),
        ]

        for hkey, subkey in registry_paths:
            try:
                with winreg.OpenKey(hkey, subkey) as key:
                    steam_path = winreg.QueryValueEx(key, "InstallPath")[0]
                    self._add_steam_library_folders(steam_path)
            except (WindowsError, FileNotFoundError, OSError):
                pass

        # 常见的 Steam 安装路径
        common_paths = [
            r"C:\Program Files (x86)\Steam",
            r"C:\Program Files\Steam",
            r"D:\Steam", r"D:\SteamLibrary",
            r"E:\Steam", r"E:\SteamLibrary",
            r"F:\Steam", r"F:\SteamLibrary",
        ]

        for path in common_paths:
            if os.path.exists(path):
                self._add_steam_library_folders(path)

    def _find_epic_paths(self):
        """查找 Epic Games 安装目录"""
        # 默认安装路径
        default_paths = [
            r"C:\Program Files\Epic Games",
            r"C:\Program Files (x86)\Epic Games",
            r"D:\Epic Games",
            r"E:\Epic Games",
        ]

        for path in default_paths:
            if os.path.exists(path):
                self.game_install_paths.add(path.lower())

        # 从注册表读取
        if HAS_WINREG:
            try:
                with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE,
                                   r"SOFTWARE\WOW6432Node\Epic Games\EpicGamesLauncher") as key:
                    app_data = winreg.QueryValueEx(key, "AppDataPath")[0]
                    # Epic 游戏通常在同一驱动器下
                    drive = os.path.splitdrive(app_data)[0]
                    epic_path = os.path.join(drive, "Epic Games")
                    if os.path.exists(epic_path):
                        self.game_install_paths.add(epic_path.lower())
            except (WindowsError, FileNotFoundError, OSError):
                pass

    def _find_ea_paths(self):
        """查找 EA / Origin 游戏安装目录"""
        default_paths = [
            r"C:\Program Files\EA Games",
            r"C:\Program Files (x86)\EA Games",
            r"C:\Program Files\Origin Games",
            r"C:\Program Files (x86)\Origin Games",
            r"D:\EA Games", r"D:\Origin Games",
            r"E:\EA Games", r"E:\Origin Games",
        ]

        for path in default_paths:
            if os.path.exists(path):
                self.game_install_paths.add(path.lower())

    def _find_ubisoft_paths(self):
        """查找 Ubisoft Connect 游戏安装目录"""
        default_paths = [
            r"C:\Program Files\Ubisoft\Ubisoft Game Launcher\games",
            r"C:\Program Files (x86)\Ubisoft\Ubisoft Game Launcher\games",
            r"D:\Ubisoft\Ubisoft Game Launcher\games",
        ]

        for path in default_paths:
            if os.path.exists(path):
                self.game_install_paths.add(path.lower())

        # 从注册表读取
        if HAS_WINREG:
            try:
                with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE,
                                   r"SOFTWARE\WOW6432Node\Ubisoft\Launcher") as key:
                    install_dir = winreg.QueryValueEx(key, "InstallDir")[0]
                    games_path = os.path.join(install_dir, "games")
                    if os.path.exists(games_path):
                        self.game_install_paths.add(games_path.lower())
            except (WindowsError, FileNotFoundError, OSError):
                pass

    def _find_gog_paths(self):
        """查找 GOG Galaxy 游戏安装目录"""
        default_paths = [
            r"C:\Program Files\GOG Galaxy\Games",
            r"C:\Program Files (x86)\GOG Galaxy\Games",
            r"C:\GOG Games",
            r"D:\GOG Games",
        ]

        for path in default_paths:
            if os.path.exists(path):
                self.game_install_paths.add(path.lower())

    def _find_battlenet_paths(self):
        """查找 Battle.net 游戏安装目录"""
        default_paths = [
            r"C:\Program Files\Blizzard",
            r"C:\Program Files (x86)\Blizzard",
            r"C:\Program Files (x86)\Battle.net",
            r"D:\Blizzard",
            r"D:\Battle.net",
        ]

        for path in default_paths:
            if os.path.exists(path):
                self.game_install_paths.add(path.lower())

    def _find_riot_paths(self):
        """查找 Riot Games 安装目录"""
        default_paths = [
            r"C:\Riot Games",
            r"D:\Riot Games",
            r"C:\Program Files\Riot Games",
        ]

        for path in default_paths:
            if os.path.exists(path):
                self.game_install_paths.add(path.lower())

    def _find_xbox_paths(self):
        """查找 Xbox Game Pass 游戏安装目录"""
        # Xbox 游戏通常安装在 WindowsApps 或 XboxGames
        default_paths = [
            r"C:\XboxGames",
            r"D:\XboxGames",
            r"E:\XboxGames",
        ]

        for path in default_paths:
            if os.path.exists(path):
                self.game_install_paths.add(path.lower())

    def _add_steam_library_folders(self, steam_path: str):
        """添加 Steam 库文件夹"""
        # 主安装目录
        common_path = os.path.join(steam_path, "steamapps", "common")
        if os.path.exists(common_path):
            self.game_install_paths.add(common_path.lower())

        # 读取 libraryfolders.vdf 获取其他库位置
        vdf_path = os.path.join(steam_path, "steamapps", "libraryfolders.vdf")
        if os.path.exists(vdf_path):
            try:
                with open(vdf_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # 简单解析 VDF 格式
                    import re
                    paths = re.findall(r'"path"\s+"([^"]+)"', content)
                    for path in paths:
                        common = os.path.join(path, "steamapps", "common")
                        if os.path.exists(common):
                            self.game_install_paths.add(common.lower())
            except Exception:
                pass

    def _is_game_process(self, proc_name: str, proc_exe: str) -> bool:
        """
        判断进程是否是游戏进程

        Args:
            proc_name: 进程名
            proc_exe: 进程可执行文件路径

        Returns:
            是否是游戏进程
        """
        proc_name_lower = proc_name.lower()

        # 排除非游戏进程
        if proc_name_lower in self.EXCLUDED_PROCESSES:
            return False

        # 检查是否在常见游戏列表中
        if proc_name_lower in self.COMMON_GAME_PROCESSES:
            return True

        # 检查用户自定义列表
        if proc_name_lower in self.custom_game_processes:
            return True

        # 检查进程路径是否在任何游戏安装目录下
        if proc_exe:
            proc_exe_lower = proc_exe.lower()
            for game_path in self.game_install_paths:
                if game_path in proc_exe_lower:
                    return True

        return False

    def _find_running_games(self) -> Dict[str, dict]:
        """
        查找当前运行的游戏进程

        Returns:
            运行中的游戏进程字典 {进程名: {pid, exe_path}}
        """
        games = {}

        try:
            for proc in psutil.process_iter(['name', 'pid', 'exe']):
                try:
                    proc_name = proc.info['name']
                    proc_exe = proc.info['exe'] or ''

                    if proc_name and self._is_game_process(proc_name, proc_exe):
                        games[proc_name.lower()] = {
                            'pid': proc.info['pid'],
                            'exe_path': proc_exe,
                            'name': proc_name
                        }
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    continue
        except Exception:
            pass

        return games

    def add_custom_game(self, process_name: str):
        """
        添加自定义游戏进程名

        Args:
            process_name: 进程名（如 'mygame.exe'）
        """
        self.custom_game_processes.add(process_name.lower())

    def remove_custom_game(self, process_name: str):
        """移除自定义游戏进程名"""
        self.custom_game_processes.discard(process_name.lower())

    def get_custom_games(self) -> List[str]:
        """获取自定义游戏列表"""
        return list(self.custom_game_processes)

    def set_custom_games(self, games: List[str]):
        """设置自定义游戏列表"""
        self.custom_game_processes = set(g.lower() for g in games)

    def start(self):
        """开始监控"""
        self._check_processes()
        self.timer.start(self.check_interval)

    def stop(self):
        """停止监控"""
        self.timer.stop()

    def set_check_interval(self, seconds: int):
        """设置检查间隔"""
        self.check_interval = seconds * 1000
        if self.timer.isActive():
            self.timer.stop()
            self.timer.start(self.check_interval)

    def _is_process_running(self, exe_names: list) -> bool:
        """检查进程是否正在运行"""
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

        # 检查 Anki
        self._check_anki(current_time)

        # 检查 Steam 游戏
        self._check_steam_games(current_time)

        # 发出状态更新信号
        self.status_updated.emit(self.get_status())

    def _check_anki(self, current_time: datetime):
        """检查 Anki 进程状态"""
        info = self.monitored_processes['anki']
        was_running = info['is_running']
        is_running = self._is_process_running(info['exe_names'])

        if is_running and not was_running:
            info['is_running'] = True
            info['start_time'] = current_time
            info['session_duration'] = 0
            if self.on_session_start:
                self.session_ids['anki'] = self.on_session_start('anki')
            self.process_started.emit('anki')

        elif not is_running and was_running:
            if info['start_time']:
                session_duration = int((current_time - info['start_time']).total_seconds())
                info['today_duration'] += session_duration
            info['is_running'] = False
            info['start_time'] = None
            info['session_duration'] = 0
            if self.on_session_end and self.session_ids['anki']:
                self.on_session_end(self.session_ids['anki'])
                self.session_ids['anki'] = None
            self.process_stopped.emit('anki')

        elif is_running and was_running:
            if info['start_time']:
                info['session_duration'] = int((current_time - info['start_time']).total_seconds())

    def _check_steam_games(self, current_time: datetime):
        """检查 Steam 游戏进程状态"""
        info = self.monitored_processes['steam_games']
        was_running = info['is_running']

        # 查找当前运行的游戏
        running_games = self._find_running_games()
        is_running = len(running_games) > 0

        if is_running and not was_running:
            # 游戏刚启动
            info['is_running'] = True
            info['start_time'] = current_time
            info['session_duration'] = 0

            # 记录当前游戏名
            game_names = list(running_games.keys())
            info['current_game'] = game_names[0] if game_names else None

            if self.on_session_start:
                self.session_ids['steam_games'] = self.on_session_start('steam_games')
            self.process_started.emit('steam')

            # 发出检测到游戏的信号
            if info['current_game']:
                self.game_detected.emit(info['current_game'])

        elif not is_running and was_running:
            # 游戏刚关闭
            if info['start_time']:
                session_duration = int((current_time - info['start_time']).total_seconds())
                info['today_duration'] += session_duration

            info['is_running'] = False
            info['start_time'] = None
            info['session_duration'] = 0
            info['current_game'] = None

            if self.on_session_end and self.session_ids['steam_games']:
                self.on_session_end(self.session_ids['steam_games'])
                self.session_ids['steam_games'] = None
            self.process_stopped.emit('steam')

        elif is_running and was_running:
            # 游戏持续运行
            if info['start_time']:
                info['session_duration'] = int((current_time - info['start_time']).total_seconds())

            # 更新当前游戏名（可能切换了游戏）
            game_names = list(running_games.keys())
            if game_names:
                new_game = game_names[0]
                if new_game != info['current_game']:
                    info['current_game'] = new_game
                    self.game_detected.emit(new_game)

        # 保存运行中的游戏列表
        self.running_games = running_games

    def get_status(self) -> dict:
        """获取当前所有进程的状态"""
        status = {}

        # Anki 状态
        anki_info = self.monitored_processes['anki']
        total_seconds = anki_info['today_duration'] + anki_info['session_duration']
        status['anki'] = {
            'is_running': anki_info['is_running'],
            'session_duration': anki_info['session_duration'],
            'today_duration': total_seconds,
            'today_minutes': total_seconds // 60,
        }

        # Steam 游戏状态（为了兼容性，键名仍为 'steam'）
        game_info = self.monitored_processes['steam_games']
        total_seconds = game_info['today_duration'] + game_info['session_duration']
        status['steam'] = {
            'is_running': game_info['is_running'],
            'session_duration': game_info['session_duration'],
            'today_duration': total_seconds,
            'today_minutes': total_seconds // 60,
            'current_game': game_info.get('current_game'),
        }

        return status

    def get_app_status(self, app_name: str) -> dict:
        """获取指定应用程序的状态"""
        if app_name == 'steam':
            app_name = 'steam_games'

        info = self.monitored_processes.get(app_name)
        if not info:
            return {'is_running': False, 'session_duration': 0, 'today_duration': 0, 'today_minutes': 0}

        total_seconds = info['today_duration'] + info['session_duration']
        result = {
            'is_running': info['is_running'],
            'session_duration': info['session_duration'],
            'today_duration': total_seconds,
            'today_minutes': total_seconds // 60,
        }

        if app_name == 'steam_games':
            result['current_game'] = info.get('current_game')

        return result

    def set_today_duration(self, app_name: str, seconds: int):
        """设置今日累计时长"""
        if app_name == 'steam':
            app_name = 'steam_games'
        if app_name in self.monitored_processes:
            self.monitored_processes[app_name]['today_duration'] = seconds

    def reset_today_duration(self, app_name: str = None):
        """重置今日时长"""
        if app_name == 'steam':
            app_name = 'steam_games'

        if app_name:
            if app_name in self.monitored_processes:
                self.monitored_processes[app_name]['today_duration'] = 0
        else:
            for info in self.monitored_processes.values():
                info['today_duration'] = 0

    def kill_process(self, app_name: str) -> bool:
        """强制关闭指定应用程序"""
        killed = False

        if app_name == 'steam':
            # 关闭所有运行中的游戏进程
            for game_name, game_info in self.running_games.items():
                try:
                    proc = psutil.Process(game_info['pid'])
                    proc.terminate()
                    try:
                        proc.wait(timeout=3)
                    except psutil.TimeoutExpired:
                        proc.kill()
                    killed = True
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
        else:
            info = self.monitored_processes.get(app_name)
            if info:
                try:
                    for proc in psutil.process_iter(['name', 'pid']):
                        try:
                            proc_name = proc.info['name']
                            if proc_name and proc_name.lower() in [n.lower() for n in info['exe_names']]:
                                proc.terminate()
                                try:
                                    proc.wait(timeout=3)
                                except psutil.TimeoutExpired:
                                    proc.kill()
                                killed = True
                        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                            continue
                except Exception:
                    pass

        return killed

    def is_steam_running(self) -> bool:
        """检查是否有 Steam 游戏正在运行"""
        return self.monitored_processes['steam_games']['is_running']

    def is_anki_running(self) -> bool:
        """检查 Anki 是否正在运行"""
        return self.monitored_processes['anki']['is_running']

    def get_steam_today_minutes(self) -> int:
        """获取今日游戏分钟数"""
        info = self.monitored_processes['steam_games']
        total_seconds = info['today_duration'] + info['session_duration']
        return total_seconds // 60

    def get_anki_today_minutes(self) -> int:
        """获取今日 Anki 使用分钟数"""
        info = self.monitored_processes['anki']
        total_seconds = info['today_duration'] + info['session_duration']
        return total_seconds // 60

    def get_current_game(self) -> Optional[str]:
        """获取当前运行的游戏名"""
        return self.monitored_processes['steam_games'].get('current_game')

    def get_running_games(self) -> List[str]:
        """获取所有运行中的游戏列表"""
        return [info['name'] for info in self.running_games.values()]
