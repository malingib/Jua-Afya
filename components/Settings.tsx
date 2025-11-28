import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, Globe, Shield, CreditCard, ChevronRight, Moon, Sun, Save } from 'lucide-react';
import { ClinicSettings } from '../types';

interface SettingsProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
    settings: ClinicSettings;
    updateSettings: (s: ClinicSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ isDarkMode, toggleTheme, settings, updateSettings }) => {
  const [formData, setFormData] = useState<ClinicSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
      setFormData(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
          ...formData,
          [e.target.name]: e.target.value
      });
      setHasChanges(true);
  };

  const handleSave = () => {
      updateSettings(formData);
      setHasChanges(false);
  };

  const handleCancel = () => {
      setFormData(settings);
      setHasChanges(false);
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
       <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage account and clinic preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Sidebar nav for settings */}
            <div className="md:col-span-4 lg:col-span-3 space-y-2">
                <button className="w-full text-left px-4 py-3 bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-semibold rounded-xl shadow-sm border-l-4 border-teal-500 flex items-center justify-between transition-colors">
                    <span>General</span>
                    <ChevronRight className="w-4 h-4" />
                </button>
                <button className="w-full text-left px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors">Notifications</button>
                <button className="w-full text-left px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors">Security & Access</button>
                <button className="w-full text-left px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors">Billing</button>
            </div>

            {/* Main Settings Panel */}
            <div className="md:col-span-8 lg:col-span-9 space-y-6">
                
                {/* Profile Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Clinic Profile</h3>
                    
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-300 text-2xl font-bold border-4 border-slate-50 dark:border-slate-600 uppercase">
                            {formData.name.substring(0,2)}
                        </div>
                        <div>
                            <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">Upload Logo</button>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Recommended size 400x400px</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Clinic Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                            <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Location</label>
                            <input name="location" value={formData.location} onChange={handleChange} type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white" />
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">System Preferences</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 shadow-sm">
                                    {isDarkMode ? <Moon className="w-5 h-5"/> : <Sun className="w-5 h-5"/>}
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900 dark:text-white text-sm">Theme</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark mode</div>
                                </div>
                            </div>
                            <button 
                                onClick={toggleTheme}
                                className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${isDarkMode ? 'bg-teal-600' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isDarkMode ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 shadow-sm"><Globe className="w-5 h-5"/></div>
                                <div>
                                    <div className="font-semibold text-slate-900 dark:text-white text-sm">Language</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{formData.language}</div>
                                </div>
                            </div>
                            <button className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">Edit</button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 shadow-sm"><Bell className="w-5 h-5"/></div>
                                <div>
                                    <div className="font-semibold text-slate-900 dark:text-white text-sm">SMS Reminders</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Automatically send appointment reminders</div>
                                </div>
                            </div>
                            <div 
                                onClick={() => { setFormData({...formData, smsEnabled: !formData.smsEnabled}); setHasChanges(true); }}
                                className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${formData.smsEnabled ? 'bg-teal-500' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${formData.smsEnabled ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </div>
                    </div>
                 </div>

                 <div className={`flex justify-end gap-3 transition-opacity duration-300 ${hasChanges ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                     <button onClick={handleCancel} className="px-6 py-3 text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                     <button onClick={handleSave} className="px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-200 dark:shadow-none transition-colors flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Changes
                     </button>
                 </div>

            </div>
        </div>
    </div>
  );
};

export default Settings;