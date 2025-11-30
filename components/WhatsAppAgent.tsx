
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, MessageSquare, Settings, Activity, Shield, Users, 
  CheckCircle, AlertCircle, RefreshCw, Power, Save, Terminal, 
  Play, StopCircle, Search, Trash2, Smartphone
} from 'lucide-react';
import { TeamMember, Appointment, InventoryItem, Patient, ClinicSettings } from '../types';
import { getStaffAssistantResponse } from '../services/geminiService';

interface WhatsAppAgentProps {
  team: TeamMember[];
  appointments: Appointment[];
  inventory: InventoryItem[];
  patients: Patient[];
  settings: ClinicSettings;
}

interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  query: string;
  response: string;
  status: 'Success' | 'Failed';
  latency: number;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: Date;
}

const WhatsAppAgent: React.FC<WhatsAppAgentProps> = ({ team, appointments, inventory, patients, settings }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings' | 'logs'>('dashboard');
  const [botStatus, setBotStatus] = useState<'Active' | 'Paused' | 'Maintenance'>('Active');
  const [selectedTestUser, setSelectedTestUser] = useState<string>(team[0]?.id || '');
  
  // -- Settings State --
  const [config, setConfig] = useState({
      allowAppointments: true,
      allowInventory: true,
      allowPatientRecords: true,
      requireAuth: true,
      systemPrompt: "You are the JuaAfya Ops Bot. Be concise, professional, and helpful.",
      businessNumber: settings.phone
  });

  // -- Chat Sandbox State --
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxMessages, setSandboxMessages] = useState<ChatMessage[]>([
      { id: '1', sender: 'bot', text: 'Sandbox Ready. Select a user and type a message to test the agent.', timestamp: new Date() }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // -- Logs State --
  const [activityLogs, setActivityLogs] = useState<LogEntry[]>([
      { id: 'L-101', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), user: 'Dr. Andrew', role: 'Admin', query: 'Do we have Amoxicillin?', response: 'Yes, 400 Tablets in stock.', status: 'Success', latency: 450 },
      { id: 'L-102', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), user: 'Sarah W.', role: 'Nurse', query: 'Next appointment?', response: 'Next is Wanjiku Kamau at 09:00.', status: 'Success', latency: 520 },
  ]);

  // Scroll to bottom of chat
  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sandboxMessages]);

  const handleSendMessage = async () => {
      if (!sandboxInput.trim() || !selectedTestUser) return;

      const user = team.find(t => t.id === selectedTestUser);
      if (!user) return;

      const userMsg: ChatMessage = {
          id: Date.now().toString(),
          sender: 'user',
          text: sandboxInput,
          timestamp: new Date()
      };

      setSandboxMessages(prev => [...prev, userMsg]);
      setSandboxInput('');
      setIsThinking(true);

      const startTime = Date.now();

      // Construct Context
      const context = {
          clinic: { name: settings.name, phone: settings.phone, location: settings.location },
          user: { name: user.name, role: user.role, id: user.id },
          team: team.map(t => ({ name: t.name, role: t.role, phone: t.phone })),
          appointments: config.allowAppointments ? appointments : [],
          inventory: config.allowInventory ? inventory.map(i => ({ name: i.name, stock: i.stock, location: 'Pharmacy' })) : [],
          patients: config.allowPatientRecords ? patients.map(p => ({ name: p.name, age: p.age, gender: p.gender })) : [],
          today: new Date().toLocaleDateString()
      };

      try {
          const responseText = await getStaffAssistantResponse(userMsg.text, context);
          
          const botMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              sender: 'bot',
              text: responseText,
              timestamp: new Date()
          };
          setSandboxMessages(prev => [...prev, botMsg]);

          // Log the interaction
          const newLog: LogEntry = {
              id: `L-${Date.now()}`,
              timestamp: new Date().toISOString(),
              user: user.name,
              role: user.role,
              query: userMsg.text,
              response: responseText,
              status: 'Success',
              latency: Date.now() - startTime
          };
          setActivityLogs(prev => [newLog, ...prev]);

      } catch (error) {
          const errorMsg: ChatMessage = { id: Date.now().toString(), sender: 'bot', text: "Error processing request.", timestamp: new Date() };
          setSandboxMessages(prev => [...prev, errorMsg]);
      } finally {
          setIsThinking(false);
      }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
      }
  };

  // --- RENDERERS ---

  const renderDashboard = () => (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
          {/* Status Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-full">
              <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Connection Status</h3>
                  <div className="flex items-center gap-4 mb-6">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${botStatus === 'Active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                          <Smartphone className="w-8 h-8" />
                      </div>
                      <div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">{botStatus}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                              {botStatus === 'Active' ? 'Listening for messages' : 'Bot is offline'}
                          </div>
                      </div>
                  </div>
                  
                  <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Business Number</span>
                          <span className="font-mono font-medium dark:text-white">{config.businessNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                          <span className="text-slate-500">API Provider</span>
                          <span className="font-medium text-teal-600">WhatsApp Cloud API</span>
                      </div>
                      <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Webhook Health</span>
                          <span className="font-medium text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> 100% OK</span>
                      </div>
                  </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <button 
                      onClick={() => setBotStatus(botStatus === 'Active' ? 'Paused' : 'Active')}
                      className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                          botStatus === 'Active' 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                  >
                      {botStatus === 'Active' ? <StopCircle className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
                      {botStatus === 'Active' ? 'Stop Agent' : 'Start Agent'}
                  </button>
              </div>
          </div>

          {/* Sandbox Chat */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-[500px]">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 rounded-t-3xl">
                  <div className="flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-bold text-slate-900 dark:text-white">Test Sandbox</h3>
                  </div>
                  <select 
                      value={selectedTestUser}
                      onChange={(e) => setSelectedTestUser(e.target.value)}
                      className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 outline-none dark:text-white"
                  >
                      {team.map(t => <option key={t.id} value={t.id}>Simulate as: {t.name} ({t.role})</option>)}
                  </select>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                  {sandboxMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                              msg.sender === 'user' 
                              ? 'bg-teal-600 text-white rounded-br-none' 
                              : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-bl-none shadow-sm'
                          }`}>
                              {msg.text}
                              <div className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-teal-100' : 'text-slate-400'}`}>
                                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                          </div>
                      </div>
                  ))}
                  {isThinking && (
                      <div className="flex justify-start">
                          <div className="bg-white dark:bg-slate-700 p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-200 dark:border-slate-600 flex items-center gap-2">
                              <Activity className="w-4 h-4 text-teal-500 animate-spin" />
                              <span className="text-xs text-slate-500 dark:text-slate-400">Processing clinic data...</span>
                          </div>
                      </div>
                  )}
                  <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-3xl">
                  <div className="relative">
                      <input 
                          value={sandboxInput}
                          onChange={(e) => setSandboxInput(e.target.value)}
                          onKeyDown={handleKeyPress}
                          placeholder="Type a message to test..."
                          className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 dark:text-white transition-all"
                          disabled={isThinking || botStatus !== 'Active'}
                      />
                      <button 
                          onClick={handleSendMessage}
                          disabled={!sandboxInput.trim() || isThinking || botStatus !== 'Active'}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                      >
                          <Send className="w-4 h-4" />
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderSettingsPanel = () => (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 animate-in fade-in">
          <div className="max-w-4xl mx-auto space-y-8">
              <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Agent Configuration</h3>
                  <p className="text-slate-500 dark:text-slate-400">Manage how the WhatsApp bot behaves and what data it can access.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Data Access Control */}
                  <div className="space-y-4">
                      <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                          <Shield className="w-4 h-4" /> Data Access Permissions
                      </h4>
                      <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600 space-y-4">
                          {[
                              { id: 'allowAppointments', label: 'View Appointments', desc: 'Allow bot to read scheduling data' },
                              { id: 'allowInventory', label: 'Check Inventory', desc: 'Allow bot to query stock levels' },
                              { id: 'allowPatientRecords', label: 'Patient Basic Info', desc: 'Read names and demographics (No Medical History)' },
                          ].map(opt => (
                              <div key={opt.id} className="flex items-start gap-3">
                                  <input 
                                      type="checkbox" 
                                      id={opt.id}
                                      checked={(config as any)[opt.id]}
                                      onChange={(e) => setConfig({...config, [opt.id]: e.target.checked})}
                                      className="mt-1 w-5 h-5 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
                                  />
                                  <div>
                                      <label htmlFor={opt.id} className="font-bold text-slate-700 dark:text-slate-200 text-sm cursor-pointer">{opt.label}</label>
                                      <p className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Security */}
                  <div className="space-y-4">
                      <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                          <AlertCircle className="w-4 h-4" /> Security & Auth
                      </h4>
                      <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600">
                          <div className="flex items-center justify-between mb-4">
                              <div>
                                  <div className="font-bold text-slate-700 dark:text-slate-200 text-sm">Enforce Team Verification</div>
                                  <p className="text-xs text-slate-500">Only numbers listed in "Team Members" can interact.</p>
                              </div>
                              <button 
                                  onClick={() => setConfig({...config, requireAuth: !config.requireAuth})}
                                  className={`w-10 h-6 rounded-full relative transition-colors ${config.requireAuth ? 'bg-teal-600' : 'bg-slate-300'}`}
                              >
                                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${config.requireAuth ? 'left-5' : 'left-1'}`}></div>
                              </button>
                          </div>
                          <div className="pt-4 border-t border-slate-200 dark:border-slate-600">
                              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">System Instructions (Prompt)</label>
                              <textarea 
                                  value={config.systemPrompt}
                                  onChange={(e) => setConfig({...config, systemPrompt: e.target.value})}
                                  className="w-full p-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                                  rows={3}
                              />
                          </div>
                      </div>
                  </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
                      <Save className="w-4 h-4" /> Save Configuration
                  </button>
              </div>
          </div>
      </div>
  );

  const renderLogs = () => (
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Activity Logs</h3>
              <div className="flex gap-2">
                  <button onClick={() => setActivityLogs([])} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-bold">
                      <Trash2 className="w-3 h-3" /> Clear History
                  </button>
                  <button className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 font-bold">
                      <RefreshCw className="w-3 h-3" /> Refresh
                  </button>
              </div>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-400 font-semibold">
                      <tr>
                          <th className="px-6 py-4">Time</th>
                          <th className="px-6 py-4">User</th>
                          <th className="px-6 py-4">Message</th>
                          <th className="px-6 py-4">Bot Response</th>
                          <th className="px-6 py-4">Latency</th>
                          <th className="px-6 py-4">Status</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                      {activityLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                              <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                                  {new Date(log.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="px-6 py-4">
                                  <div className="font-bold text-slate-900 dark:text-white">{log.user}</div>
                                  <div className="text-xs text-slate-500">{log.role}</div>
                              </td>
                              <td className="px-6 py-4 text-slate-700 dark:text-slate-300 max-w-[200px] truncate" title={log.query}>
                                  "{log.query}"
                              </td>
                              <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={log.response}>
                                  {log.response}
                              </td>
                              <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                  {log.latency}ms
                              </td>
                              <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                      log.status === 'Success' 
                                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                                      : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                  }`}>
                                      {log.status}
                                  </span>
                              </td>
                          </tr>
                      ))}
                      {activityLogs.length === 0 && (
                          <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-400">No activity recorded yet.</td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
  );

  return (
    <div className="p-6 md:p-10 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-8 h-8 text-green-600" /> WhatsApp Integration
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your Staff Ops Bot settings and monitor activity.</p>
            </div>
            
            <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                {[
                    { id: 'dashboard', label: 'Console', icon: Terminal },
                    { id: 'settings', label: 'Configuration', icon: Settings },
                    { id: 'logs', label: 'Logs', icon: Activity },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                            activeTab === tab.id 
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>

        <div className="min-h-[500px]">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'settings' && renderSettingsPanel()}
            {activeTab === 'logs' && renderLogs()}
        </div>
    </div>
  );
};

export default WhatsAppAgent;
