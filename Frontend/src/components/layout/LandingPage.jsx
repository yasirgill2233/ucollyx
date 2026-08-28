import React from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Code2,
  GitBranch,
  MessageSquare,
  Rocket,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router";


const features = [
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Bring developers, managers, and startup teams together in one unified workspace.",
  },
  {
    icon: Code2,
    title: "Development Workspace",
    description:
      "Manage projects, tasks, repositories, environments, and development workflows.",
  },
  {
    icon: MessageSquare,
    title: "Real-time Communication",
    description:
      "Communicate with your team through channels, direct messages, meetings, and discussions.",
  },
  {
    icon: GitBranch,
    title: "Project Management",
    description:
      "Organize software projects, track progress, assign tasks, and keep everyone aligned.",
  },
  {
    icon: Rocket,
    title: "Easy Deployment",
    description:
      "Move from development to deployment with an integrated and streamlined workflow.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Workspace",
    description:
      "Keep your projects and team data organized with workspace-based access and security.",
  },
];

const stats = [
  { value: "1", label: "Unified Workspace" },
  { value: "∞", label: "Possibilities" },
  { value: "24/7", label: "Team Collaboration" },
  { value: "100%", label: "Focused on Teams" },
];

function LandingPage() {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden">
      {/* ================= NAVBAR ================= */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            {/* <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
              <span className="text-xl font-black text-white">U</span>
            </div> */}

            <span className="text-2xl font-bold tracking-tight">
              {/* <span className="text-blue-600">U</span>
              Collyx */}
              <img src="/ucollyx.png" alt="" className="w-40"/>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              How It Works
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              About
            </a>
          </nav>

          {/* Actions */}
          <div className="hidden items-center gap-3 md:flex">
            <button onClick={() => navigate('/login')} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:cursor-pointer">
              Log in
            </button>

            <button onClick={() => navigate('/register')} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:cursor-pointer">
              Get Started
            </button>
          </div>

          {/* Mobile button */}
          <button className="rounded-lg p-2 text-slate-700 md:hidden">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <main>
        <section className="relative isolate pt-32 lg:pt-40">
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl" />

            <div className="absolute right-0 top-80 h-72 w-72 rounded-full bg-blue-50 blur-3xl" />

            <div className="absolute left-0 top-96 h-72 w-72 rounded-full bg-sky-50 blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              {/* Badge */}
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                <Zap className="h-4 w-4" />
                Built for modern software teams
                <ChevronRight className="h-4 w-4" />
              </div>

              {/* Heading */}
              <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                One workspace.
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Your entire team.
                </span>
              </h1>

              {/* Description */}
              <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                UCollyx is a unified workspace for software teams and tech
                startups to collaborate, manage projects, communicate, and
                build products together.
              </p>

              {/* CTA */}
              <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button onClick={() => navigate('/register')} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white shadow-xl shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 sm:w-auto">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </button>

                <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-4 font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50 sm:w-auto">
                  Explore Workspace
                </button>
              </div>

              {/* Small note */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-600" />
                  No complicated setup
                </span>

                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-600" />
                  Built for teams
                </span>

                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-600" />
                  Everything connected
                </span>
              </div>
            </div>

            {/* ================= DASHBOARD PREVIEW ================= */}
            <div className="relative mx-auto mt-20 max-w-6xl">
              {/* Glow */}
              <div className="absolute inset-x-20 -bottom-10 h-32 rounded-full bg-blue-500/20 blur-3xl" />

              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-blue-900/10">
                {/* Browser top */}
                <div className="flex h-12 items-center gap-2 border-b border-slate-200 bg-slate-50 px-5">
                  <div className="h-3 w-3 rounded-full bg-slate-300" />
                  <div className="h-3 w-3 rounded-full bg-slate-300" />
                  <div className="h-3 w-3 rounded-full bg-slate-300" />

                  <div className="mx-auto hidden h-7 w-80 rounded-md bg-white shadow-sm sm:block" />
                </div>

                {/* Dashboard */}
                <div className="flex min-h-[430px] bg-slate-50">
                  {/* Sidebar */}
                  <aside className="hidden w-56 border-r border-slate-200 bg-white p-4 sm:block">
                    <div className="mb-7 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                        U
                      </div>
                      <span className="font-bold">
                        <span className="text-blue-600">U</span>Collyx
                      </span>
                    </div>

                    <div className="space-y-1">
                      {[
                        "Dashboard",
                        "Projects",
                        "Tasks",
                        "Messages",
                        "Meetings",
                        "Deployments",
                      ].map((item, index) => (
                        <div
                          key={item}
                          className={`rounded-lg px-3 py-2.5 text-sm ${
                            index === 0
                              ? "bg-blue-50 font-semibold text-blue-600"
                              : "text-slate-500"
                          }`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </aside>

                  {/* Main dashboard */}
                  <div className="flex-1 p-5 sm:p-7">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Workspace</p>
                        <h3 className="mt-1 text-xl font-bold text-slate-900">
                          Development Team
                        </h3>
                      </div>

                      <div className="hidden items-center gap-2 sm:flex">
                        <div className="flex -space-x-2">
                          {[1, 2, 3, 4].map((item) => (
                            <div
                              key={item}
                              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-xs font-bold text-blue-600"
                            >
                              {item}
                            </div>
                          ))}
                        </div>

                        <span className="ml-2 text-xs text-slate-500">
                          12 members
                        </span>
                      </div>
                    </div>

                    {/* Cards */}
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                          <Code2 className="h-5 w-5 text-blue-600" />
                        </div>

                        <p className="text-sm text-slate-500">Projects</p>
                        <p className="mt-1 text-2xl font-bold">24</p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                          <Check className="h-5 w-5 text-blue-600" />
                        </div>

                        <p className="text-sm text-slate-500">
                          Completed Tasks
                        </p>
                        <p className="mt-1 text-2xl font-bold">186</p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                          <Rocket className="h-5 w-5 text-blue-600" />
                        </div>

                        <p className="text-sm text-slate-500">Deployments</p>
                        <p className="mt-1 text-2xl font-bold">48</p>
                      </div>
                    </div>

                    {/* Project activity */}
                    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
                      <div className="mb-5 flex items-center justify-between">
                        <h4 className="font-semibold">Project Activity</h4>
                        <span className="text-sm text-blue-600">
                          View all
                        </span>
                      </div>

                      <div className="space-y-4">
                        {[
                          "Frontend deployment completed",
                          "New task assigned to development team",
                          "API integration updated",
                        ].map((activity, index) => (
                          <div
                            key={activity}
                            className="flex items-center gap-3"
                          >
                            <div className="h-2 w-2 rounded-full bg-blue-500" />

                            <p className="flex-1 text-sm text-slate-600">
                              {activity}
                            </p>

                            <span className="text-xs text-slate-400">
                              {index + 1}h ago
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= STATS ================= */}
        <section className="border-y border-slate-100 bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-black text-blue-600 sm:text-4xl">
                    {stat.value}
                  </div>

                  <div className="mt-2 text-sm text-slate-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section id="features" className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
                Everything connected
              </span>

              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Everything your team needs
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                Replace scattered tools and disconnected workflows with one
                centralized workspace designed for modern software teams.
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="group rounded-2xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 transition group-hover:bg-blue-600">
                      <Icon className="h-6 w-6 text-blue-600 transition group-hover:text-white" />
                    </div>

                    <h3 className="mt-6 text-lg font-bold text-slate-900">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {feature.description}
                    </p>

                    <button className="mt-5 flex items-center gap-1 text-sm font-semibold text-blue-600">
                      Learn more
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section
          id="how-it-works"
          className="overflow-hidden bg-slate-50 py-24"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div>
                <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
                  Simple workflow
                </span>

                <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  From idea to deployment in one place.
                </h2>

                <p className="mt-6 text-lg leading-8 text-slate-600">
                  UCollyx connects your team's complete development lifecycle,
                  helping everyone stay focused, informed, and productive.
                </p>

                <div className="mt-10 space-y-7">
                  {[
                    {
                      number: "01",
                      title: "Create your workspace",
                      description:
                        "Set up a workspace for your company, startup, or software team.",
                    },
                    {
                      number: "02",
                      title: "Build your project",
                      description:
                        "Create projects, invite your team, assign tasks, and organize your workflow.",
                    },
                    {
                      number: "03",
                      title: "Collaborate & deploy",
                      description:
                        "Communicate, develop, review, and deploy without leaving your workspace.",
                    },
                  ].map((step) => (
                    <div key={step.number} className="flex gap-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
                        {step.number}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          {step.title}
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual */}
              <div className="relative">
                <div className="absolute -inset-10 rounded-full bg-blue-100/60 blur-3xl" />

                <div className="relative rounded-3xl border border-blue-100 bg-white p-6 shadow-2xl shadow-blue-900/10">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Project</p>
                        <h3 className="font-bold">UCollyx Platform</h3>
                      </div>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                        Active
                      </span>
                    </div>

                    <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full w-[76%] rounded-full bg-blue-600" />
                    </div>

                    <div className="mt-2 flex justify-between text-xs text-slate-400">
                      <span>Project progress</span>
                      <span>76%</span>
                    </div>

                    <div className="mt-7 space-y-3">
                      {[
                        ["Frontend", "Completed"],
                        ["Backend API", "In Progress"],
                        ["Deployment", "In Progress"],
                        ["Testing", "Pending"],
                      ].map(([name, status]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between rounded-xl bg-white p-4"
                        >
                          <span className="text-sm font-medium">{name}</span>

                          <span
                            className={`text-xs font-semibold ${
                              status === "Completed"
                                ? "text-blue-600"
                                : status === "In Progress"
                                  ? "text-slate-700"
                                  : "text-slate-400"
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ABOUT ================= */}
        <section id="about" className="py-24">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-black text-white shadow-xl shadow-blue-600/20">
              U
            </div>

            <h2 className="mt-7 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Built to bring teams together.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              UCollyx provides a single digital workspace where software
              developers, project managers, and tech startups can collaborate
              seamlessly from planning to production.
            </p>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="px-6 pb-24 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-blue-600 px-8 py-16 text-center shadow-2xl shadow-blue-600/20 sm:px-16">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-blue-400/30 blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl font-black text-white sm:text-5xl">
                Ready to build better together?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100">
                Bring your projects, people, and development workflow into one
                powerful workspace.
              </p>

              <button onClick={() => navigate('/register')} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 font-bold text-blue-600 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50">
                Start Building with UCollyx
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            {/* <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white">
              U
            </div> */}

            <div>
             <img src="/ucollyx.png" alt="" className="w-30"/>
            </div>
          </div>

          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} UCollyx. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;