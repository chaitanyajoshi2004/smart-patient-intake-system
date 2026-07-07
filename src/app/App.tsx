import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, UserPlus, Users, Brain, BarChart3, Settings,
  LogOut, Search, Bell, ChevronDown, Moon, Sun, Eye, Edit3, Trash2,
  Plus, Download, FileText, Shield, AlertTriangle, CheckCircle,
  Clock, Activity, TrendingUp, Heart, Stethoscope, Pill, X,
  ChevronRight, Filter, RefreshCw, Check, AlertCircle, Info,
  Phone, MapPin, Droplets, User, Calendar, Menu, ArrowLeft,
  Printer, FileDown, MoreHorizontal, Zap, Target, Cpu, ChevronLeft,
  ClipboardList, Building2, Globe, Lock, Mail, Camera, Upload,
  ToggleLeft, ToggleRight, Sparkles, MessageSquare, Bookmark,
  Star, Send, RotateCcw, PieChart, LineChart, BarChart2
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Toaster, toast } from "sonner";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = "login" | "dashboard" | "registration" | "records" | "details" | "triage" | "reports" | "settings";
type Urgency = "routine" | "priority" | "urgent";
type Department = "General" | "Cardiology" | "Neurology" | "Orthopedics" | "Emergency" | "Pediatrics" | "ENT" | "Dermatology";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  address: string;
  bloodGroup: string;
  emergencyContact: string;
  symptoms: string;
  notes: string;
  department: Department;
  urgency: Urgency;
  date: string;
  status: "Waiting" | "In Progress" | "Completed";
  confidence: number;
  conditions: string[];
  aiSummary: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const PATIENTS: Patient[] = [
  { id: "P-001", name: "Sarah Mitchell", age: 34, gender: "Female", phone: "+1 (555) 234-5678", address: "142 Maple Street, Austin TX 78701", bloodGroup: "A+", emergencyContact: "+1 (555) 234-5679", symptoms: "Persistent headache, blurred vision, mild nausea for 3 days", notes: "History of migraines. Currently on sumatriptan.", department: "Neurology", urgency: "priority", date: "2024-01-15", status: "In Progress", confidence: 87, conditions: ["Migraine", "Tension Headache", "Hypertension"], aiSummary: "Patient presents with classic migraine symptoms. Neurological evaluation recommended." },
  { id: "P-002", name: "James Okafor", age: 58, gender: "Male", phone: "+1 (555) 345-6789", address: "89 Oak Avenue, Dallas TX 75201", bloodGroup: "O-", emergencyContact: "+1 (555) 345-6790", symptoms: "Chest tightness, shortness of breath, left arm pain", notes: "Diabetic. Takes metformin. Family history of CAD.", department: "Cardiology", urgency: "urgent", date: "2024-01-15", status: "In Progress", confidence: 94, conditions: ["ACS", "Angina", "GERD"], aiSummary: "High-risk presentation for acute coronary syndrome. Immediate cardiology consult needed." },
  { id: "P-003", name: "Emma Rodriguez", age: 7, gender: "Female", phone: "+1 (555) 456-7890", address: "33 Pine Lane, Houston TX 77001", bloodGroup: "B+", emergencyContact: "+1 (555) 456-7891", symptoms: "Fever 102°F, ear pain, crying frequently", notes: "No known allergies. Up to date on vaccinations.", department: "Pediatrics", urgency: "priority", date: "2024-01-15", status: "Waiting", confidence: 91, conditions: ["Otitis Media", "URI", "Tonsillitis"], aiSummary: "Pediatric patient with signs of acute otitis media. ENT evaluation may be needed." },
  { id: "P-004", name: "Robert Chen", age: 45, gender: "Male", phone: "+1 (555) 567-8901", address: "210 Cedar Drive, San Antonio TX 78201", bloodGroup: "AB+", emergencyContact: "+1 (555) 567-8902", symptoms: "Lower back pain radiating to left leg, numbness in foot", notes: "Office worker. No prior surgeries.", department: "Orthopedics", urgency: "routine", date: "2024-01-14", status: "Completed", confidence: 82, conditions: ["Lumbar Disc Herniation", "Sciatica", "Muscle Strain"], aiSummary: "Classic radiculopathy presentation. MRI lumbar spine recommended." },
  { id: "P-005", name: "Priya Sharma", age: 29, gender: "Female", phone: "+1 (555) 678-9012", address: "67 Birch Road, Fort Worth TX 76101", bloodGroup: "A-", emergencyContact: "+1 (555) 678-9013", symptoms: "Skin rash, itching, swelling around eyes", notes: "Known peanut allergy. Carries EpiPen.", department: "Dermatology", urgency: "priority", date: "2024-01-14", status: "Completed", confidence: 89, conditions: ["Urticaria", "Allergic Reaction", "Contact Dermatitis"], aiSummary: "Allergic reaction pattern. Rule out anaphylaxis progression." },
  { id: "P-006", name: "David Kim", age: 62, gender: "Male", phone: "+1 (555) 789-0123", address: "445 Elm Street, El Paso TX 79901", bloodGroup: "O+", emergencyContact: "+1 (555) 789-0124", symptoms: "Dizziness, ringing in ears, hearing loss right side", notes: "Hypertensive. Takes amlodipine 5mg daily.", department: "ENT", urgency: "routine", date: "2024-01-14", status: "Waiting", confidence: 76, conditions: ["Meniere Disease", "BPPV", "Acoustic Neuroma"], aiSummary: "Vestibular dysfunction suspected. Audiometry and MRI brain recommended." },
];

const DAILY_DATA = [
  { day: "Mon", patients: 28, routine: 16, priority: 8, urgent: 4 },
  { day: "Tue", patients: 35, routine: 20, priority: 11, urgent: 4 },
  { day: "Wed", patients: 31, routine: 18, priority: 9, urgent: 4 },
  { day: "Thu", patients: 42, routine: 24, priority: 13, urgent: 5 },
  { day: "Fri", patients: 38, routine: 22, priority: 11, urgent: 5 },
  { day: "Sat", patients: 22, routine: 14, priority: 6, urgent: 2 },
  { day: "Sun", patients: 18, routine: 12, priority: 4, urgent: 2 },
];

const DEPT_DATA = [
  { name: "Cardiology", value: 18, color: "#dc2626" },
  { name: "Neurology", value: 14, color: "#7c3aed" },
  { name: "Orthopedics", value: 16, color: "#2563eb" },
  { name: "Pediatrics", value: 20, color: "#16a34a" },
  { name: "Emergency", value: 12, color: "#ea580c" },
  { name: "ENT", value: 10, color: "#0891b2" },
  { name: "Dermatology", value: 10, color: "#db2777" },
];

const AI_ACCURACY = [
  { month: "Aug", accuracy: 84 },
  { month: "Sep", accuracy: 86 },
  { month: "Oct", accuracy: 88 },
  { month: "Nov", accuracy: 91 },
  { month: "Dec", accuracy: 93 },
  { month: "Jan", accuracy: 94 },
];

