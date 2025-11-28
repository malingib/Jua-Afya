import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Search, Plus, Package, AlertCircle, Filter, X, Check, Edit2, Trash2 } from 'lucide-react';

interface PharmacyProps {
  inventory: InventoryItem[];
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
}

const Pharmacy: React.FC<PharmacyProps> = ({ inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Medicine',
    stock: '',
    unit: 'Tablets',
    price: ''
  });

  const filtered = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
      setEditingItem(null);
      setNewItem({ name: '', category: 'Medicine', stock: '', unit: 'Tablets', price: '' });
      setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
      setEditingItem(item);
      setNewItem({
          name: item.name,
          category: item.category,
          stock: item.stock.toString(),
          unit: item.unit,
          price: item.price.toString()
      });
      setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
      if(confirm('Are you sure you want to remove this item from inventory?')) {
          deleteInventoryItem(id);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.stock || !newItem.price) return;

    if (editingItem) {
        // Update existing
        const updated: InventoryItem = {
            ...editingItem,
            name: newItem.name,
            category: newItem.category as 'Medicine' | 'Supply' | 'Lab',
            stock: Number(newItem.stock),
            unit: newItem.unit,
            price: Number(newItem.price)
        };
        updateInventoryItem(updated);
    } else {
        // Create new
        const item: InventoryItem = {
            id: Date.now().toString(),
            name: newItem.name,
            category: newItem.category as 'Medicine' | 'Supply' | 'Lab',
            stock: Number(newItem.stock),
            unit: newItem.unit,
            price: Number(newItem.price)
        };
        addInventoryItem(item);
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-200 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Pharmacy Inventory</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Track stock and medicine</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
               <div className="relative">
                    <select 
                        className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 pl-3 pr-8 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer w-full sm:w-auto"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        <option value="Medicine">Medicine</option>
                        <option value="Supply">Supply</option>
                        <option value="Lab">Lab</option>
                    </select>
                    <Filter className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search items..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl text-sm w-full sm:w-64 shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                </div>
               <button 
                  onClick={openAddModal}
                  className="bg-teal-600 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-200 dark:shadow-none font-medium w-full sm:w-auto justify-center transition-colors"
               >
                  <Plus className="w-5 h-5" />
                  Add Item
               </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                    <Package className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{inventory.length}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Total Items</div>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
                <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{inventory.filter(i => i.stock < 10).length}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Low Stock Alerts</div>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                    <Package className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">KSh 45k</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Est. Stock Value</div>
                </div>
            </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
            <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-4">Item Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Stock Level</th>
                        <th className="px-6 py-4">Unit Price</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700 text-sm">
                    {filtered.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                                {item.name}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                                    item.category === 'Medicine' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                                    item.category === 'Supply' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' :
                                    'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                }`}>
                                    {item.category}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-600 rounded-full overflow-hidden w-24">
                                        <div 
                                            className={`h-full rounded-full ${item.stock < 10 ? 'bg-red-500' : 'bg-green-500'}`}
                                            style={{ width: `${Math.min(item.stock, 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className={`text-xs font-bold ${item.stock < 10 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                        {item.stock} {item.unit}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                KSh {item.price}
                            </td>
                            <td className="px-6 py-4">
                                {item.stock < 10 ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold border border-red-100 dark:border-red-800">
                                        Low Stock
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold border border-green-100 dark:border-green-800">
                                        In Stock
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => openEditModal(item)}
                                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No items found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Add/Edit Item Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {editingItem ? 'Edit Inventory Item' : 'Add Inventory'}
                        </h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Item Name</label>
                            <input 
                                name="name"
                                value={newItem.name}
                                onChange={handleInputChange}
                                type="text" 
                                placeholder="e.g. Paracetamol" 
                                className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white transition-all"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
                                <select 
                                    name="category"
                                    value={newItem.category}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white transition-all"
                                >
                                    <option value="Medicine">Medicine</option>
                                    <option value="Supply">Supply</option>
                                    <option value="Lab">Lab</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Unit</label>
                                <input 
                                    name="unit"
                                    value={newItem.unit}
                                    onChange={handleInputChange}
                                    type="text" 
                                    placeholder="e.g. Tablets" 
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Stock Qty</label>
                                <input 
                                    name="stock"
                                    value={newItem.stock}
                                    onChange={handleInputChange}
                                    type="number" 
                                    min="0"
                                    placeholder="0" 
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Price (KSh)</label>
                                <input 
                                    name="price"
                                    value={newItem.price}
                                    onChange={handleInputChange}
                                    type="number" 
                                    min="0"
                                    placeholder="0.00" 
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="flex-1 py-3 text-white font-semibold bg-teal-600 hover:bg-teal-700 rounded-xl shadow-lg shadow-teal-200 dark:shadow-none transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" />
                                {editingItem ? 'Save Changes' : 'Add Item'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default Pharmacy;