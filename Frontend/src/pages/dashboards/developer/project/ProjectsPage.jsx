import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Folder, MoreVertical, Search, Plus, X, FileCode, 
  ChevronRight, HardDrive, Terminal, Trash2, ArrowLeft, 
  Monitor, Layout, Code2
} from 'lucide-react';

import API from "../../../../api/axios";

const ProjectsPage = () => {
  const navigate = useNavigate();

  const user_role = JSON.parse(localStorage.getItem("user"))?.role;
  
  // 1. Full Nested State (Aap isay mazeed folders se bhar sakte hain)
  const [fileSystem, setFileSystem] = useState([
    { 
      id: 'ucollyx', 
      name: "UCollyx Web App", 
      type: 'folder', 
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      children: [
        { 
          id: 'src', name: 'src', type: 'folder', 
          children: [
            { id: 'app-js', name: 'App.js', type: 'file' },
            { id: 'styles-css', name: 'index.css', type: 'file' }
          ] 
        },
        { id: 'package-json', name: 'package.json', type: 'file' }
      ] 
    },
    { 
      id: 'ecommerce', 
      name: "E-Commerce", 
      type: 'folder', 
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      children: [] 
    },
  ]);

  const handleProjectClick = (slug) => {
    localStorage.setItem("slug", slug);
    navigate(`/${user_role}/ide/${slug}`);
  };

  // UI States
  const [currentPath, setCurrentPath] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('folder'); 
  const [contextMenu, setContextMenu] = useState(null);

  // Helper: Get Items in Current View
  const getCurrentDirectory = () => {
    let current = fileSystem;
    for (const folder of currentPath) {
      const found = current.find(item => item.id === folder.id);
      if (found && found.children) current = found.children;
    }
    return current;
  };

  // Close Context Menu on click outside
  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);


  // ProjectsPage.jsx ke andar:

const [projects, setProjects] = useState([]); // State update

useEffect(() => {
    const fetchMyProjects = async () => {
        try {
            // API call: Backend se wahi projects aayenge jo is user se linked hain
            const res = await API.get("/projects/my-projects"); 
            setProjects(res.data.data);
        } catch (err) {
            console.error("Error fetching projects:", err);
        }
    };
    fetchMyProjects();
}, []);

