import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";
import { BarChart } from "echarts/charts";
import type { BarSeriesOption } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import type { GridComponentOption, TooltipComponentOption } from "echarts/components";
import { init, use as registerECharts } from "echarts/core";
import type { ComposeOption, EChartsType } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import {
  Archive,
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  Ellipsis,
  FileBarChart,
  FileDown,
  Headphones,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Monitor,
  Package,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

registerECharts([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

type DashboardChartOption = ComposeOption<BarSeriesOption | GridComponentOption | TooltipComponentOption>;

type MenuItem = {
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  active?: boolean;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const menuSections: MenuSection[] = [
  {
    title: "Main Menu",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, active: true },
      { label: "Products", icon: Package },
      { label: "Transactions", icon: CircleDollarSign },
      { label: "Reports & Analytics", icon: ClipboardList },
      { label: "Messages", icon: MessageCircle },
      { label: "Team Performance", icon: BarChart3 },
      { label: "Campaigns", icon: Megaphone },
    ],
  },
  {
    title: "Customers",
    items: [
      { label: "Customer List", icon: Users },
      { label: "Channels", icon: Monitor },
      { label: "Order Management", icon: FileBarChart },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Roles & Permissions", icon: ShieldCheck },
      { label: "Billing & Subscription", icon: CreditCard },
      { label: "Integrations", icon: Archive },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Customer Support", icon: Headphones },
      { label: "Help Center", icon: HelpCircle },
      { label: "System Settings", icon: Settings },
    ],
  },
];

const metrics = [
  { label: "Total Revenue", value: "$20,320" },
  { label: "Total Orders", value: "10,320", suffix: "Orders" },
  { label: "New Customers", value: "4,305", suffix: "New Users" },
  { label: "Conversion Rate", value: "3.9%" },
];

const miniBars = [19, 31, 38, 28, 50, 41, 56, 33, 45];

const salesBars = [
  12, 20, 25, 45, 61, 78, 55, 66, 42, 18, 52, 28, 38, 64, 54, 43, 34, 26,
  27, 88, 70, 55, 18, 12, 20, 35, 64, 51, 36, 19, 14, 31, 58, 95, 67, 45,
  20, 17, 14, 10, 28, 42, 77, 50, 37, 29, 17, 11, 14, 21, 61, 91, 66, 38,
  47, 55, 34, 25, 17, 24, 40, 58, 70,
];

const ghostBars = salesBars.map((value, index) => {
  const wave = [38, 64, 52, 92, 44, 74, 119, 58, 88, 48, 78, 104];
  return Math.max(34, Math.min(138, value + wave[index % wave.length]));
});

const revenueBars = [83, 111, 64, 135, 91, 65, 98, 58, 128, 70, 104, 60, 74];
const revenueGhostBars = [103, 152, 118, 168, 110, 95, 125, 104, 148, 86, 133, 118, 104];
const monthLabels = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const salesCategories = salesBars.map((_, index) => {
  const segment = salesBars.length / monthLabels.length;
  const monthIndex = Math.floor(index / segment);
  const labelIndex = Math.round(monthIndex * segment + segment / 2);
  return index === labelIndex ? monthLabels[monthIndex] : "";
});

const salesExistingValues = salesBars.map((value) => Number(((value / 95) * 18).toFixed(1)));
const salesNewUserValues = ghostBars.map((value) => Number(((value / 138) * 50).toFixed(1)));
const revenueExistingValues = revenueBars.map((value) => Number(((value / 168) * 52).toFixed(1)));
const revenueGhostValues = revenueGhostBars.map((value) => Number(((value / 168) * 80).toFixed(1)));
const revenueCategories = revenueBars.map((_, index) => {
  if (index === 0) return "1 JAN";
  if (index === revenueBars.length - 1) return "30 JAN 2025";
  return "";
});
const salesGridCells = Array.from({ length: 240 }, (_, index) => index);

const transactions = [
  {
    id: "#04910",
    customer: "Ryan Korsgaard",
    product: "Ergo Office Chair",
    status: "Success",
    qty: 12,
    unit: "$3,450",
    total: "$41,400",
  },
  {
    id: "#04911",
    customer: "Madelyn Lubin",
    product: "Sunset Desk 02",
    status: "Success",
    qty: 20,
    unit: "$2,980",
    total: "$89,200",
  },
  {
    id: "#04912",
    customer: "Abram Bergson",
    product: "Eco Bookshelf",
    status: "Pending",
    qty: 22,
    unit: "$1,750",
    total: "$75,900",
  },
  {
    id: "#04913",
    customer: "Phillip Mango",
    product: "Green Leaf Desk",
    status: "Refunded",
    qty: 24,
    unit: "$1,950",
    total: "$19,500",
  },
];

function useEChart(option: DashboardChartOption) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<EChartsType | null>(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const chart = init(containerRef.current, undefined, { renderer: "canvas" });
    chartRef.current = chart;

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(containerRef.current);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.setOption(option, true);
    chartRef.current.resize();
  }, [option]);

  return containerRef;
}

