
import React, { useState, useMemo, useEffect } from 'react';
import { InventoryItem } from '../types';
import { 
  Search, Plus, Package, AlertCircle, Filter, X, Check, Edit2, 
  Trash2, Download, ArrowUpDown, RefreshCw, DollarSign, ChevronDown, 
  AlertTriangle, History, ChevronLeft, ChevronRight, MoreHorizontal, CheckSquare, Square
} from 'lucide-react';

interface PharmacyProps {
  inventory: InventoryItem[];
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
}

type SortField = 'name' | 'stock' | 'price' | 'category';
type SortDirection = 'asc' | 'desc';
type StockFilter = 'All' | 'Low' | 'Out' | 'Good';

const Pharmacy: React.FC<PharmacyProps> = ({ inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem }) => {
  // -- Filter & Sort State --
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<StockFilter>('All');
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({ 
    field: 'name', 
    direction: 'asc' 
  });
  
  // -- Pagination State --
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // -- Bulk Action State --
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // -- Modal State --
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItemForRestock, setSelectedItemForRestock] = useState<InventoryItem | null>(null);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<string>('');
  
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Medicine',
    stock: '',
    unit: 'Tablets',
    price: ''
  });

  // -- Derived Metrics --
  const lowStockThreshold = 10;
  
  const stats = useMemo(() => {
      const totalItems = inventory.length;
      const lowStock = inventory.filter(i => i.stock > 0 && i.stock <= lowStockThreshold).length;
      const outOfStock = inventory.filter(i => i.stock === 0).length;
      const totalValue = inventory.reduce((acc, item) => acc + (item.price * item.stock), 0);
      return { totalItems, lowStock, outOfStock, totalValue };
  }, [inventory]);

  // -- Filtering & Sorting Logic --
  const filteredAndSortedInventory = useMemo(() => {
    let data = [...inventory];

    // 1. Search
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        data = data.filter(item => 
            item.name.toLowerCase().includes(lowerTerm) || 
            item.id.toLowerCase().includes(lowerTerm)
        );
    }

    // 2. Category Filter
    if (categoryFilter !== 'All') {
        data = data.filter(item => item.category === categoryFilter);
    }

    // 3. Stock Filter
    if (stockFilter !== 'All') {
        if (stockFilter === 'Low') data = data.filter(item => item.stock > 0 && item.stock <= lowStockThreshold);
        else if (stockFilter === 'Out') data = data.filter(item => item.stock === 0);
        else if (stockFilter === 'Good') data = data.filter(item => item.stock > lowStockThreshold);
    }

    // 4. Sorting
    data.sort((a, b) => {
        const aValue = a[sortConfig.field];
        const bValue = b[sortConfig.field];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return data;
  }, [inventory, searchTerm, categoryFilter, stockFilter, sortConfig]);

  // Reset pagination when filters change
  useEffect(() => {
      setCurrentPage(1);
      setSelectedIds(new Set());
  }, [searchTerm, categoryFilter, stockFilter]);

  // -- Pagination Logic --
  const totalPages = Math.ceil(filteredAndSortedInventory.length / itemsPerPage);
  const paginatedItems = filteredAndSortedInventory.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  // -- Handlers --

  const handleSort = (field: SortField) => {
      setSortConfig(prev => ({
          field,
          direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
      }));
  };

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

  const openRestockModal = (item: InventoryItem) => {
      setSelectedItemForRestock(item);
      setRestockAmount('');
      setIsRestockModalOpen(true);
  };

  const openHistoryModal = (item: InventoryItem) => {
      setSelectedItemForHistory(item);
      setIsHistoryOpen(true);
  }

  const handleRestockSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedItemForRestock || !restockAmount) return;

      const amount = parseInt(restockAmount);
      if (isNaN(amount)) return;

      const updatedItem = {
          ...selectedItemForRestock,
          stock: selectedItemForRestock.stock + amount
      };
      
      updateInventoryItem(updatedItem);
      setIsRestockModalOpen(false);
      setSelectedItemForRestock(null);
      setRestockAmount('');
  };

  const handleDelete = (id: string) => {
      if(confirm('Are you sure you want to remove this item from inventory? This action cannot be undone.')) {
          deleteInventoryItem(id);
      }
  };

  const handleBulkDelete = () => {
      if (selectedIds.size === 0) return;
      if (confirm(`Are you sure you want to delete ${selectedIds.size} items?`)) {
          selectedIds.forEach(id => deleteInventoryItem(id));
          setSelectedIds(new Set());
      }
  };

  const toggleSelection = (id: string) => {
      const newSelection = new Set(selectedIds);
      if (newSelection.has(id)) {
          newSelection.delete(id);
      } else {
          newSelection.add(id);
      }
      setSelectedIds(newSelection);
  };

  const toggleSelectAll = () => {
      if (selectedIds.size === paginatedItems.length) {
          setSelectedIds(new Set());
      } else {
          const newSelection = new Set<string>();
          paginatedItems.forEach(item => newSelection.add(item.id));
          setSelectedIds(newSelection);
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

  const handleExportCSV = () => {
      const headers = ['ID', 'Name', 'Category', 'Stock', 'Unit', 'Price (KSh)', 'Total Value'];
      const rows = filteredAndSortedInventory.map(item => [
          item.id,
          `"${item.name}"`, // Quote name to handle commas
          item.category,
          item.stock,
          item.unit,
          item.price,
          item.stock * item.price
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
          + headers.join(',') + "\n" 
          + rows.map(e => e.join(',')).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-200 relative pb-24">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Pharmacy Inventory</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage stock levels, tracking, and valuation</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
               <button 
                  onClick={handleExportCSV}
                  className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm font-medium transition-colors w-full sm:w-auto justify-center"
               >
                  <Download className="w-4 h-4" />
                  Export CSV
               </button>
               <button 
                  onClick={openAddModal}
                  className="bg-teal-600 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-200 dark:shadow-none font-bold w-full sm:w-auto justify-center transition-colors"
               >
                  <Plus className="w-5 h-5" />
                  Add New Item
               </button>
          </div>
        </div>

        {/* Dynamic KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-colors relative overflow-hidden group">
                <div className="absolute right-0 top-0 h-full w-1 bg-blue-500"></div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalItems}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Items</div>
                </div>
            </div>

            <div 
                onClick={() => setStockFilter(stockFilter === 'Low' ? 'All' : 'Low')}
                className={`p-6 rounded-2xl shadow-sm border flex items-center gap-4 transition-all cursor-pointer relative overflow-hidden group ${
                    stockFilter === 'Low' 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 ring-2 ring-red-500 ring-offset-2 dark:ring-offset-slate-900' 
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900'
                }`}
            >
                <div className="absolute right-0 top-0 h-full w-1 bg-red-500"></div>
                <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {stats.lowStock + stats.outOfStock}
                        {stats.outOfStock > 0 && <span className="text-xs font-bold bg-red-100 dark:bg-red-900 text-red-600 px-2 py-0.5 rounded-full">{stats.outOfStock} Empty</span>}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Low Stock Alerts</div>
                </div>
                {stockFilter === 'Low' && <div className="absolute top-2 right-3 text-red-500 text-xs font-bold">Active</div>}
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-colors relative overflow-hidden group">
                <div className="absolute right-0 top-0 h-full w-1 bg-emerald-500"></div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(stats.totalValue)}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Inventory Value</div>
                </div>
            </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                 {/* Search */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search items..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    <select 
                        className="appearance-none bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer min-w-[140px]"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        <option value="Medicine">Medicine</option>
                        <option value="Supply">Supply</option>
                        <option value="Lab">Lab</option>
                    </select>

                    <select 
                        className="appearance-none bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer min-w-[140px]"
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                    >
                        <option value="All">All Stock Status</option>
                        <option value="Good">In Stock</option>
                        <option value="Low">Low Stock</option>
                        <option value="Out">Out of Stock</option>
                    </select>
                </div>
            </div>
            
            {selectedIds.size > 0 ? (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedIds.size} Selected</span>
                    <button 
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                </div>
            ) : (
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium hidden lg:block">
                    Showing {filteredAndSortedInventory.length} results
                </div>
            )}
        </div>

        {/* Inventory Table */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors flex flex-col min-h-[400px]">
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700">
                        <tr>
                            <th className="px-4 py-4 w-12 text-center">
                                <button onClick={toggleSelectAll} className="hover:text-teal-600 dark:hover:text-teal-400">
                                    {selectedIds.size > 0 && selectedIds.size === paginatedItems.length ? <CheckSquare className="w-5 h-5"/> : <Square className="w-5 h-5"/>}
                                </button>
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group" onClick={() => handleSort('name')}>
                                <div className="flex items-center gap-2">Item Name <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100"/></div>
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group" onClick={() => handleSort('category')}>
                                <div className="flex items-center gap-2">Category <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100"/></div>
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group" onClick={() => handleSort('stock')}>
                                <div className="flex items-center gap-2">Stock Level <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100"/></div>
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group" onClick={() => handleSort('price')}>
                                <div className="flex items-center gap-2">Value <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100"/></div>
                            </th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700 text-sm">
                        {paginatedItems.length > 0 ? paginatedItems.map((item) => (
                            <tr key={item.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group ${selectedIds.has(item.id) ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''}`}>
                                <td className="px-4 py-4 text-center">
                                    <button onClick={() => toggleSelection(item.id)} className={`text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 ${selectedIds.has(item.id) ? 'text-teal-600 dark:text-teal-400' : ''}`}>
                                        {selectedIds.has(item.id) ? <CheckSquare className="w-5 h-5"/> : <Square className="w-5 h-5"/>}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                                    <div className="text-xs text-slate-400">ID: {item.id}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                        item.category === 'Medicine' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900' :
                                        item.category === 'Supply' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-900' :
                                        'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-900'
                                    }`}>
                                        {item.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden w-24">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${item.stock === 0 ? 'bg-slate-300' : item.stock < 10 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min(item.stock, 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className={`text-xs font-bold ${item.stock < 10 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {item.stock} {item.unit}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-700 dark:text-slate-200">KSh {item.price}</div>
                                    <div className="text-xs text-slate-400">Total: KSh {(item.price * item.stock).toLocaleString()}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {item.stock === 0 ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-slate-600">
                                            <X className="w-3 h-3" /> Out of Stock
                                        </span>
                                    ) : item.stock < 10 ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold border border-red-100 dark:border-red-900">
                                            <AlertTriangle className="w-3 h-3" /> Low Stock
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-900">
                                            <Check className="w-3 h-3" /> In Stock
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => openHistoryModal(item)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                                            title="View History"
                                        >
                                            <History className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => openRestockModal(item)}
                                            className="p-2 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400 transition-colors"
                                            title="Quick Restock"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => openEditModal(item)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                                            title="Edit Item"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-500 transition-colors"
                                            title="Delete Item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center">
                                        <Filter className="w-8 h-8 mb-3 opacity-20" />
                                        <p className="font-medium">No inventory items found.</p>
                                        <p className="text-xs mt-1">Try adjusting your filters or search terms.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        Showing page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Add/Edit Item Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-700/50">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {editingItem ? <Edit2 className="w-5 h-5 text-teal-600"/> : <Plus className="w-5 h-5 text-teal-600"/>}
                            {editingItem ? 'Edit Inventory Item' : 'Add New Item'}
                        </h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Item Name</label>
                            <input 
                                name="name"
                                value={newItem.name}
                                onChange={handleInputChange}
                                type="text" 
                                placeholder="e.g. Paracetamol 500mg" 
                                className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white transition-all font-medium"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</label>
                                <div className="relative">
                                    <select 
                                        name="category"
                                        value={newItem.category}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white transition-all appearance-none font-medium cursor-pointer"
                                    >
                                        <option value="Medicine">Medicine</option>
                                        <option value="Supply">Supply</option>
                                        <option value="Lab">Lab</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unit Type</label>
                                <input 
                                    name="unit"
                                    value={newItem.unit}
                                    onChange={handleInputChange}
                                    type="text" 
                                    placeholder="e.g. Tablets, Box" 
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Stock</label>
                                <input 
                                    name="stock"
                                    value={newItem.stock}
                                    onChange={handleInputChange}
                                    type="number" 
                                    min="0"
                                    placeholder="0" 
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white transition-all font-bold"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unit Price (KSh)</label>
                                <input 
                                    name="price"
                                    value={newItem.price}
                                    onChange={handleInputChange}
                                    type="number" 
                                    min="0"
                                    placeholder="0.00" 
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white transition-all font-bold"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="flex-1 py-3 text-white font-bold bg-teal-600 hover:bg-teal-700 rounded-xl shadow-lg shadow-teal-200 dark:shadow-none transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" />
                                {editingItem ? 'Save Changes' : 'Create Item'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Restock Modal */}
        {isRestockModalOpen && selectedItemForRestock && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-teal-600" />
                            Restock Item
                        </h3>
                         <button onClick={() => setIsRestockModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                    </div>
                    <form onSubmit={handleRestockSubmit} className="p-6">
                        <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Item</p>
                            <p className="font-bold text-slate-900 dark:text-white">{selectedItemForRestock.name}</p>
                            <div className="flex justify-between mt-2 text-sm">
                                <span className="text-slate-500">Current Stock:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{selectedItemForRestock.stock} {selectedItemForRestock.unit}</span>
                            </div>
                        </div>

                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Quantity to Add</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                min="1" 
                                autoFocus
                                value={restockAmount}
                                onChange={(e) => setRestockAmount(e.target.value)}
                                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-lg font-bold focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white mb-6"
                                placeholder="0"
                            />
                            <div className="absolute right-4 top-3.5 text-slate-400 font-medium text-sm">{selectedItemForRestock.unit}</div>
                        </div>

                        <div className="flex gap-3">
                             <button 
                                type="button" 
                                onClick={() => setIsRestockModalOpen(false)}
                                className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={!restockAmount || parseInt(restockAmount) <= 0}
                                className="flex-1 py-3 text-white font-bold bg-teal-600 hover:bg-teal-700 rounded-xl shadow-lg shadow-teal-200 dark:shadow-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Item History Modal */}
        {isHistoryOpen && selectedItemForHistory && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                     <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <History className="w-5 h-5 text-teal-600" />
                                Audit Log
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedItemForHistory.name}</p>
                        </div>
                        <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                    </div>
                    <div className="p-6 overflow-y-auto">
                        <div className="relative border-l-2 border-slate-100 dark:border-slate-700 ml-3 space-y-8">
                            {/* Mock History Data */}
                            {[
                                { action: 'Manual Adjustment', detail: 'Stock corrected from 45 to 40', date: '2 hrs ago', user: 'Dr. Andrew' },
                                { action: 'Restock', detail: 'Added 100 units', date: 'Yesterday, 4:00 PM', user: 'Nurse Sarah' },
                                { action: 'Price Update', detail: 'Price updated to KSh 150', date: 'Oct 24, 2023', user: 'Admin' },
                                { action: 'Created', detail: 'Item added to inventory', date: 'Sep 10, 2023', user: 'System' },
                            ].map((log, i) => (
                                <div key={i} className="relative pl-6">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800"></div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">{log.action}</h4>
                                    <p className="text-slate-600 dark:text-slate-300 text-xs mt-1">{log.detail}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full">{log.date}</span>
                                        <span className="text-[10px] text-slate-400">by {log.user}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 text-center">
                        <button className="text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline">View Full Report</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Pharmacy;