console.log("My Projects:", projects); // Debugging ke liye console log


  // Handle Item Creation
  const handleCreate = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName + (newItemType === 'file' && !newItemName.includes('.') ? '.js' : ''),
      type: newItemType,
      children: newItemType === 'folder' ? [] : null,
      color: newItemType === 'folder' ? 'text-blue-500' : 'text-orange-500',
      bgColor: newItemType === 'folder' ? 'bg-blue-50' : 'bg-orange-50'
    };

    const updateRecursive = (list, pathIndex) => {
      if (pathIndex === currentPath.length) return [...list, newItem];
      return list.map(item => {
        if (item.id === currentPath[pathIndex].id) {
          return { ...item, children: updateRecursive(item.children, pathIndex + 1) };
        }
        return item;
      });
    };

    setFileSystem(updateRecursive(fileSystem, 0));
    setNewItemName('');
    setIsModalOpen(false);
  };

  return (
    <div className="p-10 bg-[#fcfcfc] min-h-screen font-sans relative text-slate-800">
      
      {/* Breadcrumbs & Navigation */}
      <div className="flex items-center gap-4 mb-8">
        {currentPath.length > 0 && (
          <button onClick={() => setCurrentPath(currentPath.slice(0, -1))} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
        )}
        <nav className="flex items-center gap-2 text-sm font-bold tracking-tight">
          <div onClick={() => setCurrentPath([])} className="flex items-center gap-1.5 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors">
            <HardDrive size={16} /> <span>Root</span>
          </div>
          {currentPath.map((folder, i) => (
            <React.Fragment key={folder.id}>
              <ChevronRight size={14} className="text-slate-300" />
              <span 
                className={i === currentPath.length - 1 ? "text-blue-600 bg-blue-50 px-2 py-0.5 rounded" : "text-slate-400 cursor-pointer hover:text-slate-600"}
                onClick={() => setCurrentPath(currentPath.slice(0, i + 1))}
              >
                {folder.name}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Header Section */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {currentPath.length === 0 ? "Workspace Directories" : currentPath[currentPath.length-1].name}
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Manage your project files and sub-folders</p>
        </div>
      </div>

      {/* Main Grid View */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-12 gap-8">
        {getCurrentDirectory().map((item) => (
          <div 
            key={item.id}
            onDoubleClick={() => item.type === 'folder' ? setCurrentPath([...currentPath, item]) : navigate(`/${user_role}/ide/${item.id}`, { state: { folderData: item } })}
            onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.pageX, y: e.pageY, item });
            }}
            className="group cursor-pointer text-center relative"
          >
            <div className="flex flex-col items-center">
              {item.type === 'folder' ? (
                <div className="relative mb-3">
                    <div className="w-14 h-2.5 bg-blue-100 rounded-t-lg ml-1 border-t border-x border-blue-200 group-hover:-translate-y-0.5 transition-transform"></div>
                    <div className="bg-white border-2 border-slate-100 rounded-xl rounded-tl-none p-5 shadow-sm group-hover:shadow-xl group-hover:border-blue-400 transition-all">
                        <Folder size={44} className="text-blue-500 fill-blue-50/50" />
                    </div>
                </div>
              ) : (
                <div className="bg-white border-2 border-slate-100 rounded-xl p-6 mb-3 shadow-sm group-hover:shadow-xl group-hover:border-orange-400 transition-all">
                    <FileCode size={44} className="text-orange-500" />
                </div>
              )}
              <span className="text-xs font-extrabold text-slate-700 truncate w-full px-2 group-hover:text-blue-600 transition-colors">
                {item.name}
              </span>
            </div>
          </div>
        ))}
      </div> */}

      {/* Main Grid View */}
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-12 gap-8">
  {projects.map((project) => (
    <div 
      key={project.id}
      onDoubleClick={() => handleProjectClick(project.slug)}
      className="group cursor-pointer text-center relative"
    >
      <div className="flex flex-col items-center">
        <div className="relative mb-3">
          <div className="bg-white border-2 border-slate-100 rounded-xl p-5 shadow-sm group-hover:shadow-xl group-hover:border-blue-400 transition-all">
             <Folder size={44} className="text-blue-500" />
          </div>
        </div>
        <span className="text-xs font-extrabold text-slate-700 truncate w-full px-2">
          {project.name}
        </span>
      </div>
    </div>
  ))}
</div>

      {/* Custom Context Menu (Right Click) */}
      {contextMenu && (
        <div 
          className="fixed bg-white border border-slate-100 shadow-2xl rounded-2xl w-56 py-2 z-[100] animate-in fade-in zoom-in duration-150 border-t-4 border-t-blue-500"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="px-4 py-2 border-b border-slate-50 mb-1">
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest truncate">{contextMenu.item.name}</p>
          </div>
          <button 
            onClick={() => navigate(`/${user_role}/ide/${contextMenu.item.id}`, { state: { folderData: contextMenu.item } })}
            className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
          >
            <Terminal size={15} /> Open in UCollyx IDE
          </button>
          <button className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 flex items-center gap-2.5 transition-colors">
            <Monitor size={15} /> View Details
          </button>
          <div className="h-[1px] bg-slate-50 my-1 mx-2"></div>
          <button className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
            <Trash2 size={15} /> Move to Trash
          </button>
        </div>
      )}

      {/* New Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl p-8 border border-slate-100">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-black text-slate-900 tracking-tight">Create New {newItemType}</h2>
               <X className="cursor-pointer text-slate-300 hover:text-slate-900 transition-colors" onClick={() => setIsModalOpen(false)} />
            </div>
            <input 
              autoFocus
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl mb-6 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-sm"
              placeholder={`Enter ${newItemType} name...`}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            <div className="flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                <button onClick={handleCreate} className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;