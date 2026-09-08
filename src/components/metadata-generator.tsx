"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Upload,
  Image as ImageIcon,
  FileVideo,
  Sparkles,
  Download,
  Trash2,
  RotateCcw,
  StopCircle,
  Settings,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Tag,
  Eye,
  Layers,
  Copy,
  Check,
  Key,
  AlertCircle,
  FileCode,
  List,
  Loader2,
  CircleCheck,
  CircleX,
  RefreshCw,
  ArrowUp,
  FileImage,
  ExternalLink,
  Settings2,
  Clock,
} from "lucide-react";
import { extractEmbeddedPreview, extractVideoFrame, rasterizeSvgFile } from "@/lib/thumbnail-extractors";
import { detectTransparency } from "@/lib/transparency-detect";
import { buildMetadataPrompt, ensureCompleteSentences, cleanKeywords, parseMetadataResponse, buildEvaluationPrompt, PLATFORM_CONFIGS } from "@/lib/generation-logic";
import { calculateQualityScore, type QualityScore } from "@/lib/quality-scorer";
import { buildVisionAnalysisPrompt, parseVisionAnalysis, buildEnhancedPromptWithVision, type VisionAnalysis } from "@/lib/vision-analysis";
import { getUserPreferences, saveUserPreferences, recordTitleSelection, getRecommendedSettings } from "@/lib/user-preferences";
import {
  type ProviderId,
  type GeneratedMetadata,
  type ApiKeyEntry,
  PROVIDERS,
  getStoredKeysAll,
  saveStoredKeysAll,
  getStoredProvider,
  saveStoredProvider,
  validateApiKey,
  generateMetadataWithKey,
  getPlatformPrompt,
  generateCSV,
  downloadFile,
  maskKey,
  getModelDisplayName,
  runWithConcurrency,
} from "@/lib/ai-providers";

const PLATFORMS = [
  { id: "adobestock", label: "Adobe Stock", color: "#FF6B35" },
  { id: "shutterstock", label: "Shutterstock", color: "#EE2B24" },
  { id: "freepik", label: "Freepik", color: "#0B7BC1" },
  { id: "vecteezy", label: "Vecteezy", color: "#8B5CF6" },
  { id: "istock", label: "iStock", color: "#00A862" },
  { id: "pond5", label: "Pond5", color: "#F97316" },
];

const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "es", label: "Spanish" },
  { id: "de", label: "German" },
  { id: "fr", label: "French" },
  { id: "pt", label: "Portuguese" },
  { id: "ja", label: "Japanese" },
  { id: "zh", label: "Chinese" },
];

type FileStatus = "pending" | "generating" | "done" | "error";

interface FileItem {
  id: number;
  name: string;
  type: string;
  preview: string;
  file: File;
  companionFile?: File; // extracted raster for EPS/SVG/video
  status: FileStatus;
  metadata?: GeneratedMetadata;
  error?: string;
  startTime?: number;
  endTime?: number;
  isTransparent?: boolean; // detected via corner/edge sampling
}

function toast(msg: string) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.className = "fixed bottom-4 left-1/2 z-[999] -translate-x-1/2 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-text-primary shadow-lg";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

