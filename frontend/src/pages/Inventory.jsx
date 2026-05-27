import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Boxes, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Pill, 
  Scissors, 
  Activity, 
  ShieldAlert, 
  ClipboardList,
  CreditCard,
  CheckCircle2,
  Lock,
  X,
  Coins
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Inventory() {
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchasedOrders, setPurchasedOrders] = useState([]);

  // Mock Payment Gateway States
  const [showMockGateway, setShowMockGateway] = useState(false);
  const [activePaymentItem, setActivePaymentItem] = useState(null);
  const [mockGatewayLoading, setMockGatewayLoading] = useState(false);
  const [mockCardName, setMockCardName] = useState("");
  const [mockCardNumber, setMockCardNumber] = useState("");
  const [mockCardExpiry, setMockCardExpiry] = useState("");
  const [mockCardCvv, setMockCardCvv] = useState("");

  // Price & Quantity states
  const [itemPrice, setItemPrice] = useState("");
  const [quantities, setQuantities] = useState({});

  const increaseQty = (name) => {
    setQuantities(prev => ({ ...prev, [name]: (prev[name] || 1) + 1 }));
  };

  const decreaseQty = (name) => {
    setQuantities(prev => ({ ...prev, [name]: Math.max((prev[name] || 1) - 1, 1) }));
  };

  // ==================================
  // FETCH INVENTORY & PAID ORDERS
  // ==================================
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [invRes, ordersRes] = await Promise.all([
        axios.get("http://localhost/api/v1/inventory"),
        axios.get("http://localhost/api/v1/inventory/orders")
      ]);
      setItems(invRes.data);
      setPurchasedOrders(ordersRes.data);
      setError("");
    } catch (error) {
      console.error("Inventory Fetch Error:", error);
      setError("Failed to connect to the medical supplies ledger database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();

    // Dynamically append the Razorpay Checkout SDK Script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // ==================================
  // ADD ITEM
  // ==================================
  const addItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      setError("Please specify a valid item name to register.");
      return;
    }

    try {
      const payload = {
        name: itemName.trim()
      };
      if (itemPrice) {
        payload.price = parseFloat(itemPrice);
      }
      await axios.post("http://localhost/api/v1/inventory", payload);
      setItemName("");
      setItemPrice("");
      setError("");
      fetchInventory();
    } catch (error) {
      console.error("Inventory Add Error:", error);
      setError("Failed to register supply item to inventory.");
    }
  };

  // ==================================
  // DELETE ITEM
  // ==================================
  const deleteItem = async (name) => {
    try {
      await axios.delete(`http://localhost/api/v1/inventory/${name}`);
      fetchInventory();
    } catch (error) {
      console.error("Inventory Delete Error:", error);
      setError("Failed to remove item from stock registry.");
    }
  };

  // ==========================================
  // INITIATE RAZORPAY CHECKOUT IN INR (₹)
  // ==========================================
  const handleBuyItem = async (item, qty = 1) => {
    try {
      setError("");
      const finalPrice = item.price * qty;
      const checkoutLabel = `${qty}x ${item.name}`;
      
      // 1. Create a payment order on backend microservice
      const orderRes = await axios.post("http://localhost/api/v1/inventory/order/create", {
        item_name: checkoutLabel,
        amount: finalPrice
      });

      const { razorpay_order, key_id, merchant_name } = orderRes.data;

      // 2. Launch the Mock Payment Gateway if using a mock Key ID or Razorpay isn't available
      if (key_id.startsWith("rzp_test_mockKeyId") || !window.Razorpay) {
        setActivePaymentItem({
          item: {
            ...item,
            name: checkoutLabel,
            price: finalPrice
          },
          order_id: razorpay_order.id,
          razorpay_order,
          key_id,
          merchant_name
        });
        setShowMockGateway(true);
        return;
      }

      // 3. Trigger Real Razorpay Secure Checkout Overlay Modal
      const options = {
        key: key_id,
        amount: razorpay_order.amount,
        currency: "INR",
        name: merchant_name,
        description: `Order Supply for ${checkoutLabel}`,
        order_id: razorpay_order.id,
        prefill: {
          name: "Hospital Admin",
          email: "admin@vectorhms.com",
          contact: "9999999999"
        },
        theme: {
          color: "#2563eb" // Blue matching brand colors
        },
        handler: async function (response) {
          try {
            // 4. Verify payment signature on backend
            const verifyRes = await axios.post("http://localhost/api/v1/inventory/order/verify", {
              razorpay_order_id: response.razorpay_order_id || razorpay_order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              item_name: checkoutLabel
            });
            if (verifyRes.data.success) {
              alert(`Success! Purchased ${checkoutLabel} for ₹${finalPrice}.`);
              fetchInventory();
            }
          } catch (err) {
            console.error("Payment Verification Failed:", err);
            setError("Payment verification failed. Check server configurations.");
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();

    } catch (err) {
      console.error("Order Creation Error:", err);
      setError("Failed to initialize payment gateway checkout.");
    }
  };

  // Dynamic Keyword Auto-Categorization Helper
  const getCategoryDetails = (itemName) => {
    const name = itemName.toLowerCase();
    
    if (name.includes("glove") || name.includes("mask") || name.includes("gown") || name.includes("ppe")) {
      return {
        label: "Personal Protective Equipment",
        icon: ShieldAlert,
        bg: "bg-blue-50/70 text-blue-600 border-blue-100/50",
      };
    }
    
    if (name.includes("tablet") || name.includes("pill") || name.includes("vaccine") || name.includes("medicine")) {
      return {
        label: "Pharmaceuticals",
        icon: Pill,
        bg: "bg-emerald-50/70 text-emerald-600 border-emerald-100/50",
      };
    }
    
    if (name.includes("scalpel") || name.includes("forceps") || name.includes("suture") || name.includes("scissors")) {
      return {
        label: "Surgical Instruments",
        icon: Scissors,
        bg: "bg-rose-50/70 text-rose-600 border-rose-100/50",
      };
    }
    
    if (name.includes("monitor") || name.includes("ventilator") || name.includes("bed")) {
      return {
        label: "Critical Equipment",
        icon: Activity,
        bg: "bg-amber-50/70 text-amber-600 border-amber-100/50",
      };
    }
    
    return {
      label: "General Supplies",
      icon: ClipboardList,
      bg: "bg-slate-50/70 text-slate-500 border-slate-200/50",
    };
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight sm:text-3xl">
          Clinical Inventory & Stocks
        </h1>
        <p className="text-sm font-medium text-slate-400 mt-1">
          Monitor medical instruments, buy supplies in Indian Rupees (₹), and verify gateway transactions.
        </p>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center gap-3 text-rose-800 text-sm font-semibold">
          <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* MAIN CONTAINER: Flex Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: Supply Registration Form */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm sticky top-24 space-y-6">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Boxes className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-base font-bold text-slate-800">
                Register Supply Entry
              </h2>
            </div>

            <form onSubmit={addItem} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Item Name / Description
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., Syringes Box"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-sm font-semibold outline-none transition-all duration-150"
                  />
                  <Boxes className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Unit Price (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g., 150 (Leave blank for dynamic)"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-sm font-semibold outline-none transition-all duration-150"
                  />
                  <Coins className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl py-3 text-sm font-bold shadow-md shadow-amber-100 flex items-center justify-center gap-2 cursor-pointer transition-colors duration-150"
              >
                <Plus className="h-4 w-4" />
                Register Inventory Item
              </motion.button>
            </form>
          </div>

          {/* Paid Purchases Logs Container */}
          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              Verified Receipts
            </h3>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {purchasedOrders.length > 0 ? (
                purchasedOrders.map((order, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-700 line-clamp-1">{order.item_name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">ID: {order.payment_id?.substring(0, 14)}</p>
                    </div>
                    <span className="font-extrabold text-emerald-600 flex-shrink-0 text-right">
                      ₹{order.amount}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 font-semibold py-4 text-center">
                  No successful purchases logged yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Supply Ledger Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">Hospital Supply Ledger</h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                Manage stock and purchase direct clinical replacements.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-500">
              {items.length} Registered Items
            </span>
          </div>

          {loading ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 flex flex-col items-center justify-center gap-2 shadow-sm">
              <div className="h-8 w-8 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400">Refreshing Stock Catalogs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AnimatePresence initial={false}>
                {items.length > 0 ? (
                  items.map((item, index) => {
                    const category = getCategoryDetails(item.name);
                    const CatIcon = category.icon;

                    return (
                      <motion.div
                        key={item.name + "-" + index}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-52 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-50/40 rounded-bl-full pointer-events-none" />

                        {/* Top: Icon and price tag */}
                        <div className="flex items-start justify-between">
                          <div className={`h-10 w-10 rounded-xl ${category.bg} flex items-center justify-center border`}>
                            <CatIcon className="h-5 w-5" />
                          </div>
                          
                          <span className="font-extrabold text-slate-800 text-lg tracking-tight">
                            ₹{item.price ?? 500}
                          </span>
                        </div>

                        {/* Middle: Title & category info */}
                        <div className="my-3">
                          <h3 className="text-base font-bold text-slate-800 tracking-tight line-clamp-1">
                            {item.name}
                          </h3>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mt-1">
                            {category.label}
                          </span>
                        </div>

                        {/* Bottom Action Group */}
                        <div className="border-t border-slate-50 pt-3 flex justify-between items-center gap-4">
                          <button
                            onClick={() => deleteItem(item.name)}
                            className="text-[11px] font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors duration-150 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Quantity Selector buttons */}
                            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                              <button
                                type="button"
                                onClick={() => decreaseQty(item.name)}
                                className="h-5 w-5 flex items-center justify-center text-[10px] font-bold text-slate-400 hover:text-slate-700 bg-white rounded border border-slate-100 hover:shadow-sm cursor-pointer select-none"
                              >
                                -
                              </button>
                              <span className="w-6 text-center text-xs font-black text-slate-600 select-none">
                                {quantities[item.name] || 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => increaseQty(item.name)}
                                className="h-5 w-5 flex items-center justify-center text-[10px] font-bold text-slate-400 hover:text-slate-700 bg-white rounded border border-slate-100 hover:shadow-sm cursor-pointer select-none"
                              >
                                +
                              </button>
                            </div>

                            <motion.button
                              whileHover={{ y: -1 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleBuyItem(item, quantities[item.name] || 1)}
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-bold shadow-sm shadow-blue-100 flex items-center gap-1 cursor-pointer transition-colors duration-150"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              Buy
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-full bg-white border border-slate-100 rounded-2xl p-12 text-center text-sm font-semibold text-slate-400 shadow-sm">
                    No clinical stock registry items registered.
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>
      {/* Custom Mock Secure Payment Gateway Modal Overlay */}
      <AnimatePresence>
        {showMockGateway && activePaymentItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white flex justify-between items-center relative">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <Lock className="h-4.5 w-4.5 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm tracking-tight">Secure Payment Gateway</h3>
                    <p className="text-[10px] text-blue-100 font-semibold uppercase tracking-wider mt-0.5">VectorHMS Sandbox Checkout</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowMockGateway(false);
                    setActivePaymentItem(null);
                    setMockGatewayLoading(false);
                  }}
                  className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-5">
                {/* Order summary card */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Purchasing Item</span>
                    <h4 className="font-extrabold text-sm text-slate-700 mt-0.5">{activePaymentItem.item.name}</h4>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1">Merchant: {activePaymentItem.merchant_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Amount</span>
                    <span className="font-black text-xl text-blue-600 block mt-0.5">₹{activePaymentItem.item.price}</span>
                  </div>
                </div>

                {/* Form Input simulation */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Dr. Rajesh Pandey"
                      value={mockCardName}
                      onChange={(e) => setMockCardName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs font-semibold outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        maxLength={19}
                        value={mockCardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                          setMockCardNumber(val);
                        }}
                        className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs font-semibold outline-none transition-all pl-10"
                      />
                      <CreditCard className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={mockCardExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length >= 2) {
                            val = val.slice(0, 2) + '/' + val.slice(2, 4);
                          }
                          setMockCardExpiry(val);
                        }}
                        className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs font-semibold outline-none transition-all text-center"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">CVV Code</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={3}
                        value={mockCardCvv}
                        onChange={(e) => setMockCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs font-semibold outline-none transition-all text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Secure transaction indicators */}
                <div className="flex items-center justify-center gap-1.5 text-slate-400 py-1 border-y border-slate-50">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">128-bit SSL Encrypted Sandbox Session</span>
                </div>

                {/* Actions */}
                <div className="space-y-2.5 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={mockGatewayLoading}
                    onClick={async () => {
                      setMockGatewayLoading(true);
                      try {
                        const verifyRes = await axios.post("http://localhost/api/v1/inventory/order/verify", {
                          razorpay_order_id: activePaymentItem.razorpay_order.id,
                          razorpay_payment_id: "pay_sandbox_" + Math.random().toString(36).substring(2, 10),
                          razorpay_signature: "mock_signature_approved",
                          item_name: activePaymentItem.item.name
                        });
                        if (verifyRes.data.success) {
                          alert(`Success! Purchased ${activePaymentItem.item.name} for ₹${activePaymentItem.item.price}.`);
                          setShowMockGateway(false);
                          setActivePaymentItem(null);
                          setMockCardName("");
                          setMockCardNumber("");
                          setMockCardExpiry("");
                          setMockCardCvv("");
                          fetchInventory();
                        }
                      } catch (e) {
                        console.error("Verification failed:", e);
                        alert("Error verifying simulated transaction.");
                      } finally {
                        setMockGatewayLoading(false);
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl py-3 text-xs font-bold shadow-md shadow-blue-100 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    {mockGatewayLoading ? (
                      <div className="h-4.5 w-4.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Simulate Success Payment
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={mockGatewayLoading}
                    onClick={() => {
                      setMockGatewayLoading(true);
                      setTimeout(() => {
                        alert("Payment declined. Transaction failed.");
                        setMockGatewayLoading(false);
                        setShowMockGateway(false);
                        setActivePaymentItem(null);
                      }, 800);
                    }}
                    className="w-full bg-slate-50 border border-slate-100 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 text-slate-500 rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    Simulate Declined / Fail Card
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Inventory;