// ─── Reusable Components ──────────────────────────────────────────────────────

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function Badge({ children, variant = "default", size = "sm" }: {
  children: React.ReactNode;
  variant?: "default" | "routine" | "priority" | "urgent" | "success" | "muted" | "blue";
  size?: "xs" | "sm" | "md";
}) {
  const base = "inline-flex items-center gap-1 font-medium rounded-full";
  const sizes = { xs: "px-1.5 py-0.5 text-[10px]", sm: "px-2.5 py-1 text-xs", md: "px-3 py-1.5 text-sm" };
  const variants = {
    default: "bg-muted text-muted-foreground",
    routine: "bg-[color:var(--success-muted)] text-[color:var(--success)]",
    priority: "bg-[color:var(--warning-muted)] text-[color:var(--warning)]",
    urgent: "bg-[color:var(--urgent-muted)] text-[color:var(--urgent)]",
    success: "bg-[color:var(--success-muted)] text-[color:var(--success)]",
    muted: "bg-muted text-muted-foreground",
    blue: "bg-accent text-accent-foreground",
  };
  return (
    <span className={cn(base, sizes[size], variants[variant])}>
      {variant === "routine" && <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--success)] flex-shrink-0" />}
      {variant === "priority" && <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--warning)] flex-shrink-0" />}
      {variant === "urgent" && <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--urgent)] flex-shrink-0" />}
      {children}
    </span>
  );
}

function Button({ children, variant = "primary", size = "md", className, disabled, loading, onClick, type = "button" }: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3.5 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base",
  };
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-blue-600 focus:ring-primary shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-blue-100 focus:ring-primary border border-border",
    ghost: "bg-transparent text-foreground hover:bg-muted focus:ring-primary",
    danger: "bg-destructive text-destructive-foreground hover:bg-red-700 focus:ring-destructive shadow-sm",
    success: "bg-[color:var(--success)] text-white hover:bg-green-700 focus:ring-green-500 shadow-sm",
    outline: "bg-transparent border border-border text-foreground hover:bg-muted focus:ring-primary",
  };
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(base, sizes[size], variants[variant], className)}
    >
      {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
}