function formatSalesTooltip(params: unknown) {
  const points = Array.isArray(params)
    ? (params as Array<{ dataIndex: number; marker: string; seriesName: string; value: number }>)
    : [];
  const dataIndex = points[0]?.dataIndex ?? 0;
  const month = monthLabels[Math.min(monthLabels.length - 1, Math.floor((dataIndex / salesBars.length) * monthLabels.length))];
  const title = `${month.charAt(0)}${month.slice(1).toLowerCase()} 2025`;

  return `
    <div class="echarts-tooltip-card">
      <strong>${title}</strong>
      ${points
        .map(
          (point) => `
            <span>
              ${point.marker}${point.seriesName}
              <b>${Math.round(Number(point.value))}k</b>
            </span>
          `,
        )
        .join("")}
    </div>
  `;
}

function formatRevenueTooltip(params: unknown) {
  const points = Array.isArray(params)
    ? (params as Array<{ marker: string; seriesName: string; value: number }>)
    : [];

  return `
    <div class="echarts-tooltip-card compact">
      <strong>Revenue</strong>
      ${points
        .map(
          (point) => `
            <span>
              ${point.marker}${point.seriesName}
              <b>${Math.round(Number(point.value))}k</b>
            </span>
          `,
        )
        .join("")}
    </div>
  `;
}

