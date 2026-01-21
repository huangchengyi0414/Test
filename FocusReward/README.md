# FocusReward

**专注学习，赚取娱乐** - 一款帮助用户建立健康生产力习惯的桌面应用程序。

## 功能特点

- **Anki 监控**: 自动读取 Anki 数据库，统计每日复习卡片数量
- **Steam 监控**: 追踪 Steam 运行时间
- **时间兑换**: 通过复习卡片赚取游戏时间（可自定义兑换比例）
- **自动限制**: 游戏时间用尽时自动关闭 Steam
- **历史统计**: 查看过去 30 天的学习和游戏数据图表

## 系统要求

- Windows 10/11
- Python 3.8+
- Anki（用于学习追踪）
- Steam（用于游戏时间管理）

## 安装步骤

### 1. 安装 Python 依赖

```bash
cd FocusReward
pip install -r requirements.txt
```

### 2. 运行程序

```bash
python main.py
```

## 使用说明

### 首次设置

1. 启动程序后，点击「设置」标签页
2. 点击「浏览...」选择 Anki 数据库文件
   - Windows 默认路径: `C:\Users\<用户名>\AppData\Roaming\Anki2\<配置文件名>\collection.anki2`
3. 调整兑换比例（默认: 复习 10 张卡片 = 5 分钟游戏时间）
4. 点击「保存设置」

### 日常使用

1. 程序会在后台自动监控 Anki 和 Steam
2. 复习 Anki 卡片会自动累积游戏时间
3. 当 Steam 运行时，游戏时间会自动消耗
4. 时间用尽时会收到警告通知，随后 Steam 会被自动关闭

### 紧急功能

- **紧急暂停 5 分钟**: 每日可使用一次，获得额外 5 分钟缓冲时间
- **今日解除限制**: 完全解除当日的时间限制（会被记录）

## 项目结构

```
FocusReward/
├── main.py              # 程序入口
├── requirements.txt     # Python 依赖
├── README.md           # 说明文档
├── data/               # 数据目录（自动创建）
│   └── focusreward.db  # 本地数据库
├── src/                # 源代码目录
│   ├── __init__.py
│   ├── database.py     # 数据库管理
│   ├── process_monitor.py  # 进程监控
│   ├── anki_reader.py  # Anki 数据读取
│   ├── time_manager.py # 时间管理
│   ├── notifications.py # 系统通知
│   └── main_window.py  # 主窗口 UI
└── assets/             # 资源文件目录
```

## 配置说明

所有设置保存在本地 SQLite 数据库中：

| 设置项 | 说明 | 默认值 |
|--------|------|--------|
| anki_db_path | Anki 数据库路径 | 自动检测 |
| cards_per_exchange | 每次兑换需要的卡片数 | 10 |
| minutes_per_exchange | 每次兑换获得的分钟数 | 5 |
| check_interval | 监控检查间隔（秒） | 30 |
| warning_minutes | 警告阈值（分钟） | 5 |

## 常见问题

### Q: 程序找不到 Anki 数据库？
A: 请手动在设置页面选择 `collection.anki2` 文件路径。

### Q: Steam 没有被正确监控？
A: 确保 Steam 客户端正在运行（steam.exe 进程存在）。

### Q: 如何完全退出程序？
A: 右键点击系统托盘图标，选择「退出」。

## 开发说明

### 技术栈
- Python 3.8+
- PyQt5 (GUI 框架)
- psutil (进程监控)
- matplotlib (图表可视化)
- SQLite (本地数据存储)

### 打包为可执行文件

```bash
pip install pyinstaller
pyinstaller --onefile --windowed --name FocusReward main.py
```

## 许可证

MIT License
