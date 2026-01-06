import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/images/Logo.png";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Settings,
  FileText,
  ListChecks,
  ClipboardList,
  UserCheck,
  Edit2,
  Download,
  Building,
  LogOut,
  ChevronDown,
  Menu,
} from "lucide-react";

export default function Sidebar({
  isCollapsed: externalCollapsed,
  isMobileOpen: externalMobileOpen,
  onToggle,
  onMobileToggle,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, permissions: contextPermissions, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(externalCollapsed || false);
  const [isMobileOpen, setIsMobileOpen] = useState(externalMobileOpen || false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [expandedParentPermissions, setExpandedParentPermissions] = useState(
    {}
  );
  const [hoveredButton, setHoveredButton] = useState(null);

  useEffect(() => {
    if (externalCollapsed !== undefined) {
      setIsCollapsed(externalCollapsed);
    }
  }, [externalCollapsed]);

  useEffect(() => {
    if (externalMobileOpen !== undefined) {
      setIsMobileOpen(externalMobileOpen);
    }
  }, [externalMobileOpen]);

  const modules = Object.values(contextPermissions || {});

  const moduleIcons = {
    attendance: <CalendarCheck size={18} />,
    registration: <Users size={18} />,
    dashboard: <LayoutDashboard size={18} />,
    reports: <FileText size={18} />,
    settings: <Settings size={18} />,
    default: <ListChecks size={18} />,
  };

  const permissionIcons = {
    my_records: <ClipboardList size={14} />,
    my_attendance: <CalendarCheck size={14} />,
    "emp-leave": <UserCheck size={14} />,
    regularization: <Edit2 size={14} />,
    company_page: <Building size={14} />,
    branch_page: <ClipboardList size={14} />,
    department_page: <Users size={14} />,
    employee_page: <UserCheck size={14} />,
    attendance_my_daily_export_f: <Download size={14} />,
    attendance_my_reports_export_f: <Download size={14} />,
    default: <ListChecks size={14} />,
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      const newState = !isMobileOpen;
      setIsMobileOpen(newState);
      if (onMobileToggle) onMobileToggle(newState);
    } else {
      const newState = !isCollapsed;
      setIsCollapsed(newState);
      if (onToggle) onToggle(newState);
    }
  };

  const toggleMenu = (moduleKey) => {
    setExpandedMenu(expandedMenu === moduleKey ? null : moduleKey);
  };

  const toggleParentPermission = (parentId) => {
    setExpandedParentPermissions((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  const isPageActive = (permissionKey) => {
    return location.pathname.includes(permissionKey);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-[#011748] text-white flex flex-col transition-all duration-300
          fixed left-0 top-0 h-full z-50
          ${isCollapsed ? "w-16" : "w-64"}
          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
        style={{ fontFamily: "'Segoe UI', 'Roboto', system-ui, sans-serif" }}
      >
        {/* Sidebar Header */}
        <div className="px-3 py-5 flex items-center justify-between border-b border-white/10 mb-5">
          {!isCollapsed && (
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              <img
                src={Logo}
                alt="PeopleVista Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="text-lg font-bold tracking-wide">
                PeopleVista
              </span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2.5 bg-white/5 border border-white/10 text-white cursor-pointer rounded transition-colors hover:bg-white/12 hover:border-white/20"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-0 pb-2 overflow-y-auto overflow-x-hidden">
          {modules.length === 0 ? (
            <p className="text-white/65 text-sm px-4">No accessible modules</p>
          ) : (
            modules.map((m) => (
              <div key={m.module_key} className="mb-1.5">
                <button
                  onClick={() => toggleMenu(m.module_key)}
                  onMouseEnter={() => setHoveredButton(`menu-${m.module_key}`)}
                  onMouseLeave={() => setHoveredButton(null)}
                  className={`
                    w-[calc(100%-20px)] mx-2.5 mb-1 flex items-center justify-between
                    px-4 py-3 border-none cursor-pointer rounded-lg
                    transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] text-left gap-3.5
                    relative overflow-hidden
                    ${
                      expandedMenu === m.module_key
                        ? "bg-white/15 text-white/65 font-semibold"
                        : "bg-transparent text-white/85 hover:bg-white/[0.08] hover:text-white hover:translate-x-1"
                    }
                    ${isCollapsed ? "justify-center px-3" : ""}
                  `}
                  style={{
                    fontSize: "13px",
                    fontWeight: expandedMenu === m.module_key ? 600 : 500,
                    letterSpacing: "0.3px",
                  }}
                >
                  {/* Orange line indicator - shows on hover and active */}
                  <div
                    className={`
                      absolute top-1/2 -translate-y-1/2 w-1 h-full bg-[#f9b722]
                      transition-all duration-300 ease-in-out
                      ${
                        expandedMenu === m.module_key ||
                        hoveredButton === `menu-${m.module_key}`
                          ? "opacity-100"
                          : "opacity-0"
                      }
                    `}
                    style={{
                      left: "0px",
                      width: "4px",
                      borderRadius: "0 4px 4px 0",
                    }}
                  />

                  <span className="flex items-center gap-3.5">
                    <span
                      className="flex-shrink-0 text-white"
                      style={{ width: "18px", height: "18px" }}
                    >
                      {moduleIcons[m.module_key] || moduleIcons.default}
                    </span>
                    {!isCollapsed && (
                      <span
                        className="flex-1 font-medium tracking-wide transition-colors duration-200"
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          letterSpacing: "0.3px",
                          color:
                            expandedMenu === m.module_key
                              ? "rgba(255, 255, 255, 0.65)"
                              : hoveredButton === `menu-${m.module_key}`
                              ? "#ffffff"
                              : "rgba(255, 255, 255, 0.65)",
                        }}
                      >
                        {m.module_name}
                      </span>
                    )}
                  </span>

                  {!isCollapsed && (
                    <ChevronDown
                      className={`
                        w-[15px] h-[15px] flex-shrink-0 text-white transition-all duration-200
                        ${expandedMenu === m.module_key ? "rotate-180" : ""}
                      `}
                    />
                  )}
                </button>

                {/* Submenu */}
                {!isCollapsed && expandedMenu === m.module_key && (
                  <ul className="ml-5 mt-2 list-none space-y-1">
                    {(() => {
                      const pages = m.permissions?.filter(
                        (p) =>
                          p.permission_type === "PAGE" && p.show_in_menu === 1
                      );
                      const parents = pages.filter(
                        (p) => p.parent_permission_id === null
                      );
                      const children = pages.filter(
                        (p) => p.parent_permission_id !== null
                      );

                      return parents.map((parent) => {
                        const parentChildren = children.filter(
                          (c) => c.parent_permission_id === parent.permission_id
                        );
                        const parentIcon =
                          permissionIcons[parent.permission_key] ||
                          permissionIcons.default;
                        const isActive = isPageActive(parent.permission_key);

                        return (
                          <li key={parent.permission_id}>
                            <button
                              onClick={() =>
                                parentChildren.length > 0
                                  ? toggleParentPermission(parent.permission_id)
                                  : navigate(
                                      `/${m.module_key}/${parent.permission_key}`
                                    )
                              }
                              onMouseEnter={() =>
                                setHoveredButton(
                                  `parent-${parent.permission_id}`
                                )
                              }
                              onMouseLeave={() => setHoveredButton(null)}
                              className={`
                                w-full flex items-center justify-between gap-3 text-left px-3 py-2 rounded-lg
                                transition-all duration-200 relative overflow-hidden
                                ${
                                  isActive
                                    ? "bg-white/15 text-white/65 font-semibold"
                                    : "bg-transparent text-white/65 hover:bg-white/[0.08] hover:text-white hover:translate-x-1"
                                }
                              `}
                              style={{
                                fontSize: "13px",
                                fontWeight: isActive ? 600 : 500,
                                letterSpacing: "0.3px",
                              }}
                            >
                              {/* Orange line indicator - shows on hover and active */}
                              <div
                                className={`
                                  absolute top-1/2 -translate-y-1/2 h-full bg-[#f9b722]
                                  transition-all duration-300 ease-in-out
                                  ${
                                    isActive ||
                                    hoveredButton ===
                                      `parent-${parent.permission_id}`
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }
                                `}
                                style={{
                                  left: "0px",
                                  width: "4px",
                                  borderRadius: "0 4px 4px 0",
                                }}
                              />

                              <span className="flex items-center gap-2">
                                <span
                                  className="text-white"
                                  style={{ width: "18px", height: "18px" }}
                                >
                                  {parentIcon}
                                </span>
                                <span
                                  className="transition-colors duration-200"
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: isActive ? 600 : 500,
                                    letterSpacing: "0.3px",
                                    color: isActive
                                      ? "rgba(255, 255, 255, 0.65)"
                                      : hoveredButton ===
                                        `parent-${parent.permission_id}`
                                      ? "#ffffff"
                                      : "rgba(255, 255, 255, 0.65)",
                                  }}
                                >
                                  {parent.permission_description}
                                </span>
                              </span>
                              {parentChildren.length > 0 && (
                                <ChevronDown
                                  className={`
                                    w-4 h-4 transition-transform duration-200
                                    ${
                                      expandedParentPermissions[
                                        parent.permission_id
                                      ]
                                        ? "rotate-180"
                                        : ""
                                    }
                                  `}
                                />
                              )}
                            </button>

                            {parentChildren.length > 0 &&
                              expandedParentPermissions[
                                parent.permission_id
                              ] && (
                                <ul className="ml-6 mt-1 space-y-1">
                                  {parentChildren.map((child) => {
                                    const childIcon =
                                      permissionIcons[child.permission_key] ||
                                      permissionIcons.default;
                                    const isChildActive = isPageActive(
                                      child.permission_key
                                    );
                                    return (
                                      <li key={child.permission_id}>
                                        <button
                                          onClick={() => {
                                            navigate(
                                              `/${m.module_key}/${child.permission_key}`
                                            );
                                            setIsMobileOpen(false);
                                          }}
                                          onMouseEnter={() =>
                                            setHoveredButton(
                                              `child-${child.permission_id}`
                                            )
                                          }
                                          onMouseLeave={() =>
                                            setHoveredButton(null)
                                          }
                                          className={`
                                            w-full flex items-center gap-2 text-left px-3 py-1.5 rounded-lg
                                            transition-all duration-200 relative overflow-hidden
                                            ${
                                              isChildActive
                                                ? "bg-white/15 text-white/65 font-semibold"
                                                : "bg-transparent text-white/65 hover:bg-white/[0.08] hover:text-white"
                                            }
                                          `}
                                          style={{
                                            fontSize: "13px",
                                            fontWeight: isChildActive
                                              ? 600
                                              : 500,
                                            letterSpacing: "0.3px",
                                          }}
                                        >
                                          {/* Orange line indicator - shows on hover and active */}
                                          <div
                                            className={`
                                              absolute top-1/2 -translate-y-1/2 h-full bg-[#f9b722]
                                              transition-all duration-300 ease-in-out
                                              ${
                                                isChildActive ||
                                                hoveredButton ===
                                                  `child-${child.permission_id}`
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              }
                                            `}
                                            style={{
                                              left: "0px",
                                              width: "4px",
                                              borderRadius: "0 4px 4px 0",
                                            }}
                                          />

                                          <span
                                            className="text-white"
                                            style={{
                                              width: "14px",
                                              height: "14px",
                                            }}
                                          >
                                            {childIcon}
                                          </span>
                                          <span
                                            className="transition-colors duration-200"
                                            style={{
                                              fontSize: "13px",
                                              fontWeight: isChildActive
                                                ? 600
                                                : 500,
                                              letterSpacing: "0.3px",
                                              color: isChildActive
                                                ? "rgba(255, 255, 255, 0.65)"
                                                : hoveredButton ===
                                                  `child-${child.permission_id}`
                                                ? "#ffffff"
                                                : "rgba(255, 255, 255, 0.65)",
                                            }}
                                          >
                                            {child.permission_description}
                                          </span>
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                          </li>
                        );
                      });
                    })()}
                  </ul>
                )}
              </div>
            ))
          )}
        </nav>

        {/* Sidebar Footer - Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            onMouseEnter={() => setHoveredButton("logout")}
            onMouseLeave={() => setHoveredButton(null)}
            className={`
              w-[calc(100%-20px)] mx-2.5 flex items-center justify-start
              px-4 py-3 bg-transparent border-none cursor-pointer rounded-lg
              transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] text-left gap-3.5
              relative overflow-hidden
              hover:bg-red-500/10 hover:text-red-500 hover:translate-x-1
              ${isCollapsed ? "justify-center px-3" : ""}
            `}
            style={{
              fontSize: "13px",
              fontWeight: 500,
              letterSpacing: "0.3px",
              color: "rgba(255, 255, 255, 0.85)",
            }}
          >
            {/* Orange line indicator on hover */}
            <div
              className={`
                absolute top-1/2 -translate-y-1/2 h-full bg-[#f9b722]
                transition-all duration-300 ease-in-out
                ${hoveredButton === "logout" ? "opacity-100" : "opacity-0"}
              `}
              style={{
                left: "0px",
                width: "4px",
                borderRadius: "0 4px 4px 0",
              }}
            />
            <LogOut className="w-[18px] h-[18px] flex-shrink-0 text-white" />
            {!isCollapsed && (
              <span
                className="flex-1 font-medium tracking-wide transition-colors duration-200"
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "0.3px",
                  color:
                    hoveredButton === "logout"
                      ? "#ef4444"
                      : "rgba(255, 255, 255, 0.85)",
                }}
              >
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