function Input({ label, placeholder, type = "text", value, onChange, icon: Icon, required, error, multiline, rows = 3, className }: {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
  icon?: React.ElementType;
  required?: boolean;
  error?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
}) {
  const inputClass = cn(
    "w-full bg-input-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all",
    Icon && "pl-10",
    error && "border-destructive focus:ring-destructive/30",
    className
  );
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}{required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />}
        {multiline ? (
          <textarea
            rows={rows}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange?.(e.target.value)}
            className={cn(inputClass, "resize-none")}
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange?.(e.target.value)}
            className={inputClass}
          />
        )}
      </div>
      {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

function Select({ label, value, onChange, options, required }: {
  label?: string;
  value?: string;
  onChange?: (v: string) => void;
  options: { label: string; value: string }[];
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}{required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={e => onChange?.(e.target.value)}
        className="w-full bg-input-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Card({ children, className, padding = "md" }: { children: React.ReactNode; className?: string; padding?: "none" | "sm" | "md" | "lg" }) {
  const paddings = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };
  return (
    <div className={cn("bg-card border border-border rounded-2xl", paddings[padding], className)}
      style={{ boxShadow: "var(--shadow-sm)" }}>
      {children}
    </div>
  );
}

function KPICard({ title, value, subtitle, icon: Icon, color, trend }: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ElementType; color: string; trend?: { value: string; up: boolean };
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          {trend && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", trend.up ? "text-[color:var(--success)]" : "text-destructive")}>
              <TrendingUp className={cn("w-3 h-3", !trend.up && "rotate-180")} />
              {trend.value} vs yesterday
            </div>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <Badge variant={urgency as any}>
      {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
    </Badge>
  );
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-purple-100 text-purple-700", "bg-orange-100 text-orange-700", "bg-pink-100 text-pink-700"];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" };
  return (
    <div className={cn("rounded-full flex items-center justify-center font-semibold flex-shrink-0", sizes[size], color)}>
      {initials}
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-muted rounded-lg", className)} />;
}

function Modal({ open, onClose, title, children, size = "md" }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: "sm" | "md" | "lg";
}) {
  if (!open) return null;
  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative bg-card rounded-2xl border border-border w-full", sizes[size])}
        style={{ boxShadow: "var(--shadow-lg)" }}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ProgressBar({ value, color = "bg-primary", height = "h-2" }: { value: number; color?: string; height?: string }) {
  return (
    <div className={cn("w-full bg-muted rounded-full overflow-hidden", height)}>
      <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

function Tabs({ tabs, active, onSelect }: { tabs: { id: string; label: string; icon?: React.ElementType }[]; active: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex gap-1 bg-muted rounded-xl p-1">
      {tabs.map(tab => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              active === tab.id ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function Tip({ content, children }: { content: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-foreground text-background text-xs rounded-lg whitespace-nowrap z-50">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "registration", label: "Registration", icon: UserPlus },
  { id: "records", label: "Patient Records", icon: Users },
  { id: "triage", label: "AI Triage", icon: Brain },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

function Sidebar({ active, onNavigate, collapsed, onToggle, darkMode }: {
  active: Screen; onNavigate: (s: Screen) => void; collapsed: boolean; onToggle: () => void; darkMode: boolean;
}) {
  return (
    <aside className={cn(
      "flex flex-col bg-sidebar border-r border-sidebar-border h-full transition-all duration-300 flex-shrink-0",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
          <Heart className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-sidebar-foreground truncate">MediFlow</p>
            <p className="text-[10px] text-muted-foreground truncate">Patient Intake System</p>
          </div>
        )}
        <button onClick={onToggle} className="ml-auto p-1 rounded-lg hover:bg-sidebar-accent text-muted-foreground transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <Tip key={item.id} content={collapsed ? item.label : ""}>
              <button
                onClick={() => onNavigate(item.id as Screen)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </button>
            </Tip>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <Avatar name="Dr. Anna Brooks" size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">Dr. Anna Brooks</p>
              <p className="text-[10px] text-muted-foreground truncate">Receptionist</p>
            </div>
          </div>
        )}
        <Tip content={collapsed ? "Logout" : ""}>
          <button className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-destructive transition-all",
            collapsed && "justify-center"
          )}>
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && "Logout"}
          </button>
        </Tip>
      </div>
    </aside>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ title, darkMode, onToggleDark, onNavigate }: {
  title: string; darkMode: boolean; onToggleDark: () => void; onNavigate: (s: Screen) => void;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const notifs = [
    { icon: AlertTriangle, color: "text-[color:var(--urgent)]", bg: "bg-[color:var(--urgent-muted)]", msg: "James Okafor — urgent case flagged", time: "2m ago" },
    { icon: CheckCircle, color: "text-[color:var(--success)]", bg: "bg-[color:var(--success-muted)]", msg: "Emma Rodriguez — registration complete", time: "8m ago" },
    { icon: Brain, color: "text-primary", bg: "bg-accent", msg: "AI Triage completed for 4 patients", time: "15m ago" },
  ];

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-5 gap-4 flex-shrink-0" style={{ boxShadow: "var(--shadow-sm)" }}>
      <h1 className="text-base font-semibold text-foreground flex-shrink-0">{title}</h1>

      {/* Search */}
      <div className="relative flex-1 max-w-xs ml-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search patients, records..."
          className="w-full bg-muted border border-border rounded-xl pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Dark mode */}
        <button onClick={onToggleDark} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-card border border-border rounded-2xl z-50 overflow-hidden" style={{ boxShadow: "var(--shadow-lg)" }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Notifications</p>
                <Badge variant="blue" size="xs">3 new</Badge>
              </div>
              <div className="divide-y divide-border">
                {notifs.map((n, i) => {
                  const Icon = n.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-muted transition-colors cursor-pointer">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", n.bg)}>
                        <Icon className={cn("w-4 h-4", n.color)} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground leading-snug">{n.msg}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-3 border-t border-border">
                <button className="text-xs text-primary font-medium hover:underline">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-muted transition-colors">
            <Avatar name="Dr. Anna Brooks" size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-foreground leading-none">Dr. Anna Brooks</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Receptionist</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-11 w-48 bg-card border border-border rounded-xl z-50 py-1.5 overflow-hidden" style={{ boxShadow: "var(--shadow-lg)" }}>
              {[
                { label: "Profile", icon: User, screen: "settings" },
                { label: "Settings", icon: Settings, screen: "settings" },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.label} onClick={() => { onNavigate(item.screen as Screen); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    {item.label}
                  </button>
                );
              })}
              <div className="border-t border-border my-1" />
              <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-destructive hover:bg-muted transition-colors">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("anna.brooks@mediflow.health");
  const [password, setPassword] = useState("••••••••••");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Welcome back, Dr. Brooks!");
      onLogin();
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-16 max-w-lg mx-auto lg:mx-0 w-full">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">MediFlow</p>
            <p className="text-xs text-muted-foreground">Patient Intake System</p>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your clinic portal to continue</p>
        </div>

        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleLogin(); }}>
          <Input
            label="Email address"
            type="email"
            placeholder="you@clinic.com"
            value={email}
            onChange={setEmail}
            icon={Mail}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
            icon={Lock}
            required
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div
                onClick={() => setRemember(!remember)}
                className={cn(
                  "w-4.5 h-4.5 rounded border flex items-center justify-center transition-all cursor-pointer",
                  remember ? "bg-primary border-primary" : "border-border bg-input-background"
                )}
              >
                {remember && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-foreground">Remember me</span>
            </label>
            <button type="button" className="text-sm text-primary font-medium hover:underline">Forgot password?</button>
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
            {!loading && <><Shield className="w-4 h-4" /> Sign in securely</>}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            <span>Protected by 256-bit SSL encryption. HIPAA compliant.</span>
          </div>
        </div>
      </div>

      {/* Right: Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="relative flex flex-col justify-center items-center p-16 text-white text-center">
          {/* Hero illustration */}
          <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 border border-white/20">
            <Stethoscope className="w-16 h-16 text-white/90" />
          </div>

          <h2 className="text-2xl font-bold mb-3">Smart Healthcare at Your Fingertips</h2>
          <p className="text-blue-100 text-sm leading-relaxed max-w-xs mb-10">
            AI-powered patient intake, intelligent triage, and streamlined workflows — everything your clinic needs in one place.
          </p>

          {/* Feature pills */}
          <div className="space-y-3 w-full max-w-xs">
            {[
              { icon: Brain, label: "AI-powered symptom analysis" },
              { icon: Zap, label: "Instant urgency classification" },
              { icon: BarChart3, label: "Real-time analytics dashboard" },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                  <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-sm font-medium text-white/90">{f.label}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex items-center gap-6 text-xs text-blue-200">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" />HIPAA Compliant</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" />WCAG AA</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" />SOC 2</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Screen ─────────────────────────────────────────────────────────

function DashboardScreen({ patients, onNavigate, onSelectPatient }: {
  patients: Patient[];
  onNavigate: (s: Screen) => void;
  onSelectPatient: (p: Patient) => void;
}) {
  const [deleteModal, setDeleteModal] = useState<Patient | null>(null);
  const [loadingRows, setLoadingRows] = useState<Set<string>>(new Set());

  const today = patients.slice(0, 6);
  const routine = today.filter(p => p.urgency === "routine").length;
  const priority = today.filter(p => p.urgency === "priority").length;
  const urgent = today.filter(p => p.urgency === "urgent").length;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard title="Today's Patients" value={today.length} subtitle="Jan 15, 2024" icon={Users} color="bg-accent text-primary" trend={{ value: "+12%", up: true }} />
        <KPICard title="Routine" value={routine} subtitle="Low priority" icon={CheckCircle} color="bg-[color:var(--success-muted)] text-[color:var(--success)]" trend={{ value: "+5%", up: true }} />
        <KPICard title="Priority" value={priority} subtitle="Needs attention" icon={AlertTriangle} color="bg-[color:var(--warning-muted)] text-[color:var(--warning)]" trend={{ value: "-3%", up: false }} />
        <KPICard title="Urgent" value={urgent} subtitle="Immediate care" icon={AlertCircle} color="bg-[color:var(--urgent-muted)] text-[color:var(--urgent)]" trend={{ value: "+1", up: false }} />
        <KPICard title="Avg Wait Time" value="23m" subtitle="Target: 20m" icon={Clock} color="bg-purple-50 text-purple-600" trend={{ value: "+3m", up: false }} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Patients Line */}
        <Card className="lg:col-span-2" padding="md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Daily Patient Volume</h3>
              <p className="text-xs text-muted-foreground mt-0.5">This week vs previous week</p>
            </div>
            <Badge variant="blue">This week</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={DAILY_DATA}>
              <defs>
                <linearGradient id="patGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px", color: "var(--foreground)" }} />
              <Area type="monotone" dataKey="patients" stroke="#2563eb" strokeWidth={2} fill="url(#patGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Department Pie */}
        <Card padding="md">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Department Distribution</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Today's cases</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <RechartsPie>
              <Pie data={DEPT_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {DEPT_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px", color: "var(--foreground)" }} />
            </RechartsPie>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {DEPT_DATA.slice(0, 4).map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-medium text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Urgency Bar */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Urgency Breakdown</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Weekly distribution by urgency level</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={DAILY_DATA} barSize={16} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px", color: "var(--foreground)" }} />
            <Legend wrapperStyle={{ fontSize: "12px", color: "var(--foreground)" }} />
            <Bar dataKey="routine" fill="#16a34a" radius={[4, 4, 0, 0]} name="Routine" />
            <Bar dataKey="priority" fill="#d97706" radius={[4, 4, 0, 0]} name="Priority" />
            <Bar dataKey="urgent" fill="#dc2626" radius={[4, 4, 0, 0]} name="Urgent" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Patients Table */}
      <Card padding="none">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Recent Patients</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Today's registrations</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => onNavigate("registration")}>
            <Plus className="w-3.5 h-3.5" /> Register Patient
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Patient", "Age / Gender", "Department", "Urgency", "Time", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {patients.map(p => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={p.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{p.age}y · {p.gender}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{p.department}</td>
                  <td className="px-4 py-3"><UrgencyBadge urgency={p.urgency} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.date}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.status === "Completed" ? "success" : p.status === "In Progress" ? "blue" : "muted"} size="xs">
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tip content="View Details">
                        <button onClick={() => { onSelectPatient(p); onNavigate("details"); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-primary transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </Tip>
                      <Tip content="Edit">
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </Tip>
                      <Tip content="Delete">
                        <button onClick={() => setDeleteModal(p)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[color:var(--urgent-muted)] text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </Tip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Patient Record" size="sm">
        {deleteModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-[color:var(--urgent-muted)] rounded-xl">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive font-medium">This action cannot be undone.</p>
            </div>
            <p className="text-sm text-foreground">
              Are you sure you want to permanently delete <strong>{deleteModal.name}</strong>'s record ({deleteModal.id})?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={() => setDeleteModal(null)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={() => {
                toast.error(`Record for ${deleteModal.name} deleted`);
                setDeleteModal(null);
              }}>
                <Trash2 className="w-3.5 h-3.5" /> Delete Record
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Patient Registration Screen ──────────────────────────────────────────────

function RegistrationScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [form, setForm] = useState({
    name: "", age: "", gender: "Male", phone: "", address: "",
    bloodGroup: "A+", emergency: "", symptoms: "", notes: ""
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<null | {
    urgency: Urgency; department: string; confidence: number;
    conditions: string[]; summary: string; alternatives: string[];
  }>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const runAI = () => {
    if (!form.symptoms.trim()) { toast.error("Please enter symptoms first"); return; }
    setAiLoading(true);
    setAiResult(null);
    setTimeout(() => {
      setAiLoading(false);
      setAiResult({
        urgency: "priority",
        department: "Cardiology",
        confidence: 88,
        conditions: ["Angina Pectoris", "Hypertensive Crisis", "GERD"],
        summary: "Patient reports chest discomfort with exertional component. AI analysis indicates moderate probability of cardiac origin. Recommend immediate ECG and troponin levels.",
        alternatives: ["Emergency Medicine", "Internal Medicine"],
      });
      toast.success("AI analysis complete");
    }, 2200);
  };

  const handleSave = () => {
    if (!form.name || !form.symptoms) { toast.error("Name and symptoms are required"); return; }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Patient registered successfully");
      onNavigate("records");
    }, 1000);
  };

  const urgencyColors = { routine: "text-[color:var(--success)]", priority: "text-[color:var(--warning)]", urgent: "text-destructive" };
  const urgencyBg = { routine: "bg-[color:var(--success-muted)]", priority: "bg-[color:var(--warning-muted)]", urgent: "bg-[color:var(--urgent-muted)]" };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => onNavigate("dashboard")} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-foreground">New Patient Registration</h2>
            <p className="text-xs text-muted-foreground">Fill patient information and run AI triage</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            <Card padding="md">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input label="Full Name" placeholder="Enter patient's full name" value={form.name} onChange={set("name")} icon={User} required />
                </div>
                <Input label="Age" placeholder="e.g. 34" value={form.age} onChange={set("age")} required />
                <Select label="Gender" value={form.gender} onChange={set("gender")} required options={[
                  { label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Other", value: "Other" }
                ]} />
                <Input label="Phone Number" placeholder="+1 (555) 000-0000" value={form.phone} onChange={set("phone")} icon={Phone} required />
                <Select label="Blood Group" value={form.bloodGroup} onChange={set("bloodGroup")} options={
                  ["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => ({ label: b, value: b }))
                } />
                <div className="sm:col-span-2">
                  <Input label="Address" placeholder="Street, City, State, ZIP" value={form.address} onChange={set("address")} icon={MapPin} />
                </div>
                <div className="sm:col-span-2">
                  <Input label="Emergency Contact" placeholder="+1 (555) 000-0000" value={form.emergency} onChange={set("emergency")} icon={Phone} />
                </div>
              </div>
            </Card>

            <Card padding="md">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-primary" /> Clinical Information
              </h3>
              <div className="space-y-4">
                <Input
                  label="Symptoms" placeholder="Describe the patient's current symptoms in detail..."
                  value={form.symptoms} onChange={set("symptoms")} multiline rows={4} required
                />
                <Input
                  label="Medical Notes" placeholder="Additional notes, allergies, current medications..."
                  value={form.notes} onChange={set("notes")} multiline rows={3}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="secondary" onClick={runAI} loading={aiLoading}>
                  {!aiLoading && <Brain className="w-4 h-4" />}
                  {aiLoading ? "Analyzing..." : "Analyze with AI"}
                </Button>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button variant="primary" loading={saving} onClick={handleSave}>
                {!saving && <Check className="w-4 h-4" />}
                {saving ? "Saving..." : "Save & Register"}
              </Button>
              <Button variant="outline" onClick={() => setForm({ name: "", age: "", gender: "Male", phone: "", address: "", bloodGroup: "A+", emergency: "", symptoms: "", notes: "" })}>
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </Button>
              <Button variant="ghost" onClick={() => onNavigate("records")}>Cancel</Button>
            </div>
          </div>

          {/* AI Panel */}
          <div className="space-y-4">
            <Card padding="md" className="border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">AI Assistant</h3>
                <Badge variant="blue" size="xs">v2.4</Badge>
              </div>

              {!aiResult && !aiLoading && (
                <div className="flex flex-col items-center text-center py-8">
                  <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-3">
                    <Sparkles className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Ready to Analyze</p>
                  <p className="text-xs text-muted-foreground">Enter symptoms and click "Analyze with AI" to get intelligent triage recommendations.</p>
                </div>
              )}

              {aiLoading && (
                <div className="space-y-3 py-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-accent rounded-xl flex items-center justify-center animate-pulse">
                      <Cpu className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Processing symptoms...</p>
                      <p className="text-[10px] text-muted-foreground">Analyzing with medical knowledge base</p>
                    </div>
                  </div>
                  {[80, 60, 40, 55].map((w, i) => <Skeleton key={i} className={`h-4 w-[${w}%]`} />)}
                  <ProgressBar value={75} height="h-1.5" />
                </div>
              )}

              {aiResult && (
                <div className="space-y-3">
                  {/* Urgency */}
                  <div className={cn("rounded-xl p-3 flex items-center justify-between", urgencyBg[aiResult.urgency])}>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Suggested Urgency</p>
                      <p className={cn("text-sm font-bold capitalize", urgencyColors[aiResult.urgency])}>
                        {aiResult.urgency}
                      </p>
                    </div>
                    <AlertTriangle className={cn("w-5 h-5", urgencyColors[aiResult.urgency])} />
                  </div>

                  {/* Department */}
                  <div className="bg-muted rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Department</p>
                      <p className="text-sm font-semibold text-foreground">{aiResult.department}</p>
                    </div>
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>

                  {/* Confidence */}
                  <div className="bg-muted rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">AI Confidence</p>
                      <p className="text-sm font-bold text-foreground">{aiResult.confidence}%</p>
                    </div>
                    <ProgressBar value={aiResult.confidence} />
                  </div>

                  {/* Conditions */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Possible Conditions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {aiResult.conditions.map((c, i) => (
                        <Badge key={i} variant={i === 0 ? "blue" : "muted"} size="xs">{c}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">AI Summary</p>
                    <p className="text-xs text-foreground leading-relaxed">{aiResult.summary}</p>
                  </div>

                  {/* Alternatives */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Alternative Departments</p>
                    <div className="flex flex-wrap gap-1.5">
                      {aiResult.alternatives.map((a, i) => <Badge key={i} variant="muted" size="xs">{a}</Badge>)}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button variant="success" size="sm" onClick={() => toast.success("AI recommendation accepted")}>
                      <Check className="w-3.5 h-3.5" /> Accept
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toast.info("You can modify the recommendation")}>
                      <Edit3 className="w-3.5 h-3.5" /> Modify
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toast.warning("Recommendation overridden")}>
                      <X className="w-3.5 h-3.5" /> Override
                    </Button>
                    <Button variant="ghost" size="sm" onClick={runAI}>
                      <RotateCcw className="w-3.5 h-3.5" /> Regen
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Quick Tips */}
            <Card padding="sm">
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary" /> Tips for Better AI Results
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {["Include symptom duration and severity", "Mention relevant medical history", "Note any recent medications", "Include vital signs if available"].map((t, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-[color:var(--success)] flex-shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Patient Records Screen ───────────────────────────────────────────────────

function RecordsScreen({ patients, onNavigate, onSelectPatient }: {
  patients: Patient[]; onNavigate: (s: Screen) => void; onSelectPatient: (p: Patient) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 250);
  const PER_PAGE = 5;

  const filtered = patients.filter(p => {
    const q = debouncedSearch.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.phone.includes(q);
    const matchUrgency = filterUrgency === "all" || p.urgency === filterUrgency;
    const matchDept = filterDept === "all" || p.department === filterDept;
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchUrgency && matchDept && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Patient Records</h2>
          <p className="text-xs text-muted-foreground">{filtered.length} records found</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("CSV exported")}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => onNavigate("registration")}>
            <Plus className="w-3.5 h-3.5" /> Add Patient
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, ID, phone..."
                className="w-full bg-input-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>
          {[
            { label: "Urgency", value: filterUrgency, onChange: (v: string) => { setFilterUrgency(v); setPage(1); }, options: [{ label: "All Urgency", value: "all" }, { label: "Routine", value: "routine" }, { label: "Priority", value: "priority" }, { label: "Urgent", value: "urgent" }] },
            { label: "Department", value: filterDept, onChange: (v: string) => { setFilterDept(v); setPage(1); }, options: [{ label: "All Departments", value: "all" }, ...["Cardiology","Neurology","Orthopedics","Pediatrics","ENT","Dermatology","Emergency"].map(d => ({ label: d, value: d }))] },
            { label: "Status", value: filterStatus, onChange: (v: string) => { setFilterStatus(v); setPage(1); }, options: [{ label: "All Status", value: "all" }, { label: "Waiting", value: "Waiting" }, { label: "In Progress", value: "In Progress" }, { label: "Completed", value: "Completed" }] },
          ].map(f => (
            <select key={f.label} value={f.value} onChange={e => f.onChange(e.target.value)}
              className="bg-input-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none min-w-36">
              {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        {paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-3">
              <Users className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No patients found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["Patient", "Age / Gender", "Phone", "Department", "Urgency", "Date", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paged.map(p => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={p.name} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{p.age}y · {p.gender}</td>
                      <td className="px-4 py-3 text-sm text-foreground font-mono">{p.phone}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{p.department}</td>
                      <td className="px-4 py-3"><UrgencyBadge urgency={p.urgency} /></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{p.date}</td>
                      <td className="px-4 py-3">
                        <Badge variant={p.status === "Completed" ? "success" : p.status === "In Progress" ? "blue" : "muted"} size="xs">
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tip content="View"><button onClick={() => { onSelectPatient(p); onNavigate("details"); }} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-primary"><Eye className="w-3.5 h-3.5" /></button></Tip>
                          <Tip content="Edit"><button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground"><Edit3 className="w-3.5 h-3.5" /></button></Tip>
                          <Tip content="Delete"><button onClick={() => toast.error("Record deleted")} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[color:var(--urgent-muted)] text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button></Tip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} records
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className={cn("w-7 h-7 rounded-lg text-xs font-medium transition-colors",
                      page === n ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground")}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

// ─── Patient Details Screen ───────────────────────────────────────────────────

function PatientDetailsScreen({ patient, onBack }: { patient: Patient; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");

  const timeline = [
    { time: "09:14 AM", label: "Patient registered", icon: UserPlus, color: "text-primary bg-accent" },
    { time: "09:17 AM", label: "AI triage completed", icon: Brain, color: "text-purple-600 bg-purple-50" },
    { time: "09:22 AM", label: `Assigned to ${patient.department}`, icon: Building2, color: "text-[color:var(--success)] bg-[color:var(--success-muted)]" },
    { time: "09:30 AM", label: "Doctor notified", icon: Bell, color: "text-[color:var(--warning)] bg-[color:var(--warning-muted)]" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">Patient Details</h2>
          <p className="text-xs text-muted-foreground">{patient.id} · Registered {patient.date}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info("Print dialog opened")}>
            <Printer className="w-3.5 h-3.5" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success("PDF downloaded")}>
            <FileDown className="w-3.5 h-3.5" /> Download PDF
          </Button>
          <Button variant="primary" size="sm">
            <Edit3 className="w-3.5 h-3.5" /> Edit Record
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Profile */}
        <div className="space-y-4">
          <Card padding="md">
            <div className="flex flex-col items-center text-center mb-4">
              <Avatar name={patient.name} size="lg" />
              <h3 className="text-base font-bold text-foreground mt-3">{patient.name}</h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{patient.id}</p>
              <div className="flex items-center gap-2 mt-2">
                <UrgencyBadge urgency={patient.urgency} />
                <Badge variant={patient.status === "Completed" ? "success" : "blue"} size="xs">{patient.status}</Badge>
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              {[
                { icon: User, label: "Age / Gender", value: `${patient.age} years · ${patient.gender}` },
                { icon: Droplets, label: "Blood Group", value: patient.bloodGroup },
                { icon: Phone, label: "Phone", value: patient.phone },
                { icon: MapPin, label: "Address", value: patient.address },
                { icon: Phone, label: "Emergency", value: patient.emergencyContact },
                { icon: Building2, label: "Department", value: patient.department },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">{label}</p>
                    <p className="text-xs text-foreground font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Timeline */}
          <Card padding="md">
            <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" /> Visit Timeline
            </h4>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {timeline.map((t, i) => {
                  const Icon = t.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 relative">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10", t.color)}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="pt-0.5">
                        <p className="text-xs font-medium text-foreground">{t.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{t.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs
            active={activeTab}
            onSelect={setActiveTab}
            tabs={[
              { id: "overview", label: "Overview", icon: ClipboardList },
              { id: "ai", label: "AI Report", icon: Brain },
              { id: "history", label: "History", icon: FileText },
            ]}
          />

          {activeTab === "overview" && (
            <div className="space-y-4">
              <Card padding="md">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-primary" /> Presenting Symptoms
                </h4>
                <p className="text-sm text-foreground leading-relaxed">{patient.symptoms}</p>
              </Card>
              <Card padding="md">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-primary" /> Medical Notes
                </h4>
                <p className="text-sm text-foreground leading-relaxed">{patient.notes}</p>
              </Card>
              <Card padding="md">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[color:var(--success)]" /> Final Decision
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Assigned Department</p>
                    <p className="text-sm font-semibold text-foreground">{patient.department}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Urgency Level</p>
                    <UrgencyBadge urgency={patient.urgency} />
                  </div>
                </div>
                <div className="mt-3">
                  <Input label="Doctor Notes" placeholder="Add doctor notes..." multiline rows={3} />
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="primary" size="sm" onClick={() => toast.success("Notes saved")}>
                    <Check className="w-3.5 h-3.5" /> Save Notes
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-4">
              <Card padding="md">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" /> AI Triage Report
                  </h4>
                  <Badge variant="blue" size="xs">Confidence: {patient.confidence}%</Badge>
                </div>
                <div className="space-y-3">
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">AI Summary</p>
                    <p className="text-sm text-foreground leading-relaxed">{patient.aiSummary}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Possible Conditions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {patient.conditions.map((c, i) => (
                        <Badge key={i} variant={i === 0 ? "blue" : "muted"} size="sm">{c}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">AI Confidence</p>
                    <div className="flex items-center gap-3">
                      <ProgressBar value={patient.confidence} height="h-2.5" />
                      <span className="text-sm font-bold text-foreground flex-shrink-0">{patient.confidence}%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "history" && (
            <Card padding="md">
              <h4 className="text-sm font-semibold text-foreground mb-4">Visit History</h4>
              <div className="space-y-3">
                {[
                  { date: patient.date, dept: patient.department, urgency: patient.urgency, status: patient.status },
                  { date: "2023-11-10", dept: "General", urgency: "routine" as Urgency, status: "Completed" },
                  { date: "2023-08-22", dept: "General", urgency: "routine" as Urgency, status: "Completed" },
                ].map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{v.date}</p>
                        <p className="text-xs text-muted-foreground">{v.dept}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <UrgencyBadge urgency={v.urgency} />
                      <Badge variant={v.status === "Completed" ? "success" : "blue"} size="xs">{v.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AI Triage Screen ─────────────────────────────────────────────────────────

function AITriageScreen() {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<null | {
    urgency: Urgency; department: string; confidence: number;
    riskLevel: string; action: string; conditions: string[]; alternatives: string[];
  }>(null);

  const analyze = () => {
    if (!symptoms.trim()) { toast.error("Please describe the symptoms"); return; }
    setLoading(true);
    setResult(null);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + 12;
      });
    }, 200);
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setResult({
          urgency: "urgent",
          department: "Emergency",
          confidence: 91,
          riskLevel: "High",
          action: "Immediate evaluation required. Start IV access, continuous cardiac monitoring, and prepare for potential catheterization lab activation.",
          conditions: ["STEMI", "Unstable Angina", "Aortic Dissection"],
          alternatives: ["Cardiology", "Cardiac ICU"],
        });
        toast.success("AI analysis complete");
      }, 300);
    }, 2500);
  };

  const urgencyColors = { routine: "text-[color:var(--success)]", priority: "text-[color:var(--warning)]", urgent: "text-destructive" };
  const urgencyBg = { routine: "bg-[color:var(--success-muted)]", priority: "bg-[color:var(--warning-muted)]", urgent: "bg-[color:var(--urgent-muted)]" };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" /> AI Triage Engine
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Enter symptoms for instant AI-powered triage analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <Card padding="md">
            <h3 className="text-sm font-semibold text-foreground mb-3">Symptom Description</h3>
            <textarea
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              placeholder="Describe the patient's symptoms in detail...

Example: 64-year-old male presenting with sudden onset severe chest pain radiating to the left arm, onset 45 minutes ago. Associated with diaphoresis and shortness of breath. History of hypertension and diabetes."
              className="w-full h-52 bg-input-background border border-border rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-muted-foreground">{symptoms.length} characters</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSymptoms("")}>
                  <RotateCcw className="w-3.5 h-3.5" /> Clear
                </Button>
                <Button variant="primary" size="sm" loading={loading} onClick={analyze}>
                  {!loading && <Zap className="w-3.5 h-3.5" />}
                  {loading ? "Analyzing..." : "Run AI Triage"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Loading state */}
          {loading && (
            <Card padding="md" className="border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center animate-pulse">
                  <Cpu className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">AI Processing</p>
                  <p className="text-xs text-muted-foreground">Analyzing symptoms against medical knowledge base...</p>
                </div>
              </div>
              <ProgressBar value={progress} height="h-2" />
              <p className="text-xs text-muted-foreground mt-2">{progress}% complete</p>
              <div className="mt-4 space-y-2">
                {["Parsing symptom tokens...", "Cross-referencing ICD-10 codes...", "Evaluating risk factors...", "Generating recommendations..."].map((step, i) => (
                  <div key={i} className={cn("flex items-center gap-2 text-xs transition-all", progress > i * 25 ? "text-foreground" : "text-muted-foreground/50")}>
                    {progress > i * 25 + 20 ? (
                      <CheckCircle className="w-3.5 h-3.5 text-[color:var(--success)]" />
                    ) : progress > i * 25 ? (
                      <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-border" />
                    )}
                    {step}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Quick examples */}
          {!loading && !result && (
            <Card padding="md">
              <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-primary" /> Quick Examples
              </h4>
              <div className="space-y-2">
                {[
                  { label: "Chest Pain", text: "65-year-old male, sudden chest pain radiating to left arm, shortness of breath, diaphoresis for 30 minutes." },
                  { label: "Pediatric Fever", text: "6-year-old girl, high fever 103°F, ear pain, irritability for 2 days. No known allergies." },
                  { label: "Back Pain", text: "42-year-old male, lower back pain for 3 weeks, radiating down left leg with numbness in foot." },
                ].map((ex, i) => (
                  <button key={i} onClick={() => setSymptoms(ex.text)}
                    className="w-full text-left p-2.5 rounded-xl border border-border hover:bg-muted hover:border-primary/30 transition-all">
                    <p className="text-xs font-medium text-foreground">{ex.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{ex.text}</p>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Results */}
        <div>
          {result ? (
            <div className="space-y-4">
              {/* Urgency hero */}
              <Card padding="md" className={cn("border-2", result.urgency === "urgent" ? "border-destructive/30" : result.urgency === "priority" ? "border-[color:var(--warning)]/30" : "border-[color:var(--success)]/30")}>
                <div className={cn("rounded-xl p-4 mb-4 flex items-center justify-between", urgencyBg[result.urgency])}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Urgency Level</p>
                    <p className={cn("text-2xl font-bold capitalize mt-0.5", urgencyColors[result.urgency])}>
                      {result.urgency}
                    </p>
                  </div>
                  <AlertTriangle className={cn("w-8 h-8", urgencyColors[result.urgency])} />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Department</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{result.department}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Risk Level</p>
                    <p className="text-sm font-bold text-destructive mt-0.5">{result.riskLevel}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">AI Confidence</p>
                    <p className="text-sm font-bold text-foreground">{result.confidence}%</p>
                  </div>
                  <ProgressBar value={result.confidence} height="h-2.5" />
                </div>

                <div className="bg-muted rounded-xl p-3 mb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Recommended Action</p>
                  <p className="text-xs text-foreground leading-relaxed">{result.action}</p>
                </div>

                <div className="mb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Possible Conditions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.conditions.map((c, i) => <Badge key={i} variant={i === 0 ? "urgent" : "muted"} size="sm">{c}</Badge>)}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Alternative Departments</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.alternatives.map((a, i) => <Badge key={i} variant="muted" size="sm">{a}</Badge>)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button variant="success" size="sm" onClick={() => toast.success("Triage accepted")}>
                    <Check className="w-3.5 h-3.5" /> Accept
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.info("Modify recommendation")}>
                    <Edit3 className="w-3.5 h-3.5" /> Modify
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => { setResult(null); toast.warning("Recommendation rejected"); }}>
                    <X className="w-3.5 h-3.5" /> Reject
                  </Button>
                </div>
              </Card>
            </div>
          ) : !loading ? (
            <Card padding="md">
              <div className="flex flex-col items-center text-center py-12">
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">AI Results Will Appear Here</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                  Enter patient symptoms and run the AI triage to get urgency classification, department routing, and recommended actions.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-2 w-full max-w-xs">
                  {[
                    { icon: Target, label: "Smart Urgency", desc: "Accurate classification" },
                    { icon: Building2, label: "Dept Routing", desc: "Optimized assignment" },
                    { icon: Shield, label: "Risk Analysis", desc: "Evidence-based" },
                    { icon: Activity, label: "Action Plan", desc: "Immediate steps" },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="bg-muted rounded-xl p-3 text-center">
                      <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-xs font-medium text-foreground">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Reports Screen ───────────────────────────────────────────────────────────

function ReportsScreen() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Analytics & Reports</h2>
          <p className="text-xs text-muted-foreground">January 1 – January 15, 2024</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Excel exported")}>
            <Download className="w-3.5 h-3.5" /> Export Excel
          </Button>
          <Button variant="primary" size="sm" onClick={() => toast.success("PDF generated")}>
            <FileDown className="w-3.5 h-3.5" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Registrations", value: "214", change: "+18%", icon: Users, color: "bg-accent text-primary" },
          { label: "AI Accuracy", value: "94%", change: "+2.1%", icon: Brain, color: "bg-purple-50 text-purple-600" },
          { label: "Avg Wait Time", value: "21m", change: "-4m", icon: Clock, color: "bg-[color:var(--success-muted)] text-[color:var(--success)]" },
          { label: "Urgent Cases", value: "31", change: "+5", icon: AlertTriangle, color: "bg-[color:var(--urgent-muted)] text-[color:var(--urgent)]" },
        ].map(k => {
          const Icon = k.icon;
          return (
            <Card key={k.label} padding="md">
              <div className="flex items-center justify-between mb-2">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", k.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <Badge variant="success" size="xs">{k.change}</Badge>
              </div>
              <p className="text-xl font-bold text-foreground">{k.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Daily registrations */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-foreground mb-4">Daily Registrations</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={DAILY_DATA}>
              <defs>
                <linearGradient id="repGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px", color: "var(--foreground)" }} />
              <Area type="monotone" dataKey="patients" stroke="#2563eb" strokeWidth={2} fill="url(#repGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Department distribution */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-foreground mb-4">Department Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DEPT_DATA} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px", color: "var(--foreground)" }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {DEPT_DATA.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Urgency trends */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-foreground mb-4">Urgency Trends</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DAILY_DATA} barSize={12} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px", color: "var(--foreground)" }} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "var(--foreground)" }} />
              <Bar dataKey="routine" fill="#16a34a" radius={[4, 4, 0, 0]} name="Routine" />
              <Bar dataKey="priority" fill="#d97706" radius={[4, 4, 0, 0]} name="Priority" />
              <Bar dataKey="urgent" fill="#dc2626" radius={[4, 4, 0, 0]} name="Urgent" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* AI Accuracy */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-foreground mb-4">AI Triage Accuracy</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RechartsLine data={AI_ACCURACY}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px", color: "var(--foreground)" }} itemStyle={{ color: "var(--foreground)" }} formatter={(v: any) => [`${v}%`, "Accuracy"]} />
              <Line type="monotone" dataKey="accuracy" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4, fill: "#7c3aed", strokeWidth: 0 }} />
            </RechartsLine>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ─── Settings Screen ──────────────────────────────────────────────────────────

function SettingsScreen({ darkMode, onToggleDark }: { darkMode: boolean; onToggleDark: () => void }) {
  const [activeSection, setActiveSection] = useState("profile");
  const [aiThreshold, setAiThreshold] = useState(75);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifUrgent, setNotifUrgent] = useState(true);
  const [language, setLanguage] = useState("en");
  const [twoFactor, setTwoFactor] = useState(false);

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "clinic", label: "Clinic Info", icon: Building2 },
    { id: "ai", label: "AI Configuration", icon: Brain },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Sun },
    { id: "security", label: "Security", icon: Shield },
  ];

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={cn("relative w-11 h-6 rounded-full transition-colors flex-shrink-0", value ? "bg-primary" : "bg-switch-background")}>
      <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all", value ? "left-6" : "left-1")} />
    </button>
  );

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground">Settings</h2>
          <p className="text-xs text-muted-foreground">Manage your account, clinic, and system preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Sidebar nav */}
          <Card padding="sm">
            <nav className="space-y-0.5">
              {sections.map(s => {
                const Icon = s.icon;
                return (
                  <button key={s.id} onClick={() => setActiveSection(s.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      activeSection === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {s.label}
                  </button>
                );
              })}
            </nav>
          </Card>

          {/* Content */}
          <div className="md:col-span-3">
            {activeSection === "profile" && (
              <Card padding="md">
                <h3 className="text-sm font-semibold text-foreground mb-4">Profile Information</h3>
                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border">
                  <div className="relative">
                    <Avatar name="Dr. Anna Brooks" size="lg" />
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md">
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">Dr. Anna Brooks</p>
                    <p className="text-xs text-muted-foreground">Receptionist · Eastside Medical Clinic</p>
                    <button className="text-xs text-primary font-medium mt-1 hover:underline">Change photo</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="First Name" value="Anna" onChange={() => {}} />
                  <Input label="Last Name" value="Brooks" onChange={() => {}} />
                  <Input label="Email" type="email" value="anna.brooks@mediflow.health" onChange={() => {}} icon={Mail} />
                  <Input label="Phone" value="+1 (555) 123-4567" onChange={() => {}} icon={Phone} />
                  <div className="sm:col-span-2">
                    <Input label="Role / Title" value="Lead Receptionist" onChange={() => {}} />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="primary" size="sm" onClick={() => toast.success("Profile saved")}>
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </Button>
                </div>
              </Card>
            )}

            {activeSection === "ai" && (
              <Card padding="md">
                <h3 className="text-sm font-semibold text-foreground mb-4">AI Triage Configuration</h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">Confidence Threshold</label>
                      <Badge variant="blue" size="sm">{aiThreshold}%</Badge>
                    </div>
                    <input type="range" min="50" max="99" value={aiThreshold} onChange={e => setAiThreshold(Number(e.target.value))}
                      className="w-full accent-primary" />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>50% (Permissive)</span><span>99% (Strict)</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">AI will flag recommendations below this confidence for manual review.</p>
                  </div>
                  <div className="border-t border-border pt-4 space-y-3">
                    {[
                      { label: "Auto-assign urgent cases to Emergency", desc: "Immediately route urgent patients without manual approval", value: true },
                      { label: "Require confirmation for AI recommendations", desc: "Receptionist must approve all AI triage decisions", value: false },
                      { label: "Include alternative department suggestions", desc: "Show backup departments in the triage report", value: true },
                    ].map((s, i) => (
                      <div key={i} className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                        </div>
                        <Toggle value={s.value} onChange={() => {}} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="primary" size="sm" onClick={() => toast.success("AI settings saved")}>
                    <Check className="w-3.5 h-3.5" /> Save Configuration
                  </Button>
                </div>
              </Card>
            )}

            {activeSection === "notifications" && (
              <Card padding="md">
                <h3 className="text-sm font-semibold text-foreground mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { label: "Email Notifications", desc: "Receive updates via email", value: notifEmail, set: () => setNotifEmail(!notifEmail) },
                    { label: "SMS Notifications", desc: "Critical alerts via text message", value: notifSms, set: () => setNotifSms(!notifSms) },
                    { label: "Urgent Case Alerts", desc: "Instant alert when urgent cases are registered", value: notifUrgent, set: () => setNotifUrgent(!notifUrgent) },
                  ].map(n => (
                    <div key={n.label} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-foreground">{n.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                      </div>
                      <button onClick={n.set} className={cn("relative w-11 h-6 rounded-full transition-colors flex-shrink-0", n.value ? "bg-primary" : "bg-switch-background")}>
                        <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all", n.value ? "left-6" : "left-1")} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeSection === "appearance" && (
              <Card padding="md">
                <h3 className="text-sm font-semibold text-foreground mb-4">Appearance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-foreground">Dark Mode</p>
                      <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
                    </div>
                    <button onClick={onToggleDark} className={cn("relative w-11 h-6 rounded-full transition-colors", darkMode ? "bg-primary" : "bg-switch-background")}>
                      <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all", darkMode ? "left-6" : "left-1")} />
                    </button>
                  </div>
                  <div className="p-3 bg-muted rounded-xl">
                    <p className="text-sm font-medium text-foreground mb-3">Language</p>
                    <select value={language} onChange={e => setLanguage(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
                      {[{ label: "English (US)", value: "en" }, { label: "Spanish", value: "es" }, { label: "French", value: "fr" }, { label: "Arabic", value: "ar" }].map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>
            )}

            {activeSection === "security" && (
              <Card padding="md">
                <h3 className="text-sm font-semibold text-foreground mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <button onClick={() => setTwoFactor(!twoFactor)} className={cn("relative w-11 h-6 rounded-full transition-colors", twoFactor ? "bg-primary" : "bg-switch-background")}>
                      <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all", twoFactor ? "left-6" : "left-1")} />
                    </button>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-medium text-foreground mb-3">Change Password</p>
                    <div className="space-y-3">
                      <Input label="Current Password" type="password" placeholder="••••••••" onChange={() => {}} icon={Lock} />
                      <Input label="New Password" type="password" placeholder="••••••••" onChange={() => {}} icon={Lock} />
                      <Input label="Confirm New Password" type="password" placeholder="••••••••" onChange={() => {}} icon={Lock} />
                    </div>
                    <Button variant="primary" size="sm" className="mt-3" onClick={() => toast.success("Password updated")}>
                      <Check className="w-3.5 h-3.5" /> Update Password
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {(activeSection === "clinic") && (
              <Card padding="md">
                <h3 className="text-sm font-semibold text-foreground mb-4">Clinic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input label="Clinic Name" value="Eastside Medical Clinic" onChange={() => {}} icon={Building2} />
                  </div>
                  <Input label="Phone" value="+1 (555) 800-9000" onChange={() => {}} icon={Phone} />
                  <Input label="Email" value="info@eastsidemedical.com" onChange={() => {}} icon={Mail} />
                  <div className="sm:col-span-2">
                    <Input label="Address" value="800 Healthcare Blvd, Austin TX 78701" onChange={() => {}} icon={MapPin} />
                  </div>
                  <Input label="License Number" value="TX-MED-2024-4581" onChange={() => {}} />
                  <Input label="Operating Hours" value="Mon–Sat 8am–8pm" onChange={() => {}} icon={Clock} />
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="primary" size="sm" onClick={() => toast.success("Clinic info saved")}>
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients] = useState<Patient[]>(PATIENTS);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const SCREEN_TITLES: Record<Screen, string> = {
    login: "Login",
    dashboard: "Dashboard",
    registration: "New Patient Registration",
    records: "Patient Records",
    details: "Patient Details",
    triage: "AI Triage",
    reports: "Reports & Analytics",
    settings: "Settings",
  };

  if (screen === "login") {
    return (
      <>
        <Toaster position="top-right" richColors />
        <LoginScreen onLogin={() => setScreen("dashboard")} />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "var(--font-family)" }}>
      <Toaster position="top-right" richColors />

      <Sidebar
        active={screen}
        onNavigate={s => { setScreen(s); if (s !== "details") setSelectedPatient(null); }}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        darkMode={darkMode}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          title={SCREEN_TITLES[screen]}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(d => !d)}
          onNavigate={setScreen}
        />

        {screen === "dashboard" && (
          <DashboardScreen
            patients={patients}
            onNavigate={setScreen}
            onSelectPatient={p => { setSelectedPatient(p); setScreen("details"); }}
          />
        )}
        {screen === "registration" && <RegistrationScreen onNavigate={setScreen} />}
        {screen === "records" && (
          <RecordsScreen
            patients={patients}
            onNavigate={setScreen}
            onSelectPatient={p => { setSelectedPatient(p); setScreen("details"); }}
          />
        )}
        {screen === "details" && selectedPatient && (
          <PatientDetailsScreen patient={selectedPatient} onBack={() => setScreen("records")} />
        )}
        {screen === "triage" && <AITriageScreen />}
        {screen === "reports" && <ReportsScreen />}
        {screen === "settings" && <SettingsScreen darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />}
      </div>
    </div>
  );
}
