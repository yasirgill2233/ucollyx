// import React, { useState, useEffect } from 'react';
// import { NavLink, useLocation, useParams } from 'react-router-dom';
// import axios from 'axios';
// import { 
//   LayoutGrid, Folder, Lock, Bug, ClipboardList, Code2, 
//   MessageSquare, Video, FolderCheck, ShieldAlert, 
//   UserCog, BarChart3, Briefcase, Settings, Users,
//   FolderClock, Building, Menu, X,
//   ArrowLeft,
//   ArrowRight,
//   ArrowLeftIcon,
//   ChevronRight,
//   ChevronLeft
// } from 'lucide-react';
// import API from '../../api/axios';

// const Sidebar = () => {
//   const location = useLocation();
//   const path = location.pathname;
//   // const { workspaceSlug } = useParams();
  
//   // 📱 Mobile responsive slide-toggle state
//   const [isOpen, setIsOpen] = useState(false);
  
//   // 🔄 Dynamic Links State
//   const [filteredNavItems, setFilteredNavItems] = useState([]);

//   const user = JSON.parse(localStorage.getItem("user"));
//   const workspaceSlug = JSON.parse(localStorage.getItem("user"))?.workspace_id;
//   const userRole = user?.role;

//   console.log("Console from Sidebar:", userRole, JSON.parse(localStorage.getItem("user")));

//   // 1. Define Groups for each Role
//   const navGroups = {
//     dev: [
//       { icon: LayoutGrid, path: `/dev/dashboard`, label: 'Overview' },
//       { icon: Folder, path: `/dev/my-projects`, label: 'Projects' },
//       { icon: Bug, path: `/dev/issues`, label: 'Issues' },
//       { icon: ClipboardList, path: `/dev/board`, label: 'Kanban' },
//       { icon: Code2, path: `/dev/ide`, label: 'IDE' },
//       { icon: MessageSquare, path: `/dev/chat`, label: 'Chat' },
//       { icon: FolderClock, path: `/dev/projects-dir`, label: 'Directories' },
//       { icon: Video, path: `/dev/meetings`, label: 'Meetings' },
//     ],
//     manager: [
//       { icon: Briefcase, path: `/manager/portfolio`, label: 'Portfolio' },
//       { icon: BarChart3, path: `/manager/activity`, label: 'Team Activity' },
//       { icon: ClipboardList, path: `/manager/tasks`, label: 'Project Tasks' },
//       { icon: Code2, path: `/manager/ide`, label: 'IDE' },
//       { icon: MessageSquare, path: `/manager/chat`, label: 'Chat' },
//       { icon: FolderClock, path: `/manager/projects-dir`, label: 'Directories' },
//       { icon: Video, path: `/manager/meetings`, label: 'Meetings' },
//     ],
//     qa: [
//       { icon: LayoutGrid, path: `/qa/dashboard`, label: 'QA Dashboard' },
//       { icon: ShieldAlert, path: `/qa/alerts`, label: 'Red Alerts' },
//       { icon: Bug, path: `/qa/report-bug`, label: 'Report Bug' },
//       { icon: FolderCheck, path: `/qa/verify-task`, label: 'Verification' },
//       { icon: ClipboardList, path: `/qa/board`, label: 'Kanban' },
//       { icon: MessageSquare, path: `/qa/chat`, label: 'Chat' },
//       { icon: Video, path: `/qa/meetings`, label: 'Meetings' },
//     ],
//     orgadmin: [
//       { icon: LayoutGrid, path: `/org-admin/dashboard`, label: 'Admin Panel' },
//       { icon: Folder, path: `/org-admin/projects`, label: 'Projects' },
//       { icon: Users, path: `/org-admin/users`, label: 'Users' },
//       { icon: MessageSquare, path: `/org-admin/chat`, label: 'Chat' },
//       { icon: Video, path: `/org-admin/meetings`, label: 'Meetings' },
//       { icon: Lock, path: `/org-admin/permissions`, label: 'Permissions' },
//     ],
//     superadmin: [
//       { icon: LayoutGrid, path: `/super-admin/dashboard`, label: 'Admin Panel' },
//       { icon: Building, path: `/super-admin/orgs`, label: 'Organizations' },
//       { icon: Users, path: `/super-admin/roles`, label: 'Members' },
//     ]
//   };

