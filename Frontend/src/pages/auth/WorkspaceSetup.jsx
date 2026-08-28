import React, { useRef, useState, useEffect } from "react";
import {
  Image as ImageIcon,
  X,
  ArrowLeft,
  ArrowRight,
  Hexagon,
  Plus,
  Upload,
  Loader2,
  Sparkles,
  Layers,
  Globe,
  Clock,
  ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { triggerToast } from "../../utils/toastHelper";
import { useCreateWorkspaceMutation, useInviteMutation } from "../../hooks/useWorkspace";

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") 
    .replace(/[^\w-]+/g, "") 
    .replace(/--+/g, "-"); 
};

export default function WorkspaceSetup() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const createMutation = useCreateWorkspaceMutation();
  const inviteMutation = useInviteMutation();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [timezone, setTimezone] = useState("(GMT+5:00) Pakistan Standard Time");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [emails, setEmails] = useState(["", "", ""]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.email) setOwnerEmail(user?.email);
  }, []);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    setSlug(slugify(val));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addEmailField = () => setEmails([...emails, ""]);
  const removeEmailField = (index) => {
    if (emails.length > 1) setEmails(emails.filter((_, i) => i !== index));
  };

  const handleCreateWorkspace = () => {
    if (!name || !slug) return triggerToast("Workspace name and URL are required!", "error");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("timezone", timezone);
    formData.append("ownerEmail", ownerEmail);

    const validEmails = emails.filter((email) => email.trim() !== "");
    formData.append("invitedEmails", JSON.stringify(validEmails));

    if (fileInputRef.current.files[0]) {
      formData.append("logo", fileInputRef.current.files[0]);
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        setStep(2); 
        triggerToast("Workspace created successfully!", "success");
      },
      onError: (err) => {
        triggerToast(err.response?.data?.message || "Failed to create workspace", "error");
      }
    });
  };

  const handleSendInvites = () => {
    const validEmails = emails.filter((email) => email.trim() !== "");
    if (validEmails.length === 0) return navigate(`/login`);

    const user = JSON.parse(localStorage.getItem("user"));

    inviteMutation.mutate({
      workspaceSlug: slug,
      emails: validEmails,
      inviterName: user?.full_name,
    }, {
      onSuccess: () => {
        triggerToast("Invitations sent successfully!", "success");
        navigate(`/login`);
      },
      onError: (err) => {
        triggerToast(err.response?.data?.message || "Invites failed.", "error");
        navigate(`/login`); 
      }
    });
  };

  const isLoading = createMutation.isPending || inviteMutation.isPending;

  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc] font-sans overflow-hidden">
      
      <div className="w-full lg:w-[55%] flex flex-col justify-between p-8 md:p-14 lg:p-20 bg-white relative z-10 overflow-y-auto">

        <div className="w-full max-w-xl mx-auto my-auto py-10">
          
          <div className="flex items-center gap-4 mb-10 text-xs font-bold uppercase tracking-widest text-gray-400">
            <span className={`transition-colors ${step === 1 ? "text-[#3b59ff]" : "text-gray-400"}`}>01. Info</span>
            <div className={`h-[2px] w-12 rounded ${step === 2 ? "bg-[#9d4edd]" : "bg-gray-200"}`} />
            <span className={`transition-colors ${step === 2 ? "text-[#9d4edd]" : "text-gray-400"}`}>02. Team Slots</span>
          </div>

          {step === 1 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-7">
              <div>
                <h1 className="text-3xl font-black text-[#1a1d2f] tracking-tight mb-2">
                  Create your workspace
                </h1>
                <p className="text-gray-500 text-sm">Configure your organizational infrastructure and instance routing properties.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[#565d7a] text-xs font-bold uppercase tracking-wider mb-2">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. Acme Development Group"
                    className="w-full bg-[#f8fafc] border border-gray-200 rounded-xl p-3.5 text-sm text-[#1e2238] placeholder-gray-400 focus:bg-white focus:border-[#3b59ff] focus:ring-4 focus:ring-[#3b59ff]/10 outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-[#565d7a] text-xs font-bold uppercase tracking-wider mb-2">
                    Workspace Routing Slug URL
                  </label>
                  <div className="flex items-center group">
                    <div className="bg-[#f1f5f9] border border-gray-200 border-r-0 p-3.5 rounded-l-xl text-gray-400 text-sm font-bold tracking-tight">
                      ucollyx.com/
                    </div>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      placeholder="acme-hq"
                      className="w-full bg-[#f8fafc] border border-gray-200 rounded-r-xl p-3.5 text-sm font-bold text-[#3b59ff] placeholder-gray-400 focus:bg-white focus:border-[#3b59ff] focus:ring-4 focus:ring-[#3b59ff]/10 outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#565d7a] text-xs font-bold uppercase tracking-wider mb-2">
                      Instance Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-gray-200 rounded-xl p-3.5 text-sm text-[#1e2238] focus:bg-white focus:border-[#3b59ff] focus:ring-4 focus:ring-[#3b59ff]/10 outline-none transition-all duration-200 cursor-pointer font-medium"
                    >
                      <option value="(GMT+5:00) Pakistan Standard Time">(GMT+5:00) Islamabad, Karachi</option>
                      <option value="PST">(GMT-8:00) Pacific Time - LA</option>
                      <option value="UTC">(GMT+0:00) Universal Coordinated</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#565d7a] text-xs font-bold uppercase tracking-wider mb-2">
                      Master Owner Email
                    </label>
                    <input
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="admin@company.com"
                      className="w-full bg-[#f8fafc] border border-gray-200 rounded-xl p-3.5 text-sm text-[#1e2238] focus:bg-white focus:border-[#3b59ff] focus:ring-4 focus:ring-[#3b59ff]/10 outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Workspace Logo */}
                <div className="bg-[#f8fafc] border border-gray-200/60 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden bg-white relative group shadow-sm shrink-0">
                      {logoPreview ? (
                        <>
                          <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setLogoPreview(null)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} className="text-white" />
                          </button>
                        </>
                      ) : (
                        <ImageIcon size={20} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-[#1a1d2f] text-sm font-bold">Workspace Branding Logo</p>
                      <p className="text-gray-400 text-xs">PNG, JPG formats up to 2MB (Optional)</p>
                    </div>
                  </div>

                  <input type="file" ref={fileInputRef} onChange={handleLogoChange} className="hidden" accept="image/*" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()} 
                    className="bg-white border border-gray-200 hover:border-[#3b59ff]/40 text-gray-600 hover:text-[#3b59ff] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 shadow-sm active:scale-95"
                  >
                    <Upload size={14} />
                    <span>{logoPreview ? "Change File" : "Upload"}</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3.5 bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all duration-200"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={handleCreateWorkspace}
                  disabled={!name || !slug || !ownerEmail}
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#3b59ff] to-[#8a2be2] hover:opacity-95 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
                >
                  <span>Continue Setup</span> <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right duration-300 space-y-6">
              <div>
                <h1 className="text-3xl font-black text-[#1a1d2f] tracking-tight mb-2">
                  Assemble your team
                </h1>
                <p className="text-gray-500 text-sm">Send dynamic access invites to engineers, stakeholders or operators directly.</p>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {emails.map((email, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        const newEmails = [...emails];
                        newEmails[index] = e.target.value;
                        setEmails(newEmails);
                      }}
                      placeholder={`engineer.${index + 1}@yourorganization.com`}
                      className="w-full bg-[#f8fafc] border border-gray-200 rounded-xl p-3.5 text-sm text-[#1e2238] placeholder-gray-400 focus:bg-white focus:border-[#9d4edd] focus:ring-4 focus:ring-[#9d4edd]/10 outline-none transition-all duration-200"
                    />
                    {emails.length > 1 && (
                      <button
                        onClick={() => removeEmailField(index)}
                        className="p-3.5 border border-red-100 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all duration-200 shrink-0"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  onClick={addEmailField}
                  className="w-full py-3.5 border-2 border-dashed border-gray-200 text-gray-500 font-bold rounded-xl flex items-center justify-center gap-1.5 hover:border-[#9d4edd]/40 hover:text-[#9d4edd] bg-white transition-all duration-200 text-xs uppercase tracking-wider"
                >
                  <Plus size={16} /> Add Invite Slot
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                  className="px-6 py-3.5 bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all duration-200"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={handleSendInvites} 
                  disabled={isLoading}
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#9d4edd] to-[#3b59ff] hover:opacity-95 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-xl"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin text-white" />
                  ) : (
                    <>
                      <span>Complete & Deploy Workspace</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={handleSendInvites} 
                  className="text-xs text-gray-400 hover:text-[#3b59ff] font-bold uppercase tracking-wider transition-colors pt-2 outline-none"
                >
                  Skip this process for now
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center lg:text-left text-xs text-gray-400 font-medium">
          Protected instance encryption. Powered by UCollyx Engine Core.
        </p>
      </div>

      {/* RIGHT SIDE PANEL: Fluid Mesh Gradient Showcase & Living Workspace Mockup Preview */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#121424] relative flex-col justify-between p-16 overflow-hidden border-l border-white/5">
        
        {/* Intense Floating Colored Light Ambient Blurs */}
        <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-[#3b59ff]/30 rounded-full blur-[110px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] bg-[#9d4edd]/20 rounded-full blur-[100px]" />

        {/* Top Tagline */}
        <div className="relative z-10 flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
          <Layers size={14} className="text-[#00f2fe]" /> Synchronized Cloud Environments
        </div>

        {/* Center Canvas Workspace Graphic Mockup Panel */}
        <div className="relative z-10 w-full max-w-sm mx-auto bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#3b59ff] to-[#00f2fe] flex items-center justify-center font-black text-white text-xs">
                {name ? name.substring(0, 2).toUpperCase() : "UC"}
              </div>
              <div>
                <h4 className="text-white text-xs font-bold tracking-wide truncate max-w-[140px]">
                  {name || "Your New Instance"}
                </h4>
                <p className="text-white/40 text-[10px] font-mono truncate max-w-[140px]">
                  ucollyx.com/{slug || "slug-route"}
                </p>
              </div>
            </div>
            <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full">
              Active
            </div>
          </div>

          {/* Dummy Live Ecosystem Stats inside the panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-white/70 bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-[#00f2fe]" />
                <span>Ecosystem Server</span>
              </div>
              <span className="text-white font-mono text-[11px]">US-East-Cluster</span>
            </div>
            <div className="flex items-center justify-between text-xs text-white/70 bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#3b59ff]" />
                <span>Instance Zone</span>
              </div>
              <span className="text-white text-[11px] truncate max-w-[120px]">{timezone.split(" ")[0]}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-white/70 bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#9d4edd]" />
                <span>Security Group</span>
              </div>
              <span className="text-emerald-400 font-bold text-[11px]">Enforced TLS</span>
            </div>
          </div>
        </div>

        {/* Bottom Context Message */}
        <div className="relative z-10 space-y-2">
          <h3 className="text-white font-black text-xl tracking-tight flex items-center gap-2">
            Build Better Together <Sparkles size={18} className="text-[#00f2fe]" />
          </h3>
          <p className="text-white/50 text-xs leading-relaxed max-w-xs">
            Deploy secure workspace infrastructure instantly. Team synchronizations, collaborative repositories, and IDE controls are bundled within your target cluster link.
          </p>
        </div>

      </div>

    </div>
  );
}