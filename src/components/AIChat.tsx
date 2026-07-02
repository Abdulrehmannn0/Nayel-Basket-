/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Message, Product } from "../types";
import { 
  Send, 
  Sparkles, 
  ArrowLeft, 
  Ruler, 
  Layers, 
  Mic, 
  Camera, 
  QrCode, 
  Loader2, 
  Plus, 
  Check, 
  HelpCircle,
  ThumbsUp,
  Layout,
  Maximize2,
  Volume2,
  VolumeX,
  Languages,
  Trash2,
  RefreshCw
} from "lucide-react";

export const AIChat: React.FC = () => {
  const { products, addToCart, addNotification, theme } = useApp();
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("nb_ai_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn("Stale chat history ignored:", e);
      }
    }
    return [
      {
        id: "welcome",
        sender: "ai",
        text: "Greetings! I am the **Nayel Basket AI Concierge** – your private digital interior designer, styling consultant, and decor specialist. \n\nHow can I help you elevate your home today? Here is what I can assist you with right now:",
        timestamp: new Date().toISOString()
      }
    ];
  });
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    const saved = localStorage.getItem("nb_ai_auto_speak");
    return saved !== "false"; // Default to true
  });
  const [voiceLang, setVoiceLang] = useState<"en-US" | "hi-IN">(() => {
    const saved = localStorage.getItem("nb_ai_voice_lang");
    return (saved as "en-US" | "hi-IN") || "en-US";
  });

  // Keep history, autoSpeak, and voiceLang persisted
  useEffect(() => {
    localStorage.setItem("nb_ai_chat_history", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("nb_ai_auto_speak", String(autoSpeak));
  }, [autoSpeak]);

  useEffect(() => {
    localStorage.setItem("nb_ai_voice_lang", voiceLang);
  }, [voiceLang]);

  // Space Configurator states
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [sizeHeight, setSizeHeight] = useState("280"); // Ceiling height
  const [sizeWeight, setSizeWeight] = useState("35"); // Room area
  const [sizePref, setSizePref] = useState("minimalist"); // Design style
  const [sizeResult, setSizeResult] = useState<any>(null);

  // Room design state
  const [showOutfitModal, setShowOutfitModal] = useState(false);
  const [occasionInput, setOccasionInput] = useState("Cozy modern Scandinavian living room setup");

  // Registry scanning states
  const [showScanner, setShowScanner] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const speakResponse = (text: string, force = false) => {
    if (!force && !autoSpeak) return;
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      // Remove markdown characters and formatting for clean reading
      const cleanText = text.replace(/[*#`_\-\n]/g, " ").replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 240));
      
      // Auto-detect Hindi characters
      const hasHindi = /[\u0900-\u097F]/.test(cleanText);
      if (hasHindi) {
        utterance.lang = "hi-IN";
      } else {
        utterance.lang = voiceLang; // Can be en-US or hi-IN (which speech engines often use for Hinglish accent)
      }
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis failed to speak:", e);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    if (!textToSend) {
      setInputMessage("");
    }

    // If it's a retry, we can clean up any error message at the end
    setMessages((prev) => {
      // Remove any trailing error message if we are retrying
      const filtered = prev.filter((m) => !m.isError);
      
      // Check if user's last message is identical to avoid double-printing
      const lastMsg = filtered[filtered.length - 1];
      if (lastMsg && lastMsg.sender === "user" && lastMsg.text === query) {
        return filtered;
      }
      
      return [
        ...filtered,
        {
          id: `msg_${Date.now()}`,
          sender: "user",
          text: query,
          timestamp: new Date().toISOString()
        }
      ];
    });

    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages.slice(-12), // Pass enough history for context
          message: query,
          productsCatalog: products
        })
      });

      if (!response.ok) {
        throw new Error("Chat assistant proxy yielded an error");
      }

      const data = await response.json();
      const textResponse = data.text || "I was unable to retrieve a response from the central server.";

      const aiMsg: Message = {
        id: `msg_${Date.now()}_ai`,
        sender: "ai",
        text: textResponse,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev.filter((m) => !m.isError), aiMsg]);
      speakResponse(textResponse);
    } catch (err: any) {
      console.error("AIChat API Error:", err);
      const friendlyErrorText = `⚠️ **Nayel Basket Styling Concierge is Temporarily Offline**

We are having trouble communicating with the Gemini API to construct your luxury styling guidance. This is usually due to a missing or inactive \`GEMINI_API_KEY\` in **Settings > Secrets** or a temporary network disruption.

Please make sure your API key is correctly configured and click the **Retry** button below to resend your query.`;

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: "ai",
          text: friendlyErrorText,
          timestamp: new Date().toISOString(),
          isError: true,
          retryQuery: query
        }
      ]);
      speakResponse("Styling assistant is offline. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  // Launch Room Decor suggestion (utilizes outfit endpoint with interior theme)
  const handleRequestOutfit = async () => {
    setShowOutfitModal(false);
    setIsLoading(true);

    const placeholderUserMsg: Message = {
      id: `outfit_req_${Date.now()}`,
      sender: "user",
      text: `Draft a bespoke room curation lookbook for: "${occasionInput}"`,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, placeholderUserMsg]);

    try {
      const response = await fetch("/api/gemini/outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: occasionInput,
          productsCatalog: products
        })
      });

      if (!response.ok) throw new Error("Styling engine threw an error");

      const outfitData = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `outfit_res_${Date.now()}`,
          sender: "ai",
          text: `Here is a custom curated home decor lookbook designed specifically for **${occasionInput}**:`,
          type: "outfit",
          data: outfitData,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `outfit_err_${Date.now()}`,
          sender: "ai",
          text: `✨ **Bespoke Lookbook Update**: Our styling studio is currently polishing new summer room coordinates. In the meantime, we suggest combining our **Stoneware Clay Vases** with a **Solid Oak Coffee Table** to anchor natural textures and cozy warmth in your Japandi sanctuary!`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Space spacing recommendation (utilizes size endpoint mapped to ceilings and room area)
  const handleRequestSize = async () => {
    setSizeResult(null);
    try {
      const response = await fetch("/api/gemini/size-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: `${sizeHeight}cm ceiling height`,
          weight: `${sizeWeight} sq meters room size`,
          fitPreference: sizePref, // e.g., minimalist, cozy, statement-making
          sizes: ["Compact / Accent Piece", "Mid-Scale Curation", "Grand Centerpiece Scale", "Multi-Piece Set"]
        })
      });

      if (!response.ok) throw new Error("Sizing server rejected parameters");

      const sizingData = await response.json();
      setSizeResult(sizingData);

      setMessages((prev) => [
        ...prev,
        {
          id: `size_req_${Date.now()}`,
          sender: "user",
          text: `Bespoke Space Analysis request: Ceiling Height ${sizeHeight}cm, Room Area ${sizeWeight}㎡, Style: ${sizePref}`,
          timestamp: new Date().toISOString()
        },
        {
          id: `size_res_${Date.now()}`,
          sender: "ai",
          text: `Based on your room parameters and aesthetic preferences, here is my precise spacing and placement advice:`,
          type: "size_recommendation",
          data: {
            recommendedSize: sizingData.recommendedSize || "Mid-Scale Curation",
            confidenceScore: sizingData.confidenceScore || 95,
            fitJustification: sizingData.fitJustification || "For this area, mid-scale furniture and accent lighting provide proper breathing room while anchoring the focal points beautifully."
          },
          timestamp: new Date().toISOString()
        }
      ]);

      setShowSizeModal(false);
    } catch (err: any) {
      addNotification("📐 Spacing Analysis Offline", "Using default room proportions based on golden ratio harmonies.", "ai");
      setMessages((prev) => [
        ...prev,
        {
          id: `size_err_${Date.now()}`,
          sender: "ai",
          text: `✨ **Proportion Synthesis**: Our real-time volumetric sizing engine is currently updating. By default, for your specified space layout, we recommend choosing our **Mid-Scale Curation** and leaving 45cm of breathing clearance around central coordinates to maintain the golden ratio.`,
          timestamp: new Date().toISOString()
        }
      ]);
      setShowSizeModal(false);
    }
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addNotification("🎤 Voice Input Error", "Speech recognition is not supported in this browser.", "ai");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsVoiceRecording(true);
    addNotification(
      "🎤 Voice Input Active", 
      `Listening in ${voiceLang === "en-US" ? "English" : "Hindi / Hinglish"}... Speak now.`, 
      "ai"
    );

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      handleSendMessage(speechToText);
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error", event.error);
      setIsVoiceRecording(false);
    };

    recognition.onend = () => {
      setIsVoiceRecording(false);
    };

    recognition.start();
  };

  const handleScanSimulation = (barcode: string) => {
    const matched = products.find((p) => p.sku === barcode || p.id === barcode);
    if (matched) {
      setScannedProduct(matched);
      addNotification("🔍 Barcode Decoded", `Matched: ${matched.name}`, "ai");
    } else {
      setScannedProduct(null);
      alert("No corresponding product SKU located in our current home decor registry.");
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto bg-slate-50 dark:bg-[#111111] text-neutral-900 dark:text-white rounded-2xl border border-slate-200 dark:border-[#222222] overflow-hidden h-[calc(100vh-10rem)] shadow-2xl transition-colors duration-300">
      
      {/* Sidebar Shortcuts / Info */}
      <div className="w-full md:w-80 bg-white dark:bg-[#1A1A1A] border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#222222] p-5 flex flex-col gap-5 transition-colors duration-300">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-emerald-500/15 rounded-lg text-emerald-400">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">Active Model</span>
          </div>
          <h2 className="text-lg font-bold">Gemini 3.5 Flash</h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Premium interior styling AI trained on Nayel Basket's catalog, space layout rules, and colorway coordination.
          </p>
        </div>

        <div className="border-t border-slate-800/80 pt-4 flex-1 flex flex-col gap-3">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Aesthetic Assistants</span>
          
          <button
            id="btn-shortcut-outfit"
            onClick={() => setShowOutfitModal(true)}
            className="flex items-center gap-3 w-full bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 p-3 rounded-xl text-left transition text-xs cursor-pointer group"
          >
            <Layout className="h-4 w-4 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <div>
              <p className="font-semibold text-neutral-800 dark:text-slate-200">AI Room Stylist</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Coordinate items into gorgeous themed lookbooks</p>
            </div>
          </button>

          <button
            id="btn-shortcut-size"
            onClick={() => setShowSizeModal(true)}
            className="flex items-center gap-3 w-full bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 p-3 rounded-xl text-left transition text-xs cursor-pointer group"
          >
            <Maximize2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <div>
              <p className="font-semibold text-neutral-800 dark:text-slate-200">AI Space Configurator</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Analyze dimensions for perfect piece scaling</p>
            </div>
          </button>

          <button
            id="btn-shortcut-camera"
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-3 w-full bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 p-3 rounded-xl text-left transition text-xs cursor-pointer group"
          >
            <QrCode className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div>
              <p className="font-semibold text-slate-200">Product Tag Lookup</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Simulate scanning retail physical SKUs</p>
            </div>
          </button>
        </div>

        <div className="border-t border-slate-800/80 pt-4">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-2">Preset Queries</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              "What is your return policy?",
              "Recommend candles and holders",
              "Show minimalist ceramic vases"
            ].map((preset) => (
              <button
                key={preset}
                onClick={() => handleSendMessage(preset)}
                className="text-[10px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#111111]">
        
        {/* Chat Control Bar */}
        <div className="px-5 py-2.5 border-b border-slate-200 dark:border-[#222222] bg-white dark:bg-[#1A1A1A] flex flex-wrap items-center justify-between gap-2.5 transition-colors duration-300">
          <div className="flex flex-wrap items-center gap-3">
            {/* Auto-Speak Toggle */}
            <button
              id="btn-toggle-autospeak"
              type="button"
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition cursor-pointer ${
                autoSpeak 
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500" 
                  : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
              }`}
              title="Toggle Automated Voice Response"
            >
              {autoSpeak ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span>Auto Speak: {autoSpeak ? "ON" : "OFF"}</span>
            </button>

            {/* Voice Input / Output Language Switcher */}
            <button
              id="btn-toggle-voicelang"
              type="button"
              onClick={() => setVoiceLang(voiceLang === "en-US" ? "hi-IN" : "en-US")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              title="Switch Voice Input / output Accent"
            >
              <Languages className="h-3.5 w-3.5 text-emerald-500" />
              <span>Voice Accent: {voiceLang === "en-US" ? "English" : "Hindi/Hinglish"}</span>
            </button>
          </div>

          {/* Clear Chat Button */}
          <button
            id="btn-clear-chat"
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to clear your conversation history? This will start a fresh chat.")) {
                const welcomeMsg = [
                  {
                    id: "welcome",
                    sender: "ai",
                    text: "Greetings! I am the **Nayel Basket AI Concierge** – your private digital interior designer, styling consultant, and decor specialist. \n\nHow can I help you elevate your home today? Here is what I can assist you with right now:",
                    timestamp: new Date().toISOString()
                  }
                ];
                setMessages(welcomeMsg);
                localStorage.setItem("nb_ai_chat_history", JSON.stringify(welcomeMsg));
                addNotification("🧹 Chat Cleared", "Your conversation history was cleaned up.", "system");
              }
            }}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 border border-rose-200 dark:border-rose-900/30 px-2.5 py-1 rounded-full transition cursor-pointer"
            title="Wipe Conversational History"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        </div>

        {/* Chat History Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-slate-500">
                  {m.sender === "user" ? "Client" : "Stylist Concierge"} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div 
                className={`p-3.5 rounded-2xl max-w-xl text-sm leading-relaxed shadow-md ${
                  m.sender === "user"
                    ? "bg-emerald-600 text-white rounded-tr-none"
                    : "bg-white dark:bg-[#1A1A1A] border border-slate-100 dark:border-[#222222] text-slate-800 dark:text-slate-200 rounded-tl-none"
                }`}
              >
                {/* Regular text */}
                <div className="whitespace-pre-line prose prose-invert prose-sm">
                  {m.text}
                </div>

                {/* Speaker Button for Manual Reading */}
                {m.sender === "ai" && !m.isError && (
                  <div className="mt-2.5 flex justify-end">
                    <button
                      id={`btn-speak-${m.id}`}
                      type="button"
                      onClick={() => speakResponse(m.text, true)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 rounded-md transition cursor-pointer"
                      title="Read Message Aloud"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Retry Button for Errors */}
                {m.isError && m.retryQuery && (
                  <button
                    id={`btn-retry-message-${m.id}`}
                    type="button"
                    onClick={() => handleSendMessage(m.retryQuery)}
                    className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Retry Query
                  </button>
                )}

                {/* Structured Room lookbook */}
                {m.type === "outfit" && m.data && (
                  <div className="mt-4 border-t border-slate-200 dark:border-[#222222] pt-3 space-y-3">
                    <div className="bg-slate-100 dark:bg-[#111111] p-3 rounded-xl border border-emerald-500/20">
                      <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1.5">
                        <Layout className="h-4 w-4" />
                        {m.data.lookbookTitle}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">"{m.data.stylistNotes}"</p>

                      <div className="my-3 divide-y divide-slate-200 dark:divide-[#222222]">
                        {m.data.items?.map((item: any, idx: number) => {
                          const catalogItem = products.find((p) => p.id === item.productId || p.name.includes(item.name));
                          return (
                            <div key={idx} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                              <div className="pr-4">
                                <span className="font-semibold text-slate-800 dark:text-white block">{item.name}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.stylingRole}</span>
                              </div>
                              {catalogItem && (
                                <button
                                  id={`btn-add-from-lookbook-${catalogItem.id}`}
                                  onClick={() => addToCart(catalogItem, 1)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="h-3 w-3" />
                                  Add (${catalogItem.price})
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="text-[10px] text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-[#222222] pt-2 bg-slate-200/40 dark:bg-slate-900/40 p-2 rounded">
                        <strong className="text-emerald-600 dark:text-emerald-400">Styling advice:</strong> {m.data.accessorizingTips}
                      </div>
                    </div>
                  </div>
                )}

                {/* Spacing advice */}
                {m.type === "size_recommendation" && m.data && (
                  <div className="mt-3 bg-slate-100 dark:bg-[#111111] p-3.5 rounded-xl border border-emerald-500/20 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aesthetic Matrix</span>
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                        {m.data.confidenceScore}% Confidence
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Scale Recommendation:</span>
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{m.data.recommendedSize}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-[#1A1A1A] p-2.5 rounded border border-slate-200 dark:border-[#222222]">
                      {m.data.fitJustification}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs bg-white dark:bg-[#1A1A1A] border border-slate-100 dark:border-[#222222] px-3 py-2 rounded-xl w-max animate-pulse">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
              <span>Curation algorithm framing concepts...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Voice Recording overlay indicator */}
        {isVoiceRecording && (
          <div className="bg-emerald-950/80 border-t border-emerald-800/50 p-3 text-center text-xs text-emerald-200 flex items-center justify-center gap-2 animate-pulse font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Microphone capturing raw waveform signals. Speak now...</span>
          </div>
        )}

        {/* Input box */}
        <div className="p-4 border-t border-slate-100 dark:border-[#222222] bg-white dark:bg-[#1A1A1A]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <button
              id="btn-voice"
              type="button"
              onClick={startVoiceSearch}
              className="p-3 text-slate-400 hover:text-emerald-500 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 rounded-xl transition cursor-pointer"
              title="Voice Search"
            >
              <Mic className="h-5 w-5" />
            </button>

            <input
              id="input-chat"
              type="text"
              placeholder="Ask the luxury design concierge about home decor..."
              className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
            />

            <button
              id="btn-send-chat"
              type="submit"
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold p-3 rounded-xl transition cursor-pointer"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Spacing Calibration Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              id="btn-close-size-modal"
              onClick={() => setShowSizeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-2">
              <Maximize2 className="h-5 w-5 text-emerald-400" />
              Aesthetic Space Configurator
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Provide ceiling and layout dimensions. Our interior algorithm recommends the perfect scale of pieces for flawless breathing space.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Ceiling Height (cm)</label>
                  <input
                    id="input-size-height"
                    type="number"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-emerald-500 focus:outline-none"
                    value={sizeHeight}
                    onChange={(e) => setSizeHeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Room Size (㎡)</label>
                  <input
                    id="input-size-weight"
                    type="number"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-emerald-500 focus:outline-none"
                    value={sizeWeight}
                    onChange={(e) => setSizeWeight(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1.5">Aesthetic Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {["minimalist", "cozy", "statement"].map((f) => (
                    <button
                      id={`btn-fit-pref-${f}`}
                      key={f}
                      type="button"
                      onClick={() => setSizePref(f)}
                      className={`text-xs capitalize py-2 rounded-lg border transition cursor-pointer ${
                        sizePref === f
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-semibold"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="btn-calculate-size"
                onClick={handleRequestSize}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                Compute Space Recommendation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Stylist Lookbook Modal */}
      {showOutfitModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              id="btn-close-outfit-modal"
              onClick={() => setShowOutfitModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-2">
              <Layout className="h-5 w-5 text-emerald-400" />
              Artisanal Room Stylist
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Describe the theme, mood, or room context. Our styling core will coordinate items from our luxury decor catalog.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1.5">Design Theme or Context:</label>
                <textarea
                  id="textarea-outfit-occasion"
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g., A cozy emerald-accented reading corner with warm ambient pendant lighting."
                  value={occasionInput}
                  onChange={(e) => setOccasionInput(e.target.value)}
                />
              </div>

              <button
                id="btn-generate-outfit"
                onClick={handleRequestOutfit}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                Draft Customized Curation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Scanner simulation */}
      {showScanner && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              id="btn-close-scanner"
              onClick={() => {
                setShowScanner(false);
                setScannedProduct(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-emerald-400" />
              Simulate Tag Scanner
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Choose a product SKU to simulate scanning a physical product hang-tag:
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs text-slate-300">Select simulated tag to read:</label>
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden bg-slate-950 max-h-48 overflow-y-auto">
                  {products.map((p) => (
                    <button
                      id={`btn-scan-${p.sku}`}
                      key={p.id}
                      onClick={() => handleScanSimulation(p.sku)}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-900 flex justify-between items-center cursor-pointer"
                    >
                      <span className="font-semibold truncate max-w-[180px]">{p.name}</span>
                      <span className="font-mono text-[10px] text-emerald-400">{p.sku}</span>
                    </button>
                  ))}
                </div>
              </div>

              {scannedProduct && (
                <div className="bg-slate-950 border border-emerald-500/25 p-3 rounded-xl space-y-2">
                  <div className="flex gap-2.5">
                    <img
                      src={scannedProduct.image}
                      alt={scannedProduct.name}
                      className="w-12 h-12 object-cover rounded-lg border border-slate-800"
                    />
                    <div>
                      <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase font-bold">{scannedProduct.brand}</span>
                      <p className="text-xs font-semibold text-white line-clamp-1">{scannedProduct.name}</p>
                      <p className="text-xs font-mono font-bold text-emerald-400 mt-0.5">${scannedProduct.price}</p>
                    </div>
                  </div>
                  <button
                    id="btn-add-scanned-to-cart"
                    onClick={() => {
                      addToCart(scannedProduct, 1);
                      setShowScanner(false);
                      setScannedProduct(null);
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1.5 rounded-lg text-xs transition cursor-pointer"
                  >
                    Add Scanned Item To Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
