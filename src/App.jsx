import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Edit3,
  FileText,
  Languages,
  Pause,
  Play,
  Plus,
  RefreshCcw,
  Search,
  Settings2,
  Save,
  Square,
  Trash2,
  Upload,
  X
} from "lucide-react";

const STORAGE_KEY = "daily-plan-dynamic-board-v2";
const BACKUP_KEY = "daily-plan-board-backups-v1";

const initialProjects = [
  { id: "p-stat", name: "统计学", icon: "stats" },
  { id: "p-r", name: "统计学/R", icon: "stats" },
  { id: "p-sem", name: "统计学/SEM", icon: "stats" },
  { id: "p-cet6", name: "六级", icon: "language" },
  { id: "p-english", name: "英语课程", icon: "language" },
  { id: "p-oral", name: "英语口试", icon: "language" },
  { id: "p-final", name: "英语笔试", icon: "language" },
  { id: "p-paper", name: "论文", icon: "paper" },
  { id: "p-mini-paper", name: "小论文", icon: "paper" },
  { id: "p-trade", name: "股票", icon: "trade" },
  { id: "p-fixed", name: "固定任务", icon: "book" }
];

const initialBoards = [
  { id: "today", title: "今日执行", hint: "今天必须推进", fixed: true },
  { id: "tomorrow", title: "明日预备", hint: "明天提前准备", fixed: true },
  { id: "stat", title: "统计学冲刺", hint: "6月5日前最高优先级", fixed: true },
  { id: "cet6", title: "六级冲刺", hint: "6月13日前重点", fixed: true },
  { id: "oral", title: "英语口试", hint: "6月16日前完成", fixed: true },
  { id: "final", title: "英语笔试", hint: "6月23日前完成", fixed: true },
  { id: "paper", title: "论文/小论文", hint: "低强度不断线", fixed: true },
  { id: "trade", title: "股票复盘", hint: "每天最多1.5小时", fixed: true },
  { id: "done", title: "已完成", hint: "完成后拖到这里", fixed: true }
];

const initialTasks = [
  ["t1", "today", "统计学：做方法选择表", "5月25日", "高", "p-stat", "60分钟", "整理题目特征→统计方法→H0→看哪个sig→结论句。", "完成7种方法的名称和适用场景。"],
  ["t2", "today", "R语言：基础代码启动", "5月25日", "高", "p-r", "45分钟", "写出read.csv、head、str、summary、mean、sd。", "默写3行代码。"],
  ["t3", "today", "线上学术写作：确认题目", "5月25日", "高", "p-english", "30分钟", "复制题目、字数、评分要求，列出中文三点提纲。", "只确认题目和截止时间。"],
  ["t4", "stat", "T检验与ANOVA题库训练", "5月26日", "高", "p-stat", "120分钟", "单样本T、独立样本T、配对T、单因素ANOVA各做题并写结论。", "完成5道T检验题。"],
  ["t5", "stat", "相关、回归、因子分析模板", "5月27日", "高", "p-stat", "150分钟", "整理cor.test、lm、KMO/Bartlett、旋转载荷解读。", "完成回归解读模板。"],
  ["t6", "stat", "SEM第一轮：概念与方程", "5月28日", "高", "p-sem", "120分钟", "复习潜变量、标识变量、内源/外生变量、测量模型、结构模型。", "写出SEM定义和两个模型区别。"],
  ["t7", "stat", "中介与调节专项", "5月29日", "中", "p-stat", "90分钟", "中介路径c/a/b/c'；调节四类组合；交互项判断。", "背：中介看机制，调节看交互项。"],
  ["t8", "stat", "统计学第一轮闭环模拟", "5月30日", "高", "p-stat", "180分钟", "限时做基础统计+SEM+中介调节+R代码，整理错题。", "完成20道题或半套模拟。"],
  ["t9", "stat", "时间序列与ARIMA", "5月31日", "中", "p-stat", "120分钟", "STC预测、季节因素、ARIMA(p,d,q)(P,D,Q)s参数含义。", "做1道STC预测题。"],
  ["t10", "stat", "统计学结果解读专项", "6月1日", "高", "p-stat", "150分钟", "T检验、ANOVA、相关、回归、因子、SEM各写一套结论模板。", "完成5类解读模板。"],
  ["t11", "stat", "统计学全真模拟", "6月3日", "高", "p-stat", "180分钟", "闭卷模拟：简答、解读、计算、R代码。按错因分类。", "完成半套模拟+10个错题。"],
  ["t12", "stat", "考前收口：三张表默写", "6月4日", "高", "p-stat", "150分钟", "统计方法选择表、结果解读模板表、R代码模板表。", "背方法选择表和R代码表。"],
  ["t13", "cet6", "六级听力真题1套", "6月6日", "高", "p-cet6", "90分钟", "完成听力1套，记录10个没听出来的表达，二刷错题音频。", "听力20分钟。"],
  ["t14", "cet6", "六级写作模板+仿写", "6月7日", "高", "p-cet6", "60分钟", "背1个议论文模板，仿写1篇，整理5个高级替换表达。", "背作文开头段。"],
  ["t15", "cet6", "六级阅读提速训练", "6月8日", "高", "p-cet6", "90分钟", "完成选词填空、长篇匹配、仔细阅读，按定位词复盘。", "仔细阅读1篇。"],
  ["t16", "cet6", "六级完整模拟", "6月10日", "高", "p-cet6", "180分钟", "严格计时做一套六级真题，批改并归因。", "只完成听力+阅读。"],
  ["t17", "cet6", "六级考前收口", "6月12日", "高", "p-cet6", "90分钟", "听力轻练、阅读错题、作文模板、翻译高频词。", "听力10分钟+看作文模板。"],
  ["t18", "oral", "口试5个话题卡", "6月14日", "高", "p-oral", "120分钟", "每个话题写核心观点、个人观点、例子、追问句、接话句。", "完成3张话题卡。"],
  ["t19", "oral", "口试全流程模拟", "6月15日", "高", "p-oral", "90分钟", "5个话题逐个30秒表达，找同学模拟2-3人对话。", "练3个话题，每个30秒。"],
  ["t20", "final", "英语笔试Unit 1-2", "6月17日", "高", "p-final", "150分钟", "Text 1中心思想、关键词、段落结构；英译汉核心段；汉译英句子。", "Unit 1 Text 1精读+翻译3句。"],
  ["t21", "final", "英语笔试Unit 3", "6月18日", "中", "p-final", "90分钟", "Unit 3 Text 1中心思想、关键词、英译汉1段、汉译英5句。", "Unit 3读1遍+翻译3句。"],
  ["t22", "final", "英语笔试Unit 4-5", "6月19日", "高", "p-final", "150分钟", "Unit 4精读，Unit 5通读，整理核心段落和指令类写作模板。", "完成Unit 4阅读卡。"],
  ["t23", "final", "英语笔试模拟", "6月20日", "高", "p-final", "180分钟", "阅读+翻译+写作限时模拟，批改阅读错题和翻译表达。", "完成阅读+英译汉。"],
  ["t24", "paper", "毕业论文中介变量查找", "每日低强度", "中", "p-paper", "20-30分钟", "围绕X和Y查1-3篇文献，记录候选中介、理论依据、量表来源。", "读1篇摘要。"],
  ["t25", "paper", "小论文低强度推进", "每日可选", "低", "p-mini-paper", "20分钟", "只改一个小标题、一段话或整理一个文献点。", "改1句话。"],
  ["t26", "trade", "A股盘中观察与买入逻辑", "交易日9:30-10:00", "中", "p-trade", "30分钟", "记录买入/不买的理由、题材、技术位置、仓位、止损。", "只写是否操作和原因。"],
  ["t27", "trade", "A股14:30选股", "交易日14:30-15:00", "中", "p-trade", "30分钟", "筛选明日观察标的，标注板块、形态、风险。", "写1只观察股。"],
  ["t28", "trade", "股票晚间复盘", "每日20:30-21:00", "中", "p-trade", "30分钟", "大盘、板块、持仓、买点、纪律、明日计划、体系验证。", "只写持仓变化和明日观察。"],
  ["t29", "today", "每日诵读《金刚经》", "每日8:00-8:30", "中", "p-fixed", "30分钟", "早上坐下后先读第一页，不刷手机。", "读5分钟。"]
].map(([id, board, title, date, priority, projectId, time, detail, minimum]) => ({
  id,
  board,
  title,
  date,
  priority,
  projectId,
  time,
  detail,
  minimum,
  loggedSeconds: 0,
  quadrant: priority === "高" ? "urgent-important" : "important-not-urgent",
  smartGoal: minimum,
  knowledgeNote: "",
  energyLevel: priority === "高" ? "high" : "medium"
}));

