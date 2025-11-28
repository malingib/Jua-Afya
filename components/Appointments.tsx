import React, { useState } from 'react';
import { Appointment, Patient } from '../types';
import { Calendar, Clock, User, Check, X, MoreHorizontal, Search, Plus, Filter, AlertCircle } from 'lucide-react';

interface AppointmentsProps {
  appointments: Appointment[];
  patients: Patient[];
  addAppointment: (appt: Appointment) => void;
  updateAppointment: (appt: Appointment) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const Appointments: React.FC<AppointmentsProps> = ({ appointments, patients, addAppointment, updateAppointment, showToast }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Appointment State
  const [newApptData, setNewApptData] = useState({
      patientId: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      reason: ''
  });

  const filteredAppointments = appointments.filter(appt => {
    if (activeTab === 'upcoming') return appt.status === 'Scheduled';
    if (activeTab === 'completed') return appt.status === 'Completed';
    return appt.status === 'Cancelled';
  });

  const handleStatusChange = (appt: Appointment, newStatus: 'Scheduled' | 'Completed' | 'Cancelled') => {
      updateAppointment({ ...appt, status: newStatus });
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
      e.preventDefault();
      const patient = patients.find(p => p.id === newApptData.patientId);
      if (!patient || !newApptData.date || !newApptData.time) return;

      // Check for conflicts
      const conflict = appointments.find(a => 
          a.date === newApptData.date && 
          a.time === newApptData.time && 
          a.status === 'Scheduled'
      );

      if (conflict) {
          showToast(`Conflict: Appointment exists at ${newApptData.time} on ${newApptData.date}`, 'error');
          return;
      }

      const newAppointment: Appointment = {
          id: `A${Date.now()}`,
          patientId: patient.id,
          patientName: patient.name,
          date: newApptData.date,
          time: newApptData.time,
          reason: newApptData.reason || 'General Checkup',
          status: 'Scheduled'
      };

      addAppointment(newAppointment);
      setIsModalOpen(false);
      setNewApptData({ patientId: '', date: new Date().toISOString().split('T')[0], time: '09:00', reason: '' });
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Appointments</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your schedule</p>
        </div>
        
        <div className="flex items-center gap-3">
             <button className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <Filter className="w-5 h-5" />
             </button>
             <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-slate-900 dark:bg-brand-600 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-slate-800 dark:hover:bg-brand-700 shadow-lg shadow-slate-200 dark:shadow-none font-medium transition-colors"
             >
                <Plus className="w-5 h-5" />
                New Appointment
             </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-700 mb-6">
        {['upcoming', 'completed', 'cancelled'].map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-3 text-sm font-semibold capitalize transition-all relative ${
                    activeTab === tab 
                    ? 'text-teal-600 dark:text-teal-400' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
            >
                {tab}
                {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-400 rounded-t-full"></div>
                )}
            </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        {filteredAppointments.length > 0 ? (
            <div className="divide-y divide-slate-50 dark:divide-slate-700">
                {filteredAppointments.map((appt) => (
                    <div key={appt.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center w-14 h-14 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-2xl border border-teal-100 dark:border-teal-800">
                                <span className="text-xs font-bold uppercase">{new Date(appt.date).toLocaleString('default', { month: 'short' })}</span>
                                <span className="text-xl font-bold">{new Date(appt.date).getDate()}</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{appt.patientName}</h3>
                                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {appt.time}
                                    </div>
                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                    <span>{appt.reason}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                            {appt.status === 'Scheduled' && (
                                <>
                                    <button 
                                        onClick={() => handleStatusChange(appt, 'Completed')}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl transition-colors"
                                    >
                                        <Check className="w-4 h-4" /> Complete
                                    </button>
                                    <button 
                                        onClick={() => handleStatusChange(appt, 'Cancelled')}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl transition-colors"
                                    >
                                        <X className="w-4 h-4" /> Cancel
                                    </button>
                                </>
                            )}
                             <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <Calendar className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" />
                <p>No {activeTab} appointments found.</p>
            </div>
        )}
      </div>

      {/* New Appointment Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                  <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-700/50">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-teal-600" /> New Appointment
                      </h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                  </div>
                  <form onSubmit={handleCreateAppointment} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Patient</label>
                          <select 
                              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white text-sm"
                              value={newApptData.patientId}
                              onChange={(e) => setNewApptData({...newApptData, patientId: e.target.value})}
                              required
                          >
                              <option value="">-- Choose Patient --</option>
                              {patients.map(p => (
                                  <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                              ))}
                          </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                              <input 
                                  type="date"
                                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white text-sm"
                                  value={newApptData.date}
                                  onChange={(e) => setNewApptData({...newApptData, date: e.target.value})}
                                  required
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                              <input 
                                  type="time"
                                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white text-sm"
                                  value={newApptData.time}
                                  onChange={(e) => setNewApptData({...newApptData, time: e.target.value})}
                                  required
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason for Visit</label>
                          <input 
                              type="text"
                              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white text-sm"
                              placeholder="e.g. Fever, Follow-up"
                              value={newApptData.reason}
                              onChange={(e) => setNewApptData({...newApptData, reason: e.target.value})}
                          />
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                          <button 
                              type="button" 
                              onClick={() => setIsModalOpen(false)}
                              className="flex-1 py-2 text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                              type="submit"
                              className="flex-1 py-2 text-white font-medium bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                          >
                              <Check className="w-4 h-4" /> Schedule
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default Appointments;