export function MetadataGenerator() {
  // Multiple API keys per provider
  const [allKeys, setAllKeys] = useState<Record<ProviderId, ApiKeyEntry[]>>({
    openai: [], gemini: [], anthropic: [], grok: [], mistral: [], openrouter: [],
  });
  const [activeProvider, setActiveProvider] = useState<ProviderId>("openai");
  const [activeModel, setActiveModel] = useState("gpt-4o");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showSidebarProviderDropdown, setShowSidebarProviderDropdown] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const [profileName, setProfileName] = useState("");
  const [validatingAll, setValidatingAll] = useState(false);

  // Generation settings
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["adobestock"]);
  const [mediaType, setMediaType] = useState("hybrid");
  const [language, setLanguage] = useState("en");
  const [titleRange, setTitleRange] = useState<[number, number]>([74, 135]);
  const [kwRange, setKwRange] = useState<[number, number]>([35, 45]);
  const [descRange, setDescRange] = useState<[number, number]>([184, 238]);
  const [titlePrefix, setTitlePrefix] = useState("");
  const [titleSuffix, setTitleSuffix] = useState("");
  const [customKeywords, setCustomKeywords] = useState("");
  const [bannedWords, setBannedWords] = useState("");
  const [transparentBg, setTransparentBg] = useState(false);
  const [whiteBg, setWhiteBg] = useState(false);
  const [singleWords, setSingleWords] = useState(false);
  const [epsMetadata, setEpsMetadata] = useState(false);
  const [filterIP, setFilterIP] = useState(false);
  const [parallelGen, setParallelGen] = useState(false);
  const [concurrencyLimit, setConcurrencyLimit] = useState(3);
  const [promptStyle, setPromptStyle] = useState("highly-optimized");
  const [customPromptText, setCustomPromptText] = useState("");

  // Tab mode
  const [activeTab, setActiveTab] = useState<"metadata" | "prompt">("metadata");

  // Enhanced options
  const [tone, setTone] = useState<"professional" | "creative" | "technical">("professional");
  const [qualityScores, setQualityScores] = useState<Record<number, QualityScore>>({});
  const [abVersions, setAbVersions] = useState<Record<number, { versionA: any; versionB: any; scores: any; selectedVersion: 'A' | 'B' | null }>>({});
  const [visionAnalyses, setVisionAnalyses] = useState<Record<number, VisionAnalysis>>({});
  const [userPrefs, setUserPrefs] = useState(() => getUserPreferences());

  // Timer state
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Prompt-specific settings
  const [promptWhiteBg, setPromptWhiteBg] = useState(false);
  const [cameraParams, setCameraParams] = useState(false);
  const [promptRange, setPromptRange] = useState<[number, number]>([200, 427]);
  const [promptPrefix, setPromptPrefix] = useState("");
  const [promptSuffix, setPromptSuffix] = useState("");
  const [usePromptPrefix, setUsePromptPrefix] = useState(false);
  const [usePromptSuffix, setUsePromptSuffix] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [useNegativePrompt, setUseNegativePrompt] = useState(false);

  // Files & generation
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const keyRotationIndexRef = useRef(0);
  const [singlePass, setSinglePass] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);

  // Scroll-to-top
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Copy state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const keysLoadedRef = useRef(false);

  // Scroll-to-top listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > 300);
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Load saved keys on mount
  useEffect(() => {
    const keys = getStoredKeysAll();
    setAllKeys(keys);
    const { provider, model } = getStoredProvider();
    setActiveProvider(provider);
    setActiveModel(model);
    // Mark as loaded after a tick so the save effect doesn't overwrite
    setTimeout(() => { keysLoadedRef.current = true; }, 100);
  }, []);

  // Save keys when changed (but not on initial load)
  useEffect(() => {
    if (keysLoadedRef.current) {
      saveStoredKeysAll(allKeys);
    }
  }, [allKeys]);

  // Timer useEffect
  useEffect(() => {
    if (isGenerating && timerStart) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - timerStart);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isGenerating, timerStart]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(centiseconds).padStart(2, '0')}`;
  };

  // ─── Key Management ───

  const addKey = () => {
    if (!tempApiKey.trim()) return;
    const newEntry: ApiKeyEntry = {
      id: Date.now().toString(),
      key: tempApiKey.trim(),
      model: activeModel,
      isActive: true,
      isValid: null,
    };
    setAllKeys(prev => ({
      ...prev,
      [activeProvider]: [...prev[activeProvider], newEntry],
    }));
    setTempApiKey("");
    toast(`Key added for ${PROVIDERS.find(p => p.id === activeProvider)?.name}`);
  };

  const removeKey = (keyId: string) => {
    setAllKeys(prev => ({
      ...prev,
      [activeProvider]: prev[activeProvider].filter(k => k.id !== keyId),
    }));
  };

  const toggleKeyActive = (keyId: string) => {
    setAllKeys(prev => ({
      ...prev,
      [activeProvider]: prev[activeProvider].map(k =>
        k.id === keyId ? { ...k, isActive: !k.isActive } : k
      ),
    }));
  };

  const validateSingleKey = async (keyId: string) => {
    const keys = allKeys[activeProvider];
    const entry = keys.find(k => k.id === keyId);
    if (!entry) return;

    // Set to "validating" state
    setAllKeys(prev => ({
      ...prev,
      [activeProvider]: prev[activeProvider].map(k =>
        k.id === keyId ? { ...k, isValid: null } : k // null = validating
      ),
    }));

    const isValid = await validateApiKey(activeProvider, entry.key, entry.model);
    setAllKeys(prev => ({
      ...prev,
      [activeProvider]: prev[activeProvider].map(k =>
        k.id === keyId ? { ...k, isValid } : k
      ),
    }));
  };

  const validateAllKeys = async () => {
    setValidatingAll(true);
    const keys = allKeys[activeProvider];

    // Validate all keys IN PARALLEL (fast!)
    const results = await Promise.all(
      keys.map(async (entry) => {
        const isValid = await validateApiKey(activeProvider, entry.key, entry.model);
        return { id: entry.id, isValid };
      })
    );

    // Update all keys at once
    const resultMap = new Map(results.map(r => [r.id, r.isValid]));
    setAllKeys(prev => ({
      ...prev,
      [activeProvider]: prev[activeProvider].map(k =>
        resultMap.has(k.id) ? { ...k, isValid: resultMap.get(k.id) } : k
      ),
    }));

    setValidatingAll(false);
    const validCount = results.filter(r => r.isValid).length;
    toast(`Validated: ${validCount}/${keys.length} valid`);
  };

  const clearAllKeys = () => {
    setAllKeys(prev => ({
      ...prev,
      [activeProvider]: [],
    }));
    toast(`All keys cleared for ${PROVIDERS.find(p => p.id === activeProvider)?.name}`);
  };

  const bulkImportKeys = (text: string) => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const newEntries: ApiKeyEntry[] = lines.map((key, i) => ({
      id: `${Date.now()}-${i}`,
      key,
      model: activeModel,
      isActive: true,
      isValid: null,
    }));
    setAllKeys(prev => ({
      ...prev,
      [activeProvider]: [...prev[activeProvider], ...newEntries],
    }));
    toast(`Imported ${newEntries.length} key(s)`);
  };

  // Get an active valid key for the currently selected provider (round-robin)
  const getActiveKey = (): { apiKey: string; model: string } | null => {
    const activeKeys = allKeys[activeProvider].filter(k => k.isActive);
    if (activeKeys.length === 0) return null;

    // Separate valid vs all active keys
    const validKeys = activeKeys.filter(k => k.isValid === true);
    const pool = validKeys.length > 0 ? validKeys : activeKeys;

    // Round-robin: pick next key in the pool
    const idx = keyRotationIndexRef.current % pool.length;
    keyRotationIndexRef.current = idx + 1;
    const key = pool[idx];
    return { apiKey: key.key, model: key.model };
  };

  const hasAnyActiveKey = allKeys[activeProvider]?.some(k => k.isActive) ?? false;

  // ─── File Management ───

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const arr = Array.from(newFiles).map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      type: f.type,
      preview: f.type.startsWith("image/") || f.name.endsWith(".svg") ? URL.createObjectURL(f) : "",
      file: f,
      status: "pending" as FileStatus,
      ...(transparentBg && { isTransparent: true }),
    }));
    setFiles(prev => [...prev, ...arr]);

    // Detect transparency only when toggle is OFF (auto-detect)
    if (!transparentBg) {
      for (const item of arr) {
        detectTransparency(item.file).then((isTrans) => {
          if (isTrans) {
            setFiles(prev => prev.map(f => f.id === item.id ? { ...f, isTransparent: true } : f));
          }
        });
      }
    }

    // Extract thumbnails for EPS, video, and SVG files
    for (const item of arr) {
      const ext = item.name.split('.').pop()?.toLowerCase() || '';
      const isEps = ext === 'eps' || ext === 'ai' || ext === 'pdf' || item.type.includes('postscript');
      const isSvg = ext === 'svg';
      const isVideo = item.type.startsWith('video/') || ['mp4','mov','avi','mkv','webm','m4v','3gp','wmv','flv'].includes(ext);

      if (isEps) {
        extractEmbeddedPreview(item.file).then((result) => {
          if (result) {
            setFiles(prev => prev.map(f => f.id === item.id ? { ...f, preview: result.previewUrl, companionFile: result.companionFile } : f));
          }
        });
      } else if (isVideo) {
        extractVideoFrame(item.file).then((result) => {
          if (result) {
            setFiles(prev => prev.map(f => f.id === item.id ? { ...f, preview: result.previewUrl, companionFile: result.companionFile } : f));
          }
        });
      } else if (isSvg) {
        rasterizeSvgFile(item.file).then((result) => {
          if (result) {
            setFiles(prev => prev.map(f => f.id === item.id ? { ...f, companionFile: result.companionFile } : f));
          }
        });
      }
    }
  };

  const removeFile = (id: number) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearMetadata = () => {
    setFiles(prev => prev.map(f => ({
      ...f,
      status: "pending" as FileStatus,
      metadata: undefined,
      error: undefined,
    })));
  };

  const copyToClipboard = async (text: string, fieldId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 1500);
  };

  // ─── Generation ───

  const generateSingle = async (fileItem: FileItem, signal?: AbortSignal): Promise<void> => {
    if (abortRef.current) return;
    const activeKey = getActiveKey();
    if (!activeKey) {
      setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "error", error: "No active API key" } : f));
      return;
    }

    setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "generating", startTime: Date.now() } : f));

    try {
      let base64Data: string | null = null;
      let mimeType = fileItem.file.type || "image/jpeg";

      // Use companionFile (extracted raster) for EPS/SVG/video, otherwise use raw file
      const fileToSend = fileItem.companionFile || fileItem.file;
      mimeType = fileToSend.type || mimeType;

      if (!fileItem.type.startsWith("text/")) {
        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(fileToSend);
        });
      }

      const mediaKind = fileItem.type.startsWith("video/") ? "video" : "image" as "image" | "video";
      const hasImage = !!base64Data;

      // Find which provider this key belongs to
      let keyProvider: ProviderId = activeProvider;
      for (const prov of Object.keys(allKeys) as ProviderId[]) {
        if (allKeys[prov].some(k => k.key === activeKey.apiKey)) {
          keyProvider = prov;
          break;
        }
      }

      // Vision Analysis (pre-generation)
      let visionAnalysis: VisionAnalysis | null = null;
      if (hasImage && base64Data) {
        try {
          const visionPrompt = buildVisionAnalysisPrompt(mediaKind);
          const visionResponse = await generateMetadataWithKey(
            activeKey.apiKey,
            keyProvider,
            activeKey.model,
            mediaKind,
            base64Data,
            mimeType,
            visionPrompt,
            signal,
          );
          visionAnalysis = parseVisionAnalysis(visionResponse);
          if (visionAnalysis) {
            setVisionAnalyses(prev => ({ ...prev, [fileItem.id]: visionAnalysis! }));
          }
        } catch (e) {
          // Vision analysis is optional, continue without it
        }
      }

      // Build the enhanced prompt
      let prompt = buildMetadataPrompt(mediaKind, base64Data, fileItem.name, {
        titleLength: titleRange[1],
        descLength: descRange[1],
        keywordsCount: kwRange[1],
        language: LANGUAGES.find(l => l.id === language)?.label || "English",
        transparentBg: transparentBg || !!fileItem.isTransparent, whiteBg: promptWhiteBg, singleWords, filterIP,
        customKeywords, bannedWords,
        promptLength: promptRange[1],
        useCameraParams: cameraParams,
        promptStyle,
        customPromptText,
        titlePrefix,
        titleSuffix,
        platform: selectedPlatforms[0] || "adobestock",
        tone,
      });

      // Enhance prompt with vision analysis if available
      if (visionAnalysis) {
        prompt = buildEnhancedPromptWithVision(prompt, visionAnalysis);
      }

      // PASS 1: Generate main metadata
      const response1 = await generateMetadataWithKey(
        activeKey.apiKey,
        keyProvider,
        activeKey.model,
        mediaKind,
        base64Data,
        mimeType,
        prompt,
        signal,
      );

      if (abortRef.current) return;

      const parsed1 = parseMetadataResponse(response1, fileItem.name);

      let parsed: ReturnType<typeof parseMetadataResponse>;
      let winningVersion: 'A' | 'B';

      if (singlePass) {
        // Single pass: skip A/B generation, use Pass 1 directly
        parsed = parsed1;
        winningVersion = 'A';
      } else {
        // PASS 2: Generate alternative version (keyword-focused)
        const altPrompt = buildMetadataPrompt(mediaKind, base64Data, fileItem.name, {
          ...{
            titleLength: titleRange[1],
            descLength: descRange[1],
            keywordsCount: kwRange[1],
            language: LANGUAGES.find(l => l.id === language)?.label || "English",
            transparentBg: transparentBg || !!fileItem.isTransparent, whiteBg: promptWhiteBg, singleWords, filterIP,
            customKeywords, bannedWords,
            promptLength: promptRange[1],
            useCameraParams: cameraParams,
            promptStyle: "keyword-priority",
            customPromptText,
            titlePrefix,
            titleSuffix,
            platform: selectedPlatforms[0] || "adobestock",
            tone,
          }
        });

        const response2 = await generateMetadataWithKey(
          activeKey.apiKey,
          keyProvider,
          activeKey.model,
          mediaKind,
          base64Data,
          mimeType,
          altPrompt,
          signal,
        );

        if (abortRef.current) return;

        const parsed2 = parseMetadataResponse(response2, fileItem.name);

        // Compare and pick the best version
        const score1 = calculateQualityScore(
          parsed1.title || '',
          Array.isArray(parsed1.keywords) ? parsed1.keywords : [],
          parsed1.description || '',
          selectedPlatforms[0] || 'adobestock',
        );
        const score2 = calculateQualityScore(
          parsed2.title || '',
          Array.isArray(parsed2.keywords) ? parsed2.keywords : [],
          parsed2.description || '',
          selectedPlatforms[0] || 'adobestock',
        );

        parsed = score1.overallScore >= score2.overallScore ? parsed1 : parsed2;
        winningVersion = score1.overallScore >= score2.overallScore ? 'A' : 'B';

        // Store A/B versions for potential user selection
        setAbVersions(prev => ({
          ...prev,
          [fileItem.id]: {
            versionA: parsed1,
            versionB: parsed2,
            scores: { A: score1, B: score2 },
            selectedVersion: winningVersion,
          },
        }));
      }

      // Post-processing: ensureCompleteSentences + cleanKeywords (from original project)
      const rawTitle = ensureCompleteSentences(parsed.title, titleRange[1]);
      const finalTitle = `${titlePrefix ? titlePrefix + ' ' : ''}${rawTitle}${titleSuffix ? ' ' + titleSuffix : ''}`;

      const metadata: GeneratedMetadata = {
        title: finalTitle,
        description: ensureCompleteSentences(parsed.description, descRange[1]),
        keywords: cleanKeywords(parsed.keywords, kwRange[1]),
        category: parsed.category || "Backgrounds/Textures",
        prompt: parsed.prompt || "",
      };

      // Calculate quality score
      const score = calculateQualityScore(
        metadata.title,
        metadata.keywords,
        metadata.description,
        selectedPlatforms[0] || "adobestock",
      );
      setQualityScores(prev => ({ ...prev, [fileItem.id]: score }));

      // Learn from user preferences (record generation)
      const updatedPrefs = recordTitleSelection(userPrefs, metadata.title, true);
      setUserPrefs(updatedPrefs);

      setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "done", metadata, endTime: Date.now() } : f));
    } catch (err: any) {
      if (abortRef.current) return;
      setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: "error", error: err.message || "Generation failed", endTime: Date.now() } : f));
    }
  };

  const generateAll = async () => {
    if (!hasAnyActiveKey) { setShowApiKeyModal(true); return; }
    setIsGenerating(true);
    setTimerStart(Date.now());
    setElapsedTime(0);
    abortRef.current = false;
    abortControllerRef.current = new AbortController();
    keyRotationIndexRef.current = 0;
    const pending = files.filter(f => f.status === "pending" || f.status === "error");
    const signal = abortControllerRef.current.signal;
    if (parallelGen) {
      const tasks = pending.map(f => () => generateSingle(f, signal));
      await runWithConcurrency(tasks, concurrencyLimit);
    } else {
      for (const f of pending) {
        if (abortRef.current) break;
        await generateSingle(f, signal);
      }
    }
    setIsGenerating(false);
  };

  // Auto-download: trigger CSV download when generation finishes
  useEffect(() => {
    if (!isGenerating && autoDownload && files.some(f => f.status === "done" && f.metadata)) {
      // Small delay so state is fully settled
      const t = setTimeout(() => downloadCSV(), 500);
      return () => clearTimeout(t);
    }
  }, [isGenerating, autoDownload]);

  const generateNew = () => {
    if (!hasAnyActiveKey) { setShowApiKeyModal(true); return; }
    setIsGenerating(true);
    abortRef.current = false;
    abortControllerRef.current = new AbortController();
    keyRotationIndexRef.current = 0;
    const pending = files.filter(f => f.status === "pending");
    const signal = abortControllerRef.current.signal;
    if (parallelGen) {
      const tasks = pending.map(f => () => generateSingle(f, signal));
      runWithConcurrency(tasks, concurrencyLimit).then(() => setIsGenerating(false));
    } else {
      (async () => {
        for (const f of pending) {
          if (abortRef.current) break;
          await generateSingle(f, signal);
        }
        setIsGenerating(false);
      })();
    }
  };

  const retryFailed = async () => {
    if (!hasAnyActiveKey) { setShowApiKeyModal(true); return; }
    setIsGenerating(true);
    abortRef.current = false;
    abortControllerRef.current = new AbortController();
    keyRotationIndexRef.current = 0;
    const failed = files.filter(f => f.status === "error");
    // Reset failed to pending
    setFiles(prev => prev.map(f => f.status === "error" ? { ...f, status: "pending", error: undefined } : f));
    const signal = abortControllerRef.current.signal;
    if (parallelGen) {
      const tasks = failed.map(f => () => generateSingle({ ...f, status: "pending", error: undefined }, signal));
      await runWithConcurrency(tasks, concurrencyLimit);
    } else {
      for (const f of failed) {
        if (abortRef.current) break;
        await generateSingle({ ...f, status: "pending", error: undefined }, signal);
      }
    }
    setIsGenerating(false);
  };

  const stopGeneration = () => { abortRef.current = true; abortControllerRef.current?.abort(); setIsGenerating(false); };
  const clearFiles = () => { setFiles([]); setTimerStart(null); setElapsedTime(0); setQualityScores({}); setAbVersions({}); };

  // A/B Version Selection
  const handleSelectVersion = (fileId: number, version: 'A' | 'B') => {
    const abData = abVersions[fileId];
    if (!abData) return;

    const selectedData = version === 'A' ? abData.versionA : abData.versionB;
    if (!selectedData) return;

    // Update the file with the selected version
    setFiles(prev => prev.map(f => {
      if (f.id !== fileId) return f;
      const rawTitle = ensureCompleteSentences(selectedData.title || '', titleRange[1]);
      const finalTitle = `${titlePrefix ? titlePrefix + ' ' : ''}${rawTitle}${titleSuffix ? ' ' + titleSuffix : ''}`;
      return {
        ...f,
        metadata: {
          title: finalTitle,
          description: ensureCompleteSentences(selectedData.description || '', descRange[1]),
          keywords: cleanKeywords(selectedData.keywords || [], kwRange[1]),
          category: selectedData.category || 'Backgrounds/Textures',
          prompt: selectedData.prompt || '',
        },
      };
    }));

    // Update A/B version selection
    setAbVersions(prev => ({
      ...prev,
      [fileId]: { ...prev[fileId], selectedVersion: version },
    }));

    // Update quality score
    const score = calculateQualityScore(
      selectedData.title || '',
      selectedData.keywords || [],
      selectedData.description || '',
      selectedPlatforms[0] || 'adobestock',
    );
    setQualityScores(prev => ({ ...prev, [fileId]: score }));

    // Record user preference
    const updatedPrefs = recordTitleSelection(userPrefs, selectedData.title || '', true);
    setUserPrefs(updatedPrefs);
  };

  const downloadCSV = async () => {
    const doneFiles = files.filter(f => f.status === "done" && f.metadata);
    if (doneFiles.length === 0) return;

    const esc = (s: string) => `"${String(s || '').replace(/"/g, '""')}"`;
    const ts = Date.now();

    const generatePlatformCSV = (plat: string): string => {
      if (plat === "adobestock") {
        let csv = ["Filename","Title","Keywords","Category","Releases"].join(",") + "\n";
        doneFiles.forEach(f => {
          const m = f.metadata!;
          csv += [esc(f.name), esc(m.title), esc(m.keywords.join(", ")), esc(m.category || "3"), esc(m.releases || "")].join(",") + "\n";
        });
        return csv;
      } else if (plat === "shutterstock") {
        let csv = ["Filename","Description","Keywords","Categories","Editorial","Mature content","illustration"].join(",") + "\n";
        doneFiles.forEach(f => {
          const m = f.metadata!;
          const cats = [m.category || m.category1 || "", m.category2 || ""].filter(Boolean).join(";");
          csv += [esc(f.name), esc(m.description), esc(m.keywords.join(",")), esc(cats), "no", "no", "no"].join(",") + "\n";
        });
        return csv;
      } else if (plat === "freepik" || plat === "vecteezy") {
        let csv = ["Filename","Title","Keywords"].join(",") + "\n";
        doneFiles.forEach(f => {
          const m = f.metadata!;
          csv += [esc(f.name), esc(m.title), esc(m.keywords.join(","))].join(",") + "\n";
        });
        return csv;
      } else if (plat === "istock") {
        let csv = ["Filename","Title","Description","Keywords"].join(",") + "\n";
        doneFiles.forEach(f => {
          const m = f.metadata!;
          csv += [esc(f.name), esc(m.title), esc(m.description), esc(m.keywords.join(","))].join(",") + "\n";
        });
        return csv;
      } else if (plat === "pond5") {
        let csv = ["Filename","Title","Description","Keywords","Category"].join(",") + "\n";
        doneFiles.forEach(f => {
          const m = f.metadata!;
          csv += [esc(f.name), esc(m.title), esc(m.description), esc(m.keywords.join(",")), esc(m.category || "")].join(",") + "\n";
        });
        return csv;
      } else {
        let csv = ["Filename","Title","Description","Keywords","Category"].join(",") + "\n";
        doneFiles.forEach(f => {
          const m = f.metadata!;
          csv += [esc(f.name), esc(m.title), esc(m.description), esc(m.keywords.join(", ")), esc(m.category || "")].join(",") + "\n";
        });
        return csv;
      }
    };

    if (selectedPlatforms.length === 1) {
      // Single platform — download CSV directly
      const csv = generatePlatformCSV(selectedPlatforms[0]);
      const platLabel = PLATFORMS.find(p => p.id === selectedPlatforms[0])?.label || selectedPlatforms[0];
      downloadFile(csv, `metadata-${platLabel.toLowerCase().replace(/\s+/g, "-")}-${ts}.csv`);
    } else {
      // Multiple platforms — download ZIP with one CSV per platform
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const plat of selectedPlatforms) {
        const csv = generatePlatformCSV(plat);
        const platLabel = PLATFORMS.find(p => p.id === plat)?.label || plat;
        zip.file(`${platLabel.toLowerCase().replace(/\s+/g, "-")}.csv`, csv);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `metadata-all-platforms-${ts}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const pendingCount = files.filter(f => f.status === "pending").length;
  const generatingCount = files.filter(f => f.status === "generating").length;
  const doneCount = files.filter(f => f.status === "done").length;
  const errorCount = files.filter(f => f.status === "error").length;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-y-auto min-h-0">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-bg px-5 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Generator</h2>
            <p className="text-[11px] text-text-muted">AI-powered metadata for microstock platforms</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {/* Tab Toggle */}
            <div className="flex overflow-hidden rounded-lg border border-border bg-surface">
              <button onClick={() => setActiveTab("metadata")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold transition-all ${
                  activeTab === "metadata"
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}>
                <Sparkles className="h-3 w-3" /> Metadata
              </button>
              <button onClick={() => setActiveTab("prompt")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold transition-all ${
                  activeTab === "prompt"
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}>
                <FileCode className="h-3 w-3" /> Prompt
              </button>
            </div>
            <button onClick={() => setShowApiKeyModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-dashed border-yellow-500/30 bg-yellow-500/5 px-3 py-1.5 text-[10px] font-medium text-yellow-600 transition-colors hover:bg-yellow-500/10">
              <Key className="h-3 w-3" /> Add API Key
            </button>
            <div className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-[10px] font-medium text-text-secondary border border-border">
              <div className={`h-2 w-2 rounded-full ${hasAnyActiveKey ? "bg-green-500" : "bg-red-500"}`} />
              {hasAnyActiveKey ? `${PROVIDERS.find(p => p.id === activeProvider)?.name} (${allKeys[activeProvider]?.filter(k => k.isActive).length || 0})` : "No Key"}
            </div>
          </div>
        </div>

        <div ref={scrollContainerRef} className="relative flex-1 overflow-y-auto p-5">
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-accent", "bg-accent-subtle"); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove("border-accent", "bg-accent-subtle"); }}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-accent", "bg-accent-subtle"); addFiles(e.dataTransfer.files); }}
            onClick={() => document.getElementById("fileInput")?.click()}
            className="cursor-pointer rounded-xl border-2 border-dashed border-border bg-bg-secondary p-8 text-center transition-all hover:border-accent hover:bg-accent-subtle/50"
          >
            <input id="fileInput" type="file" multiple accept="image/*,video/*,.eps,.svg" className="hidden"
              onChange={(e) => addFiles(e.target.files)} />
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Upload className="h-5 w-5 text-accent" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Drop images, videos, or EPS vectors here</h3>
            <p className="mt-1.5 text-xs text-text-muted">JPG, PNG, WEBP, EPS, MP4, MOV, AVI, MKV and more · Mixed files supported</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              {["Images", "Videos", "EPS", "SVG"].map(t => (
                <span key={t} className="rounded-full border border-border bg-surface px-3 py-1 text-[10px] font-medium text-text-secondary">{t}</span>
              ))}
            </div>
          </div>

          {/* Toolbar */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <ActionButton icon={<Sparkles />} label="Generate All" variant="primary" onClick={generateAll}
              disabled={isGenerating || files.filter(f => f.status === "pending" || f.status === "error").length === 0} />
            <ActionButton icon={<Plus />} label="Generate New" variant="outline" onClick={generateNew}
              disabled={isGenerating || pendingCount === 0} />
            <ActionButton icon={<RefreshCw />} label="Retry Failed" variant="outline" onClick={retryFailed}
              disabled={isGenerating || errorCount === 0} />
            <ActionButton icon={<RotateCcw />} label="Stop" variant="danger" onClick={stopGeneration}
              disabled={!isGenerating} />
            {(isGenerating || elapsedTime > 0) && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-mono text-[11px] font-bold text-accent">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(elapsedTime)}
                <span className="ml-0.5 text-text-muted font-normal">for {doneCount + errorCount}/{files.length}</span>
              </span>
            )}
            <div className="flex-1" />
            <button onClick={() => setAutoDownload(!autoDownload)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                autoDownload
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-surface text-text-secondary hover:border-accent/50 hover:text-accent"
              }`}>
              <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                autoDownload ? "border-accent bg-accent" : "border-border bg-surface"
              }`}>
                {autoDownload && <Check className="h-2.5 w-2.5 text-white" />}
              </span>
              Auto Download CSV
            </button>
            <ActionButton icon={<Download />} label="Download CSV" variant="outline" onClick={downloadCSV}
              disabled={doneCount === 0} />
            <ActionButton icon={<Trash2 />} label="Clear" variant="danger" onClick={clearFiles}
              disabled={files.length === 0 || isGenerating} />
            <ActionButton icon={<List />} label="Clear Metadata" variant="ghost" onClick={clearMetadata}
              disabled={doneCount === 0 && errorCount === 0} />
          </div>

          {/* Timer + Status Bar */}
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {/* Status counts */}
              <div className="flex items-center gap-4 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-text-muted" />
                  Pending: <span className="font-bold text-text-primary">{pendingCount}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  Generating: <span className="font-bold text-accent">{generatingCount}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Done: <span className="font-bold text-green-600">{doneCount}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-danger" />
                  Error: <span className="font-bold text-danger">{errorCount}</span>
                </span>
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="mt-6 space-y-4">
            {files.map((file) => (
              <FileCard key={file.id} file={file} onRemove={removeFile} onCopy={copyToClipboard}
                copiedField={copiedField} platform={selectedPlatforms[0] || "adobestock"} activeTab={activeTab} qualityScore={qualityScores[file.id]}
                abVersion={abVersions[file.id]} onSelectVersion={handleSelectVersion} />
            ))}
            {files.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                  <ImageIcon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-text-primary">Start Generating</h3>
                <p className="mt-1.5 max-w-sm text-sm text-text-muted">
                  Drop some files above to generate optimized metadata for your microstock uploads.
                </p>
              </div>
            )}
          </div>

          {/* Scroll to Top */}
          {showScrollTop && (
            <button onClick={scrollToTop}
              className="fixed bottom-24 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 transition-all hover:scale-110 hover:shadow-xl">
              <ArrowUp className="h-5 w-5" />
            </button>
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto min-h-0 border-l border-border bg-bg-secondary lg:flex">
        <div className="p-4">
          <Section title="AI Provider" icon={<Key className="h-3 w-3" />}>
            <div className="relative">
              <button onClick={() => setShowSidebarProviderDropdown(!showSidebarProviderDropdown)}
                className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-left transition-all hover:border-accent/30">
                <div className={`h-2 w-2 shrink-0 rounded-full ${
                  (allKeys[activeProvider]?.filter(k => k.isActive).length || 0) > 0
                    ? "bg-green-500" : "bg-text-muted"
                }`} />
                <span className="flex-1 text-xs font-semibold text-text-primary">
                  {PROVIDERS.find(p => p.id === activeProvider)?.name}
                </span>
                <span className="text-[9px] text-text-muted">
                  ({allKeys[activeProvider]?.filter(k => k.isActive).length || 0})
                </span>
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-text-muted transition-transform ${showSidebarProviderDropdown ? "rotate-180" : ""}`} />
              </button>
              {showSidebarProviderDropdown && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border bg-bg-secondary shadow-2xl overflow-hidden">
                  {(Object.keys(allKeys) as ProviderId[]).map(pid => {
                    const p = PROVIDERS.find(x => x.id === pid)!;
                    const count = allKeys[pid].length;
                    const activeCount = allKeys[pid].filter(k => k.isActive).length;
                    return (
                      <button key={pid} onClick={() => { setActiveProvider(pid); setActiveModel(allKeys[pid][0]?.model || PROVIDERS.find(x => x.id === pid)!.models[0].id); setShowSidebarProviderDropdown(false); }}
                        className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-all border-b border-border last:border-b-0 ${
                          activeProvider === pid
                            ? "bg-accent/5 border-l-2 border-l-accent"
                            : "hover:bg-accent/5"
                        }`}>
                        <div className={`h-2 w-2 shrink-0 rounded-full ${activeCount > 0 ? "bg-green-500" : "bg-text-muted"}`} />
                        <span className={`flex-1 text-xs font-semibold ${activeProvider === pid ? "text-accent" : "text-text-primary"}`}>{p.name}</span>
                        {count > 0 && <span className="text-[9px] text-text-muted">({count})</span>}
                        <ExternalLink className="h-3 w-3 shrink-0 text-text-muted" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {activeProvider && (
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">Model</label>
                <select value={activeModel} onChange={(e) => { setActiveModel(e.target.value); saveStoredProvider(activeProvider, e.target.value); }}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none">
                  {PROVIDERS.find(p => p.id === activeProvider)?.models.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}
          </Section>

          {activeTab === "metadata" ? (
          <>
          <Section title="Generation" icon={<Sparkles className="h-3 w-3" />} defaultOpen={true}>
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text-primary">Parallel generation</p>
                <p className="text-[10px] text-text-muted">Run every enabled API key at once</p>
              </div>
              <Toggle checked={parallelGen} onChange={setParallelGen} />
            </div>
            {parallelGen && (
              <div className="rounded-xl border border-border bg-surface px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-text-primary">Concurrency limit</p>
                  <span className="font-mono text-xs font-bold text-accent">{concurrencyLimit}</span>
                </div>
                <p className="text-[10px] text-text-muted mb-2">Max parallel API requests at once</p>
                <input type="range" min={1} max={10} value={concurrencyLimit}
                  onChange={(e) => setConcurrencyLimit(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-border cursor-pointer accent-[var(--accent)]" />
                <div className="flex justify-between text-[9px] text-text-muted mt-1">
                  <span>1</span><span>5</span><span>10</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text-primary">Single pass (skip A/B)</p>
                <p className="text-[10px] text-text-muted">Faster generation, half the tokens</p>
              </div>
              <Toggle checked={singlePass} onChange={setSinglePass} />
            </div>
            <Field label="Targeted platform">
              <div className="grid grid-cols-2 gap-1.5">
                {PLATFORMS.map((p) => (
                  <label key={p.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-[10px] font-medium transition-all ${
                      selectedPlatforms.includes(p.id)
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-surface text-text-secondary hover:border-text-muted"
                    }`}>
                    <input type="checkbox" checked={selectedPlatforms.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPlatforms(prev => [...prev, p.id]);
                        } else {
                          setSelectedPlatforms(prev => prev.filter(id => id !== p.id));
                        }
                      }}
                      className="h-3 w-3 accent-[var(--accent)]" />
                    {p.label}
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Prompt style">
              <select value={promptStyle} onChange={(e) => setPromptStyle(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none">
                <option value="highly-optimized">Highly Optimized</option>
                <option value="keyword-priority">Keyword Priority</option>
                <option value="seo-focus">SEO Focus</option>
                <option value="adobe-stock-special">Adobe Stock Special</option>
                <option value="shutterstock-special">Shutterstock Special</option>
                <option value="human-search-psychology">Human Search Psychology</option>
                <option value="custom-prompt">Custom Prompt...</option>
              </select>
            </Field>
            {promptStyle === "custom-prompt" && (
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">Custom prompt instructions</label>
                <textarea
                  value={customPromptText}
                  onChange={(e) => setCustomPromptText(e.target.value)}
                  placeholder="e.g. Focus on vibrant colors and minimalist style..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
                />
              </div>
            )}
            <Field label="Language">
              <select value={language} onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none">
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Tone">
              <div className="grid grid-cols-3 gap-1.5">
                {["professional", "creative", "technical"].map((t) => (
                  <button key={t} onClick={() => setTone(t as typeof tone)}
                    className={`rounded-md px-2 py-1.5 text-[10px] font-medium transition-all ${
                      tone === t
                        ? "bg-accent text-white shadow-sm"
                        : "border border-border bg-surface text-text-secondary hover:border-text-muted"
                    }`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </Field>
          </Section>

          <Section title="Limits" icon={<Tag className="h-3 w-3" />} defaultOpen={true}>

            <RangeSlider label="Title length" value={titleRange} onChange={setTitleRange} min={0} max={200} unit="chars" />
            <RangeSlider label="Keywords count" value={kwRange} onChange={setKwRange} min={5} max={50} unit="words" />
            <RangeSlider label="Description length" value={descRange} onChange={setDescRange} min={0} max={300} unit="chars" />
          </Section>

          <Section title="Customization" icon={<Settings2 className="h-3 w-3" />} defaultOpen={true}>
            <Field label="Title prefix">
              <input type="text" value={titlePrefix} onChange={(e) => setTitlePrefix(e.target.value)}
                placeholder="e.g. Premium —"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none" />
            </Field>
            <Field label="Title suffix">
              <input type="text" value={titleSuffix} onChange={(e) => setTitleSuffix(e.target.value)}
                placeholder="e.g. — Stock Photo"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none" />
            </Field>
            <Field label="Custom keywords">
              <textarea
                value={customKeywords}
                onChange={(e) => setCustomKeywords(e.target.value)}
                placeholder="Comma separated keywords to always include..."
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
              />
            </Field>
            <Field label="Banned words">
              <textarea
                value={bannedWords}
                onChange={(e) => setBannedWords(e.target.value)}
                placeholder="Comma separated words to never use..."
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
              />
            </Field>
          </Section>

          <Section title="Toggles" icon={<Eye className="h-3 w-3" />} defaultOpen={true}>
            <ToggleRow label="Transparent background" checked={transparentBg} onChange={(v) => { setTransparentBg(v); if (v) setWhiteBg(false); }} />
            <ToggleRow label="White background" checked={whiteBg} onChange={(v) => { setWhiteBg(v); if (v) setTransparentBg(false); }} />
            <ToggleRow label="Single-word keywords" checked={singleWords} onChange={setSingleWords} />
            <ToggleRow label="Filter IP terms" checked={filterIP} onChange={setFilterIP} />

          </Section>
          </>
          ) : (
          <>
          <Section title="Prompt Controls" icon={<FileCode className="h-3 w-3" />} defaultOpen={true}>
            <ToggleRow label="White Background" checked={promptWhiteBg} onChange={setPromptWhiteBg} />
            <ToggleRow label="Camera Parameters" checked={cameraParams} onChange={setCameraParams} />
            <RangeSlider label="Prompt length" value={promptRange} onChange={setPromptRange} min={50} max={800} unit="chars" />
          </Section>

          <Section title="Options" icon={<Eye className="h-3 w-3" />} defaultOpen={true}>
            <ToggleRow label="Prefix" checked={usePromptPrefix} onChange={setUsePromptPrefix} />
            {usePromptPrefix && (
              <input type="text" value={promptPrefix} onChange={(e) => setPromptPrefix(e.target.value)}
                placeholder="e.g. --ar 16:9 --v 6"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none" />
            )}
            <ToggleRow label="Suffix" checked={usePromptSuffix} onChange={setUsePromptSuffix} />
            {usePromptSuffix && (
              <input type="text" value={promptSuffix} onChange={(e) => setPromptSuffix(e.target.value)}
                placeholder="e.g. --style raw --q 2"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none" />
            )}
            <ToggleRow label="Negative Prompt Words" checked={useNegativePrompt} onChange={setUseNegativePrompt} />
            {useNegativePrompt && (
              <textarea value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="Words to exclude from prompt..."
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none" />
            )}
          </Section>

          <Section title="Prompt Style" icon={<Sparkles className="h-3 w-3" />} defaultOpen={true}>
            <Field label="Style">
              <select value={promptStyle} onChange={(e) => setPromptStyle(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none">
                <option value="highly-optimized">Highly Optimized</option>
                <option value="keyword-priority">Keyword Priority</option>
                <option value="seo-focus">SEO Focus</option>
                <option value="adobe-stock-special">Adobe Stock Special</option>
                <option value="shutterstock-special">Shutterstock Special</option>
                <option value="human-search-psychology">Human Search Psychology</option>
                <option value="custom-prompt">Custom Prompt...</option>
              </select>
            </Field>
            {promptStyle === "custom-prompt" && (
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">Custom instructions</label>
                <textarea value={customPromptText} onChange={(e) => setCustomPromptText(e.target.value)}
                  placeholder="e.g. Focus on dramatic cinematic lighting..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none" />
              </div>
            )}
          </Section>
          </>
          )}
        </div>
      </aside>

      {/* ═══ API Settings Modal ═══ */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-bg-secondary shadow-2xl">
            {/* Header - Fixed */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-base font-bold text-text-primary">API Settings</h3>
              <button onClick={() => setShowApiKeyModal(false)} className="rounded-lg p-1 text-text-muted hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
            <p className="mb-5 text-xs leading-relaxed text-text-muted">
              Your API keys stay in your browser — never sent anywhere but the AI provider. Select a provider, pick a model, then add keys.
            </p>

            {/* SELECT PROVIDER - Dropdown */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">Select Provider</p>
              <a href={PROVIDERS.find(p => p.id === activeProvider)?.keyUrl || "#"} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/5 px-3 py-1.5 text-[10px] font-semibold text-accent transition-colors hover:bg-accent/10">
                <ExternalLink className="h-3 w-3" /> Get API Key
              </a>
            </div>
            <div className="relative mb-4">
              <button onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left transition-all hover:border-accent/30">
                <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  (allKeys[activeProvider]?.filter(k => k.isActive).length || 0) > 0
                    ? "bg-green-500" : "bg-text-muted/40"
                }`} />
                <span className="flex-1 text-sm font-medium text-text-primary">
                  {PROVIDERS.find(p => p.id === activeProvider)?.name}
                </span>
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                  ({allKeys[activeProvider]?.filter(k => k.isActive).length || 0})
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${showProviderDropdown ? "rotate-180" : ""}`} />
              </button>
              {showProviderDropdown && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border bg-bg-secondary shadow-2xl overflow-hidden">
                  {PROVIDERS.map((p) => {
                    const keyCount = allKeys[p.id]?.filter(k => k.isActive).length || 0;
                    const isActive = activeProvider === p.id;
                    return (
                      <button key={p.id} onClick={() => { setActiveProvider(p.id); setShowProviderDropdown(false); }}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-all border-b border-border last:border-b-0 ${
                          isActive
                            ? "bg-accent/5 border-l-2 border-l-accent"
                            : "hover:bg-accent/5"
                        }`}>
                        <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${keyCount > 0 ? "bg-green-500" : "bg-text-muted/40"}`} />
                        <span className={`flex-1 text-sm font-medium ${isActive ? "text-accent" : "text-text-primary"}`}>{p.name}</span>
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">({keyCount})</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Model */}
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Model</label>
            <select value={activeModel}
              onChange={(e) => { setActiveModel(e.target.value); saveStoredProvider(activeProvider, e.target.value); }}
              className="mb-4 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none">
              {PROVIDERS.find(p => p.id === activeProvider)?.models.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            {/* API Key Input */}
            <div className="mb-4 flex gap-2">
              <input type="password" value={tempApiKey} onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="Paste your API key here"
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary font-mono outline-none placeholder:text-text-muted focus:border-accent"
                onKeyDown={(e) => { if (e.key === "Enter" && tempApiKey) addKey(); }} />
              <button onClick={addKey} disabled={!tempApiKey.trim()}
                className="rounded-lg bg-accent px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-accent-hover disabled:opacity-40">
                Add
              </button>
            </div>

            {/* Bulk Import */}
            <div className="mb-4 rounded-lg border border-border bg-surface p-4">
              <p className="mb-2 text-xs text-text-muted">Bulk-import from a .txt file — each line is one API key.</p>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">
                <Upload className="h-3.5 w-3.5" /> Upload .txt File
                <input type="file" accept=".txt" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => bulkImportKeys(ev.target?.result as string);
                  reader.readAsText(file);
                  e.target.value = "";
                }} />
              </label>
            </div>

            {/* ADDED KEYS - MetaGen style list */}
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
              Added Keys ({allKeys[activeProvider].length})
            </p>
            <div className="mb-4 space-y-2">
              {allKeys[activeProvider].length === 0 ? (
                <div className="rounded-lg border border-border bg-surface p-4 text-center">
                  <p className="text-xs text-text-muted italic">No keys added for {PROVIDERS.find(p => p.id === activeProvider)?.name} yet.</p>
                </div>
              ) : (
                allKeys[activeProvider].map((entry) => (
                  <div key={entry.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
                    {/* Validation status */}
                    <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                      {entry.isValid === true ? (
                        <CircleCheck className="h-5 w-5 text-green-500" />
                      ) : entry.isValid === false ? (
                        <CircleX className="h-5 w-5 text-red-500" />
                      ) : entry.isValid === null ? (
                        <div className="h-5 w-5 rounded-full border-2 border-text-muted" />
                      ) : null}
                    </div>

                    {/* Masked key */}
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-text-primary truncate">{maskKey(entry.key)}</p>
                      <p className="text-[10px] text-text-muted">{getModelDisplayName(activeProvider, entry.model)}</p>
                    </div>

                    {/* Toggle */}
                    <Toggle checked={entry.isActive} onChange={() => toggleKeyActive(entry.id)} />

                    {/* Delete */}
                    <button onClick={() => removeKey(entry.id)}
                      className="shrink-0 rounded p-1 text-text-muted hover:text-danger transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Profile name */}
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Profile name</label>
            <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. My profile"
              className="mb-5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent" />

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button onClick={validateAllKeys} disabled={validatingAll || allKeys[activeProvider].length === 0}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-2.5 text-xs font-semibold text-green-500 transition-colors hover:bg-green-500/10 disabled:opacity-40">
                {validatingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                {validatingAll ? "Validating..." : "Validate All APIs"}
              </button>
              <button className="flex items-center justify-center gap-1.5 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/10">
                <Settings className="h-3 w-3" /> Save Settings
              </button>
              <button className="flex items-center justify-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2.5 text-xs font-semibold text-blue-500 transition-colors hover:bg-blue-500/10">
                <Download className="h-3 w-3" /> Load Settings
              </button>
            </div>
            <button onClick={clearAllKeys}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2.5 text-xs font-semibold text-danger transition-colors hover:bg-danger/10">
              <Trash2 className="h-3 w-3" /> Clear All Keys
            </button>
            </div>{/* end scrollable body */}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── File Card ─── */

function FileCard({ file, onRemove, onCopy, copiedField, platform, activeTab, qualityScore, abVersion, onSelectVersion }: {
  file: FileItem; onRemove: (id: number) => void; onCopy: (text: string, fieldId: string) => void;
  copiedField: string | null; platform: string; activeTab: "metadata" | "prompt"; qualityScore?: QualityScore;
  abVersion?: { versionA: any; versionB: any; scores: any; selectedVersion: 'A' | 'B' | null };
  onSelectVersion?: (fileId: number, version: 'A' | 'B') => void;
}) {
  const [liveTime, setLiveTime] = useState(0);
  const liveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (file.status === "generating" && file.startTime) {
      liveTimerRef.current = setInterval(() => {
        setLiveTime((Date.now() - file.startTime!) / 1000);
      }, 100);
    } else {
      if (liveTimerRef.current) { clearInterval(liveTimerRef.current); liveTimerRef.current = null; }
      if (file.endTime && file.startTime) setLiveTime((file.endTime - file.startTime) / 1000);
    }
    return () => { if (liveTimerRef.current) { clearInterval(liveTimerRef.current); liveTimerRef.current = null; } };
  }, [file.status, file.startTime, file.endTime]);

  const statusColors: Record<FileStatus, string> = {
    pending: "bg-text-muted", generating: "bg-accent animate-pulse", done: "bg-green-500", error: "bg-danger",
  };
  const statusLabels: Record<FileStatus, string> = {
    pending: "Pending", generating: "Generating...", done: "Done", error: "Error",
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:shadow-md hover:border-accent/20">
      <div className="flex">
        {/* Left: Thumbnail + bottom bar */}
        <div className="flex w-52 shrink-0 flex-col">
          <div className="relative aspect-square w-full bg-bg-secondary">
            {file.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={file.preview} alt={file.name} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <FileCode className="h-10 w-10 text-text-muted" />
              </div>
            )}
            {file.status === "generating" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>
          {/* Bottom bar: filename + status + delete */}
          <div className="flex items-center gap-2 border-t border-border px-2.5 py-1.5">
            <span className="flex-1 truncate font-mono text-[10px] text-text-secondary">{file.name}</span>
            {file.status === "generating" && file.startTime && (
              <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[9px] font-bold text-accent">{liveTime.toFixed(1)}s</span>
            )}
            {file.status !== "generating" && file.startTime && file.endTime && (
              <span className="shrink-0 font-mono text-[9px] text-text-muted">{((file.endTime - file.startTime) / 1000).toFixed(1)}s</span>
            )}
            {file.status !== "generating" && (
              <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider">
                <span className={`h-1.5 w-1.5 rounded-full ${statusColors[file.status]}`} />
                {statusLabels[file.status]}
              </span>
            )}
            <button onClick={() => onRemove(file.id)}
              className="shrink-0 rounded p-0.5 text-red-500 hover:text-red-700 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Metadata */}
        <div className="flex-1 min-w-0 border-l border-border p-4">
          {file.error && (
            <div className="flex items-start gap-1.5 rounded-lg bg-danger/5 p-2 text-[10px] text-danger">
              <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" /><span>{file.error}</span>
            </div>
          )}
          {file.metadata && activeTab === "prompt" && (
            <div className="space-y-3">
              {/* Prompt */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Prompt ({(file.metadata.prompt || "").length} chars)</p>
                  <button onClick={() => onCopy(file.metadata!.prompt || "", `prompt-${file.id}`)}
                    className="text-[10px] font-medium text-accent hover:text-accent-hover transition-colors">
                    {copiedField === `prompt-${file.id}` ? "Copied!" : "Copy Prompt"}
                  </button>
                </div>
                <div className="rounded-lg border border-border bg-bg-secondary p-3">
                  <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap">{file.metadata.prompt || "No prompt generated."}</p>
                </div>
              </div>
            </div>
          )}
          {file.metadata && activeTab === "metadata" && (
            <div className="space-y-3">
              {/* Quality Score + A/B Version — single line */}
              {qualityScore && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-secondary px-3 py-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/10">
                    <span className="text-[11px] font-bold text-accent">{qualityScore.overallScore}</span>
                  </div>
                  <span className={`text-[10px] font-semibold ${
                    qualityScore.rating === 'excellent' ? 'text-green-600' :
                    qualityScore.rating === 'good' ? 'text-accent' :
                    qualityScore.rating === 'average' ? 'text-yellow-600' : 'text-red-500'
                  }`}>{qualityScore.rating.charAt(0).toUpperCase() + qualityScore.rating.slice(1)}</span>
                  <span className="text-[9px] text-text-muted">T:{qualityScore.titleScore} K:{qualityScore.keywordScore}</span>
                  {abVersion && abVersion.selectedVersion && (
                    <>
                      <div className="h-3 w-px bg-border" />
                      <div className="flex gap-1">
                        <button onClick={() => onSelectVersion?.(file.id, 'A')}
                          className={`rounded px-2 py-0.5 text-[9px] font-medium transition-all ${
                            abVersion.selectedVersion === 'A'
                              ? 'bg-accent text-white'
                              : 'border border-border bg-surface text-text-secondary hover:border-accent'
                          }`}>
                          A ({abVersion.scores.A?.overallScore || 0})
                        </button>
                        <button onClick={() => onSelectVersion?.(file.id, 'B')}
                          className={`rounded px-2 py-0.5 text-[9px] font-medium transition-all ${
                            abVersion.selectedVersion === 'B'
                              ? 'bg-accent text-white'
                              : 'border border-border bg-surface text-text-secondary hover:border-accent'
                          }`}>
                          B ({abVersion.scores.B?.overallScore || 0})
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              {/* Title */}
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">Title</p>
                <div className="flex items-start gap-2">
                  <p className="flex-1 text-sm font-semibold text-text-secondary leading-snug">{file.metadata.title}</p>
                  <button onClick={() => onCopy(file.metadata!.title, `title-${file.id}`)}
                    className="shrink-0 rounded p-1 text-text-muted hover:text-accent transition-colors">
                    {copiedField === `title-${file.id}` ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              {/* Description */}
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">Description</p>
                <div className="flex items-start gap-2">
                  <p className="flex-1 text-sm leading-relaxed text-text-secondary">{file.metadata.description}</p>
                  <button onClick={() => onCopy(file.metadata!.description, `desc-${file.id}`)}
                    className="shrink-0 rounded p-1 text-text-muted hover:text-accent transition-colors">
                    {copiedField === `desc-${file.id}` ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              {/* Keywords */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Keywords ({file.metadata.keywords.length})</p>
                  <button onClick={() => onCopy(file.metadata!.keywords.join(", "), `kw-${file.id}`)}
                    className="text-[10px] font-medium text-accent hover:text-accent-hover transition-colors">
                    {copiedField === `kw-${file.id}` ? "Copied!" : "Copy All"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {file.metadata.keywords.slice(0, 18).map((kw, i) => (
                    <button key={i} onClick={() => onCopy(kw, `kw-${file.id}-${i}`)}
                      className="rounded-full bg-accent/5 px-2.5 py-1 text-[10px] font-medium text-accent transition-colors hover:bg-accent/15">
                      {copiedField === `kw-${file.id}-${i}` ? <Check className="h-2.5 w-2.5" /> : kw}
                    </button>
                  ))}
                  {file.metadata.keywords.length > 18 && (
                    <span className="rounded-full bg-bg-secondary px-2.5 py-1 text-[10px] text-text-muted">
                      +{file.metadata.keywords.length - 18} more
                    </span>
                  )}
                </div>
              </div>
              {/* Category + Copy All inline */}
              <div className="flex items-center gap-4">
                {file.metadata.category && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Category</p>
                    <p className="mt-0.5 text-xs font-medium text-text-secondary">{file.metadata.category}</p>
                  </div>
                )}
                <button onClick={() => {
                  const all = `Title: ${file.metadata!.title}\n\nDescription: ${file.metadata!.description}\n\nKeywords: ${file.metadata!.keywords.join(", ")}\n\nCategory: ${file.metadata!.category}`;
                  onCopy(all, `all-${file.id}`);
                }}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[10px] font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent">
                  {copiedField === `all-${file.id}` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  {copiedField === `all-${file.id}` ? "Copied!" : "Copy All Metadata"}
                </button>
              </div>
            </div>
          )}
          {!file.metadata && file.status === "pending" && (
            <div className="flex h-full items-center justify-center">
              <p className="text-xs italic text-text-muted">Waiting for generation...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

function Section({ title, icon, children, defaultOpen = true }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4">
      <button onClick={() => setOpen(!open)} className="mb-3 flex w-full items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
        {icon}{title}<span className="flex-1 border-t border-border-subtle" />
        {open ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
      </button>
      {open && <div className="space-y-3">{children}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-text-secondary">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-border"}`}>
      <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-4" : ""}`} />
    </button>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
      <p className="flex-1 text-xs font-medium text-text-primary">{label}</p>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function RangeSlider({ label, value, onChange, min, max, unit }: {
  label: string; value: [number, number]; onChange: (v: [number, number]) => void; min: number; max: number; unit: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);

  const getPercent = (clientX: number) => {
    if (!trackRef.current) return min;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    return Math.max(min, Math.min(max, Math.round((pct / 100) * (max - min) + min)));
  };

  const handlePointerDown = (thumb: "min" | "max") => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(thumb);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const val = getPercent(e.clientX);
    if (dragging === "min") onChange([Math.max(min, Math.min(val, value[1] - 1)), value[1]]);
    else onChange([value[0], Math.max(value[0] + 1, Math.min(val, max))]);
  };

  const handlePointerUp = () => setDragging(null);
  const lowPct = ((value[0] - min) / (max - min)) * 100;
  const highPct = ((value[1] - min) / (max - min)) * 100;

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between text-xs">
        <span className="font-medium text-text-secondary">{label}</span>
        <span className="font-mono font-bold text-accent">{value[0]} – {value[1]} {unit}</span>
      </div>
      <div ref={trackRef} className="relative my-2 cursor-pointer select-none touch-none" style={{ height: 14 }}
        onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full bg-border" />
        <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
          style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }} />
        <div className="absolute top-1/2 z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent shadow-md cursor-grab active:cursor-grabbing"
          style={{ left: `${lowPct}%` }} onPointerDown={handlePointerDown("min")} />
        <div className="absolute top-1/2 z-20 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent shadow-md cursor-grab active:cursor-grabbing"
          style={{ left: `${highPct}%` }} onPointerDown={handlePointerDown("max")} />
      </div>
    </div>
  );
}

function ActionButton({ icon, label, variant, disabled, onClick }: {
  icon: React.ReactNode; label: string; variant: "primary" | "outline" | "ghost" | "danger"; disabled?: boolean; onClick?: () => void;
}) {
  const styles: Record<string, string> = {
    primary: "bg-accent text-white hover:bg-accent-hover shadow-md shadow-accent/20 border border-accent",
    outline: "bg-surface text-text-primary border border-border hover:border-accent hover:text-accent",
    ghost: "bg-surface text-text-secondary border border-border hover:text-accent hover:border-accent/50",
    danger: "bg-surface text-danger border border-danger/30 hover:bg-danger/5 hover:border-danger",
  };
  return (
    <button disabled={disabled} onClick={onClick}
      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]}`}>
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
      {label}
    </button>
  );
}