function Sidebar({
  activeMenu,
  onMenuSelect,
}: {
  activeMenu: string;
  onMenuSelect: (label: string) => void;
}) {
  const [agencyOpen, setAgencyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <aside className="sidebar">
      <button
        className={agencyOpen ? "agency-card open" : "agency-card"}
        type="button"
        aria-expanded={agencyOpen}
        onClick={() => setAgencyOpen((isOpen) => !isOpen)}
      >
        <img src="/brand-logo.webp" alt="" className="agency-logo" />
        <div>
          <span>Agency</span>
          <strong>Spark Pixel Team</strong>
        </div>
        <ChevronDown size={16} className="agency-chevron" />
      </button>

      <nav className="menu-stack" aria-label="Dashboard navigation">
        {menuSections.map((section) => (
          <div className="menu-section" key={section.title}>
            <p className="menu-title">{section.title}</p>
            <div className="menu-items">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.label;
                return (
                  <a
                    aria-current={isActive ? "page" : undefined}
                    className={isActive ? "menu-item active" : "menu-item"}
                    href="#"
                    key={item.label}
                    onClick={(event) => {
                      event.preventDefault();
                      onMenuSelect(item.label);
                    }}
                  >
                    <Icon size={18} strokeWidth={1.9} />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <button
        className={profileOpen ? "profile-card open" : "profile-card"}
        type="button"
        aria-expanded={profileOpen}
        onClick={() => setProfileOpen((isOpen) => !isOpen)}
      >
        <div className="profile-photo-wrap">
          <img src="/bottom-avatar.webp" alt="" className="profile-photo" />
          <span className="online-dot" />
        </div>
        <div className="profile-copy">
          <strong>Salung Prastyo</strong>
          <span>Pro Plan</span>
        </div>
        <ChevronDown size={17} className="profile-chevron" />
      </button>
    </aside>
  );
}

function Topbar({ onNotify }: { onNotify: (message: string) => void }) {
  const [search, setSearch] = useState("");

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>Dashboard</span>
        <b>/</b>
        <strong>Overview</strong>
      </div>
      <div className="topbar-actions">
        <label className="search-box">
          <Search size={22} />
          <input
            aria-label="Search"
            value={search}
            placeholder="Search..."
            onChange={(event) => setSearch(event.target.value)}
          />
          <kbd>⌘</kbd>
          <kbd>K</kbd>
        </label>
        <button className="icon-button" type="button" aria-label="Notifications" onClick={() => onNotify("No new notifications")}>
          <Bell size={19} />
        </button>
        <button className="icon-button" type="button" aria-label="Inbox" onClick={() => onNotify("Inbox opened")}>
          <Inbox size={19} />
        </button>
        <img src="/top-avatar.webp" alt="" className="top-avatar" />
      </div>
    </header>
  );
}

function MiniSparkBars() {
  return (
    <div className="mini-spark" aria-hidden="true">
      {miniBars.map((height, index) => (
        <span
          className={index === 4 ? "accent" : ""}
          key={`${height}-${index}`}
          style={{ height }}
        />
      ))}
    </div>
  );
}

function SquareGrid() {
  return (
    <div className="square-grid" aria-hidden="true">
      {salesGridCells.map((index) => (
        <span className="square-grid-cell" key={index} />
      ))}
    </div>
  );
}

function MetricCard({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  const [selected, setSelected] = useState(false);

  return (
    <button
      className={selected ? "metric-card selected" : "metric-card"}
      type="button"
      aria-pressed={selected}
      onClick={() => setSelected((isSelected) => !isSelected)}
    >
      <div className="metric-top">
        <div>
          <p>{label}</p>
          <div className="metric-value">
            <strong>{value}</strong>
            {suffix ? <span>{suffix}</span> : null}
          </div>
        </div>
        <MiniSparkBars />
      </div>
      <div className="metric-bottom">
        <span className="rise-icon">↑</span>
        <span>
          <b>+0,94</b> last year
        </span>
      </div>
    </button>
  );
}

function SalesChart() {
  const [period, setPeriod] = useState("Monthly");
  const salesOption = useMemo<DashboardChartOption>(
    () => ({
      animation: false,
      backgroundColor: "transparent",
      grid: {
        left: 84,
        right: 16,
        top: 12,
        bottom: 42,
      },
      tooltip: {
        trigger: "axis",
        confine: true,
        renderMode: "html",
        backgroundColor: "transparent",
        borderWidth: 0,
        padding: 0,
        axisPointer: {
          type: "line",
          lineStyle: {
            color: "rgba(255,255,255,0.24)",
            type: "dashed",
            width: 1,
          },
        },
        formatter: formatSalesTooltip,
      },
      xAxis: {
        type: "category",
        data: salesCategories,
        boundaryGap: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          interval: 0,
          color: (value?: string | number) => (value === "JUN" ? "#e5e1d9" : "#6d6963"),
          fontFamily: "Geist, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          margin: 22,
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 60,
        interval: 10,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: "#87837b",
          fontFamily: "Geist, sans-serif",
          fontSize: 15,
          margin: 14,
          formatter: "{value}k",
        },
      },
      series: [
        {
          name: "New User",
          type: "bar",
          data: salesNewUserValues,
          barWidth: 9,
          barGap: "-100%",
          itemStyle: {
            color: "rgba(255,255,255,0.052)",
            borderRadius: [2, 2, 0, 0],
          },
          emphasis: { disabled: true },
          z: 1,
        },
        {
          name: "Existing User",
          type: "bar",
          data: salesExistingValues,
          barWidth: 9,
          itemStyle: {
            color: "#ff7618",
            borderRadius: [2, 2, 0, 0],
          },
          emphasis: { disabled: true },
          z: 2,
        },
      ],
    }),
    [period],
  );
  const chartRef = useEChart(salesOption);

  return (
    <section className="panel sales-panel">
      <PanelHeader title="Sales Trend" />
      <div className="chart-shell">
        <div className="chart-toolbar">
          <div className="total-label">
            <span>Total Revenue :</span>
            <strong>$20,320</strong>
          </div>
          <div className="legend">
            <span>
              <i className="dot neutral" /> New User
            </span>
            <span>
              <i className="dot orange" /> Existing User
            </span>
          </div>
          <div className="segmented">
            {["Weekly", "Monthly", "Yearly"].map((item) => (
              <button
                className={period === item ? "selected" : ""}
                type="button"
                aria-pressed={period === item}
                key={item}
                onClick={() => setPeriod(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="sales-chart-layer">
          <SquareGrid />
          <div
            ref={chartRef}
            className="echarts-chart sales-echarts"
            data-chart-engine="echarts"
            aria-label="Sales trend chart"
            role="img"
          />
          <div className="pinned-chart-line" aria-hidden="true">
            <span />
          </div>
          <div className="pinned-chart-tooltip" aria-hidden="true">
            <strong>Jun 2025</strong>
            <span>
              <i /> New User <b>38k</b>
            </span>
            <span>
              <i className="orange" /> Existing User <b>18k</b>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function RevenueBreakdown() {
  const [rangeOpen, setRangeOpen] = useState(false);
  const [range, setRange] = useState("Jan 1 - Aug 30");
  const revenueOption = useMemo<DashboardChartOption>(
    () => ({
      animation: false,
      backgroundColor: "transparent",
      grid: {
        left: 8,
        right: 8,
        top: 16,
        bottom: 38,
      },
      tooltip: {
        trigger: "axis",
        confine: true,
        renderMode: "html",
        backgroundColor: "transparent",
        borderWidth: 0,
        padding: 0,
        axisPointer: {
          type: "line",
          lineStyle: {
            color: "rgba(255,255,255,0.14)",
            type: "dashed",
            width: 1,
          },
        },
        formatter: formatRevenueTooltip,
      },
      xAxis: {
        type: "category",
        data: revenueCategories,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          interval: 0,
          color: "#77736c",
          fontFamily: "Geist, sans-serif",
          fontSize: 14,
          margin: 16,
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 90,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            color: "rgba(255,255,255,0.07)",
            type: "dashed",
          },
        },
      },
      series: [
        {
          name: "All Categories",
          type: "bar",
          data: revenueGhostValues,
          barWidth: 5,
          barGap: "-100%",
          itemStyle: {
            color: "rgba(255,255,255,0.045)",
            borderRadius: [3, 3, 0, 0],
          },
          emphasis: { disabled: true },
          z: 1,
        },
        {
          name: "Revenue",
          type: "bar",
          data: revenueExistingValues,
          barWidth: 5,
          itemStyle: {
            color: "#ff7618",
            borderRadius: [3, 3, 0, 0],
          },
          emphasis: { disabled: true },
          z: 2,
        },
      ],
    }),
    [range],
  );
  const chartRef = useEChart(revenueOption);

  return (
    <section className="panel revenue-panel">
      <PanelHeader title="Revenue Breakdown" />
      <div className="revenue-body">
        <div className="revenue-topline">
          <div>
            <span>Revenue by Category</span>
            <strong>$20,320</strong>
          </div>
          <button
            className="date-pill"
            type="button"
            aria-expanded={rangeOpen}
            onClick={() => setRangeOpen((isOpen) => !isOpen)}
          >
            <Calendar size={16} />
            {range}
            <ChevronDown size={14} />
          </button>
          {rangeOpen ? (
            <div className="floating-menu date-menu" role="menu">
              {["Jan 1 - Aug 30", "Sep 1 - Nov 6", "Full year"].map((item) => (
                <button
                  type="button"
                  role="menuitem"
                  key={item}
                  onClick={() => {
                    setRange(item);
                    setRangeOpen(false);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <button className="ai-button" type="button">
          <span>
            <Sparkles size={18} />
          </span>
          Get AI insight for better analysis
          <b>›</b>
        </button>

        <div
          ref={chartRef}
          className="echarts-chart revenue-echarts"
          data-chart-engine="echarts"
          aria-label="Revenue breakdown chart"
          role="img"
        />
      </div>
    </section>
  );
}

function PanelHeader({ title }: { title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="panel-header">
      <div>
        <h2>{title}</h2>
        <HelpCircle size={15} />
      </div>
      <button
        className={open ? "more-button open" : "more-button"}
        type="button"
        aria-label={`${title} options`}
        aria-pressed={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <Ellipsis size={18} />
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge ${status.toLowerCase()}`}>
      <i />
      {status}
    </span>
  );
}

function TransactionTable() {
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [openRow, setOpenRow] = useState<string | null>(null);
  const visibleRows = useMemo(
    () =>
      transactions.filter((row) =>
        [row.id, row.customer, row.product, row.status].some((value) =>
          value.toLowerCase().includes(query.toLowerCase()),
        ),
      ),
    [query],
  );

  return (
    <section className="panel table-panel">
      <div className="table-header">
        <div className="table-title">
          <h2>Recent Transactions</h2>
          <HelpCircle size={15} />
        </div>
        <div className="table-actions">
          <label className="table-search">
            <Search size={19} />
            <input
              aria-label="Search transactions"
              value={query}
              placeholder="Search transactions..."
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button className="add-button" type="button" onClick={() => setNotice("New transaction form opened")}>
            + Add Transaction
          </button>
          <button
            className="more-button"
            type="button"
            aria-label="Recent transactions options"
            onClick={() => setNotice("Transaction options opened")}
          >
            <Ellipsis size={18} />
          </button>
        </div>
      </div>

      {notice ? <p className="inline-notice">{notice}</p> : null}

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th className="check-cell">
                <span />
              </th>
              <th>ID ↕</th>
              <th>Customer ↕</th>
              <th>Product ↕</th>
              <th>Status ↕</th>
              <th>Qty ↕</th>
              <th>Unit Price ↕</th>
              <th>Total Revenue ↕</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr className={openRow === row.id ? "row-open" : ""} key={row.id}>
                <td className="check-cell">
                  <span />
                </td>
                <td className="muted-id">{row.id}</td>
                <td>{row.customer}</td>
                <td>{row.product}</td>
                <td>
                  <StatusBadge status={row.status} />
                </td>
                <td className="mono">{row.qty}</td>
                <td className="money">{row.unit}</td>
                <td className="money">{row.total}</td>
                <td>
                  <button
                    className="row-more"
                    type="button"
                    aria-label={`${row.id} actions`}
                    aria-pressed={openRow === row.id}
                    onClick={() => setOpenRow((current) => (current === row.id ? null : row.id))}
                  >
                    <Ellipsis size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function App() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [intervalOpen, setIntervalOpen] = useState(false);
  const [interval, setInterval] = useState("Daily");
  const [toast, setToast] = useState("");

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  return (
    <div className="app-frame">
      <div className="dashboard-shell">
        <Sidebar activeMenu={activeMenu} onMenuSelect={setActiveMenu} />
        <main className="main-surface">
          <Topbar onNotify={notify} />
          <div className="content">
            <div className="hero-row">
              <h1>Welcome back, Salung</h1>
              <div className="filters">
                <div className="filter-wrap">
                  <button
                    type="button"
                    aria-label={`Interval: ${interval}`}
                    aria-expanded={intervalOpen}
                    onClick={() => setIntervalOpen((isOpen) => !isOpen)}
                  >
                    {interval}
                    <ChevronDown size={15} />
                  </button>
                  {intervalOpen ? (
                    <div className="floating-menu interval-menu" role="menu">
                      {["Daily", "Weekly", "Monthly"].map((item) => (
                        <button
                          type="button"
                          role="menuitem"
                          key={item}
                          onClick={() => {
                            setInterval(item);
                            setIntervalOpen(false);
                          }}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button type="button" onClick={() => notify("Date picker opened")}>
                  <Calendar size={17} />
                  6 Nov 2025
                </button>
                <button className="export-button" type="button" onClick={() => notify("CSV export prepared")}>
                  <FileDown size={18} />
                  Export CSV
                </button>
              </div>
            </div>

            {toast ? (
              <div className="toast" role="status">
                {toast}
              </div>
            ) : null}

            <div className="metrics-grid">
              {metrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </div>

            <div className="analytics-grid">
              <SalesChart />
              <RevenueBreakdown />
            </div>

            <TransactionTable />
          </div>
        </main>
      </div>
    </div>
  );
}