const quadrants = [
  { id: "urgent-important", label: "紧急且重要", short: "急重", hint: "立即推进，避免拖延" },
  { id: "important-not-urgent", label: "不紧急但重要", short: "重不急", hint: "提前安排，持续复利" },
  { id: "urgent-not-important", label: "紧急但不重要", short: "急不重", hint: "压缩处理，避免占用深度时间" },
  { id: "not-urgent-not-important", label: "不紧急且不重要", short: "低价值", hint: "拒绝、删除或延后" }
];

const energyLevels = [
  { id: "high", label: "高精力", hint: "适合考试、写作、模拟、复盘" },
  { id: "medium", label: "中精力", hint: "适合整理、练习、阅读" },
  { id: "low", label: "低精力", hint: "只做最低版本，保持不断线" }
];

const quadrantById = Object.fromEntries(quadrants.map(item => [item.id, item]));
const energyById = Object.fromEntries(energyLevels.map(item => [item.id, item]));

const emptyTask = {
  title: "",
  board: "today",
  projectId: "p-stat",
  priority: "中",
  date: "今日",
  time: "30分钟",
  detail: "",
  minimum: "完成最低版本。",
  quadrant: "important-not-urgent",
  smartGoal: "",
  knowledgeNote: "",
  energyLevel: "medium"
};

const idleTimer = {
  status: "idle",
  activeTaskId: "t1",
  startedAt: null,
  elapsedBefore: 0,
  currentLogType: null
};

const priorityClass = {
  高: "bg-red-100 text-red-700 border-red-200",
  中: "bg-amber-100 text-amber-700 border-amber-200",
  低: "bg-slate-100 text-slate-700 border-slate-200"
};

const iconMap = {
  stats: BarChart3,
  language: Languages,
  paper: FileText,
  trade: BarChart3,
  book: BookOpen
};

