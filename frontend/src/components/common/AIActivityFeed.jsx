import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { 
  Bot, 
  CheckCircle2, 
  FileText, 
  ListChecks, 
  AlertTriangle, 
  Calendar, 
  Sparkles, 
  Clock, 
  RefreshCw 
} from "lucide-react";

export default function AIActivityFeed({ compact = false }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = () => {
    setLoading(true);
    api
      .getActivityStream(compact ? 5 : 20)
      .then(setActivities)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 15000); // refresh periodically
    return () => clearInterval(interval);
  }, [compact]);

  const getAgentBadge = (agent) => {
    switch (agent) {
      case "Document Agent":
        return { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: FileText };
      case "PYQ Agent":
        return { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: ListChecks };
      case "Evaluation Agent":
        return { color: "bg-rose-500/10 text-rose-400 border-rose-500/20", icon: AlertTriangle };
      case "Study Planner Agent":
        return { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: Calendar };
      case "Tutor Agent":
        return { color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: Sparkles };
      default:
        return { color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", icon: Bot };
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">AI Agent Activity Stream</h3>
            <p className="text-xs text-slate-400">Live multi-agent decision logs</p>
          </div>
        </div>
        <button
          onClick={fetchActivities}
          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
          title="Refresh activities"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No AI activity recorded yet.</p>
        ) : (
          activities.map((act) => {
            const badge = getAgentBadge(act.agent_name);
            const IconComponent = badge.icon;
            return (
              <div
                key={act.id}
                className="group relative pl-4 border-l-2 border-slate-800 hover:border-indigo-500 transition-colors py-1"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.color}`}
                  >
                    <IconComponent className="w-2.5 h-2.5" />
                    {act.agent_name}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(act.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-medium text-slate-200">{act.title}</h4>
                    {act.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {act.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}