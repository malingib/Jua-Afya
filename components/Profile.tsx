import React from 'react';
import { User, Mail, Phone, MapPin, Award, Calendar, Shield, Key, Camera, Edit2 } from 'lucide-react';

const Profile: React.FC = () => {
  return (
    <div className="p-6 md:p-10 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">My Profile</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: ID Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-brand-500 to-teal-700"></div>
            
            <div className="relative mt-12 mb-4 group">
                <div className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-800 shadow-md overflow-hidden bg-slate-200">
                    <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <button className="absolute bottom-1 right-1 p-2 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-700 transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                </button>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Dr. Andrew Kimani</h3>
            <p className="text-teal-600 dark:text-teal-400 font-medium text-sm">General Practitioner</p>
            <p className="text-slate-400 text-xs mt-1">ID: DOC-88234</p>

            <div className="mt-6 flex items-center justify-center gap-4 w-full">
                <div className="text-center">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">1.2k</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Patients</div>
                </div>
                <div className="w-px h-8 bg-slate-100 dark:bg-slate-700"></div>
                <div className="text-center">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">4.9</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Rating</div>
                </div>
                <div className="w-px h-8 bg-slate-100 dark:bg-slate-700"></div>
                <div className="text-center">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">5y</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Exp.</div>
                </div>
            </div>

            <button className="mt-8 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit Status
            </button>
          </div>

          {/* Quick Schedule */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-500" />
                  Weekly Schedule
              </h4>
              <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Mon - Fri</span>
                      <span className="font-medium text-slate-900 dark:text-white">08:00 AM - 05:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Saturday</span>
                      <span className="font-medium text-slate-900 dark:text-white">09:00 AM - 01:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Sunday</span>
                      <span className="font-medium text-red-500">Off Duty</span>
                  </div>
              </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Details */}
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h3>
                    <button className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline">Edit Details</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">Dr. Andrew Kimani</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">andrew@juaafya.com</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">+254 712 345 678</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Designation</label>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                            <Award className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">Senior Medical Officer</span>
                        </div>
                    </div>
                     <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinic Address</label>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">JuaAfya Medical Centre, Ngong Road, Nairobi</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security */}
             <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-teal-500" />
                        Security & Login
                    </h3>
                </div>

                <div className="space-y-4">
                     <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                                <Key className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-semibold text-slate-900 dark:text-white text-sm">Change Password</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">Last changed 30 days ago</div>
                            </div>
                        </div>
                        <button className="text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">Update</button>
                    </div>
                </div>
             </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;