// useEffect(() => {
//   // 🚨 ABSOLUTE FIX: Agar super_admin hai, to bina kisi check ya API ke direct static items set karo
//   if (userRole === 'super_admin') {
//     setFilteredNavItems(navGroups.superadmin || []);
//     return; // Yahin se baahir nikal jao
//   }

//   const fetchAndFilterPermissions = async () => {
//     try {
//       if (!workspaceSlug) return;

//       // 📝 Passing dynamic workspaceSlug parameter in URL paths
//       const response = await API.get(`/permissions/workspace/${workspaceSlug}`); 
      
//       console.log("Fetched isolated workspace permissions:", response);
      
//       if (response.data.success) {
//         const dbPermissions = response.data.data;

//         // Baki roles ke liye mapping aur filtering
//         let dbMappedRole = userRole;
//         if (userRole === 'org_admin') dbMappedRole = 'orgadmin';

//         const staticConfigItems = navGroups[dbMappedRole] || [];

//         // MySQL database safety (true ya 1 dono handle ho rahe hain)
//         const activeRoutesFromDb = dbPermissions
//           .filter(p => p.role === dbMappedRole && (p.enabled === true || p.enabled === 1))
//           .map(p => p.route);

//         const finalAllowedLinks = staticConfigItems.filter(item => 
//           activeRoutesFromDb.includes(item.path)
//         );

//         setFilteredNavItems(finalAllowedLinks);
//       }
//     } catch (error) {
//       console.error("Error updating fluid sidebar permissions:", error);
//       // Fallback for remaining roles
//       let dbMappedRole = userRole;
//       if (userRole === 'org_admin') dbMappedRole = 'orgadmin';
//       setFilteredNavItems(navGroups[dbMappedRole] || []);
//     }
//   };

//   // Execution condition check
//   if (userRole && (userRole === 'super_admin' || workspaceSlug)) {
//     fetchAndFilterPermissions();
//   }
  
//   // Reactivity barkrar rakhne ke liye dependencies update
// }, [userRole, workspaceSlug]);


//   if (!user) return null;

//   return (
//     <>
//       {/* 📱 Mobile Top Navbar Trigger (Only visible on small screens) */}
//       <div className="md:hidden fixed top-2.5 left-4 z-20">
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className="p-2.5 rounded-sm bg-white border border-gray-200 text-slate-700 hover:text-indigo-600 focus:outline-none transition-all duration-300"
//         >
//           {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
//         </button>
//       </div>

//       {/* 👥 Backdrop Overlay for Mobile view drawer closure */}
//       {isOpen && (
//         <div 
//           onClick={() => setIsOpen(false)}
//           className="md:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300"
//         />
//       )}

//       {/* 🧭 Master Sidebar Container */}
//       <aside className={`
//         fixed md:sticky top-0 left-0 h-screen w-16 bg-white border-r border-gray-200 
//         flex flex-col items-center py-6 gap-2 z-40 transition-transform duration-300 ease-in-out
//         ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
//       `}>
//         {/* Logo Section */}
//         <div className="mb-6 mt-12 md:mt-0"> {/* Mobile layout margins context */}
//           <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg transition-colors duration-500 ${
//             path.startsWith('/manager') ? 'bg-amber-500 shadow-amber-100' :
//             path.startsWith('/qa') ? 'bg-rose-500 shadow-rose-100' :
//             path.startsWith('/super-admin') ? 'bg-slate-900 shadow-slate-100' :
//             path.startsWith('/org-admin') ? 'bg-indigo-500 shadow-indigo-100' : 'bg-blue-600 shadow-blue-100'
//           }`}>
//             {path.startsWith('/manager') ? 'M' : path.startsWith('/qa') ? 'Q' : path.startsWith('/super-admin') ? 'SA' : path.startsWith('/org-admin') ? 'A' : 'D'}
//           </div>
//         </div>