const navItems = [
  { id: "top", label: "顶部", icon: CalendarDays },
  { id: "timer", label: "计时", icon: Clock3 },
  { id: "controls", label: "导入/新增", icon: Settings2 },
  { id: "summary", label: "概览", icon: BarChart3 },
  { id: "self-management", label: "自我管理", icon: CheckCircle2 },
  { id: "project-stats", label: "项目统计", icon: BarChart3 },
  { id: "search-filter", label: "搜索筛选", icon: Search },
  { id: "board", label: "任务看板", icon: FileText },
  { id: "logs", label: "日志", icon: BookOpen }
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Button({ className = "", variant = "default", size = "default", type = "button", ...props }) {
  const variants = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
    ghost: "text-slate-700 hover:bg-slate-100"
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3"
  };

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

function Card({ className = "", ...props }) {
  return <div className={cn("rounded-lg border bg-white text-slate-950", className)} {...props} />;
}

function CardContent({ className = "", ...props }) {
  return <div className={className} {...props} />;
}

function formatSeconds(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function minutesLabel(seconds) {
  if (!seconds) return "0 分钟";
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} 分钟`;
}

function timeString(date = new Date()) {
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function todayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeTask(task) {
  return {
    ...task,
    quadrant: task.quadrant || (task.priority === "高" ? "urgent-important" : "important-not-urgent"),
    smartGoal: task.smartGoal || task.minimum || "",
    knowledgeNote: task.knowledgeNote || "",
    energyLevel: task.energyLevel || (task.priority === "高" ? "high" : "medium")
  };
}

function inferPriority(text) {
  if (/高|重要|紧急|考试|截止|必须|冲刺|模拟/.test(text)) return "高";
  if (/低|可选|低强度|有空|顺手/.test(text)) return "低";
  return "中";
}

function inferQuadrant(text, priority) {
  const urgent = /紧急|今天|今日|明天|截止|考试|必须|ddl|deadline|冲刺/.test(text);
  const important = /重要|考试|论文|六级|统计|复盘|目标|核心|必须|长期/.test(text) || priority === "高";
  if (urgent && important) return "urgent-important";
  if (!urgent && important) return "important-not-urgent";
  if (urgent && !important) return "urgent-not-important";
  return "not-urgent-not-important";
}

function inferEnergy(priority, text) {
  if (priority === "高" || /模拟|写作|论文|考试|复盘|深度|专项/.test(text)) return "high";
  if (/低强度|摘要|整理|背|看|读|最低/.test(text)) return "low";
  return "medium";
}

function inferBoard(text, boards) {
  const lower = text.toLowerCase();
  const direct = boards.find(board => text.includes(board.title) || lower.includes(board.id));
  if (direct) return direct.id;
  if (/明天|明日|tomorrow/.test(text)) return "tomorrow";
  if (/完成|已完成|done/.test(text)) return "done";
  if (/统计|R语言|SEM|T检验|ANOVA|回归|因子/.test(text)) return "stat";
  if (/六级|听力|阅读|翻译|作文/.test(text)) return "cet6";
  if (/口试|话题|表达/.test(text)) return "oral";
  if (/笔试|Unit|精读/.test(text)) return "final";
  if (/论文|文献|摘要|中介变量/.test(text)) return "paper";
  if (/股票|A股|复盘|选股|持仓/.test(text)) return "trade";
  return "today";
}

function inferProject(text, projects) {
  const direct = projects.find(project => text.includes(project.name));
  if (direct) return direct.id;
  if (/R语言|read\.csv|代码/.test(text)) return "p-r";
  if (/SEM|结构方程/.test(text)) return "p-sem";
  if (/统计|T检验|ANOVA|回归|因子|ARIMA/.test(text)) return "p-stat";
  if (/六级|听力|阅读|翻译|作文/.test(text)) return "p-cet6";
  if (/口试|话题|表达/.test(text)) return "p-oral";
  if (/笔试|Unit|精读/.test(text)) return "p-final";
  if (/小论文/.test(text)) return "p-mini-paper";
  if (/论文|文献|中介变量/.test(text)) return "p-paper";
  if (/股票|A股|复盘|选股|持仓/.test(text)) return "p-trade";
  return projects[0]?.id || "p-stat";
}

function inferDate(text) {
  const dateMatch = text.match(/(?:\d{1,2}月\d{1,2}日|今天|今日|明天|明日|每日|交易日|周[一二三四五六日天])/);
  return dateMatch?.[0] || "今日";
}

function inferTime(text) {
  const timeMatch = text.match(/\d+(?:-\d+)?\s*(?:分钟|小时|min|h)/i);
  return timeMatch ? timeMatch[0].replace(/\s+/g, "") : "30分钟";
}

function cleanImportTitle(line) {
  return line
    .replace(/^[\s\-*•·\d.、]+/, "")
    .replace(/\[[^\]]+\]/g, "")
    .replace(/【[^】]+】/g, "")
    .trim();
}

function parsePlanText(text, boards, projects) {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !/^#+\s*/.test(line))
    .map((line, index) => {
      const title = cleanImportTitle(line).slice(0, 80);
      const priority = inferPriority(line);
      const minimum = /最低|最小|minimum/i.test(line) ? line : "完成最低版本。";
      return normalizeTask({
        id: `import-${Date.now()}-${index}`,
        board: inferBoard(line, boards),
        title: title || `导入任务 ${index + 1}`,
        date: inferDate(line),
        priority,
        projectId: inferProject(line, projects),
        time: inferTime(line),
        detail: line,
        minimum,
        loggedSeconds: 0,
        quadrant: inferQuadrant(line, priority),
        smartGoal: `${title || line}；${inferDate(line)}；预计${inferTime(line)}。`,
        knowledgeNote: /复盘|总结|错题|文献|模板|知识|沉淀/.test(line) ? line : "",
        energyLevel: inferEnergy(priority, line)
      });
    });
}

function normalizeTimer(timer, tasks) {
  if (!timer || typeof timer !== "object") return idleTimer;
  const activeTaskExists = tasks.some(t => t.id === timer.activeTaskId);
  return {
    status: ["idle", "work", "rest"].includes(timer.status) ? timer.status : "idle",
    activeTaskId: activeTaskExists ? timer.activeTaskId : tasks[0]?.id || null,
    startedAt: timer.startedAt || null,
    elapsedBefore: Number(timer.elapsedBefore) || 0,
    currentLogType: timer.currentLogType || null
  };
}

function buildDownload(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  return URL.createObjectURL(blob);
}

function isValidBoardBackup(data) {
  return (
    data &&
    typeof data === "object" &&
    Array.isArray(data.boards) &&
    Array.isArray(data.projects) &&
    Array.isArray(data.tasks) &&
    Array.isArray(data.logs)
  );
}

export default function DynamicDailyPlanBoard() {
  const fileInputRef = useRef(null);
  const [boards, setBoards] = useState(initialBoards);
  const [projects, setProjects] = useState(initialProjects);
  const [tasks, setTasks] = useState(initialTasks);
  const [logs, setLogs] = useState([]);
  const [backups, setBackups] = useState([]);
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("全部");
  const [draggingId, setDraggingId] = useState(null);
  const [newBoardName, setNewBoardName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newTask, setNewTask] = useState(emptyTask);
  const [importText, setImportText] = useState("");
  const [importPreview, setImportPreview] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timer, setTimer] = useState(idleTimer);
  const [tick, setTick] = useState(Date.now());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedTasks = (Array.isArray(parsed.tasks) ? parsed.tasks : initialTasks).map(normalizeTask);
        if (Array.isArray(parsed.boards)) setBoards(parsed.boards);
        if (Array.isArray(parsed.projects)) setProjects(parsed.projects);
        setTasks(savedTasks);
        if (Array.isArray(parsed.logs)) setLogs(parsed.logs);
        if (parsed.timer) setTimer(normalizeTimer(parsed.timer, savedTasks));
      }
      const savedBackups = localStorage.getItem(BACKUP_KEY);
      if (savedBackups) {
        const parsedBackups = JSON.parse(savedBackups);
        if (Array.isArray(parsedBackups)) setBackups(parsedBackups);
      }
    } catch (error) {
      console.warn("Failed to load saved board", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ boards, projects, tasks, logs, timer }));
  }, [loaded, boards, projects, tasks, logs, timer]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
  }, [loaded, backups]);

  useEffect(() => {
    const interval = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const projectById = useMemo(() => Object.fromEntries(projects.map(p => [p.id, p])), [projects]);
  const taskById = useMemo(() => Object.fromEntries(tasks.map(t => [t.id, t])), [tasks]);
  const todayLogs = useMemo(() => logs.filter(log => log.day === todayKey()), [logs]);
  const workSecondsToday = useMemo(() => todayLogs.filter(l => l.type === "work").reduce((sum, l) => sum + l.seconds, 0), [todayLogs]);
  const restSecondsToday = useMemo(() => todayLogs.filter(l => l.type === "rest").reduce((sum, l) => sum + l.seconds, 0), [todayLogs]);

  const currentElapsed = useMemo(() => {
    if (timer.status === "idle" || !timer.startedAt) return timer.elapsedBefore;
    return timer.elapsedBefore + Math.floor((tick - timer.startedAt) / 1000);
  }, [timer, tick]);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tasks.filter(t => {
      const projectName = projectById[t.projectId]?.name || "";
      const hitQuery = !normalizedQuery || [t.title, t.detail, t.minimum, projectName, t.date].join(" ").toLowerCase().includes(normalizedQuery);
      const hitProject = projectFilter === "全部" || t.projectId === projectFilter;
      return hitQuery && hitProject;
    });
  }, [tasks, query, projectFilter, projectById]);

  const projectStats = useMemo(() => {
    const activeSeconds = timer.status === "work" && timer.activeTaskId ? currentElapsed : 0;
    const activeTask = taskById[timer.activeTaskId];
    return projects
      .map(project => {
        const projectTasks = tasks.filter(task => task.projectId === project.id);
        const loggedSeconds = projectTasks.reduce((sum, task) => sum + (task.loggedSeconds || 0), 0);
        const todaySeconds = todayLogs
          .filter(log => log.type === "work" && projectTasks.some(task => task.id === log.taskId))
          .reduce((sum, log) => sum + log.seconds, 0);
        const liveSeconds = activeTask?.projectId === project.id ? activeSeconds : 0;
        return {
          ...project,
          taskCount: projectTasks.length,
          doneCount: projectTasks.filter(task => task.board === "done").length,
          loggedSeconds,
          todaySeconds: todaySeconds + liveSeconds
        };
      })
      .filter(stat => stat.taskCount > 0 || stat.todaySeconds > 0 || stat.loggedSeconds > 0)
      .sort((a, b) => b.todaySeconds - a.todaySeconds || b.loggedSeconds - a.loggedSeconds);
  }, [projects, tasks, todayLogs, timer.status, timer.activeTaskId, currentElapsed, taskById]);

  const selfManagementStats = useMemo(() => {
    const quadrantCounts = Object.fromEntries(quadrants.map(item => [item.id, 0]));
    const energyCounts = Object.fromEntries(energyLevels.map(item => [item.id, 0]));
    let smartReady = 0;
    let knowledgeReady = 0;

    tasks.forEach(task => {
      quadrantCounts[task.quadrant || "important-not-urgent"] = (quadrantCounts[task.quadrant || "important-not-urgent"] || 0) + 1;
      energyCounts[task.energyLevel || "medium"] = (energyCounts[task.energyLevel || "medium"] || 0) + 1;
      if ((task.smartGoal || "").trim()) smartReady += 1;
      if ((task.knowledgeNote || "").trim()) knowledgeReady += 1;
    });

    const total = Math.max(tasks.length, 1);
    return {
      quadrantCounts,
      energyCounts,
      smartReady,
      knowledgeReady,
      smartRate: Math.round((smartReady / total) * 100),
      knowledgeRate: Math.round((knowledgeReady / total) * 100)
    };
  }, [tasks]);

  const activeTask = taskById[timer.activeTaskId];
  const boardTasks = boardId => filteredTasks.filter(t => t.board === boardId);
  const sidebarWidth = sidebarCollapsed ? 56 : 176;
  const contentOffset = sidebarWidth + 28;

  const recordSegment = type => {
    if (!timer.startedAt) return;
    const seconds = Math.max(1, Math.floor((Date.now() - timer.startedAt) / 1000) + timer.elapsedBefore);
    const task = taskById[timer.activeTaskId];
    const log = {
      id: `log-${Date.now()}`,
      day: todayKey(),
      type,
      taskId: timer.activeTaskId,
      taskTitle: task?.title || "未指定任务",
      projectName: projectById[task?.projectId]?.name || "未指定项目",
      seconds,
      start: timeString(new Date(timer.startedAt)),
      end: timeString(new Date())
    };
    setLogs(prev => [log, ...prev]);
    if (type === "work" && task) {
      setTasks(prev => prev.map(t => (t.id === timer.activeTaskId ? { ...t, loggedSeconds: (t.loggedSeconds || 0) + seconds } : t)));
    }
  };

  const stopTimer = () => {
    if (timer.status === "work") recordSegment("work");
    if (timer.status === "rest") recordSegment("rest");
    setTimer(prev => ({ ...prev, status: "idle", startedAt: null, elapsedBefore: 0, currentLogType: null }));
  };

  const startWork = taskId => {
    const nextActiveTaskId = taskId || timer.activeTaskId || tasks.find(t => t.board !== "done")?.id || null;
    if (!nextActiveTaskId) return;
    if (timer.status === "work" && timer.activeTaskId === nextActiveTaskId) return;
    if (timer.status === "work") recordSegment("work");
    if (timer.status === "rest") recordSegment("rest");
    setTimer(prev => ({
      ...prev,
      status: "work",
      activeTaskId: nextActiveTaskId,
      startedAt: Date.now(),
      elapsedBefore: 0,
      currentLogType: "work"
    }));
  };

  const startRest = () => {
    if (timer.status === "work") recordSegment("work");
    if (timer.status === "rest") return;
    setTimer(prev => ({ ...prev, status: "rest", startedAt: Date.now(), elapsedBefore: 0, currentLogType: "rest" }));
  };

  const addBoard = () => {
    const title = newBoardName.trim();
    if (!title) return;
    setBoards(prev => [...prev, { id: `board-${Date.now()}`, title, hint: "自定义日程表", fixed: false }]);
    setNewBoardName("");
  };

  const deleteBoard = boardId => {
    const board = boards.find(b => b.id === boardId);
    if (!board || board.fixed) return;
    if (!window.confirm(`删除计划表“${board.title}”？其中任务会移动到“今日执行”。`)) return;
    setTasks(prev => prev.map(t => (t.board === boardId ? { ...t, board: "today" } : t)));
    setBoards(prev => prev.filter(b => b.id !== boardId));
  };

  const addProject = () => {
    const name = newProjectName.trim();
    if (!name) return;
    const id = `project-${Date.now()}`;
    setProjects(prev => [...prev, { id, name, icon: "paper" }]);
    setNewProjectName("");
    setNewTask(prev => ({ ...prev, projectId: id }));
  };

  const deleteProject = projectId => {
    const project = projects.find(p => p.id === projectId);
    const inUse = tasks.some(t => t.projectId === projectId);
    if (inUse) {
      window.alert("这个项目仍有任务，先删除或改掉相关任务后才能删除项目。");
      return;
    }
    if (!window.confirm(`删除项目“${project?.name || projectId}”？`)) return;
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const addTask = () => {
    const title = newTask.title.trim();
    if (!title) return;
    setTasks(prev => [
      normalizeTask({
        id: `task-${Date.now()}`,
        ...newTask,
        title,
        detail: newTask.detail.trim() || "自定义任务。",
        minimum: newTask.minimum.trim() || "完成最低版本。",
        loggedSeconds: 0
      }),
      ...prev
    ]);
    setNewTask(prev => ({ ...prev, title: "", detail: "", smartGoal: "", knowledgeNote: "", minimum: "完成最低版本。" }));
  };

  const previewImport = () => {
    const parsed = parsePlanText(importText, boards, projects);
    setImportPreview(parsed);
  };

  const importPreviewTasks = () => {
    if (importPreview.length === 0) return;
    setTasks(prev => [...importPreview.map(normalizeTask), ...prev]);
    setImportText("");
    setImportPreview([]);
  };

  const updateTask = updates => {
    setTasks(prev => prev.map(task => (task.id === editingTaskId ? { ...task, ...updates } : task)));
    setEditingTaskId(null);
  };

  const deleteTask = taskId => {
    const task = taskById[taskId];
    if (!task) return;
    if (!window.confirm(`删除任务“${task.title}”？关联日志会保留。`)) return;
    if (timer.status !== "idle" && timer.activeTaskId === taskId) {
      recordSegment(timer.status);
      setTimer(prev => ({ ...prev, status: "idle", startedAt: null, elapsedBefore: 0, currentLogType: null }));
    }
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const moveTask = (taskId, boardId) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, board: boardId } : t)));
  };

  const completeTask = taskId => {
    if (timer.status !== "idle" && timer.activeTaskId === taskId) {
      recordSegment(timer.status);
      setTimer(prev => ({ ...prev, status: "idle", startedAt: null, elapsedBefore: 0, currentLogType: null }));
    }
    moveTask(taskId, "done");
  };

  const resetBoard = () => {
    if (!window.confirm("重置会清空当前任务、项目和日志记录。建议先导出备份。确定继续？")) return;
    setBoards(initialBoards);
    setProjects(initialProjects);
    setTasks(initialTasks);
    setLogs([]);
    setQuery("");
    setProjectFilter("全部");
    setEditingTaskId(null);
    setTimer(idleTimer);
  };

  const exportBackup = () => {
    const fallbackData = { boards, projects, tasks, logs, timer };
    const savedData = localStorage.getItem(STORAGE_KEY);
    let backupData = fallbackData;
    try {
      backupData = savedData ? JSON.parse(savedData) : fallbackData;
    } catch (error) {
      backupData = fallbackData;
    }
    if (!savedData || !isValidBoardBackup(backupData)) {
      backupData = fallbackData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackData));
    }
    const url = buildDownload(backupData);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `daily-plan-backup-${todayKey()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const createLocalBackup = () => {
    const backup = {
      id: `backup-${Date.now()}`,
      name: `本地备份 ${new Date().toLocaleString("zh-CN", { hour12: false })}`,
      createdAt: new Date().toISOString(),
      taskCount: tasks.length,
      logCount: logs.length,
      data: {
        version: 3,
        boards,
        projects,
        tasks,
        logs,
        timer
      }
    };
    setBackups(prev => [backup, ...prev].slice(0, 8));
  };

  const restoreLocalBackup = backupId => {
    const backup = backups.find(item => item.id === backupId);
    if (!backup) return;
    if (!window.confirm(`恢复“${backup.name}”？当前看板会被覆盖。`)) return;
    const data = backup.data;
    const restoredTasks = Array.isArray(data.tasks) ? data.tasks.map(normalizeTask) : initialTasks;
    setBoards(Array.isArray(data.boards) ? data.boards : initialBoards);
    setProjects(Array.isArray(data.projects) ? data.projects : initialProjects);
    setTasks(restoredTasks);
    setLogs(Array.isArray(data.logs) ? data.logs : []);
    setTimer(normalizeTimer(data.timer, restoredTasks));
    setProjectFilter("全部");
    setQuery("");
    setEditingTaskId(null);
  };

  const deleteLocalBackup = backupId => {
    const backup = backups.find(item => item.id === backupId);
    if (!backup) return;
    if (!window.confirm(`删除“${backup.name}”？`)) return;
    setBackups(prev => prev.filter(item => item.id !== backupId));
  };

  const importBackup = async event => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!isValidBoardBackup(parsed)) {
        throw new Error("备份文件格式不正确");
      }
      if (!window.confirm("导入会覆盖当前本地数据。确定继续？")) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      window.location.reload();
    } catch (error) {
      window.alert("备份文件格式不正确");
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 p-3 text-slate-900 md:p-4">
      <SideNav collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} width={sidebarWidth} />
      <div
        className="min-w-0 space-y-5 overflow-hidden transition-[margin,width] duration-300"
        style={{
          marginLeft: contentOffset,
          width: `calc(100vw - ${contentOffset + 16}px)`
        }}
      >
        <header id="top" className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays className="h-4 w-4" />
                5月25日-6月23日 · 动态任务看板 + 学习计时器
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">考试冲刺与长期任务动态日程表</h1>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                可新增/删除计划表、项目和任务；可拖拽任务；计时器会记录每个日程的学习时间。
              </p>
            </div>
            <div className="flex min-w-0 flex-wrap gap-2">
              <Button onClick={exportBackup} variant="outline" className="rounded-2xl">
                <Download className="mr-2 h-4 w-4" />
                导出数据
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="rounded-2xl">
                <Upload className="mr-2 h-4 w-4" />
                导入数据
              </Button>
              <Button onClick={resetBoard} variant="outline" className="rounded-2xl text-red-600 hover:bg-red-50">
                <RefreshCcw className="mr-2 h-4 w-4" />
                重置全部
              </Button>
              <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={importBackup} className="hidden" />
            </div>
          </div>
        </header>

        <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <div id="timer" className="scroll-mt-6">
            <TimerPanel
              timer={timer}
              activeTask={activeTask}
              tasks={tasks}
              setTimer={setTimer}
              currentElapsed={currentElapsed}
              workSecondsToday={workSecondsToday + (timer.status === "work" ? currentElapsed : 0)}
              restSecondsToday={restSecondsToday + (timer.status === "rest" ? currentElapsed : 0)}
              startWork={startWork}
              startRest={startRest}
              stopTimer={stopTimer}
            />
          </div>

          <div id="controls" className="scroll-mt-6">
            <ControlPanel
              boards={boards}
              projects={projects}
              newBoardName={newBoardName}
              setNewBoardName={setNewBoardName}
              addBoard={addBoard}
              newProjectName={newProjectName}
              setNewProjectName={setNewProjectName}
              addProject={addProject}
              deleteProject={deleteProject}
              newTask={newTask}
              setNewTask={setNewTask}
              addTask={addTask}
              importText={importText}
              setImportText={setImportText}
              importPreview={importPreview}
              previewImport={previewImport}
              importPreviewTasks={importPreviewTasks}
            clearImportPreview={() => setImportPreview([])}
            backups={backups}
            createLocalBackup={createLocalBackup}
            restoreLocalBackup={restoreLocalBackup}
            deleteLocalBackup={deleteLocalBackup}
          />
          </div>
        </section>

        <section id="summary" className="scroll-mt-6 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="今日学习" value={formatSeconds(workSecondsToday + (timer.status === "work" ? currentElapsed : 0))} sub="工作/学习总时长" />
          <StatCard label="今日休息" value={formatSeconds(restSecondsToday + (timer.status === "rest" ? currentElapsed : 0))} sub="休息总时长" />
          <StatCard label="任务数量" value={tasks.length} sub="当前全部任务" />
          <StatCard label="已完成" value={tasks.filter(t => t.board === "done").length} sub="拖入已完成的任务" />
        </section>

        <SelfManagementPanel stats={selfManagementStats} />
        <ProjectStats stats={projectStats} />

        <section id="search-filter" className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="搜索任务：R语言、SEM、听力、口试、股票……"
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
            <select
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="全部">全部项目</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        <main id="board" className="scroll-mt-6 pb-4">
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {boards.map(board => {
              const tasksInBoard = boardTasks(board.id);
              return (
                <div
                  key={board.id}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => draggingId && moveTask(draggingId, board.id)}
                  className="min-w-0 rounded-3xl border border-slate-200 bg-white/80 p-3 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between gap-3 px-1">
                    <div>
                      <h2 className="font-semibold text-slate-900">{board.title}</h2>
                      <p className="text-xs text-slate-500">{board.hint}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{tasksInBoard.length}</span>
                      {!board.fixed && (
                        <button
                          type="button"
                          onClick={() => deleteBoard(board.id)}
                          className="rounded-full p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label={`删除${board.title}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="min-h-[180px] space-y-3">
                    {tasksInBoard.map(task =>
                      editingTaskId === task.id ? (
                        <TaskEditor
                          key={task.id}
                          task={task}
                          boards={boards}
                          projects={projects}
                          onCancel={() => setEditingTaskId(null)}
                          onSave={updateTask}
                        />
                      ) : (
                        <TaskCard
                          key={task.id}
                          task={task}
                          project={projectById[task.projectId]}
                          onDragStart={() => setDraggingId(task.id)}
                          onDragEnd={() => setDraggingId(null)}
                          onDone={() => completeTask(task.id)}
                          onDelete={() => deleteTask(task.id)}
                          onEdit={() => setEditingTaskId(task.id)}
                          onStart={() => startWork(task.id)}
                        />
                      )
                    )}
                    {tasksInBoard.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-400">把任务拖到这里</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        <div id="logs" className="scroll-mt-6">
          <LogPanel logs={todayLogs} />
        </div>
      </div>
    </div>
  );
}

function SideNav({ collapsed, setCollapsed, width }) {
  const jumpTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside
      className="fixed left-3 top-3 z-30 flex h-[calc(100vh-1.5rem)] shrink-0 flex-col rounded-3xl border border-slate-200 bg-white p-2 shadow-sm transition-[width] duration-300 md:left-4 md:top-4 md:h-[calc(100vh-2rem)]"
      style={{ width }}
    >
      <button
        type="button"
        onClick={() => setCollapsed(prev => !prev)}
        className={cn(
          "mb-3 flex h-10 items-center rounded-2xl text-slate-500 hover:bg-slate-100 hover:text-slate-800",
          collapsed ? "justify-center" : "justify-between px-3"
        )}
        aria-label={collapsed ? "展开工具栏" : "收起工具栏"}
      >
          {!collapsed && <span className="truncate text-sm font-medium">导航工具栏</span>}
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => jumpTo(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex h-10 w-full items-center rounded-2xl text-base text-slate-600 transition hover:bg-slate-100 hover:text-slate-900",
                collapsed ? "justify-center px-0" : "justify-start px-3"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="ml-2 truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function TimerPanel({ timer, activeTask, tasks, setTimer, currentElapsed, workSecondsToday, restSecondsToday, startWork, startRest, stopTimer }) {
  const statusText = timer.status === "work" ? "学习中" : timer.status === "rest" ? "休息中" : "未开始";
  const statusClass = timer.status === "work" ? "text-blue-600" : timer.status === "rest" ? "text-amber-500" : "text-slate-500";
  const availableTasks = tasks.filter(t => t.board !== "done");

  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardContent className="p-5 md:p-6">
        <div className="flex items-center gap-2 text-xl font-bold">
          <Clock3 className="h-6 w-6 text-blue-600" />
          打卡记录
        </div>
        <div className="mt-5 text-center">
          <div className={`text-5xl font-bold ${statusClass}`}>{statusText}</div>
          <div className="mt-3 text-5xl font-semibold tabular-nums text-slate-800">{formatSeconds(currentElapsed)}</div>
          <div className="mt-3 text-lg text-slate-500">
            学习：{formatSeconds(workSecondsToday)} 休息：{formatSeconds(restSecondsToday)}
          </div>
        </div>

        <div className="mx-auto mt-5 max-w-2xl rounded-2xl bg-slate-50 p-3">
          <label className="mb-1 block text-xs font-medium text-slate-500">当前计时任务</label>
          <select
            value={timer.activeTaskId || ""}
            onChange={e => setTimer(prev => ({ ...prev, activeTaskId: e.target.value }))}
            disabled={timer.status !== "idle"}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none disabled:bg-slate-100"
          >
            {availableTasks.map(t => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">当前：{activeTask?.title || "未选择任务"}</p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Button onClick={stopTimer} className="h-14 rounded-2xl bg-red-500 px-8 text-lg hover:bg-red-600">
            <Square className="mr-2 h-5 w-5" />
            下班/结束
          </Button>
          <Button onClick={() => startWork()} className="h-14 rounded-2xl bg-blue-600 px-8 text-lg hover:bg-blue-700">
            <Play className="mr-2 h-5 w-5" />
            继续上班
          </Button>
          <Button onClick={startRest} variant="outline" className="h-14 rounded-2xl px-8 text-lg">
            <Pause className="mr-2 h-5 w-5" />
            休息
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ControlPanel({
  boards,
  projects,
  newBoardName,
  setNewBoardName,
  addBoard,
  newProjectName,
  setNewProjectName,
  addProject,
  deleteProject,
  newTask,
  setNewTask,
  addTask,
  importText,
  setImportText,
  importPreview,
  previewImport,
  importPreviewTasks,
  clearImportPreview,
  backups,
  createLocalBackup,
  restoreLocalBackup,
  deleteLocalBackup
}) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardContent className="space-y-4 p-5 md:p-6">
        <div>
          <h2 className="text-lg font-bold">自定义计划和项目</h2>
          <p className="text-sm text-slate-500">可以新增日程表、项目和任务。未被任务使用的项目可删除。</p>
        </div>

        <SmartImportPanel
          boards={boards}
          projects={projects}
          importText={importText}
          setImportText={setImportText}
          importPreview={importPreview}
          previewImport={previewImport}
          importPreviewTasks={importPreviewTasks}
          clearImportPreview={clearImportPreview}
        />

        <LocalBackupPanel
          backups={backups}
          createLocalBackup={createLocalBackup}
          restoreLocalBackup={restoreLocalBackup}
          deleteLocalBackup={deleteLocalBackup}
        />

        <div className="grid gap-2 md:grid-cols-[1fr_auto]">
          <input value={newBoardName} onChange={e => setNewBoardName(e.target.value)} placeholder="新增计划表，如：6月4日考前清单" className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none" />
          <Button onClick={addBoard} className="rounded-2xl">
            <Plus className="mr-2 h-4 w-4" />
            新增计划
          </Button>
        </div>

        <div className="grid gap-2 md:grid-cols-[1fr_auto]">
          <input value={newProjectName} onChange={e => setNewProjectName(e.target.value)} placeholder="新增项目，如：护理课题/读文献" className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none" />
          <Button onClick={addProject} variant="outline" className="rounded-2xl">
            <Plus className="mr-2 h-4 w-4" />
            新增项目
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {projects.map(project => (
            <span key={project.id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
              {project.name}
              {!initialProjects.some(p => p.id === project.id) && (
                <button type="button" onClick={() => deleteProject(project.id)} className="text-slate-400 hover:text-red-600" aria-label={`删除${project.name}`}>
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>

        <TaskForm boards={boards} projects={projects} task={newTask} setTask={setNewTask} onSubmit={addTask} title="新增任务" submitText="添加任务卡" />
      </CardContent>
    </Card>
  );
}

function SmartImportPanel({
  projects,
  importText,
  setImportText,
  importPreview,
  previewImport,
  importPreviewTasks,
  clearImportPreview
}) {
  const projectById = useMemo(() => Object.fromEntries(projects.map(project => [project.id, project])), [projects]);

  return (
    <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-blue-900">智能导入计划</h3>
          <p className="mt-1 text-xs leading-relaxed text-blue-700">每行一个任务，系统会自动识别日期、项目、优先级、四象限、精力档位和SMART目标。</p>
        </div>
        {importPreview.length > 0 && (
          <button type="button" onClick={clearImportPreview} className="rounded-full p-1 text-blue-400 hover:bg-white hover:text-blue-700" aria-label="清空导入预览">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <textarea
        value={importText}
        onChange={e => setImportText(e.target.value)}
        placeholder={"示例：\n5月27日 统计学 回归模板 90分钟 高优先级\n明天 六级听力真题1套 60分钟\n每日 股票晚间复盘 30分钟"}
        className="mt-3 h-28 w-full resize-none rounded-2xl border border-blue-100 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={previewImport} className="rounded-2xl bg-blue-600 hover:bg-blue-700" disabled={!importText.trim()}>
          <Search className="mr-2 h-4 w-4" />
          自动识别
        </Button>
        <Button onClick={importPreviewTasks} variant="outline" className="rounded-2xl bg-white" disabled={importPreview.length === 0}>
          <Upload className="mr-2 h-4 w-4" />
          一键导入 {importPreview.length || ""}
        </Button>
      </div>
      {importPreview.length > 0 && (
        <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
          {importPreview.map(task => {
            const quadrant = quadrantById[task.quadrant] || quadrantById["important-not-urgent"];
            const energy = energyById[task.energyLevel] || energyById.medium;
            return (
              <div key={task.id} className="rounded-2xl bg-white p-3 text-xs shadow-sm">
                <div className="font-semibold text-slate-800">{task.title}</div>
                <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-slate-500">
                  <span>{task.date}</span>
                  <span>·</span>
                  <span>{task.time}</span>
                  <span>·</span>
                  <span>{projectById[task.projectId]?.name || "未分类"}</span>
                  <span>·</span>
                  <span>{task.priority}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">{quadrant.label}</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">{energy.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LocalBackupPanel({ backups, createLocalBackup, restoreLocalBackup, deleteLocalBackup }) {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-emerald-900">站内本地备份</h3>
          <p className="mt-1 text-xs leading-relaxed text-emerald-700">备份直接保存在当前浏览器内，不需要导出文件。建议重大修改前点一次保存快照。</p>
        </div>
        <Button onClick={createLocalBackup} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700">
          <Save className="mr-2 h-4 w-4" />
          保存
        </Button>
      </div>
      <div className="mt-3 space-y-2">
        {backups.length === 0 && <div className="rounded-2xl border border-dashed border-emerald-200 bg-white/70 p-4 text-center text-sm text-emerald-700">暂无本地备份</div>}
        {backups.map(backup => (
          <div key={backup.id} className="rounded-2xl bg-white p-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-800">{backup.name}</div>
                <div className="mt-1 text-xs text-slate-500">
                  任务 {backup.taskCount} · 日志 {backup.logCount}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button onClick={() => restoreLocalBackup(backup.id)} size="sm" variant="outline" className="h-8 rounded-xl px-2">
                  恢复
                </Button>
                <Button onClick={() => deleteLocalBackup(backup.id)} size="sm" variant="ghost" className="h-8 rounded-xl px-2 text-slate-400 hover:text-red-600" aria-label="删除备份">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskForm({ boards, projects, task, setTask, onSubmit, title, submitText }) {
  return (
    <div className="space-y-3 rounded-3xl bg-slate-50 p-4">
      <h3 className="font-semibold">{title}</h3>
      <input value={task.title} onChange={e => setTask(prev => ({ ...prev, title: e.target.value }))} placeholder="任务名称" className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none" />
      <div className="grid gap-2 md:grid-cols-3">
        <select value={task.board} onChange={e => setTask(prev => ({ ...prev, board: e.target.value }))} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none">
          {boards.map(b => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>
        <select value={task.projectId} onChange={e => setTask(prev => ({ ...prev, projectId: e.target.value }))} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none">
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select value={task.priority} onChange={e => setTask(prev => ({ ...prev, priority: e.target.value }))} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none">
          <option value="高">高</option>
          <option value="中">中</option>
          <option value="低">低</option>
        </select>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <input value={task.date} onChange={e => setTask(prev => ({ ...prev, date: e.target.value }))} placeholder="日期" className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none" />
        <input value={task.time} onChange={e => setTask(prev => ({ ...prev, time: e.target.value }))} placeholder="预计用时" className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none" />
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <select value={task.quadrant || "important-not-urgent"} onChange={e => setTask(prev => ({ ...prev, quadrant: e.target.value }))} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none">
          {quadrants.map(item => (
            <option key={item.id} value={item.id}>
              时间四象限：{item.label}
            </option>
          ))}
        </select>
        <select value={task.energyLevel || "medium"} onChange={e => setTask(prev => ({ ...prev, energyLevel: e.target.value }))} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none">
          {energyLevels.map(item => (
            <option key={item.id} value={item.id}>
              精力档位：{item.label}
            </option>
          ))}
        </select>
      </div>
      <input
        value={task.smartGoal || ""}
        onChange={e => setTask(prev => ({ ...prev, smartGoal: e.target.value }))}
        placeholder="SMART目标：具体、可衡量、可达成、相关、有时限"
        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none"
      />
      <textarea value={task.detail} onChange={e => setTask(prev => ({ ...prev, detail: e.target.value }))} placeholder="具体任务要求" className="h-20 w-full resize-none rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none" />
      <input value={task.minimum} onChange={e => setTask(prev => ({ ...prev, minimum: e.target.value }))} placeholder="最低完成版本" className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none" />
      <textarea
        value={task.knowledgeNote || ""}
        onChange={e => setTask(prev => ({ ...prev, knowledgeNote: e.target.value }))}
        placeholder="知识沉淀：数据→信息→知识→行动，记录本任务要沉淀什么"
        className="h-16 w-full resize-none rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none"
      />
      <Button onClick={onSubmit} className="w-full rounded-2xl">
        <Plus className="mr-2 h-4 w-4" />
        {submitText}
      </Button>
    </div>
  );
}

function TaskEditor({ task, boards, projects, onSave, onCancel }) {
  const [draft, setDraft] = useState(task);

  return (
    <div className="rounded-3xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-blue-800">编辑任务</h3>
        <button type="button" onClick={onCancel} className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-slate-700" aria-label="取消编辑">
          <X className="h-4 w-4" />
        </button>
      </div>
      <TaskForm
        boards={boards}
        projects={projects}
        task={draft}
        setTask={setDraft}
        title="编辑内容"
        onSubmit={() =>
          onSave({
            ...draft,
            title: draft.title.trim() || task.title,
            detail: draft.detail.trim() || "自定义任务。",
            minimum: draft.minimum.trim() || "完成最低版本。"
          })
        }
        submitText="保存修改"
      />
      <Button onClick={onCancel} variant="ghost" className="mt-2 w-full rounded-2xl">
        取消
      </Button>
    </div>
  );
}

function SelfManagementPanel({ stats }) {
  return (
    <section id="self-management" className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-bold">自我管理驾驶舱</h2>
          <p className="text-sm text-slate-500">把时间、目标、知识和精力四个模型落到每一张任务卡。</p>
        </div>
        <div className="text-xs text-slate-500">SMART覆盖 {stats.smartRate}% · 知识沉淀 {stats.knowledgeRate}%</div>
      </div>
      <div className="grid gap-3 lg:grid-cols-4">
        <ModelCard
          title="时间管理"
          subtitle="四象限"
          body="先处理紧急且重要，持续推进不紧急但重要，压缩低价值事务。"
          rows={quadrants.map(item => ({ label: item.label, value: stats.quadrantCounts[item.id] || 0, hint: item.hint }))}
        />
        <ModelCard
          title="目标管理"
          subtitle="SMART"
          body="任务目标要具体、可衡量、可达成、相关且有时限。"
          rows={[
            { label: "已写SMART目标", value: stats.smartReady, hint: "目标清楚，执行阻力更小" },
            { label: "待补目标", value: Math.max(0, Object.values(stats.quadrantCounts).reduce((sum, count) => sum + count, 0) - stats.smartReady), hint: "建议先补考试和论文任务" }
          ]}
        />
        <ModelCard
          title="知识管理"
          subtitle="DIKW"
          body="把数据整理成信息，把信息提炼成知识，再转成下一步行动。"
          rows={[
            { label: "已有知识沉淀", value: stats.knowledgeReady, hint: "复盘、模板、错题和文献点都算" },
            { label: "沉淀覆盖率", value: `${stats.knowledgeRate}%`, hint: "完成任务后补一句就够" }
          ]}
        />
        <ModelCard
          title="精力管理"
          subtitle="能量匹配"
          body="高精力做最难任务，低精力只做最低版本，避免全有或全无。"
          rows={energyLevels.map(item => ({ label: item.label, value: stats.energyCounts[item.id] || 0, hint: item.hint }))}
        />
      </div>
    </section>
  );
}

function ModelCard({ title, subtitle, body, rows }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">{subtitle}</span>
      </div>
      <p className="mt-2 min-h-10 text-xs leading-relaxed text-slate-500">{body}</p>
      <div className="mt-3 space-y-2">
        {rows.map(row => (
          <div key={row.label} className="rounded-xl bg-white p-2">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-medium text-slate-700">{row.label}</span>
              <span className="tabular-nums text-slate-900">{row.value}</span>
            </div>
            <div className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{row.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectStats({ stats }) {
  const maxToday = Math.max(...stats.map(stat => stat.todaySeconds), 1);
  return (
    <section id="project-stats" className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-blue-600" />
        <h2 className="font-bold">项目学习统计</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {stats.slice(0, 8).map(stat => (
          <div key={stat.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-semibold">{stat.name}</span>
              <span className="text-xs text-slate-500">
                {stat.doneCount}/{stat.taskCount}
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white">
              <div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.max(4, Math.round((stat.todaySeconds / maxToday) * 100))}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>今日 {minutesLabel(stat.todaySeconds)}</span>
              <span>累计 {minutesLabel(stat.loggedSeconds)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
        <div className="mt-1 text-xs text-slate-500">{sub}</div>
      </CardContent>
    </Card>
  );
}

function TaskCard({ task, project, onDragStart, onDragEnd, onDone, onDelete, onEdit, onStart }) {
  const Icon = iconMap[project?.icon] || FileText;
  const quadrant = quadrantById[task.quadrant] || quadrantById["important-not-urgent"];
  const energy = energyById[task.energyLevel] || energyById.medium;
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="cursor-grab rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <div className="rounded-2xl bg-slate-100 p-2">
            <Icon className="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold leading-snug">{task.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
              <span>{task.date}</span>
              <span>·</span>
              <span>{task.time}</span>
            </div>
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-sm ${priorityClass[task.priority] || priorityClass.中}`}>{task.priority}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700">四象限：{quadrant.short}</span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700">精力：{energy.label}</span>
        {(task.smartGoal || "").trim() && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-sm font-medium text-violet-700">SMART</span>}
      </div>
      <p className="mt-3 text-base leading-relaxed text-slate-600">{task.detail}</p>
      {(task.smartGoal || "").trim() && (
        <div className="mt-3 rounded-2xl bg-blue-50 p-3 text-base leading-relaxed text-blue-800">
          <span className="font-medium">目标：</span>
          {task.smartGoal}
        </div>
      )}
      <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-base text-slate-600">
        <span className="font-medium text-slate-700">最低版本：</span>
        {task.minimum}
      </div>
      {(task.knowledgeNote || "").trim() && (
        <div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-base leading-relaxed text-emerald-800">
          <span className="font-medium">知识沉淀：</span>
          {task.knowledgeNote}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between gap-2 text-sm text-slate-500">
        <span>已记录：{minutesLabel(task.loggedSeconds || 0)}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm text-slate-600">{project?.name || "未分类"}</span>
      </div>
      <div className="mt-3 flex gap-1">
        <Button onClick={onStart} size="sm" variant="outline" className="h-8 flex-1 rounded-xl">
          <Play className="mr-1 h-4 w-4" />
          计时
        </Button>
        <Button onClick={onEdit} size="sm" variant="ghost" className="h-8 rounded-xl px-2" aria-label="编辑任务">
          <Edit3 className="h-4 w-4" />
        </Button>
        <Button onClick={onDone} size="sm" variant="ghost" className="h-8 rounded-xl px-2" aria-label="标记完成">
          <CheckCircle2 className="h-4 w-4" />
        </Button>
        <Button onClick={onDelete} size="sm" variant="ghost" className="h-8 rounded-xl px-2 text-slate-400 hover:text-red-600" aria-label="删除任务">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function LogPanel({ logs }) {
  const workLogs = logs.filter(l => l.type === "work");
  const restLogs = logs.filter(l => l.type === "rest");
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-3xl border-blue-100 bg-blue-50 shadow-sm">
        <CardContent className="p-5">
          <h2 className="mb-4 text-xl font-bold text-blue-700">今日工作时段</h2>
          <div className="space-y-3">
            {workLogs.length === 0 && <EmptyLog text="暂无学习记录" />}
            {workLogs.map((log, index) => (
              <LogItem key={log.id} index={workLogs.length - index} log={log} color="green" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-3xl border-amber-100 bg-amber-50 shadow-sm">
        <CardContent className="p-5">
          <h2 className="mb-4 text-xl font-bold text-amber-600">今日休息时段</h2>
          <div className="space-y-3">
            {restLogs.length === 0 && <EmptyLog text="暂无休息记录" />}
            {restLogs.map((log, index) => (
              <LogItem key={log.id} index={restLogs.length - index} log={log} color="orange" />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function EmptyLog({ text }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-5 text-center text-sm text-slate-400">{text}</div>;
}

function LogItem({ log, index, color }) {
  const timeColor = color === "green" ? "text-green-600" : "text-orange-600";
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">第{index}次{log.type === "work" ? "工作" : "休息"}</div>
          <div className="mt-1 text-sm text-slate-500">
            {log.start} - {log.end}
          </div>
          {log.type === "work" && (
            <div className="mt-1 text-xs text-slate-500">
              {log.projectName} · {log.taskTitle}
            </div>
          )}
        </div>
        <div className={`text-lg font-semibold ${timeColor}`}>{minutesLabel(log.seconds)}</div>
      </div>
    </div>
  );
}
