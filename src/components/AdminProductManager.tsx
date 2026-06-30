import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  Download, 
  Upload, 
  Check, 
  AlertTriangle,
  Grid,
  Sparkles,
  Filter,
  Eye,
  EyeOff
} from "lucide-react";
import { Product } from "../types";

interface ProductManagerProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onAddProductDB?: (p: Product) => Promise<boolean>;
  onEditProductDB?: (p: Product) => Promise<boolean>;
  onDeleteProductDB?: (id: string) => Promise<boolean>;
}

export const AdminProductManager: React.FC<ProductManagerProps> = ({
  products,
  setProducts,
  onAddProductDB,
  onEditProductDB,
  onDeleteProductDB
}) => {
  // Navigation & State managers
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [filterStock, setFilterStock] = useState<"all" | "low" | "out">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal / Form state managers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Core Form Input fields
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("150");
  const [origPrice, setOrigPrice] = useState("220");
  const [stock, setStock] = useState("25");
  const [category, setCategory] = useState("Furniture");
  const [image, setImage] = useState("");
  const [desc, setDesc] = useState("");
  
  // Specific detail input fields
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [material, setMaterial] = useState("");
  const [tags, setTags] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  
  // Badging flags
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const categories = ["Furniture", "Lighting", "Vases & Pots", "Rugs & Carpets", "Wall Decor", "Gifts & Atelier"];

  // Open Form for Adding
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName("");
    setBrand("Nayel Heritage");
    setPrice("150");
    setOrigPrice("200");
    setStock("25");
    setCategory("Furniture");
    setImage("https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=600&q=80");
    setDesc("Bespoke luxury decor piece cast to elevate modern living architectures.");
    setSku(`NB-PROD-${Math.floor(Math.random() * 9000 + 1000)}`);
    setBarcode(`880${Math.floor(Math.random() * 900000 + 100000)}`);
    setWeight("1.2 kg");
    setDimensions("30cm x 15cm x 15cm");
    setMaterial("Organic Clay");
    setTags("Ceramic, Premium, Modern");
    setSeoTitle("");
    setSeoDesc("");
    setIsFeatured(false);
    setIsTrending(false);
    setIsNewArrival(true);
    setIsBestSeller(false);
    setIsVisible(true);
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setBrand(p.brand);
    setPrice(p.price.toString());
    setOrigPrice(p.originalPrice.toString());
    setStock(p.stock.toString());
    setCategory(p.category);
    setImage(p.image);
    setDesc(p.description);
    setSku(p.sku || `NB-${Math.floor(Math.random() * 900 + 100)}`);
    setBarcode(p.specifications?.barcode || `880${Math.floor(Math.random() * 90000 + 10000)}`);
    setWeight(p.specifications?.weight || "1.0 kg");
    setDimensions(p.specifications?.dimensions || "15cm x 15cm x 20cm");
    setMaterial(p.specifications?.material || "Ceramic");
    setTags(p.tags?.join(", ") || "");
    setSeoTitle(p.specifications?.seoTitle || p.name);
    setSeoDesc(p.specifications?.seoDesc || p.description.substring(0, 80));
    setIsFeatured(p.tags?.includes("featured") || false);
    setIsTrending(p.tags?.includes("trending") || false);
    setIsNewArrival(p.tags?.includes("new") || true);
    setIsBestSeller(p.tags?.includes("best") || false);
    setIsVisible(p.stock > 0);
    setIsFormOpen(true);
  };

  // Delete Action
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product curation?")) {
      if (onDeleteProductDB) {
        await onDeleteProductDB(id);
      }
      setProducts(prev => prev.filter(p => p.id !== id));
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  // Duplicate Action
  const handleDuplicate = async (p: Product) => {
    const dup: Product = {
      ...p,
      id: `prod_${Date.now()}`,
      name: `${p.name} (Copy)`,
      sku: `${p.sku}-DUP`,
      rating: 5,
      reviewCount: 0,
      reviews: []
    };
    if (onAddProductDB) {
      await onAddProductDB(dup);
    }
    setProducts(prev => [dup, ...prev]);
  };

  // Submit Form Action
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);
    if (isFeatured) tagArray.push("featured");
    if (isTrending) tagArray.push("trending");
    if (isNewArrival) tagArray.push("new");
    if (isBestSeller) tagArray.push("best");

    if (editingProduct) {
      // Editing
      const updated: Product = {
        ...editingProduct,
        name,
        brand,
        price: Number(price),
        originalPrice: Number(origPrice),
        stock: Number(stock),
        category,
        image,
        description: desc,
        tags: tagArray,
        sku,
        specifications: {
          weight,
          dimensions,
          material,
          barcode,
          seoTitle: seoTitle || name,
          seoDesc: seoDesc || desc.substring(0, 100)
        }
      };
      if (onEditProductDB) {
        await onEditProductDB(updated);
      }
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
    } else {
      // Adding New
      const added: Product = {
        id: `prod_${Date.now()}`,
        name,
        brand,
        price: Number(price),
        originalPrice: Number(origPrice),
        stock: Number(stock),
        category,
        image,
        description: desc,
        tags: tagArray,
        sku,
        rating: 5.0,
        reviewCount: 0,
        reviews: [],
        qa: [],
        sellerId: "nayel-curator",
        sellerName: "Nayel Basket Elite",
        features: ["Premium Polish finish", "Artisanal handcrafting"],
        specifications: {
          weight,
          dimensions,
          material,
          barcode,
          seoTitle: seoTitle || name,
          seoDesc: seoDesc || desc.substring(0, 100)
        }
      };
      if (onAddProductDB) {
        await onAddProductDB(added);
      }
      setProducts(prev => [added, ...prev]);
    }
    setIsFormOpen(false);
  };

  // Bulk actions
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} selected products?`)) {
      setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    }
  };

  // Bulk status update
  const handleBulkStatus = (visible: boolean) => {
    if (selectedIds.length === 0) return;
    setProducts(prev => prev.map(p => {
      if (selectedIds.includes(p.id)) {
        return { ...p, stock: visible ? Math.max(p.stock, 5) : 0 };
      }
      return p;
    }));
    setSelectedIds([]);
  };

  // CSV/Excel Export function
  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Brand", "SKU", "Price", "Original Price", "Category", "Stock"];
    const rows = products.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.brand,
      p.sku || "N/A",
      p.price,
      p.originalPrice,
      p.category,
      p.stock
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "nayel_basket_products_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV/Excel Import simulator
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    alert("Enterprise CSV Parser Engine initiated. Mock verifying schema & bulk injecting products.");
  };

  // Filtering Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku?.toLowerCase().includes(search.toLowerCase()) ||
                          p.brand.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === "All" || p.category === selectedCat;
    
    let matchesStock = true;
    if (filterStock === "low") matchesStock = p.stock > 0 && p.stock <= 5;
    if (filterStock === "out") matchesStock = p.stock === 0;

    return matchesSearch && matchesCat && matchesStock;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Upper action control banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-slate-100 rounded-[2.5rem] shadow-sm">
        <div>
          <h2 className="text-base font-black text-black uppercase tracking-tight">Curation Atelier & Product Registry</h2>
          <p className="text-[10px] text-slate-400 font-medium font-sans mt-0.5">Manage and calibrate exquisite home decor items, variants, and stock balances.</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button
            id="btn-import-excel"
            onClick={() => document.getElementById("csv-file-picker")?.click()}
            className="px-4 py-2.5 bg-[#F7F7F7] hover:bg-neutral-100 border text-black text-[10px] font-bold uppercase rounded-xl tracking-wider cursor-pointer flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import CSV</span>
          </button>
          <input 
            type="file" 
            id="csv-file-picker" 
            accept=".csv" 
            onChange={handleImportCSV} 
            className="hidden" 
          />
          <button
            id="btn-export-excel"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-[#F7F7F7] hover:bg-neutral-100 border text-black text-[10px] font-bold uppercase rounded-xl tracking-wider cursor-pointer flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            id="btn-add-product-open"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-black hover:bg-[#34C759] text-white text-[10px] font-bold uppercase rounded-xl tracking-wider cursor-pointer flex items-center gap-1.5 shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Grid Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 border border-slate-100 rounded-[2rem] shadow-sm">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="input-product-search"
            placeholder="Search by Title, Brand, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F7F7F7] text-xs font-medium text-black pl-10 pr-4 py-3 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-[#34C759]"
          />
        </div>

        {/* Categories Selector */}
        <div className="relative">
          <select
            id="select-product-cat"
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full bg-[#F7F7F7] text-xs font-bold text-black px-4 py-3 border border-slate-100 rounded-xl outline-none appearance-none cursor-pointer"
          >
            <option value="All">All Categories ({products.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Stock status filter */}
        <div className="relative">
          <select
            id="select-product-stock"
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value as any)}
            className="w-full bg-[#F7F7F7] text-xs font-bold text-black px-4 py-3 border border-slate-100 rounded-xl outline-none appearance-none cursor-pointer"
          >
            <option value="all">Stock Health: All</option>
            <option value="low">Stock Health: Low Stock (≤ 5)</option>
            <option value="out">Stock Health: Out of Stock</option>
          </select>
        </div>

        {/* Clear indicators / counts */}
        <div className="flex items-center justify-end px-2 text-[11px] font-bold text-slate-400 font-mono">
          Showing {filteredProducts.length} curations
        </div>

      </div>

      {/* Bulk actions banner if items are selected */}
      {selectedIds.length > 0 && (
        <div className="bg-black text-white px-6 py-4 rounded-2xl flex justify-between items-center animate-fade-in shadow-xl text-xs font-bold">
          <span>{selectedIds.length} Products Selected</span>
          <div className="flex gap-2">
            <button
              id="btn-bulk-visible"
              onClick={() => handleBulkStatus(true)}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl uppercase text-[10px]"
            >
              Make In Stock
            </button>
            <button
              id="btn-bulk-invisible"
              onClick={() => handleBulkStatus(false)}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl uppercase text-[10px]"
            >
              Make Out of Stock
            </button>
            <button
              id="btn-bulk-delete"
              onClick={handleBulkDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl uppercase text-[10px]"
            >
              Delete Bulk
            </button>
          </div>
        </div>
      )}

      {/* Main Table view of Products */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider bg-[#FAFBFD]">
                <th className="py-4 px-5 text-center w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleSelectAll}
                    className="cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4">Item details</th>
                <th className="py-4 px-4">SKU / Barcode</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4 text-right">Price Grid</th>
                <th className="py-4 px-4 text-center">Stock</th>
                <th className="py-4 px-4 text-center">Badges</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {filteredProducts.map((p) => {
                const isChecked = selectedIds.includes(p.id);
                return (
                  <tr key={p.id} className={`hover:bg-[#FCFDFE] transition ${isChecked ? "bg-[#34C759]/5" : ""}`}>
                    <td className="py-4 px-5 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(p.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3.5">
                        <img src={p.image} className="w-11 h-11 object-cover rounded-xl border border-slate-100 shrink-0 shadow-sm" />
                        <div className="truncate max-w-xs">
                          <span className="font-extrabold text-black block truncate text-xs leading-normal">{p.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block mt-0.5">{p.brand}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-[10px]">
                      <span className="block font-bold text-slate-700">{p.sku || "N/A"}</span>
                      <span className="block text-slate-400 mt-0.5">BC: {p.specifications?.barcode || "None"}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {p.category}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-xs">
                      <span className="block font-extrabold text-black">${p.price}</span>
                      {p.originalPrice > p.price && (
                        <span className="block text-[10px] text-slate-400 line-through mt-0.5">${p.originalPrice}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block font-mono font-bold text-[10px] px-2 py-0.5 rounded-lg border ${
                        p.stock === 0 ? "bg-rose-50 text-rose-600 border-rose-100" :
                        p.stock <= 5 ? "bg-amber-50 text-amber-600 border-amber-100" :
                        "bg-emerald-50 text-emerald-600 border-emerald-100"
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-wrap gap-1 justify-center max-w-[12rem] mx-auto">
                        {p.tags?.includes("featured") && (
                          <span className="text-[8px] font-bold uppercase bg-black text-white px-1.5 py-0.5 rounded font-mono">FEAT</span>
                        )}
                        {p.tags?.includes("trending") && (
                          <span className="text-[8px] font-bold uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded font-mono">TREND</span>
                        )}
                        {p.tags?.includes("new") && (
                          <span className="text-[8px] font-bold uppercase bg-[#34C759] text-white px-1.5 py-0.5 rounded font-mono">NEW</span>
                        )}
                        {p.tags?.includes("best") && (
                          <span className="text-[8px] font-bold uppercase bg-violet-600 text-white px-1.5 py-0.5 rounded font-mono">BEST</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right shrink-0">
                      <div className="flex justify-end gap-1.5">
                        <button
                          id={`btn-duplicate-${p.id}`}
                          onClick={() => handleDuplicate(p)}
                          title="Duplicate item"
                          className="p-1.5 bg-neutral-50 hover:bg-neutral-100 text-slate-500 hover:text-black rounded-lg border cursor-pointer transition-all"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          id={`btn-edit-prod-${p.id}`}
                          onClick={() => handleOpenEdit(p)}
                          title="Edit product parameters"
                          className="p-1.5 bg-neutral-50 hover:bg-neutral-100 text-slate-500 hover:text-[#34C759] rounded-lg border cursor-pointer transition-all"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          id={`btn-delete-prod-${p.id}`}
                          onClick={() => handleDelete(p.id)}
                          title="Delete curation"
                          className="p-1.5 bg-neutral-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg border cursor-pointer transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 font-sans">
                    No items match the currently configured catalog filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add/Edit Dialog Slider */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
          
          <div className="w-full max-w-2xl bg-white h-screen overflow-y-auto relative z-10 p-8 shadow-2xl flex flex-col justify-between scrollbar-thin">
            
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="border-b pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-black uppercase tracking-tight">
                    {editingProduct ? "Revise Exquisite Curation Spec" : "Introduce New Artisanal Curation"}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Calibrate details, dimension rules, materials, and warehouse counts.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-black"
                >
                  Close
                </button>
              </div>

              {/* Core Attributes */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Product Curation Title</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black focus:outline-none focus:bg-white focus:border-[#34C759]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Artisanal Brand Curation</label>
                  <input required value={brand} onChange={e => setBrand(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black focus:outline-none focus:bg-white focus:border-[#34C759]" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Price ($)</label>
                  <input type="number" required value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black font-mono focus:outline-none focus:bg-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Original Price ($)</label>
                  <input type="number" required value={origPrice} onChange={e => setOrigPrice(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black font-mono focus:outline-none focus:bg-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Stock Quantity</label>
                  <input type="number" required value={stock} onChange={e => setStock(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black font-mono focus:outline-none focus:bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Category Allocation</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black font-bold focus:outline-none">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Bespoke Image URL</label>
                  <input required value={image} onChange={e => setImage(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black focus:outline-none" />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Curation Narration (Description)</label>
                <textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black focus:outline-none focus:bg-white focus:border-[#34C759]"></textarea>
              </div>

              {/* Advanced Technical metrics */}
              <div className="border-t pt-4 space-y-4">
                <span className="block text-[10px] font-extrabold text-black uppercase tracking-widest font-mono">Atelier Spec & SEO Configuration</span>
                
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">SKU ID</label>
                    <input value={sku} onChange={e => setSku(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Barcode (UPC)</label>
                    <input value={barcode} onChange={e => setBarcode(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Dimensions Spec</label>
                    <input value={dimensions} onChange={e => setDimensions(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Weight (kg)</label>
                    <input value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Primary Material</label>
                    <input value={material} onChange={e => setMaterial(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Tags (comma split)</label>
                    <input value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black" />
                  </div>
                </div>

                {/* Meta SEO Inputs */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Meta SEO Title Override</label>
                    <input placeholder={name} value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Meta SEO Description</label>
                    <input placeholder={desc.substring(0, 40)} value={seoDesc} onChange={e => setSeoDesc(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black" />
                  </div>
                </div>
              </div>

              {/* Marketing Badges Flags */}
              <div className="border-t pt-4 space-y-3">
                <span className="block text-[10px] font-extrabold text-black uppercase tracking-widest font-mono">Curation Display Badges</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2.5 p-3 bg-[#F7F7F7] rounded-xl cursor-pointer">
                    <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
                    <span className="text-[10px] font-bold text-black uppercase">Featured</span>
                  </label>
                  <label className="flex items-center gap-2.5 p-3 bg-[#F7F7F7] rounded-xl cursor-pointer">
                    <input type="checkbox" checked={isTrending} onChange={e => setIsTrending(e.target.checked)} />
                    <span className="text-[10px] font-bold text-black uppercase">Trending</span>
                  </label>
                  <label className="flex items-center gap-2.5 p-3 bg-[#F7F7F7] rounded-xl cursor-pointer">
                    <input type="checkbox" checked={isNewArrival} onChange={e => setIsNewArrival(e.target.checked)} />
                    <span className="text-[10px] font-bold text-black uppercase">New Arrival</span>
                  </label>
                  <label className="flex items-center gap-2.5 p-3 bg-[#F7F7F7] rounded-xl cursor-pointer">
                    <input type="checkbox" checked={isBestSeller} onChange={e => setIsBestSeller(e.target.checked)} />
                    <span className="text-[10px] font-bold text-black uppercase">Best Seller</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t flex gap-3">
                <button
                  id="btn-product-submit"
                  type="submit"
                  className="flex-1 bg-black hover:bg-[#34C759] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg transition-all"
                >
                  {editingProduct ? "Save Calibrated Product Curation" : "Inject Product Into Active Catalog"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-[#F7F7F7] hover:bg-neutral-100 text-black border px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