//         {/* Nav Items List Frame */}
//         <div className="flex flex-col gap-2 items-center w-full px-2 overflow-y-auto no-scrollbar">
//           {filteredNavItems.map((item, index) => {
//             const Icon = item.icon;
//             return (
//               <NavLink
//                 key={index}
//                 to={item.path}
//                 title={item.label}
//                 onClick={() => setIsOpen(false)} // Mobile par link click hote hi menu close ho jaye
//                 className={({ isActive }) => `
//                   p-3 rounded-xl transition-all duration-300 group relative
//                   ${isActive 
//                     ? 'bg-indigo-50 text-indigo-600' 
//                     : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
//                   }
//                 `}
//               >
//                 {({ isActive }) => (
//                   <>
//                     <Icon 
//                       size={20} 
//                       strokeWidth={isActive ? 2.2 : 2} 
//                       className="group-hover:scale-110 transition-transform"
//                     />
//                   </>
//                 )}
//               </NavLink>
//             );
//           })}
//         </div>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;



import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, Folder, Lock, Bug, ClipboardList, Code2, 
  MessageSquare, Video, FolderCheck, ShieldAlert, 
  UserCog, BarChart3, Briefcase, Settings, Users,
  FolderClock, Building, X, Hexagon
} from 'lucide-react';
import API from '../../api/axios';

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  // 📱 Mobile Edge-Docking Floating Trigger States
  const [isOpen, setIsOpen] = useState(false);
  const [dockEdge, setDockEdge] = useState("left"); // 'left' | 'right'
  const [isDocked, setIsDocked] = useState(true); // Half-hide edge flag
  const [positionY, setPositionY] = useState(150); // Dynamic vertical height in px
  const [isDragging, setIsDragging] = useState(false);

  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const initialYRef = useRef(150);
  const hasMovedRef = useRef(false);

  // 🔄 Dynamic Links State
  const [filteredNavItems, setFilteredNavItems] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const workspaceSlug = user?.workspace_id;
  const userRole = user?.role;

  // 1. Define Groups for each Role
  const navGroups = {
    dev: [
      { icon: LayoutGrid, path: `/dev/dashboard`, label: 'Overview' },
      { icon: Folder, path: `/dev/my-projects`, label: 'Projects' },
      { icon: Bug, path: `/dev/issues`, label: 'Issues' },
      { icon: ClipboardList, path: `/dev/board`, label: 'Kanban' },
      { icon: Code2, path: `/dev/ide`, label: 'IDE' },
      { icon: MessageSquare, path: `/dev/chat`, label: 'Chat' },
      { icon: FolderClock, path: `/dev/projects-dir`, label: 'Directories' },
      { icon: Video, path: `/dev/meetings`, label: 'Meetings' },
    ],
    manager: [
      { icon: Briefcase, path: `/manager/portfolio`, label: 'Portfolio' },
      { icon: BarChart3, path: `/manager/activity`, label: 'Team Activity' },
      { icon: ClipboardList, path: `/manager/tasks`, label: 'Project Tasks' },
      { icon: Code2, path: `/manager/ide`, label: 'IDE' },
      { icon: MessageSquare, path: `/manager/chat`, label: 'Chat' },
      { icon: FolderClock, path: `/manager/projects-dir`, label: 'Directories' },
      { icon: Video, path: `/manager/meetings`, label: 'Meetings' },
    ],
    qa: [
      { icon: LayoutGrid, path: `/qa/dashboard`, label: 'QA Dashboard' },
      { icon: ShieldAlert, path: `/qa/alerts`, label: 'Red Alerts' },
      { icon: Bug, path: `/qa/report-bug`, label: 'Report Bug' },
      { icon: FolderCheck, path: `/qa/verify-task`, label: 'Verification' },
      { icon: ClipboardList, path: `/qa/board`, label: 'Kanban' },
      { icon: MessageSquare, path: `/qa/chat`, label: 'Chat' },
      { icon: Video, path: `/qa/meetings`, label: 'Meetings' },
    ],
    orgadmin: [
      { icon: LayoutGrid, path: `/org-admin/dashboard`, label: 'Admin Panel' },
      { icon: Folder, path: `/org-admin/projects`, label: 'Projects' },
      { icon: Users, path: `/org-admin/users`, label: 'Users' },
      { icon: MessageSquare, path: `/org-admin/chat`, label: 'Chat' },
      { icon: Video, path: `/org-admin/meetings`, label: 'Meetings' },
      { icon: Lock, path: `/org-admin/permissions`, label: 'Permissions' },
    ],
    superadmin: [
      { icon: LayoutGrid, path: `/super-admin/dashboard`, label: 'Admin Panel' },
      { icon: Building, path: `/super-admin/orgs`, label: 'Organizations' },
      { icon: Users, path: `/super-admin/roles`, label: 'Members' },
    ]
  };

  useEffect(() => {
    if (userRole === 'super_admin') {
      setFilteredNavItems(navGroups.superadmin || []);
      return;
    }

    const fetchAndFilterPermissions = async () => {
      try {
        if (!workspaceSlug) return;
        const response = await API.get(`/permissions/workspace/${workspaceSlug}`); 
        
        if (response.data.success) {
          const dbPermissions = response.data.data;
          let dbMappedRole = userRole === 'org_admin' ? 'orgadmin' : userRole;
          const staticConfigItems = navGroups[dbMappedRole] || [];

          const activeRoutesFromDb = dbPermissions
            .filter(p => p.role === dbMappedRole && (p.enabled === true || p.enabled === 1))
            .map(p => p.route);

          const finalAllowedLinks = staticConfigItems.filter(item => 
            activeRoutesFromDb.includes(item.path)
          );

          setFilteredNavItems(finalAllowedLinks);
        }
      } catch (error) {
        let dbMappedRole = userRole === 'org_admin' ? 'orgadmin' : userRole;
        setFilteredNavItems(navGroups[dbMappedRole] || []);
      }
    };

    if (userRole && (userRole === 'super_admin' || workspaceSlug)) {
      fetchAndFilterPermissions();
    }
  }, [userRole, workspaceSlug]);

  // 🖐️ Touch & Edge-Snap Mechanics
  const handleTouchStart = (e) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartYRef.current = e.touches[0].clientY;
    initialYRef.current = positionY;
    setIsDragging(true);
    setIsDocked(false); // Drag event chalne par complete circle emerge hoga
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaY = e.touches[0].clientY - dragStartYRef.current;

    if (Math.abs(deltaY) > 5) {
      hasMovedRef.current = true;
    }

    const newY = Math.max(30, Math.min(window.innerHeight - 90, initialYRef.current + deltaY));
    setPositionY(newY);
  };

  const handleTouchEnd = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    // X coordinate check karke auto Left vs Right snap decision
    const touchX = e.changedTouches[0].clientX;
    if (touchX < window.innerWidth / 2) {
      setDockEdge("left");
    } else {
      setDockEdge("right");
    }

    // Touch releasing par auto half-hide lock activate hoga
    setIsDocked(true);
  };

  const handleToggleMenu = () => {
    if (!hasMovedRef.current) {
      if (isDocked) setIsDocked(false);
      setIsOpen(!isOpen);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* 📱 MOBILE FLOATING DOCKED MENU SYSTEM (< 768px Screens) */}
      <div className="md:hidden">
        {/* Backdrop overlay */}
        {isOpen && (
          <div 
            onClick={() => {
              setIsOpen(false);
              setIsDocked(true);
            }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 transition-opacity duration-300 animate-in fade-in"
          />
        )}

        {/* Floating Bubble Edge Container */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ top: `${positionY}px` }}
          className={`fixed z-50 touch-none select-none transition-all ${
            isDragging ? "duration-0 scale-105" : "duration-300 ease-out scale-100"
          } ${dockEdge === "right" ? "right-0" : "left-0"} ${
            isDocked && !isOpen
              ? dockEdge === "right"
                ? "translate-x-1/2 opacity-70 hover:opacity-100" // 50% Right Side Hidden
                : "-translate-x-1/2 opacity-70 hover:opacity-100" // 50% Left Side Hidden
              : "translate-x-0 opacity-100"
          }`}
        >
          {/* Main Moveable Hexagon Trigger Button */}
          <button
            onClick={handleToggleMenu}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 active:scale-90 border-2 border-white/40 ${
              isOpen 
                ? 'bg-slate-900 rotate-90 scale-110 shadow-slate-900/50' 
                : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-blue-500/40'
            }`}
          >
            {isOpen ? (
              <X size={20} className="text-white" />
            ) : (
              <Hexagon size={22} className="animate-pulse" />
            )}
          </button>

          {/* Orbital Radial Menu Options */}
          {isOpen && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 pointer-events-none">
              {filteredNavItems.map((item, index) => {
                const Icon = item.icon;
                const totalItems = filteredNavItems.length;

                // Circular positioning math
                const angle = (index * (360 / totalItems)) * (Math.PI / 180);
                const radius = 80;
                const x = Math.round(radius * Math.cos(angle));
                const y = Math.round(radius * Math.sin(angle));

                return (
                  <NavLink
                    key={index}
                    to={item.path}
                    onClick={() => {
                      setIsOpen(false);
                      setIsDocked(true);
                    }}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                    className={({ isActive }) => `
                      absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-11 h-11 rounded-full flex items-center justify-center 
                      shadow-xl backdrop-blur-xl border border-white/40 pointer-events-auto
                      transition-all duration-300 animate-in zoom-in-50
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-blue-500/40 scale-110' 
                        : 'bg-white/95 text-slate-700 hover:bg-white active:scale-95'
                      }
                    `}
                  >
                    <Icon size={18} />
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 💻 DESKTOP SIDEBAR CONTAINER (>= 768px Screens) */}
      <aside className="hidden md:flex sticky top-0 left-0 h-screen w-16 bg-white/70 backdrop-blur-xl border-r border-gray-100 flex-col items-center py-6 gap-2 z-40">
        {/* Logo Section */}
        <div className="mb-6">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md transition-colors duration-500 ${
            path.startsWith('/manager') ? 'bg-amber-500 shadow-amber-200' :
            path.startsWith('/qa') ? 'bg-rose-500 shadow-rose-200' :
            path.startsWith('/super-admin') ? 'bg-slate-900 shadow-slate-200' :
            path.startsWith('/org-admin') ? 'bg-indigo-500 shadow-indigo-200' : 'bg-blue-600 shadow-blue-200'
          }`}>
            {path.startsWith('/manager') ? 'M' : path.startsWith('/qa') ? 'Q' : path.startsWith('/super-admin') ? 'SA' : path.startsWith('/org-admin') ? 'A' : 'D'}
          </div>
        </div>

        {/* Nav Items List Frame */}
        <div className="flex flex-col gap-2 items-center w-full px-2 overflow-y-auto no-scrollbar">
          {filteredNavItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                title={item.label}
                className={({ isActive }) => `
                  p-3 rounded-xl transition-all duration-300 group relative
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }
                `}
              >
                {({ isActive }) => (
                  <Icon 
                    size={20} 
                    strokeWidth={isActive ? 2.2 : 2} 
                    className="group-hover:scale-110 transition-transform"
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;