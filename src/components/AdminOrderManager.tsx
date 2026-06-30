import React, { useState } from "react";
import { 
  ReceiptText, 
  Search, 
  Filter, 
  Clock, 
  Printer, 
  Download, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  FileText,
  Building,
  ArrowRight,
  User,
  AlertCircle
} from "lucide-react";
import { Order, TrackingEvent } from "../types";

interface OrderManagerProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onUpdateOrderStatusDB?: (orderId: string, status: Order["status"], tracking: TrackingEvent[]) => Promise<boolean>;
}

export const AdminOrderManager: React.FC<OrderManagerProps> = ({
  orders,
  setOrders,
  onUpdateOrderStatusDB
}) => {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Tracking details state to append new statuses
  const [newTrackTitle, setNewTrackTitle] = useState("Order packed and ready for dispatch");
  const [newTrackDesc, setNewTrackDesc] = useState("Bespoke wooden-crate protection applied.");
  const [newTrackLoc, setNewTrackLoc] = useState("Atelier Warehouse, SF");

  // Modify Order Status Pipeline Flow
  const handleStatusTransition = async (orderId: string, targetStatus: Order["status"]) => {
    const defaultTrackers: Record<Order["status"], { title: string; desc: string }> = {
      Pending: { title: "Order Placed", desc: "Awaiting administrator validation." },
      Processing: { title: "Confirmed & In Production", desc: "Our craft ateliers are preparing your curation." },
      Shipped: { title: "Dispatched from Atelier", desc: "Your crate is with white-glove shipping agents." },
      Delivered: { title: "Delivered to Sanctuary", desc: "Curations hand-received in flawless status." },
      Cancelled: { title: "Order Cancelled", desc: "Transaction gracefully terminated." },
      Returned: { title: "Return Approved", desc: "Courier has collected your items." }
    };

    const targetTracker = defaultTrackers[targetStatus] || { title: `Status updated to ${targetStatus}`, desc: "System updated details." };
    
    const newEvent: TrackingEvent = {
      title: targetTracker.title,
      description: targetTracker.desc,
      timestamp: new Date().toISOString(),
      location: "San Francisco Logistics Center",
      status: "current"
    };

    const updatedOrders = orders.map(ord => {
      if (ord.id === orderId) {
        // Complete previous tracks
        const updatedTracking = (ord.tracking || []).map(t => ({ ...t, status: "completed" as const }));
        const mergedTracking = [...updatedTracking, newEvent];

        if (onUpdateOrderStatusDB) {
          onUpdateOrderStatusDB(orderId, targetStatus, mergedTracking);
        }

        const updatedOrd: Order = {
          ...ord,
          status: targetStatus,
          tracking: mergedTracking
        };

        if (viewingOrder?.id === orderId) {
          setViewingOrder(updatedOrd);
        }
        return updatedOrd;
      }
      return ord;
    });

    setOrders(updatedOrders);
  };

  // Add Custom Tracking Update
  const handleAddCustomTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingOrder) return;

    const newEvent: TrackingEvent = {
      title: newTrackTitle,
      description: newTrackDesc,
      timestamp: new Date().toISOString(),
      location: newTrackLoc,
      status: "current"
    };

    const updatedOrders = orders.map(ord => {
      if (ord.id === viewingOrder.id) {
        const updatedTracking = (ord.tracking || []).map(t => ({ ...t, status: "completed" as const }));
        const mergedTracking = [...updatedTracking, newEvent];

        if (onUpdateOrderStatusDB) {
          onUpdateOrderStatusDB(ord.id, ord.status, mergedTracking);
        }

        const updatedOrd: Order = {
          ...ord,
          tracking: mergedTracking
        };
        setViewingOrder(updatedOrd);
        return updatedOrd;
      }
      return ord;
    });

    setOrders(updatedOrders);
    setNewTrackTitle("");
    setNewTrackDesc("");
  };

  // Filter orders
  const filteredOrders = orders.filter(ord => {
    const matchesSearch = ord.id.toLowerCase().includes(search.toLowerCase()) || 
                          ord.shippingAddress?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                          ord.shippingAddress?.phone?.includes(search) ||
                          ord.shippingAddress?.city?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = selectedStatus === "All" || ord.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalProcessing = orders.filter(o => o.status === "Processing" || o.status === "Pending").length;
  const totalDelivered = orders.filter(o => o.status === "Delivered").length;
  const totalCancelled = orders.filter(o => o.status === "Cancelled").length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Header with queue totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 border border-slate-100 rounded-[2.5rem] shadow-sm">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Live Queue volume</span>
          <span className="text-xl font-black text-black block leading-none mt-2 font-mono">
            {orders.length} Orders Logged
          </span>
        </div>
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100/50 flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-amber-700 uppercase block">Pending & Processing</span>
            <span className="text-sm font-black text-black font-mono">{totalProcessing} Transactions</span>
          </div>
        </div>
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-[#34C759] shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">Delivered Safely</span>
            <span className="text-sm font-black text-black font-mono">{totalDelivered} Homes</span>
          </div>
        </div>
        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100/50 flex items-center gap-3">
          <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-rose-700 uppercase block">Cancelled / Refunds</span>
            <span className="text-sm font-black text-black font-mono">{totalCancelled} Tickets</span>
          </div>
        </div>
      </div>

      {/* 2. Advanced table filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-5 border border-slate-100 rounded-[2rem] shadow-sm">
        <div className="relative col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="input-order-search"
            placeholder="Search by Order ID, Patron Name, Contact Phone, Logistics City..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F7F7F7] text-xs font-medium text-black pl-10 pr-4 py-3 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-[#34C759]"
          />
        </div>
        <div>
          <select
            id="select-order-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-[#F7F7F7] text-xs font-bold text-black px-4 py-3 border border-slate-100 rounded-xl outline-none appearance-none cursor-pointer"
          >
            <option value="All">All Pipeline Stages</option>
            <option value="Pending">Pending Validation</option>
            <option value="Processing">Processing Atelier</option>
            <option value="Shipped">Shipped In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Returned">Returned / Refund Request</option>
          </select>
        </div>
      </div>

      {/* 3. Primary Orders List Table */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider bg-[#FAFBFD]">
                <th className="py-4 px-5">ID Code</th>
                <th className="py-4 px-4">Logistics Timeline</th>
                <th className="py-4 px-4">Patron Details</th>
                <th className="py-4 px-4 text-right">Items / Volume</th>
                <th className="py-4 px-4 text-right">Cart Total</th>
                <th className="py-4 px-4 text-center">Status Index</th>
                <th className="py-4 px-5 text-right">System Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#FCFDFE]">
                  <td className="py-4 px-5 font-mono font-extrabold text-black uppercase">
                    #{ord.id.substring(0, 10)}...
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-500">
                    {new Date(ord.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-black">{ord.shippingAddress?.fullName || "Bespoke Collector"}</div>
                    <div className="text-[10px] text-slate-400 block mt-0.5">{ord.shippingAddress?.city}, {ord.shippingAddress?.state}</div>
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-slate-700">
                    {ord.items.length} Curations
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-extrabold text-black">
                    ${ord.total.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-block text-[8px] font-black uppercase px-2.5 py-1 rounded-full font-mono ${
                      ord.status === "Pending" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                      ord.status === "Processing" ? "bg-violet-50 text-violet-600 border border-violet-100" :
                      ord.status === "Shipped" ? "bg-sky-50 text-sky-600 border border-sky-100" :
                      ord.status === "Delivered" ? "bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20" :
                      "bg-rose-50 text-rose-600 border border-rose-100"
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        id={`btn-order-view-${ord.id}`}
                        onClick={() => setViewingOrder(ord)}
                        className="px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 border text-black font-bold uppercase text-[9px] tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Truck className="h-3 w-3 text-[#34C759]" />
                        <span>Logistics</span>
                      </button>
                      <button
                        id={`btn-invoice-${ord.id}`}
                        onClick={() => setInvoiceOrder(ord)}
                        className="px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 border text-black font-bold uppercase text-[9px] tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="h-3 w-3" />
                        <span>Invoice</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 font-sans">
                    No active shipments found in this logistics segment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEWING LOGISTICS & STATUS UPDATE PANEL */}
      {viewingOrder && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingOrder(null)}></div>
          
          <div className="w-full max-w-lg bg-white h-screen overflow-y-auto relative z-10 p-8 shadow-2xl flex flex-col justify-between scrollbar-thin">
            
            <div className="space-y-6">
              <div className="border-b pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-black uppercase tracking-tight">Active Logistics Calibration</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Order: #{viewingOrder.id}</span>
                </div>
                <button onClick={() => setViewingOrder(null)} className="text-xs font-bold uppercase text-slate-400 hover:text-black">Close</button>
              </div>

              {/* Status Pipeline Controller */}
              <div className="bg-[#F7F7F7] p-5 rounded-2xl border border-slate-100 space-y-3.5">
                <span className="block text-[10px] font-bold text-black uppercase tracking-widest font-mono">Transition Pipeline Status</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const).map(st => (
                    <button
                      key={st}
                      id={`btn-set-status-${st}`}
                      onClick={() => handleStatusTransition(viewingOrder.id, st)}
                      className={`py-2 rounded-xl text-[10px] font-extrabold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        viewingOrder.status === st
                          ? "bg-black text-white shadow"
                          : "bg-white border text-slate-600 hover:bg-neutral-50"
                      }`}
                    >
                      <CheckCircle2 className={`h-3 w-3 ${viewingOrder.status === st ? "text-[#34C759]" : "text-slate-300"}`} />
                      <span>{st}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Tracking timeline */}
              <div className="space-y-4">
                <span className="block text-[10px] font-bold text-black uppercase tracking-widest font-mono">Logistics Milestones</span>
                <div className="border-l-2 border-slate-100 pl-4 space-y-5 ml-2.5">
                  {(viewingOrder.tracking || []).map((t, idx) => (
                    <div key={idx} className="relative text-xs">
                      {/* Timeline Node */}
                      <div className={`absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-white shrink-0 ${
                        t.status === "current" ? "bg-[#34C759] ring-4 ring-[#34C759]/20" : "bg-black"
                      }`}></div>
                      <div>
                        <span className="font-extrabold text-black block text-xs">{t.title}</span>
                        <span className="text-slate-500 block text-[11px] mt-0.5">{t.description}</span>
                        <div className="flex gap-4 text-[9px] text-slate-400 font-mono mt-1">
                          <span>📍 {t.location}</span>
                          <span>🕒 {new Date(t.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Append new tracker event form */}
              <form onSubmit={handleAddCustomTrack} className="bg-[#F7F7F7] p-5 rounded-2xl border border-slate-100 space-y-4 text-xs">
                <span className="block text-[10px] font-bold text-black uppercase tracking-widest font-mono border-b pb-2">Inject Custom Waypoint Log</span>
                <div>
                  <label className="block text-[9px] text-slate-400 mb-1">Waypoint Milestone Title</label>
                  <input required value={newTrackTitle} onChange={e => setNewTrackTitle(e.target.value)} className="w-full bg-white border rounded-lg p-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 mb-1">Logistics Narration</label>
                  <input required value={newTrackDesc} onChange={e => setNewTrackDesc(e.target.value)} className="w-full bg-white border rounded-lg p-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 mb-1">Location Coordinate</label>
                  <input required value={newTrackLoc} onChange={e => setNewTrackLoc(e.target.value)} className="w-full bg-white border rounded-lg p-2 focus:outline-none" />
                </div>
                <button type="submit" className="w-full bg-black hover:bg-[#34C759] text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all">
                  Inject Logistics Update
                </button>
              </form>

            </div>

            <button onClick={() => setViewingOrder(null)} className="w-full py-3 bg-[#F7F7F7] text-black border rounded-xl font-bold uppercase text-[10px] tracking-wider mt-4">Close Details</button>
          </div>
        </div>
      )}

      {/* PRINT INVOICE DIALOG PREVIEW */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setInvoiceOrder(null)}></div>
          
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full relative z-10 max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 scrollbar-thin">
            
            {/* Invoice Printable block */}
            <div id="invoice-print-area" className="p-4 border rounded-2xl bg-white text-xs leading-relaxed font-sans text-slate-700">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-6">
                <div>
                  <h1 className="text-xl font-black text-black uppercase tracking-tight">Nayel Basket</h1>
                  <span className="text-[9px] text-slate-400 font-mono tracking-widest block uppercase mt-1">Exquisite Artisanal Home Decor</span>
                  <div className="text-[10px] text-slate-400 mt-2">
                    <p>Atelier Square, Suite 450</p>
                    <p>San Francisco, CA 94103</p>
                    <p>concierge@nayelbasket.com</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block text-[9px] font-black text-white bg-black px-3 py-1 rounded-lg uppercase tracking-wider font-mono">Invoice Receipt</span>
                  <div className="text-xs font-mono font-bold text-slate-700 mt-4 block">#{invoiceOrder.id.toUpperCase().substring(0, 12)}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Date: {new Date(invoiceOrder.date).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Bil To / Ship To info */}
              <div className="grid grid-cols-2 gap-4 py-6 border-b">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Billing Account</span>
                  <span className="font-bold text-black block">{invoiceOrder.shippingAddress?.fullName || "Bespoke Collector"}</span>
                  <span className="text-slate-500 block text-[10px] leading-relaxed mt-1">
                    {invoiceOrder.shippingAddress?.streetAddress},<br />
                    {invoiceOrder.shippingAddress?.city}, {invoiceOrder.shippingAddress?.state} - {invoiceOrder.shippingAddress?.postalCode || "94104"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Dispatch Mode</span>
                  <span className="font-bold text-black block">Elite White-Glove Shipping</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Crate Delivery Guaranteed</span>
                  <span className="text-[10px] text-black font-semibold font-mono block mt-1">Payment Method: {invoiceOrder.paymentMethod}</span>
                </div>
              </div>

              {/* Line items table */}
              <table className="w-full text-left border-collapse my-6">
                <thead>
                  <tr className="border-b text-slate-400 text-[9px] font-extrabold uppercase tracking-wider">
                    <th className="py-2">Curated Decor Curation</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs text-slate-600">
                  {invoiceOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5">
                        <span className="font-bold text-black">{item.product.name}</span>
                        {item.selectedSize && <span className="text-[10px] text-slate-400 block mt-0.5">Size: {item.selectedSize} | Color: {item.selectedColor}</span>}
                      </td>
                      <td className="py-2.5 text-right font-mono">${item.product.price}</td>
                      <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-black">${(item.product.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t pt-4 max-w-xs ml-auto space-y-2 text-xs text-right">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal Curation:</span>
                  <span className="font-mono font-bold">${(invoiceOrder.total * 0.9).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>White-Glove Shipping:</span>
                  <span className="font-mono text-[#34C759] font-bold">COMPLIMENTARY</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax Index (8%):</span>
                  <span className="font-mono font-bold">${(invoiceOrder.total * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-black font-extrabold text-sm border-t pt-2">
                  <span>Grand Net:</span>
                  <span className="font-mono text-black">${invoiceOrder.total.toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* Actions for dialog */}
            <div className="flex gap-2">
              <button
                id="btn-print-action"
                onClick={() => window.print()}
                className="flex-1 bg-black hover:bg-[#34C759] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Printer className="h-4 w-4" />
                <span>Trigger System Print</span>
              </button>
              <button
                onClick={() => setInvoiceOrder(null)}
                className="bg-[#F7F7F7] hover:bg-neutral-100 text-black border px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Dismiss
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
