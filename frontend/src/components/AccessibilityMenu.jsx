import React, { useState, useEffect } from "react";
import {
  Settings,
  Type,
  Eye,
  Volume2,
  Save,
  RotateCcw,
  X,
  MousePointer
} from "lucide-react";

const AccessibilityMenu = () => {
  const isBrowser = typeof window !== "undefined";
  
  const [isOpen, setIsOpen] = useState(false);
  
  const [fontSize, setFontSize] = useState(
    isBrowser && localStorage.getItem("accessibility-fontSize")
      ? localStorage.getItem("accessibility-fontSize")
      : "medium"
  );
  
  const [colorTheme, setColorTheme] = useState(
    isBrowser && localStorage.getItem("accessibility-colorTheme")
      ? localStorage.getItem("accessibility-colorTheme")
      : "default"
  );
  
  const [customCursorEnabled, setCustomCursorEnabled] = useState(
    isBrowser && localStorage.getItem("accessibility-customCursorEnabled") === "true"
  );
  
  const [cursorSize, setCursorSize] = useState(
    isBrowser && localStorage.getItem("accessibility-cursorSize")
      ? localStorage.getItem("accessibility-cursorSize")
      : "medium"
  );
  
  const [cursorColor, setCursorColor] = useState(
    isBrowser && localStorage.getItem("accessibility-cursorColor")
      ? localStorage.getItem("accessibility-cursorColor")
      : "white"
  );
  
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(
    isBrowser && localStorage.getItem("accessibility-textToSpeech") === "true"
  );
  
  const [screenReaderMode, setScreenReaderMode] = useState(
    isBrowser && localStorage.getItem("accessibility-screenReader") === "true"
  );

  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  
  useEffect(() => {
    if (isBrowser) {
      const synth = window.speechSynthesis;
      setSpeechSynthesis(synth);
      
      applyFontSize(fontSize);
      applyColorTheme(colorTheme);
      applyScreenReaderMode(screenReaderMode);
      applyCustomCursor(customCursorEnabled, cursorSize, cursorColor);
    }
    
    return () => {
      if (isBrowser && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const applyFontSize = (size) => {
    document.body.classList.remove('text-size-small', 'text-size-medium', 'text-size-large', 'text-size-xlarge');
    
    document.body.classList.add(`text-size-${size}`);
    
    const fontSizeMap = {
      small: {
        body: '14px',
        h1: '1.75rem',
        h2: '1.5rem',
        h3: '1.25rem',
        p: '14px',
        button: '14px',
        input: '14px',
      },
      medium: {
        body: '16px',
        h1: '2rem',
        h2: '1.75rem',
        h3: '1.5rem',
        p: '16px',
        button: '16px',
        input: '16px',
      },
      large: {
        body: '18px',
        h1: '2.25rem',
        h2: '2rem',
        h3: '1.75rem',
        p: '18px',
        button: '18px',
        input: '18px',
      },
      'x-large': {
        body: '20px',
        h1: '2.5rem',
        h2: '2.25rem',
        h3: '2rem',
        p: '20px',
        button: '20px',
        input: '20px',
      }
    };
    
    let styleEl = document.getElementById('accessibility-font-sizes');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'accessibility-font-sizes';
      document.head.appendChild(styleEl);
    }
    
    const sizeCss = `
      body.text-size-${size} { font-size: ${fontSizeMap[size].body} !important; }
      body.text-size-${size} h1:not(.accessibility-menu-controls *) { font-size: ${fontSizeMap[size].h1} !important; }
      body.text-size-${size} h2:not(.accessibility-menu-controls *) { font-size: ${fontSizeMap[size].h2} !important; }
      body.text-size-${size} h3:not(.accessibility-menu-controls *) { font-size: ${fontSizeMap[size].h3} !important; }
      body.text-size-${size} p:not(.accessibility-menu-controls *) { font-size: ${fontSizeMap[size].p} !important; }
      
      body.text-size-${size} button:not(.accessibility-button):not(.accessibility-menu-controls *) { 
        font-size: ${fontSizeMap[size].button} !important; 
      }
      body.text-size-${size} input:not(.accessibility-menu-controls *), 
      body.text-size-${size} textarea:not(.accessibility-menu-controls *) { 
        font-size: ${fontSizeMap[size].input} !important; 
      }
      
      body.text-size-${size} .text-xs { font-size: calc(${fontSizeMap[size].body} * 0.75) !important; }
      body.text-size-${size} .text-sm { font-size: calc(${fontSizeMap[size].body} * 0.875) !important; }
      body.text-size-${size} .text-base { font-size: ${fontSizeMap[size].body} !important; }
      body.text-size-${size} .text-lg { font-size: calc(${fontSizeMap[size].body} * 1.125) !important; }
      body.text-size-${size} .text-xl { font-size: calc(${fontSizeMap[size].body} * 1.25) !important; }
      body.text-size-${size} .text-2xl { font-size: calc(${fontSizeMap[size].body} * 1.5) !important; }
      
      .accessibility-menu-controls {
        font-size: 16px !important;
      }
      .accessibility-menu-controls h2 {
        font-size: 1.25rem !important;
      }
      .accessibility-menu-controls h3 {
        font-size: 1rem !important;
      }
      .accessibility-menu-controls button {
        font-size: 0.875rem !important;
      }
    `;
    
    styleEl.textContent = sizeCss;
  };

  const applyCustomCursor = (enabled, size, color) => {
    document.body.classList.remove('cursor-custom', 'cursor-size-medium', 'cursor-size-large', 'cursor-size-xlarge', 'cursor-color-black', 'cursor-color-white', 'cursor-color-blue');
    
    if (!enabled) {
      let cursorStyleEl = document.getElementById('accessibility-cursor');
      if (cursorStyleEl) {
        cursorStyleEl.textContent = '';
      }
      return;
    }
    
    document.body.classList.add('cursor-custom', `cursor-size-${size}`, `cursor-color-${color}`);
    
    let cursorStyleEl = document.getElementById('accessibility-cursor');
    if (!cursorStyleEl) {
      cursorStyleEl = document.createElement('style');
      cursorStyleEl.id = 'accessibility-cursor';
      document.head.appendChild(cursorStyleEl);
    }
    
    const cursorSizes = {
      medium: { size: 24, scale: 1 },
      large: { size: 32, scale: 1.33 },
      'x-large': { size: 48, scale: 2 }
    };
    
    const currentSize = cursorSizes[size];
    const strokeWidth = currentSize.scale;
    
    const fillColor = color === 'white' ? '%23FFF' : 
                     color === 'blue' ? '%230066FF' : '%23000';
    
    const strokeColor = color === 'white' ? '%23000' : 
                       color === 'blue' ? '%23000' : '%23FFF';
    
    const defaultCursorSVG = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${currentSize.size}" height="${currentSize.size}" viewBox="0 0 24 24"><path fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z"></path></svg>') 1 1`;
    
    const pointerCursorSVG = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${currentSize.size}" height="${currentSize.size}" viewBox="0 0 24 24"><path fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z"></path><circle cx="16" cy="16" r="3" fill="${strokeColor}" stroke="${fillColor}" stroke-width="0.75"></circle></svg>') 1 1`;
    
    const textCursorSVG = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${currentSize.size}" height="${currentSize.size}" viewBox="0 0 24 24"><path fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z"></path><line x1="18" y1="14" x2="18" y2="20" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round"></line></svg>') 1 1`;
    
    const cursorCSS = `
      * {
        cursor: ${defaultCursorSVG}, auto !important;
      }
      
      a, button, input[type="submit"], input[type="button"], input[type="checkbox"], 
      input[type="radio"], select, label[for], .relative, [role="button"] {
        cursor: ${pointerCursorSVG}, pointer !important;
      }
      
      input[type="text"], input[type="password"], input[type="email"], input[type="number"], 
      input[type="search"], textarea {
        cursor: ${textCursorSVG}, text !important;
      }
    `;
    
    cursorStyleEl.textContent = cursorCSS;
    console.log(`Applied custom cursor: size=${size}, color=${color}, enabled=${enabled}`);
  };

  const applyColorTheme = (theme) => {
    document.body.classList.remove(
      'theme-default',
      'theme-colorblind',
      'theme-high-contrast'
    );
    
    document.body.classList.add(`theme-${theme}`);
    
    let themeStyleEl = document.getElementById('accessibility-color-theme');
    if (!themeStyleEl) {
      themeStyleEl = document.createElement('style');
      themeStyleEl.id = 'accessibility-color-theme';
      document.head.appendChild(themeStyleEl);
    }
    
    let themeCss = '';
    
    switch (theme) {
      case "colorblind":
        themeCss = `
          .theme-colorblind .bg-blue-600, 
          .theme-colorblind .hover\\:bg-blue-700:hover,
          .theme-colorblind .focus\\:ring-blue-500:focus {
            background-color: #0072B2 !important;
          }
          .theme-colorblind .text-blue-600,
          .theme-colorblind .hover\\:text-blue-700:hover {
            color: #0072B2 !important;
          }
          .theme-colorblind .border-blue-600 {
            border-color: #0072B2 !important;
          }
          
          .theme-colorblind .bg-green-500, 
          .theme-colorblind .bg-green-600 {
            background-color: #0072B2 !important;
          }
          .theme-colorblind .text-green-500,
          .theme-colorblind .text-green-600,
          .theme-colorblind .text-green-700 {
            color: #0072B2 !important;
          }
          
          .theme-colorblind .bg-red-500,
          .theme-colorblind .bg-red-600 {
            background-color: #E69F00 !important;
          }
          .theme-colorblind .text-red-500,
          .theme-colorblind .text-red-600 {
            color: #E69F00 !important;
          }
          
          .theme-colorblind .bg-blue-50 {
            background-color: #E6F3FF !important;
          }
          .theme-colorblind .bg-green-50 {
            background-color: #E6F3FF !important;
          }
          .theme-colorblind .bg-red-50 {
            background-color: #FFF6E6 !important;
          }
          
          .theme-colorblind .bg-gray-200 {
            background-color: #FFF0D9 !important;
          }
          .theme-colorblind [role="progressbar"] > div {
            border: 1px solid #E69F00 !important;
          }
          .theme-colorblind .rounded-full:not(.bg-red-500):not(.bg-blue-600):not(.bg-green-500):not(.dot) {
            border: 1px solid #E69F00 !important;
          }
          
          .theme-colorblind button:not(.accessibility-button):not(.theme-button):not(.bg-blue-600):not(.bg-red-500):not(.bg-green-500):hover {
            border-color: #E69F00 !important;
            box-shadow: 0 0 0 1px #E69F00 !important;
          }
          
          .theme-colorblind .border-b-2.border-blue-600 {
            border-color: #E69F00 !important;
          }
          
          .theme-colorblind .border.border-gray-200 {
            border-left: 3px solid #E69F00 !important;
          }
          
          .theme-colorblind .bg-blue-100,
          .theme-colorblind .bg-blue-200 {
            background-color: #FFF0D9 !important;
            border: 1px solid #E69F00 !important;
          }
          .theme-colorblind .text-blue-800 {
            color: #B25000 !important;
          }
          
          .theme-colorblind .text-white {
            color: white !important;
          }
          .theme-colorblind .text-black {
            color: black !important;
          }
        `;
        break;
        
      case "high-contrast":
        themeCss = `
          .theme-high-contrast {
            background-color: black !important;
            color: white !important;
          }
          
          .theme-high-contrast .text-gray-400,
          .theme-high-contrast .text-gray-500,
          .theme-high-contrast .text-gray-600,
          .theme-high-contrast .text-gray-700,
          .theme-high-contrast .text-gray-800,
          .theme-high-contrast .text-gray-900,
          .theme-high-contrast .text-blue-600,
          .theme-high-contrast .text-green-500,
          .theme-high-contrast .text-green-600,
          .theme-high-contrast .text-green-700 {
            color: white !important;
          }
          
          .theme-high-contrast .bg-white,
          .theme-high-contrast .bg-gray-50,
          .theme-high-contrast .bg-gray-100,
          .theme-high-contrast .bg-gray-200,
          .theme-high-contrast .bg-blue-50,
          .theme-high-contrast .bg-green-50 {
            background-color: black !important;
            border: 2px solid white !important;
          }
          
          .theme-high-contrast .bg-blue-600,
          .theme-high-contrast .hover\\:bg-blue-700:hover,
          .theme-high-contrast .bg-green-500,
          .theme-high-contrast .bg-red-500 {
            background-color: white !important;
            color: black !important;
          }
          
          .theme-high-contrast button:not(.accessibility-button) {
            background-color: black !important;
            border: 2px solid white !important;
            color: white !important;
          }
          
          .theme-high-contrast button:not(.accessibility-button):hover {
            background-color: #333 !important;
          }
          
          .theme-high-contrast a {
            color: yellow !important;
            text-decoration: underline !important;
          }
          
          .theme-high-contrast input,
          .theme-high-contrast textarea {
            background-color: black !important;
            border: 2px solid white !important;
            color: white !important;
          }
          
          .theme-high-contrast .accessibility-menu-panel {
            background-color: black !important;
            border: 2px solid white !important;
          }
          
          .theme-high-contrast .accessibility-menu-panel button.theme-button {
            border: 2px solid white !important;
            margin: 2px !important;
          }
          
          .theme-high-contrast .accessibility-menu-panel button.theme-button.active {
            background-color: white !important;
            color: black !important;
          }
          
          .theme-high-contrast [role="progressbar"] {
            border: 1px solid white !important;
          }
          
          .theme-high-contrast [role="progressbar"] > div {
            background-color: white !important;
          }
          
          .theme-high-contrast .bg-white.border.border-gray-300.text-black {
            color: black !important;
          }
          
          .theme-high-contrast .text-blue-200 {
            color: #99CCFF !important;
          }
        `;
        break;
        
      default:
        themeCss = '';
        if (themeStyleEl) {
          themeStyleEl.textContent = '';
        }
        break;
    }
    
    themeStyleEl.textContent = themeCss;
    console.log(`Applied color theme: ${theme}`);
  };

  const applyScreenReaderMode = (enabled) => {
    if (enabled) {
      const unlabeledButtons = document.querySelectorAll('button:not([aria-label]):not(:has(*))');
      unlabeledButtons.forEach(button => {
        if (!button.textContent.trim()) {
          button.setAttribute('aria-label', 'Button');
        }
      });
      
      const navElements = document.querySelectorAll('nav:not([role])');
      navElements.forEach(nav => {
        nav.setAttribute('role', 'navigation');
      });
      
      const tabPanels = document.querySelectorAll('[role="tabpanel"]');
      tabPanels.forEach(panel => {
        if (!panel.getAttribute('aria-labelledby')) {
          const id = panel.id;
          const tabId = id.replace('-panel', '-tab');
          panel.setAttribute('aria-labelledby', tabId);
        }
      });
      
      const interactiveElements = document.querySelectorAll('div[onclick]:not([tabindex])');
      interactiveElements.forEach(element => {
        element.setAttribute('tabindex', '0');
      });
      
      if (!document.querySelector('.skip-to-content')) {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-to-content';
        skipLink.textContent = 'Skip to content';
        document.body.insertBefore(skipLink, document.body.firstChild);
      }
      
      const mainContent = document.querySelector('#main-content');
      if (mainContent && !mainContent.getAttribute('role')) {
        mainContent.setAttribute('role', 'main');
      }
    }
    console.log(`Applied screen reader mode: ${enabled}`);
  };

  const speakText = (text) => {
    if (speechSynthesis && textToSpeechEnabled) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onstart = () => {
        setSpeaking(true);
      };
      
      utterance.onend = () => {
        setSpeaking(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const speakPageContent = () => {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let textToRead = [];
    
    headings.forEach(heading => {
      const headingText = heading.textContent.trim();
      let contentText = '';
      
      let nextEl = heading.nextElementSibling;
      while (nextEl && !nextEl.matches('h1, h2, h3, h4, h5, h6')) {
        contentText += ' ' + nextEl.textContent.trim();
        nextEl = nextEl.nextElementSibling;
      }
      
      textToRead.push(`${headingText}. ${contentText}`);
    });
    
    if (textToRead.length === 0) {
      const paragraphs = document.querySelectorAll('p');
      textToRead = Array.from(paragraphs).map(p => p.textContent.trim());
    }
    
    const fullText = textToRead.join('. ');
    speakText(fullText);
  };

  const saveSettings = () => {
    localStorage.setItem("accessibility-fontSize", fontSize);
    localStorage.setItem("accessibility-colorTheme", colorTheme);
    localStorage.setItem("accessibility-textToSpeech", textToSpeechEnabled);
    localStorage.setItem("accessibility-screenReader", screenReaderMode);
    localStorage.setItem("accessibility-customCursorEnabled", customCursorEnabled);
    localStorage.setItem("accessibility-cursorSize", cursorSize);
    localStorage.setItem("accessibility-cursorColor", cursorColor);
    
    applyFontSize(fontSize);
    applyColorTheme(colorTheme);
    applyScreenReaderMode(screenReaderMode);
    applyCustomCursor(customCursorEnabled, cursorSize, cursorColor);
    
    const notification = document.createElement('div');
    notification.textContent = 'Settings saved!';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#10B981';
    notification.style.color = 'white';
    notification.style.padding = '10px 15px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '9999';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
    
    setIsOpen(false);
  };

  const resetSettings = () => {
    setFontSize("medium");
    setColorTheme("default");
    setTextToSpeechEnabled(false);
    setScreenReaderMode(false);
    setCustomCursorEnabled(false);
    setCursorSize("medium");
    setCursorColor("white");
    
    localStorage.removeItem("accessibility-fontSize");
    localStorage.removeItem("accessibility-colorTheme");
    localStorage.removeItem("accessibility-textToSpeech");
    localStorage.removeItem("accessibility-screenReader");
    localStorage.removeItem("accessibility-customCursorEnabled");
    localStorage.removeItem("accessibility-cursorSize");
    localStorage.removeItem("accessibility-cursorColor");
    
    applyFontSize("medium");
    applyColorTheme("default");
    applyCustomCursor(false, "medium", "white");
    
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="accessibility-button fixed right-4 bottom-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="Settings"
      >
        <Settings className="h-6 w-6" />
      </button>
      
      {isOpen && (
        <div className="accessibility-menu-panel accessibility-menu-controls fixed right-4 bottom-20 w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
            <h2 className="text-base font-semibold text-gray-900 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-600" aria-hidden="true" />
              Settings
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="accessibility-button text-gray-500 hover:text-gray-700"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 flex items-center mb-2">
                <Type className="h-4 w-4 mr-2 text-blue-600" aria-hidden="true" />
                Font Size
              </h3>
              <div className="flex space-x-2">
                {["small", "medium", "large", "x-large"].map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setFontSize(size);
                      applyFontSize(size);
                    }}
                    className={`accessibility-button text-sm px-2 py-1 rounded ${
                      fontSize === size
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {size === "x-large" 
                      ? "X-Large" 
                      : size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 flex items-center mb-2">
                <Eye className="h-4 w-4 mr-2 text-blue-600" aria-hidden="true" />
                Color Theme
              </h3>
              <div className="flex space-x-2">
                {[
                  { value: "default", label: "Default" },
                  { value: "colorblind", label: "Colorblind Friendly" },
                  { value: "high-contrast", label: "High Contrast" }
                ].map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => {
                      setColorTheme(theme.value);
                      applyColorTheme(theme.value);
                    }}
                    className={`accessibility-button text-sm px-2 py-1 rounded text-center flex-1 ${
                      colorTheme === theme.value
                        ? "bg-blue-600 text-white active"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-900 flex items-center">
                  <MousePointer className="h-4 w-4 mr-2 text-blue-600" aria-hidden="true" />
                  Custom Cursor
                </h3>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={customCursorEnabled}
                      onChange={() => {
                        const newValue = !customCursorEnabled;
                        setCustomCursorEnabled(newValue);
                        applyCustomCursor(newValue, cursorSize, cursorColor);
                      }}
                    />
                    <div className={`block w-10 h-5 rounded-full ${
                      customCursorEnabled ? "bg-blue-600" : "bg-gray-300"
                    }`}></div>
                    <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition ${
                      customCursorEnabled ? "transform translate-x-5" : ""
                    }`}></div>
                  </div>
                </label>
              </div>
              
              {customCursorEnabled && (
                <div>
                  <div className="mb-2">
                    <h4 className="text-xs text-gray-500 mb-1">Cursor Size</h4>
                    <div className="flex space-x-2">
                      {["medium", "large", "x-large"].map((size) => (
                        <button
                          key={size}
                          onClick={() => {
                            setCursorSize(size);
                            applyCustomCursor(customCursorEnabled, size, cursorColor);
                          }}
                          className={`accessibility-button text-sm px-2 py-1 rounded flex-1 ${
                            cursorSize === size
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          {size === "x-large" 
                            ? "X-Large" 
                            : size.charAt(0).toUpperCase() + size.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs text-gray-500 mb-1">Cursor Color</h4>
                    <div className="flex space-x-2">
                      {[
                        { value: "white", label: "White", tooltip: "" },
                        { value: "black", label: "Black", tooltip: "Best for high contrast" },
                        { value: "blue", label: "Blue", tooltip: "" }
                      ].map((color) => (
                        <button
                          key={color.value}
                          onClick={() => {
                            setCursorColor(color.value);
                            applyCustomCursor(customCursorEnabled, cursorSize, color.value);
                          }}
                          title={color.tooltip}
                          className={`accessibility-button text-sm px-2 py-1 rounded flex items-center justify-center flex-1 ${
                            cursorColor === color.value
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          <span 
                            className={`inline-block w-3 h-3 mr-1 rounded-full ${
                              color.value === "black" ? "bg-black" : 
                              color.value === "white" ? "bg-white border border-gray-300" : 
                              "bg-blue-500"
                            }`}
                          ></span>
                          {color.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900 flex items-center">
                  <Volume2 className="h-4 w-4 mr-2 text-blue-600" aria-hidden="true" />
                  Text to Speech
                </h3>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={textToSpeechEnabled}
                        onChange={() => setTextToSpeechEnabled(!textToSpeechEnabled)}
                      />
                      <div className={`block w-10 h-5 rounded-full ${
                        textToSpeechEnabled ? "bg-blue-600" : "bg-gray-300"
                      }`}></div>
                      <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition ${
                        textToSpeechEnabled ? "transform translate-x-5" : ""
                      }`}></div>
                    </div>
                  </label>
                  
                  <button
                    onClick={speakPageContent}
                    disabled={!textToSpeechEnabled}
                    className={`accessibility-button text-sm px-2 py-1 rounded ${
                      textToSpeechEnabled
                        ? speaking
                          ? "bg-red-500 text-white"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {speaking ? "Stop" : "Read Page"}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 pt-2 border-t border-gray-200 mt-1">
              <button
                onClick={saveSettings}
                className="accessibility-button flex-1 bg-blue-600 text-white py-1.5 px-3 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                Save Settings
              </button>
              <button
                onClick={resetSettings}
                className="accessibility-button flex-1 bg-gray-100 text-gray-800 py-1.5 px-3 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
                Reset Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityMenu;