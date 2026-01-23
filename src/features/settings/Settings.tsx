import React from 'react';
import { Bell, Volume2, Moon, Trash2, Shield, CircleHelp, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { AppView } from '../../../types';

interface SettingsProps {
    onNavigate: (view: AppView) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {

    return (
        <div className="container mx-auto px-4 py-4 max-w-2xl min-h-screen bg-slate-50 pb-24">
            <div className="flex items-center mb-6 pt-2">
                <button
                    onClick={() => onNavigate(AppView.MORE_HUB)}
                    className="mr-3 p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-blue-50 transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Settings</h1>
            </div>

            <div className="space-y-6">

                {/* Preferences Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center">
                        <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Preferences</h2>
                    </div>
                    <div className="p-5 space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
                                    <Volume2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">Sound Effects</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Play sounds for correct answers and level ups</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center mr-4">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Email reminders for daily practice streaks</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between opacity-60">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mr-4 border border-slate-200">
                                    <Moon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">Dark Mode</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Switch to dark theme (Coming Soon)</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-not-allowed">
                                <input type="checkbox" disabled className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 shadow-inner"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Support Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
                        <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Support</h2>
                    </div>
                    <div className="p-2 space-y-1">
                        <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                            <div className="flex items-center">
                                <CircleHelp className="w-5 h-5 text-slate-400 mr-3 group-hover:text-blue-600 transition-colors" />
                                <span className="text-slate-700 font-medium">Help Center</span>
                            </div>
                            <span className="text-slate-500 text-xs bg-slate-50 px-2 py-1 rounded-md border border-slate-200">External ↗</span>
                        </div>
                        <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                            <div className="flex items-center">
                                <Shield className="w-5 h-5 text-slate-400 mr-3 group-hover:text-blue-600 transition-colors" />
                                <span className="text-slate-700 font-medium">Privacy Policy</span>
                            </div>
                            <span className="text-slate-500 text-xs bg-slate-50 px-2 py-1 rounded-md border border-slate-200">External ↗</span>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-red-100 bg-red-50">
                        <h2 className="font-bold text-red-600 text-sm uppercase tracking-wider">Danger Zone</h2>
                    </div>
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">Reset Progress</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Delete all quiz history and XP (Cannot be undone)</p>
                            </div>
                            <Button
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                onClick={() => alert("Are you sure? This feature is locked in this demo.")}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Reset Data
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-10 mb-6 text-center text-xs text-slate-400 opacity-60">
                TOEFL PBT Master v1.0.0 • Built with AI
            </div>
        </div>
    );
};