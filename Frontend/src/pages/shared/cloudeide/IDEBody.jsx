import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Gitgraph } from "@gitgraph/react";
import {
  Plus,
  ChevronDown,
  Folder,
  FileCode,
  Sidebar as SidebarIcon,
  Copy,
  X,
  Brain,
  Paperclip,
  Send,
  ChevronRight,
  FileJson,
  FileText,
  Image as ImageIcon,
  FolderPlus,
  FilePlus,
  Terminal as TerminalIcon,
  Settings,
  Activity,
  Save,
  SaveAll,
  Bot,
  Upload,
} from "lucide-react";
import { Editor, useMonaco } from "@monaco-editor/react";

import AIPanel from "./components/AIPanel";

import "xterm/css/xterm.css";

import socket from "../../../context/SocketContext";
import TerminalComponent from "./TerminalComponent";
import axios from "axios";
import toast from "react-hot-toast";
import { FileTreeItem } from "./components/FileTreeItem";
import API from "../../../api/axios";
import { VibeEditorPanel } from "./VibeEditorPanel";


const IDEBody = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const param = useParams();

  const monaco = useMonaco();

  const slug = localStorage.getItem("slug");
  const user_role = JSON.parse(localStorage.getItem("user"))?.role;
  const user_id = JSON.parse(localStorage.getItem("user"))?.id;

  const [showExplorer, setShowExplorer] = useState(true);
  const [rightPanel, setRightPanel] = useState("AI");
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    {
      role: "ai",
      text: "I can help you refactor your components or explain complex logic. How can I help you today?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [activeFileUsers, setActiveFileUsers] = useState([]);
  const [activeProjectUsers, setActiveProjectUsers] = useState([]);

  const [isBrowsedProject, setIsBrowsedProject] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // const [activeCode, setActiveCode] = useState("// Your active editor code here");
  // const [fileTree, setFileTree] = useState(["src/App.jsx", "src/components/Header.jsx"]);
  // const [isVibeOpen, setIsVibeOpen] = useState(true); // Panel toggle control
  // const [isSaving, setIsSaving] = useState(false);

  // // 🚀 Fixed Auto-Clean, Monaco Model Sync & Disk Save Handler
  // const handleApplyCode = async (generatedCode) => {
  //   if (!activeFilePath || !activeTab) {
  //     toast.error("Pehle koi file editor mein open karein!");
  //     return;
  //   }

  //   try {
  //     setIsSaving(true);

  //     // 1. Markdown code blocks (```jsx ... ```) extract & clean
  //     const cleanedCode = generatedCode.includes("```")
  //       ? generatedCode.replace(/```[\w]*\n([\s\S]*?)```/g, "$1").trim()
  //       : generatedCode.trim();

  //     // 2. Editor local state & fileContents state sync
  //     setActiveCode(cleanedCode);
  //     setFileContents((prev) => ({
  //       ...prev,
  //       [activeTab]: cleanedCode,
  //     }));

  //     // 3. 🎯 CRITICAL: Direct Monaco Editor Model Sync (Real-time UI update)
  //     if (editorRef.current) {
  //       const editor = editorRef.current;
  //       const model = editor.getModel();

  //       if (model) {
  //         // Force execute edit on active Monaco model
  //         const fullRange = model.getFullModelRange();
  //         editor.executeEdits("vibe-ai-apply", [
  //           {
  //             range: fullRange,
  //             text: cleanedCode,
  //             forceMoveMarkers: true,
  //           },
  //         ]);
  //       }
  //     }

  //     // 4. Collaborative Socket Emit (Real-time sync to all active workspace users)
  //     if (socket && slug) {
  //       socket.emit("code:update", {
  //         projectId: slug,
  //         filePath: activeFilePath,
  //         content: cleanedCode,
  //       });
  //     }

  //     // 5. Backend Disk File Save API Call
  //     const response = await API.post("/vibefiles/save", {
  //       filePath: activeFilePath,
  //       content: cleanedCode,
  //     });

  //     if (response.data?.success) {
  //       toast.success("Code successfully applied & saved to disk!");
  //       console.log("Saved on disk:", response.data.savedPath);
  //     } else {
  //       toast.success("Code editor mein apply ho gaya!");
  //     }
  //   } catch (error) {
  //     console.error("Auto Save Error:", error);
  //     toast.error("Code UI par update hua lekin disk save fail ho gaya.");
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  const modelDecorationsRef = useRef({});

  const loadProject = async (id) => {
    setActiveProjectId(id ? id : null);
    await refreshTree(id ? id : "No Project");
  };

  useEffect(() => {
    if (activeProjectId) {
      console.log(
        `🚀 Triggering terminal init for: ${activeProjectId}, isBrowsed: ${isBrowsedProject}`,
      );

      socket.emit("terminal:init", {
        projectId: activeProjectId,
        isBrowsed: isBrowsedProject,
      });
    }

    return () => {
      socket.emit("terminal:close");
    };
  }, [activeProjectId]);

  const [menuPos, setMenuPos] = useState({
    x: 0,
    y: 0,
    visible: false,
    targetId: null,
  });

  const [activeFilePath, setActiveFilePath] = useState("");

  const [projectData, setProjectData] = useState(
    location.state?.folderData || {
      id: "root",
      name: "Opened Project",
      type: "folder",
      children: [],
    },
  );

  const timerRef = useRef(null);

  useEffect(() => {
    if (!slug) return;

    socket.on("file-tree-update", (data) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        refreshTree(slug);
      }, 500);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      socket.off("file-tree-update");
    };
  }, [slug]);

  const handleContextMenu = (e, itemId) => {
    e.preventDefault();
    setMenuPos({ x: e.pageX, y: e.pageY, visible: true, targetId: itemId });
  };

  // const handleAISend = async () => {
  //   if (!aiInput.trim()) return;

  //   const userMessage = { role: "user", text: aiInput };
  //   setChatHistory((prev) => [...prev, userMessage]);
  //   setAiInput("");
  //   setIsTyping(true);

  //   try {
  //     const res = await axios.post("http://localhost:11434/api/generate", {
  //       // model: "codellama:7b", // ya "deepseek-coder"
  //       model: "deepseek-coder:1.3b",
  //       prompt: aiInput,
  //       stream: false,
  //     });

  //     const aiMessage = { role: "ai", text: res.data.response };
  //     setChatHistory((prev) => [...prev, aiMessage]);
  //   } catch (error) {
  //     setChatHistory((prev) => [
  //       ...prev,
  //       { role: "ai", text: "Error: Ollama se connect nahi ho pa raha." },
  //     ]);
  //   } finally {
  //     setIsTyping(false);
  //   }
  // };

  const handleAISend = async () => {
    if (!aiInput.trim()) return;

    const userMessage = { role: "user", text: aiInput };
    setChatHistory((prev) => [...prev, userMessage]);
    const currentPrompt = aiInput; // Input store karein request ke liye
    setAiInput("");
    setIsTyping(true);

    try {
      const res = await API.post(
        "/ai/generate",
        {
          prompt: currentPrompt,
        },
      );

      if (res.data.success) {
        const aiMessage = { role: "ai", text: res.data.response };
        setChatHistory((prev) => [...prev, aiMessage]);
      } else {
        throw new Error("Response failed");
      }
    } catch (error) {
      console.error("Groq Error:", error);
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: "Error: AI service response nahi de rahi." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const closeMenu = () => setMenuPos({ ...menuPos, visible: false });

  const refreshTree = async (projectId) => {
    if (!projectId) return;

    try {
      const res = await API.get(`/files/tree?projectId=${projectId}`);

      setProjectData(res.data);
    } catch (e) {
      console.error("Tree load error:", e);
    }
  };

  useEffect(() => {
    loadProject(slug);
  }, [slug]);

  const [fileContents, setFileContents] = useState({});

  const getLanguage = (fileName) => {
    const ext = fileName.split(".").pop();
    if (ext === "js" || ext === "jsx") return "javascript";
    if (ext === "css") return "css";
    if (ext === "html") return "html";
    if (ext === "json") return "json";
    return "plaintext";
  };

  socket.on("project:users-update", (usersList) => {
    setActiveUsers(usersList);
  });

  const handleEditorChange = (value) => {
    setFileContents((prev) => ({
      ...prev,
      [activeTab]: value,
    }));

    if (activeFilePath && slug && !isIncomingRemoteChange.current) {
      socket.emit("code:update", {
        projectId: slug,
        filePath: activeFilePath,
        content: value,
      });
    }
  };

  const [previewWidth, setPreviewWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false);
  const [projectPort, setProjectPort] = useState("5174");
  const [runCommand, setRunCommand] = useState("npm run dev");

  const startResizing = React.useCallback((mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback(
    (mouseMoveEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - mouseMoveEvent.clientX;
        if (newWidth > 250 && newWidth < 800) {
          setPreviewWidth(newWidth);
        }
      }
    },
    [isResizing],
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const deleteItem = async (path) => {
    // if (window.confirm("Are you sure you want to delete this?")) {
    await API.post("/files/delete", { path });
    refreshTree(slug);
    // }
  };

  const openFile = async (path, name) => {
    if (!path || !name) return;

    setActiveTab(name);
    setActiveFilePath(path);

    setOpenTabs((prev) => {
      const exists = prev.some((tab) =>
        typeof tab === "object" ? tab.name === name : tab === name,
      );
      if (!exists) return [...prev, { name, path }];
      return prev;
    });

    try {
      const res = await API.post("/files/content", {
        path,
      });
      const freshContent = res.data.content;

      setFileContents((prev) => ({ ...prev, [name]: freshContent }));

      if (editorRef.current && monacoRef.current) {
        const editor = editorRef.current;
        const monacoInstance = monacoRef.current;

        const fileUri = monacoInstance.Uri.file(path);
        let model = monacoInstance.editor.getModel(fileUri);
        const currentLang = getLanguage(name);

        if (!model) {
          model = monacoInstance.editor.createModel(
            freshContent,
            currentLang,
            fileUri,
          );
        } else {
          if (model.getValue() !== freshContent) {
            model.setValue(freshContent);
          }
          monacoInstance.editor.setModelLanguage(model, currentLang);
        }

        // 🚀 Switch the tab model smoothly
        editor.setModel(model);

        // Server ko batao ke hamara active tab change ho gaya ha
        if (socket && slug && user) {
          socket.emit("file:join", {
            projectId: slug,
            filePath: path,
            username: user.full_name || user.name,
          });
        }
      }
    } catch (err) {
      console.error("Error loading file content", err);
    }
  };

  const closeTab = (e, fileName) => {
    e.stopPropagation();
    const newTabs = openTabs.filter((tab) => {
      const name = typeof tab === "object" ? tab.name : tab;
      return name !== fileName;
    });

    setOpenTabs(newTabs);

    if (activeTab === fileName) {
      if (newTabs.length > 0) {
        const nextTab = newTabs[newTabs.length - 1];
        const nextTabName =
          typeof nextTab === "object" ? nextTab.name : nextTab;
        const nextTabPath =
          typeof nextTab === "object" ? nextTab.path : activeFilePath;

        openFile(nextTabPath, nextTabName);
      } else {
        setActiveTab("");
        setActiveFilePath("");

        if (editorRef.current && monacoRef.current) {
          editorRef.current.setModel(null);
        }
      }
    }
  };

  const addItem = async (parentId, type) => {
    const name = prompt(`Enter ${type} name:`);
    if (!name) return;

    try {
      const targetPath = parentId;
      await API.post("/files/create", {
        parentPath: targetPath,
        name: name,
        type: type,
      });
      refreshTree(slug);
    } catch (err) {
      toast.error("Failed to create " + type);
    }
  };

  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolder = (id) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const GitGraphView = ({ projectId }) => {
    const [commits, setCommits] = useState([]);

    useEffect(() => {
      API.get(`/git/graph/${projectId}`)
        .then((res) => res.json())
        .then((data) => setCommits(data));
    }, [projectId]);

    return (
      <div
        style={{
          width: "100%",
          height: "400px",
          overflow: "auto",
          background: "rgba(255,255,255,0.1)",
        }}
      >
        <Gitgraph>
          {(gitgraph) => {
            const master = gitgraph.branch("main");
            master.commit("Initial commit");

            const develop = master.branch("develop");
            develop.commit("Add TypeScript");

            const aFeature = develop.branch("a-feature");
            aFeature
              .commit("Make it work")
              .commit("Make it right")
              .commit("Make it fast");

            develop.merge(aFeature);
            develop.commit("Prepare v1");

            master.merge(develop).tag("v1.0.0");
          }}
        </Gitgraph>
      </div>
    );
  };

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef({});
  const isIncomingRemoteChange = useRef(false);

  const activeTabRef = useRef(activeTab);
  const activeFilePathRef = useRef(activeFilePath);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    activeFilePathRef.current = activeFilePath;
  }, [activeFilePath]);

  useEffect(() => {
    if (!activeFilePath || !slug) return;

    socket.on("code:update", (data) => {
      if (data.filePath === activeFilePathRef.current) {
        if (fileContents[activeTabRef.current] !== data.content) {
          isIncomingRemoteChange.current = true;

          setFileContents((prev) => ({
            ...prev,
            [activeTabRef.current]: data.content,
          }));

          if (editorRef.current) {
            const editor = editorRef.current;
            const model = editor.getModel();

            if (model && editor.getValue() !== data.content) {
              const currentSelections = editor.getSelections();
              const scrollTop = editor.getScrollTop();

              const fullRange = model.getFullModelRange();

              editor.executeEdits("remote-sync", [
                {
                  range: fullRange,
                  text: data.content,
                  forceMoveMarkers: false,
                },
              ]);

              if (currentSelections) {
                editor.setSelections(currentSelections);
              }
              editor.setScrollTop(scrollTop);
            }
          }

          setTimeout(() => {
            isIncomingRemoteChange.current = false;
          }, 50);
        }
      }
    });

    const DEVNEX_COLORS = [
      "#f43f5e", // Rose 500
      "#3b82f6", // Blue 500
      "#10b981", // Emerald 500
      "#f59e0b", // Amber 500
      "#8b5cf6", // Purple 500
      "#06b6d4", // Cyan 500
      "#ec4899", // Pink 500
      "#14b8a6", // Teal 500
    ];

    const getUserColor = (socketId) => {
      let sum = 0;
      for (let i = 0; i < socketId.length; i++) {
        sum += socketId.charCodeAt(i);
      }
      const colorIndex = sum % DEVNEX_COLORS.length;
      return DEVNEX_COLORS[colorIndex];
    };

    socket.on(
      "cursor:update",
      ({ socketId, username, filePath, cursorPosition }) => {
        if (!monacoRef.current || !editorRef.current) return;

        const monacoInstance = monacoRef.current;
        const editor = editorRef.current;

        // 🎯 1. Target file ka exact Monaco Model nikalo
        const fileUri = monacoInstance.Uri.file(filePath);
        const targetModel = monacoInstance.editor.getModel(fileUri);

        // Agar hamare paas wo file open hi nahi ha (tab nahi bana), toh skip karo
        if (!targetModel) return;

        const userColor = getUserColor(socketId);

        // 🎯 2. Create decoration options
        const newDecorations = [
          {
            range: new monacoInstance.Range(
              cursorPosition.lineNumber,
              cursorPosition.column,
              cursorPosition.lineNumber,
              cursorPosition.column,
            ),
            options: {
              className: `remote-cursor-${socketId}`,
              beforeContentClassName: `remote-cursor-tag-${socketId}`,
              hoverMessage: { value: `**${username}** is editing here` },
            },
          },
        ];

        // Dynamic CSS injector (Wahi purana logic)
        if (!document.getElementById(`style-${socketId}`)) {
          const style = document.createElement("style");
          style.id = `style-${socketId}`;
          style.innerHTML = `
      .remote-cursor-${socketId} { border-left: 2px solid ${userColor} !important; margin-left: -1px; animation: blink 1s infinite; }
      .remote-cursor-tag-${socketId}::after { content: '${username}'; position: absolute; top: -14px; left: 0; background: ${userColor}; color: white; font-size: 9px; padding: 1px 4px; border-radius: 3px; white-space: nowrap; font-family: sans-serif; opacity: 0.8; z-index: 10; }
    `;
          document.head.appendChild(style);
        }

        // 🎯 3. Path ke mutabik tab memory initialize karo
        if (!modelDecorationsRef.current[filePath]) {
          modelDecorationsRef.current[filePath] = {};
        }

        const oldDecorations =
          modelDecorationsRef.current[filePath][socketId] || [];

        // 🔥 CORE CHANGE: Editor par lagane ki bajay direct us SPECIFIC MODEL par decoration lagao!
        modelDecorationsRef.current[filePath][socketId] =
          targetModel.deltaDecorations(oldDecorations, newDecorations);
      },
    );

    socket.on("cursor:remove", ({ socketId }) => {
      if (!monacoRef.current) return;

      const monacoInstance = monacoRef.current;

      // Saare open paths ko scan karo jahan is user ka cursor ho sakta ha
      Object.keys(modelDecorationsRef.current).forEach((filePath) => {
        const fileUri = monacoInstance.Uri.file(filePath);
        const model = monacoInstance.editor.getModel(fileUri);

        if (model && modelDecorationsRef.current[filePath][socketId]) {
          // Model se clear karo
          model.deltaDecorations(
            modelDecorationsRef.current[filePath][socketId],
            [],
          );
          delete modelDecorationsRef.current[filePath][socketId];
        }
      });

      document.getElementById(`style-${socketId}`)?.remove();
    });

    return () => {
      socket.off("code:update");
      socket.off("cursor:update");
      socket.off("cursor:remove");
      socket.emit("file:leave", { projectId: slug, filePath: activeFilePath });
    };
  }, [activeFilePath, slug]);

  useEffect(() => {
    if (!socket) return;

    socket.on("project:port-allocated", ({ port }) => {
      setProjectPort(port.toString());
    });

    return () => {
      socket.off("project:port-allocated");
    };
  }, []);

  const saveFileContent = async () => {
    if (!activeFilePath || !editorRef.current) return;

    const currentContent = editorRef.current.getValue();

    try {
      const savePromise = API.post("/files/save", {
        path: activeFilePath,
        content: currentContent,
      });

      await toast.promise(savePromise, {
        loading: "Saving file...",
        success: "File saved successfully!",
        error: "Failed to save file.",
      });
    } catch (err) {
      console.error("Save event failed:", err);
    }
  };

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  useEffect(() => {
    if (!socket || !slug || !user) return;
    socket.emit("project:join", {
      projectId: slug,
      username: user.full_name || user.name || "Developer",
    });

    socket.on("project:users-update", (usersInProject) => {
      setActiveProjectUsers(usersInProject);
    });

    return () => {
      // Component unmount stream handlers cleanup mapping
      socket.off("project:users-update");
      socket.emit("project:leave", { projectId: slug });
    };
  }, [slug]);

  const executeFolderUpload = async (uploadType) => {
    setIsUploadModalOpen(false);

    const targetProjectId = slug;
    if (!targetProjectId) {
      toast.error("Project identity missing (slug is null).");
      return;
    }

    // =========================================================================
    // 🔄 CASE 1: JUST SWITCH TO LOCAL WORKSPACE (No Picker Window)
    // =========================================================================
    if (uploadType === "local_switch") {
      try {
        toast.loading("Switching to Local Workspace environment...", {
          id: "upload",
        });

        await API.post("/files/upload-local", {
          projectId: targetProjectId,
          files: [], // Khali array kyunki sirf path badalna ha, file upload nahi karni
          userId: user_id,
          uploadSource: "local", // Backend ko pata chalay ga 'user_browsed_projects' set krna ha
        });

        setIsBrowsedProject(true);

        // Force trigger terminal state sync
        // setActiveProjectId("");
        // setTimeout(() => { setActiveProjectId(targetProjectId); }, 50);

        refreshTree(slug);

        toast.success("Successfully switched to Local Workspace!", {
          id: "upload",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to switch to Local Workspace.", { id: "upload" });
      }
    }

    // =========================================================================
    // 📂 CASE 2: FRESH UPLOAD & SYNC LOCAL FOLDER (With Directory Picker)
    // =========================================================================
    else if (uploadType === "local_upload") {
      try {
        if (!window.showDirectoryPicker) {
          toast.error(
            "Your browser doesn't support local directory picking. Try Chrome/Edge!",
          );
          return;
        }

        const dirHandle = await window.showDirectoryPicker();
        toast.loading(
          `Syncing & uploading complete structure of ${dirHandle.name}...`,
          { id: "upload" },
        );

        const localFilesObj = {};
        const apiFilesPayload = []; // 🚀 Is dabbe me ab explicit files aur folders dono ka data jayega

        const readDirectory = async (
          handle,
          currentPath,
          relativePathPrefix = "",
        ) => {
          const children = [];
          for await (const entry of handle.values()) {
            const currentRelativePath = relativePathPrefix
              ? `${relativePathPrefix}/${entry.name}`
              : entry.name;
            const virtualPath = `${currentPath}/${entry.name}`;

            if (entry.kind === "file") {
              const file = await entry.getFile();
              const textContent = await file.text();

              localFilesObj[entry.name] = textContent;

              // 🎯 FILE DATA INJECTION
              apiFilesPayload.push({
                type: "file", // Explicit type flag
                relativePath: currentRelativePath,
                content: textContent,
              });

              children.push({
                id: virtualPath,
                name: entry.name,
                type: "file",
                path: virtualPath,
              });
            } else if (entry.kind === "directory") {
              // 🎯 FOLDER METADATA INJECTION: Khali ho ya bhara hua, structural entry lazmi push hogi
              apiFilesPayload.push({
                type: "folder", // Explicit type flag
                relativePath: currentRelativePath,
                content: null,
              });

              const dirChildren = await readDirectory(
                entry,
                virtualPath,
                currentRelativePath,
              );
              children.push({
                id: virtualPath,
                name: entry.name,
                type: "folder",
                path: virtualPath,
                children: dirChildren,
              });
            }
          }
          return children;
        };

        const parsedChildren = await readDirectory(dirHandle, dirHandle.name);

        // 🚀 HIT THE BACKEND WRITER API: Structural payload goes out
        await API.post("/files/upload-local", {
          projectId: targetProjectId,
          files: apiFilesPayload, // Pura array structure metadata ke sath dispatch ho gaya
          userId: user_id,
          uploadSource: "local",
        });

        // Sidebar Explorer state configuration updates
        setProjectData({
          id: dirHandle.name,
          name: dirHandle.name,
          type: "folder",
          children: parsedChildren,
        });
        setFileContents((prev) => ({ ...prev, ...localFilesObj }));

        // 🎯 REAL-TIME IMMEDIATE REFRESH
        refreshTree(slug);

        toast.success(`Successfully uploaded & synced ${dirHandle.name}!`, {
          id: "upload",
        });
      } catch (err) {
        console.error(err);
        toast.error("Syncing local folder rejected.", { id: "upload" });
      }
    }

    // =========================================================================
    // 💼 CASE 3: SWITCH TO MANAGER ASSIGNED (No Picker Window)
    // =========================================================================
    else if (uploadType === "assigned") {
      try {
        toast.loading("Configuring Manager Assigned workspace...", {
          id: "upload",
        });

        await API.post("/files/upload-local", {
          projectId: targetProjectId,
          files: [],
          userId: user_id,
          uploadSource: "assigned", // Backend table folder_path ko 'user_projects/' kr dega
        });

        setIsBrowsedProject(false);

        // setActiveProjectId("");
        // setTimeout(() => { setActiveProjectId(targetProjectId); }, 50);

        refreshTree(slug);

        toast.success("Manager workspace verified successfully!", {
          id: "upload",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to switch workspace context.", { id: "upload" });
      }
    }
  };

  const handleEditorDidMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;

    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
      async () => {
        if (!activeFilePath || !editorRef.current) return;

        const currentContent = editorRef.current.getValue();

        try {
          const savePromise = API.post("/files/save", {
            path: activeFilePath,
            content: currentContent,
          });

          await toast.promise(savePromise, {
            loading: "Saving file...",
            success: "File saved successfully!",
            error: "Failed to save file.",
          });
        } catch (err) {
          console.error("Shortcut Save failed:", err);
        }
      },
    );

    const currentPos = editor.getPosition();
    if (currentPos && activeFilePath && slug) {
      socket.emit("cursor:move", {
        projectId: slug,
        filePath: activeFilePath,
        cursorPosition: {
          lineNumber: currentPos.lineNumber,
          column: currentPos.column,
        },
      });
    }

    editor.onDidChangeCursorPosition((e) => {
      if (isIncomingRemoteChange.current || !slug) return;
      const currentModel = editor.getModel();
      if (!currentModel) return;
      const currentLivePath = currentModel.uri.fsPath;
      if (!currentLivePath) return;

      socket.emit("cursor:move", {
        projectId: slug,
        filePath: currentLivePath,
        cursorPosition: {
          lineNumber: e.position.lineNumber,
          column: e.position.column,
        },
      });
    });
  };

  const startDynamicProject = () => {
    if (!activeProjectId) return;

    socket.emit("project:init-runtime", {
      projectId: slug,
      userPort: projectPort,
    });

    socket.emit("terminal:write", "\x03");

    setTimeout(() => {
      let finalCommand = runCommand.trim();

      // =================================================================
      // 🚀 UNIVERSAL SMART TASK RUNNER MATRIX
      // =================================================================

      // ⚛️ 1. React / Vue / Svelte (Vite based projects)
      if (
        finalCommand === "npm run dev" ||
        finalCommand === "vite" ||
        finalCommand.includes("vite")
      ) {
        finalCommand = `npm run dev -- --port ${projectPort} --host 0.0.0.0`;
      }

      // 🚀 2. Next.js (Fullstack React)
      else if (
        finalCommand === "next dev" ||
        finalCommand.includes("next dev")
      ) {
        finalCommand = `npx next dev -p ${projectPort} -H 0.0.0.0`;
      }

      // 🟢 3. Nuxt.js (Vue Fullstack)
      else if (finalCommand === "nuxt" || finalCommand.includes("nuxt dev")) {
        finalCommand = `npx nuxt dev --port ${projectPort} --host 0.0.0.0`;
      }

      // 🅰️ 4. Angular CLI
      else if (
        finalCommand === "ng serve" ||
        finalCommand.includes("ng serve")
      ) {
        finalCommand = `npx ng serve --port ${projectPort} --host 0.0.0.0`;
      }

      // 📦 5. Standard Node.js Backend (Express / NestJS / Fastify)
      // Node standard ports environment variable 'PORT' se pick karta hai jo humne docker env mein diya hua ha
      else if (
        finalCommand === "npm start" ||
        finalCommand === "node server.js" ||
        finalCommand === "node app.js"
      ) {
        finalCommand = `PORT=${projectPort} ${finalCommand}`;
      }

      // 🐍 6. Python (Django Framework)
      else if (finalCommand.includes("manage.py runserver")) {
        // Agar direct command likhi ho, toh override karein syntax matching format par
        finalCommand = `python manage.py runserver 0.0.0.0:${projectPort}`;
      }
      // Python Flask Apps
      else if (finalCommand.includes("flask run")) {
        finalCommand = `flask run --host=0.0.0.0 --port=${projectPort}`;
      }

      // 🐘 7. PHP (Laravel Framework)
      else if (
        finalCommand === "php artisan serve" ||
        finalCommand.includes("artisan serve")
      ) {
        finalCommand = `php artisan serve --host=0.0.0.0 --port=${projectPort}`;
      }

      // ☕ 8. Java (Spring Boot)
      else if (finalCommand.includes("mvn spring-boot:run")) {
        finalCommand = `mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=${projectPort}`;
      }

      // 🐹 9. Golang (Web Application)
      else if (finalCommand.includes("go run")) {
        // Go apps custom internal port read karti hain, env layer bind kar rahen hain yahan
        finalCommand = `PORT=${projectPort} ${finalCommand}`;
      }

      // =================================================================

      socket.emit("terminal:write", `${finalCommand}\n`);
      toast.success(`🚀 Engine firing on port ${projectPort}`);
    }, 200);
  };

  // const createTerminal = () => {
  //   const terminal = {
  //     id: crypto.randomUUID(),
  //     title: `bash ${terminals.length + 1}`,
  //   };

  //   setTerminals((prev) => [...prev, terminal]);
  //   setActiveTerminal(terminal.id);
  // };

  // const closeTerminal = (id) => {
  //   if (terminals.length === 1) return;

  //   const updated = terminals.filter((t) => t.id !== id);

  //   setTerminals(updated);

  //   if (activeTerminal === id) {
  //     setActiveTerminal(updated[0].id);
  //   }

  //   socket.emit("terminal:close", {
  //     terminalId: id,
  //   });
  // };

  return (
    <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)] bg-[#09090b] text-zinc-300 text-sm font-sans">
      {showExplorer && (
        <aside className="w-64 border-r border-zinc-800/60 flex flex-col bg-[#09090b] animate-in slide-in-from-left duration-300">
          <div className="h-9 flex items-center justify-between px-4">
            <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
              Explorer
            </span>

            <button
              onClick={setIsUploadModalOpen}
              title="Open Local Folder from Computer"
              className="flex items-center gap-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 font-bold px-2 py-0.5 border border-zinc-700 rounded text-zinc-300 transition-all active:scale-95"
            >
              <Upload size={10} /> Browse
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <div className="flex items-center justify-between">
              <div className="px-4 py-1.5 text-[12px] font-semibold text-zinc-300 flex items-center gap-1.5 cursor-pointer hover:text-white">
                <ChevronDown size={14} />
                {projectData?.name
                  .toUpperCase()
                  .split("-")
                  .join(" ")
                  .replace(/[0-9]/g, "")}
              </div>

              <div className="flex px-4 gap-3 text-zinc-500">
                <FilePlus
                  size={14}
                  className="cursor-pointer hover:text-zinc-200"
                  onClick={() => addItem(slug, "file")}
                />
                <FolderPlus
                  size={14}
                  className="cursor-pointer hover:text-zinc-200"
                  onClick={() => addItem(slug, "folder")}
                />
              </div>
            </div>

            <div className="mt-1">
              {activeProjectId ? (
                projectData.children?.map((child) => (
                  <FileTreeItem
                    key={child.id}
                    item={child}
                    depth={1}
                    isActive={activeTab === child.name}
                    onFileClick={openFile}
                    onAdd={addItem}
                    handleContextMenu={handleContextMenu}
                    expandedFolders={expandedFolders}
                    toggleFolder={toggleFolder}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 w-full p-4">
                  <button
                    onClick={() => {
                      navigate(`/${user_role}/projects-dir`);
                    }}
                    className="bg-blue-600 text-white font-medium px-4 py-1 w-full"
                  >
                    Open Project
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      <section className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
        {/* Toolbar */}
        <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-[#0c0c0e]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowExplorer(!showExplorer)}
              className={`p-1.5 rounded-md hover:bg-zinc-800 transition-all ${!showExplorer ? "text-blue-400 bg-blue-500/10" : "text-zinc-500"}`}
            >
              <SidebarIcon size={18} />
            </button>

            {activeProjectUsers && activeProjectUsers.length > 0 && (
              <div className="flex items-center gap-2.5 px-3 py-1 bg-zinc-900/40 border border-zinc-800/60 rounded-full animate-in fade-in duration-200">
                {/* Avatars Stack Container */}
                <div className="flex -space-x-1.5 overflow-hidden">
                  {activeProjectUsers.slice(0, 5).map((u, idx) => {
                    // Safe check for display identity
                    const displayName = u.name || "Dev";
                    const firstLetter = displayName.charAt(0).toUpperCase();

                    // Dynamic vibrant background palettes
                    const colors = [
                      "bg-rose-500 shadow-rose-500/10",
                      "bg-blue-500 shadow-blue-500/10",
                      "bg-emerald-500 shadow-emerald-500/10",
                      "bg-amber-500 shadow-amber-500/10",
                      "bg-purple-500 shadow-purple-500/10",
                    ];
                    const colorClass = colors[idx % colors.length];

                    return (
                      <div
                        key={u.id || u.socketId || idx}
                        title={`${displayName} (Active in Project)`}
                        className={`w-6 h-6 rounded-full ${colorClass} text-white flex items-center justify-center text-[10px] font-black uppercase tracking-wider border-2 border-[#0c0c0e] shadow-sm relative group cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:z-20`}
                      >
                        {firstLetter}

                        {/* Tiny live green dot status badge */}
                        <span className="absolute bottom-0 right-0 block h-1.5 w-1.5 rounded-full bg-emerald-400 ring-[1px] ring-[#0c0c0e]" />
                      </div>
                    );
                  })}

                  {/* Overflow Count Counter Layout */}
                  {activeProjectUsers.length > 5 && (
                    <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 border-2 border-[#0c0c0e] flex items-center justify-center font-bold text-[9px] z-10 shadow-sm">
                      +{activeProjectUsers.length - 5}
                    </div>
                  )}
                </div>

                {/* Dynamic Count Text Status Indicator */}
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider pr-0.5">
                  {activeProjectUsers.length} Live
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={saveFileContent}
              className={`px-4 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all bg-zinc-800 text-zinc-400 hover:text-white`}
            >
              <Save size={14} />
              {!isPreviewMaximized && <span></span>}
            </button>
            {/* 
            {activeProjectId && (
              <div className="flex items-center gap-2 bg-zinc-900/60 p-1 rounded-lg border border-zinc-800/80">
                <div className="flex items-center gap-1 pl-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Cmd:
                  </span>
                  <input
                    type="text"
                    value={runCommand}
                    onChange={(e) => setRunCommand(e.target.value)}
                    className="w-36 bg-zinc-800 border border-zinc-700/50 rounded px-2 text-xs text-zinc-300 font-mono py-1 focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="npm run dev"
                  />
                </div>

                <div className="flex items-center gap-1 border-l border-zinc-800 pl-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Port:
                  </span>
                  <input
                    type="text"
                    value={projectPort}
                    onChange={(e) => setProjectPort(e.target.value)}
                    className="w-14 bg-zinc-800 border border-zinc-700/50 rounded text-center text-xs text-white font-black py-1 focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="5174"
                  />
                </div>

                <button
                  onClick={startDynamicProject}
                  className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs px-3 py-1 rounded transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/10"
                >
                  <TerminalIcon size={12} />
                  <span>Run</span>
                </button>
              </div>
            )} */}

            {activeProjectId && (
              <button
                onClick={() =>
                  setRightPanel(rightPanel === "PREVIEW" ? null : "PREVIEW")
                }
                className={`px-4 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all ${
                  rightPanel === "PREVIEW"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <Activity size={14} />
                {!isPreviewMaximized && <span></span>}
              </button>
            )}

            <button
              onClick={() => setRightPanel(rightPanel === "AI" ? null : "AI")}
              className={`px-4 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all ${rightPanel === "AI" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
            >
              <Bot size={14} />
              {!isPreviewMaximized && <span></span>}
            </button>
          </div>
        </div>

        <div className="flex bg-[#0c0c0e] border-b border-zinc-800 overflow-x-auto no-scrollbar">
          {openTabs.map((tab) => {
            const tabName = typeof tab === "object" ? tab.name : tab;
            const tabPath = typeof tab === "object" ? tab.path : activeFilePath;

            return (
              <div
                key={tabName}
                onClick={() => openFile(tabPath, tabName)}
                className={`group flex items-center gap-2 px-4 py-2.5 border-r border-zinc-800 text-[11px] min-w-[140px] cursor-pointer transition-all ${
                  activeTab === tabName
                    ? "bg-[#09090b] text-blue-400 border-t-2 border-t-blue-500"
                    : "text-zinc-500 hover:bg-zinc-800/40"
                }`}
              >
                <FileCode
                  size={14}
                  className={
                    activeTab === tabName ? "text-blue-400" : "text-zinc-600"
                  }
                />
                <span className="truncate flex-1">{tabName}</span>
                <X
                  size={12}
                  className="opacity-0 group-hover:opacity-100 hover:bg-zinc-700 p-0.5 rounded transition-all"
                  onClick={(e) => closeTab(e, tabName)}
                />
              </div>
            );
          })}
        </div>

        <div className="flex-1 overflow-auto font-mono text-[13px] leading-relaxed bg-[#09090b]">
          {activeTab && openTabs.length > 0 ? (
            <Editor
              height="100%"
              theme="vs-dark"
              language={getLanguage(activeTab)}
              defaultValue={fileContents[activeTab]}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                num_predict: 50,
                fontFamily: "JetBrains Mono, Fira Code, monospace",
                minimap: { enabled: true },
                inlineSuggest: {
                  enabled: true,
                  mode: "prefix",
                  showToolbar: "always",
                },
                padding: { top: 20 },
                smoothScrolling: true,
                cursorSmoothCaretAnimation: "on",
                automaticLayout: true,
              }}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-3">
              <SidebarIcon size={40} className="opacity-10" />
              <p className="text-xs uppercase tracking-widest font-bold opacity-30">
                No Active File
              </p>
            </div>
          )}
        </div>

        <div className="h-60 border-t border-zinc-800 flex flex-col bg-[#0c0c0e]">
          <div className="px-4 py-2 border-b border-zinc-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TerminalIcon size={12} className="text-zinc-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Terminal
              </span>
            </div>
          </div>

          {/* <div className="h-9 border-b border-zinc-800 flex items-center justify-between bg-[#09090b]">
            <div className="flex overflow-x-auto">
              {terminals.map((terminal) => (
                <div
                  key={terminal.id}
                  onClick={() => setActiveTerminal(terminal.id)}
                  className={`group flex items-center gap-2 px-4 h-9 cursor-pointer border-r border-zinc-800 ${
                    activeTerminal === terminal.id
                      ? "bg-[#0f0f10] text-white"
                      : "text-zinc-500 hover:bg-zinc-900"
                  }`}
                >
                  <TerminalIcon size={13} />

                  <span className="text-xs">{terminal.title}</span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTerminal(terminal.id);
                    }}
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={createTerminal}
              className="px-3 text-zinc-500 hover:text-white"
            >
              +
            </button>
          </div> */}

          <div className="flex-1 overflow-hidden p-2">
            <TerminalComponent socket={socket} />
            {/* <TerminalComponent
              socket={socket}
              terminalId={activeTerminal}
              projectId={activeProjectId}
            /> */}
          </div>
        </div>
      </section>

      {rightPanel === "AI" && (
        <AIPanel
          onClose={() => setRightPanel(null)}
          chatHistory={chatHistory}
          aiInput={aiInput}
          setAiInput={setAiInput}
          handleAISend={handleAISend}
          isTyping={isTyping}
        />
      )}

      {rightPanel === "PREVIEW" &&
        (() => {
          const isLocal =
            typeof window !== "undefined" &&
            (window.location.hostname === "localhost" ||
              window.location.hostname === "127.0.0.1");

          const previewUrl = isLocal
            ? `http://localhost:${projectPort}/`
            : `https://${slug}.preview.ucollyx.com`;
          // : `https://preview.ucollyx.com/api/proxy/${slug}`;

          return (
            <div
              style={{
                width: isPreviewMaximized ? "60%" : `${previewWidth}px`,
                zIndex: isPreviewMaximized ? 40 : 10,
              }}
              className={`relative border-l border-zinc-800 bg-[#0c0c0e] flex flex-col transition-all duration-300 shrink-0 overflow-hidden ${
                isPreviewMaximized ? "absolute inset-y-0 right-0 h-full" : ""
              }`}
            >
              {!isPreviewMaximized && (
                <div
                  onMouseDown={startResizing}
                  className={`absolute top-0 left-0 bottom-0 w-1.5 -ml-1 cursor-ew-resize z-50 transition-colors duration-150 ${
                    isResizing ? "bg-emerald-500/50" : "hover:bg-emerald-500/30"
                  }`}
                />
              )}

              <div
                className={`flex flex-col h-full w-full overflow-hidden ${
                  isResizing ? "pointer-events-none select-none" : ""
                }`}
              >
                {/* HEADER SECTION */}
                <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-[#09090b] shrink-0 overflow-hidden gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 truncate">
                      {isPreviewMaximized
                        ? "Full Preview Workspace"
                        : "Web Sandbox"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setIsPreviewMaximized(false);
                        setRightPanel(null);
                      }}
                      title="Minimize"
                      className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 p-1.5 rounded transition-all flex items-center justify-center"
                    >
                      <span className="block w-3 h-0.5 bg-current rounded-sm"></span>
                    </button>

                    <button
                      onClick={() => setIsPreviewMaximized(!isPreviewMaximized)}
                      title={
                        isPreviewMaximized ? "Restore Size" : "Maximize View"
                      }
                      className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 p-1 rounded transition-all flex items-center justify-center"
                    >
                      {isPreviewMaximized ? (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      ) : (
                        <span className="block w-3 h-3 border-2 border-current rounded-sm"></span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setIsPreviewMaximized(false);
                        setRightPanel(null);
                      }}
                      title="Close"
                      className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-1 rounded transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* DYNAMIC URL ADDRESS BAR */}
                <div className="p-2 bg-[#0c0c0e] border-b border-zinc-800/60 flex items-center gap-2 shrink-0 overflow-hidden">
                  <div className="bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 rounded-md px-3 py-1 flex-1 min-w-0 truncate font-mono">
                    {previewUrl}
                  </div>

                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white px-2.5 py-1 rounded transition-all shrink-0 whitespace-nowrap"
                  >
                    Open Tab
                  </a>

                  <button
                    onClick={() => {
                      const iframe = document.getElementById(
                        "ucollyx-sandbox-frame",
                      );
                      if (iframe) iframe.src = iframe.src;
                    }}
                    className="text-xs font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded transition-all shrink-0 whitespace-nowrap"
                  >
                    Refresh
                  </button>
                </div>

                {/* SANDBOX IFRAME CONTAINER */}
                <div className="flex-1 w-full bg-white relative overflow-hidden">
                  <iframe
                    id="ucollyx-sandbox-frame"
                    src={previewUrl}
                    title="UCollyx Application Core Sandbox"
                    className="absolute inset-0 w-full h-full border-none"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                  />
                </div>

                {/* ENGINE CONTROLS PANEL - Safely placed in the main flex container */}
                {activeProjectId && (
                  <div className="flex items-center justify-between gap-2 bg-[#09090b] p-3 border-t border-zinc-800 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          Cmd:
                        </span>
                        <input
                          type="text"
                          value={runCommand}
                          onChange={(e) => setRunCommand(e.target.value)}
                          className="w-36 bg-zinc-900 border border-zinc-800/80 rounded px-2 py-1 text-xs text-zinc-300 font-mono focus:outline-none focus:border-blue-500 transition-all"
                          placeholder="npm run dev"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 border-l border-zinc-800 pl-3">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          Port:
                        </span>
                        <input
                          type="text"
                          value={projectPort}
                          onChange={(e) => setProjectPort(e.target.value)}
                          className="w-16 bg-zinc-900 border border-zinc-800/80 rounded text-center text-xs text-white font-black py-1 focus:outline-none focus:border-blue-500 transition-all"
                          placeholder="5174"
                        />
                      </div>
                    </div>

                    <button
                      onClick={startDynamicProject}
                      className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs px-4 py-1.5 rounded transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/10"
                    >
                      <TerminalIcon size={12} />
                      <span>Run Engine</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      {menuPos.visible && (
        <div
          className="fixed z-50 bg-[#121214]/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-lg py-1 w-44 animate-in fade-in zoom-in duration-150"
          style={{ top: menuPos.y, left: menuPos.x }}
          onMouseLeave={closeMenu}
        >
          {/* <button
            onClick={() => {
              addItem(menuPos.targetId, "file");
              closeMenu();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-zinc-300 hover:bg-blue-600 hover:text-white transition-colors"
          >
            <FilePlus size={14} /> New File
          </button> */}

          <button
            onClick={() => {
              deleteItem(menuPos.targetId);
              closeMenu();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-400 hover:bg-red-600 hover:text-white transition-colors"
          >
            <X size={14} /> Delete
          </button>
        </div>
      )}

      {/* 🎯 UCOLLYX DYNAMIC WORKSPACE SELECTOR MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition"
            >
              ✕
            </button>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-zinc-100">
                Workspace Control Panel
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Choose your workspace execution environment or upload
                configurations.
              </p>
            </div>

            <div className="space-y-3">
              {/* OPTION 1: JUST SWITCH TO LOCAL */}
              <div
                onClick={() => executeFolderUpload("local_switch")}
                className="group cursor-pointer border border-zinc-800 bg-zinc-900/40 p-4 rounded-lg hover:border-blue-500/50 hover:bg-zinc-900 transition flex items-start space-x-3"
              >
                <div className="p-2 rounded-md bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition mt-0.5">
                  🔀
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-200 group-hover:text-blue-400 transition">
                    Switch to Local Environment
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Just point terminal to{" "}
                    <code className="bg-zinc-950 p-0.5 rounded text-zinc-400">
                      user_browsed_projects/
                    </code>
                    . No directory picker prompt.
                  </p>
                </div>
              </div>

              {/* OPTION 2: FRESH UPLOAD TO LOCAL */}
              <div
                onClick={() => executeFolderUpload("local_upload")}
                className="group cursor-pointer border border-zinc-800 bg-zinc-900/40 p-4 rounded-lg hover:border-amber-500/50 hover:bg-zinc-900 transition flex items-start space-x-3"
              >
                <div className="p-2 rounded-md bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition mt-0.5">
                  📤
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-200 group-hover:text-amber-400 transition">
                    Upload & Sync Fresh Folder
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Opens directory picker to scan, upload, and track new files
                    from your device.
                  </p>
                </div>
              </div>

              {/* OPTION 3: MANAGER ASSIGNED */}
              <div
                onClick={() => executeFolderUpload("assigned")}
                className="group cursor-pointer border border-zinc-800 bg-zinc-900/40 p-4 rounded-lg hover:border-emerald-500/50 hover:bg-zinc-900 transition flex items-start space-x-3"
              >
                <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition mt-0.5">
                  💼
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-200 group-hover:text-emerald-400 transition">
                    Switch to Manager Workspace
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Reverts environment back to default manager assigned paths
                    inside{" "}
                    <code className="bg-zinc-950 p-0.5 rounded text-zinc-400">
                      user_projects/
                    </code>
                    .
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-zinc-400 bg-zinc-900 hover:bg-zinc-800 rounded-md border border-zinc-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* {isSaving && (
          <div className="absolute top-6 right-6 bg-indigo-600 text-xs px-3 py-1 rounded shadow-lg animate-pulse z-10">
            💾 Saving changes to file...
          </div>
        )} */}

      {/* {isVibeOpen && (
        <div className="w-80 border-l border-slate-800 p-2 bg-slate-900">
          <VibeEditorPanel
            activeFilePath={activeFilePath}
            activeCode={activeCode}
            fileTree={fileTree}
            onApplyCode={handleApplyCode}
          />
        </div>
      )} */}
    </div>
  );
};

export default IDEBody;
