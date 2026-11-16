import {
  BookOpen,
  Award,
  BarChart3,
  FlaskConical,
  Library,
  LayoutDashboard,
  Plug,
  Route,
  Settings,
  Target,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Visão geral da sua evolução." },
  { href: "/plataformas", label: "Minhas plataformas", icon: Plug, description: "Conexões com plataformas de aprendizagem." },
  { href: "/cursos", label: "Meus cursos", icon: BookOpen, description: "Todos os seus cursos em um só lugar." },
  { href: "/learning-paths", label: "Learning Paths", icon: Route, description: "Trilhas de aprendizagem personalizadas." },
  { href: "/certificacoes", label: "Certificações", icon: Award, description: "Catálogo e progresso das certificações." },
  { href: "/laboratorios", label: "Laboratórios", icon: FlaskConical, description: "Prática em laboratórios e evidências." },
  { href: "/biblioteca", label: "Biblioteca", icon: Library, description: "Materiais e documentação de referência." },
  { href: "/metas", label: "Metas e planejamento", icon: Target, description: "Metas e cronograma de estudos." },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3, description: "Relatórios de desempenho e histórico." },
  { href: "/configuracoes", label: "Configurações", icon: Settings, description: "Preferências da conta e do sistema." },
];
