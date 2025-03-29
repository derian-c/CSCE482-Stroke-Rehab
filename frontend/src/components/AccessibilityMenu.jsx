// AccessibilityMenu.jsx
import React, { useState, useEffect } from "react";
import {
  Settings,
  Type,
  Eye,
  Volume2,
  Monitor,
  Save,
  RotateCcw,
  X
} from "lucide-react";

const AccessibilityMenu = () => {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined";
  
  // State for menu open/closed
  const [isOpen, setIsOpen] = useState(false);
  
  // States for accessibility options
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
  
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(
    isBrowser && localStorage.getItem("accessibility-textToSpeech") === "true"
  );
  
  const [screenReaderMode, setScreenReaderMode] = useState(
    isBrowser && localStorage.getItem("accessibility-screenReader") === "true"
  );

  // TTS instance
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  
  // Initialize on mount
  useEffect(() => {
    if (isBrowser) {
      // Initialize speech synthesis
      const synth = window.speechSynthesis;
      setSpeechSynthesis(synth);
      
      // Apply saved settings on load
      applyFontSize(fontSize);
      applyColorTheme(colorTheme);
      applyScreenReaderMode(screenReaderMode);
    }
    
    // Cancel any ongoing speech when component unmounts
    return () => {
      if (isBrowser && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Apply font size - Directly target text elements with preserved controls size
  const applyFontSize = (size) => {
    // Remove existing font size classes
    document.body.classList.remove('text-size-small', 'text-size-medium', 'text-size-large', 'text-size-xlarge');
    
    // Add the new font size class
    document.body.classList.add(`text-size-${size}`);
    
    // Apply specific scaling for different text elements
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
    
    // Create a style element for custom sizing
    let styleEl = document.getElementById('accessibility-font-sizes');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'accessibility-font-sizes';
      document.head.appendChild(styleEl);
    }
    
    // Set the font size CSS
    const sizeCss = `
      body.text-size-${size} { font-size: ${fontSizeMap[size].body}; }
      body.text-size-${size} h1 { font-size: ${fontSizeMap[size].h1}; }
      body.text-size-${size} h2 { font-size: ${fontSizeMap[size].h2}; }
      body.text-size-${size} h3 { font-size: ${fontSizeMap[size].h3}; }
      body.text-size-${size} p { font-size: ${fontSizeMap[size].p}; }
      
      /* Ensure buttons and inputs scale properly but exclude the accessibility menu */
      body.text-size-${size} button:not(.accessibility-button) { font-size: ${fontSizeMap[size].button}; }
      body.text-size-${size} input, 
      body.text-size-${size} textarea { font-size: ${fontSizeMap[size].input}; }
      
      /* Keep accessibility menu controls manageable regardless of font size */
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

  // Apply color theme - Simplified with colorblind-friendly options for Tailwind
  const applyColorTheme = (theme) => {
    // Remove existing theme classes
    document.body.classList.remove(
      'theme-default',
      'theme-colorblind',
      'theme-high-contrast'
    );
    
    // Add new theme class
    document.body.classList.add(`theme-${theme}`);
    
    // Create or get the style element for theme
    let themeStyleEl = document.getElementById('accessibility-color-theme');
    if (!themeStyleEl) {
      themeStyleEl = document.createElement('style');
      themeStyleEl.id = 'accessibility-color-theme';
      document.head.appendChild(themeStyleEl);
    }
    
    // Set theme-specific overrides that target Tailwind classes
    let themeCss = '';
    
    switch (theme) {
      case "colorblind":
        // Optimized for all types of colorblindness with blue and orange
        themeCss = `
          /* Override primary blue with a more distinct blue */
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
          
          /* Convert greens to blues */
          .theme-colorblind .bg-green-500, 
          .theme-colorblind .bg-green-600 {
            background-color: #0072B2 !important;
          }
          .theme-colorblind .text-green-500,
          .theme-colorblind .text-green-600,
          .theme-colorblind .text-green-700 {
            color: #0072B2 !important;
          }
          
          /* Convert reds to orange */
          .theme-colorblind .bg-red-500,
          .theme-colorblind .bg-red-600 {
            background-color: #E69F00 !important;
          }
          .theme-colorblind .text-red-500,
          .theme-colorblind .text-red-600 {
            color: #E69F00 !important;
          }
          
          /* Background colors */
          .theme-colorblind .bg-blue-50 {
            background-color: #E6F3FF !important;
          }
          .theme-colorblind .bg-green-50 {
            background-color: #E6F3FF !important;
          }
          .theme-colorblind .bg-red-50 {
            background-color: #FFF6E6 !important;
          }
          
          /* Add orange elements for better contrast */
          .theme-colorblind .bg-gray-200 {
            background-color: #FFF0D9 !important; /* Light orange */
          }
          .theme-colorblind [role="progressbar"] > div {
            border: 1px solid #E69F00 !important;
          }
          .theme-colorblind .rounded-full:not(.bg-red-500):not(.bg-blue-600):not(.bg-green-500):not(.dot) {
            border: 1px solid #E69F00 !important;
          }
          
          /* Add orange accent to action elements */
          .theme-colorblind button:not(.accessibility-button):not(.theme-button):not(.bg-blue-600):not(.bg-red-500):not(.bg-green-500):hover {
            border-color: #E69F00 !important;
            box-shadow: 0 0 0 1px #E69F00 !important;
          }
          
          /* Add orange to tab indicators */
          .theme-colorblind .border-b-2.border-blue-600 {
            border-color: #E69F00 !important;
          }
          
          /* Add orange accents to cards and panels */
          .theme-colorblind .border.border-gray-200 {
            border-left: 3px solid #E69F00 !important;
          }
          
          /* Make notifications and alerts orange */
          .theme-colorblind .bg-blue-100,
          .theme-colorblind .bg-blue-200 {
            background-color: #FFF0D9 !important; /* Light orange */
            border: 1px solid #E69F00 !important;
          }
          .theme-colorblind .text-blue-800 {
            color: #B25000 !important; /* Darker orange for text */
          }
          
          /* Ensure proper contrast */
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
          /* Set main background and text */
          .theme-high-contrast {
            background-color: black !important;
            color: white !important;
          }
          
          /* Make all text white by default */
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
          
          /* Convert backgrounds to black */
          .theme-high-contrast .bg-white,
          .theme-high-contrast .bg-gray-50,
          .theme-high-contrast .bg-gray-100,
          .theme-high-contrast .bg-gray-200,
          .theme-high-contrast .bg-blue-50,
          .theme-high-contrast .bg-green-50 {
            background-color: black !important;
            border: 2px solid white !important;
          }
          
          /* Make interactive elements stand out */
          .theme-high-contrast .bg-blue-600,
          .theme-high-contrast .hover\\:bg-blue-700:hover,
          .theme-high-contrast .bg-green-500,
          .theme-high-contrast .bg-red-500 {
            background-color: white !important;
            color: black !important;
          }
          
          /* Style buttons */
          .theme-high-contrast button:not(.accessibility-button) {
            background-color: black !important;
            border: 2px solid white !important;
            color: white !important;
          }
          
          /* Hover states */
          .theme-high-contrast button:not(.accessibility-button):hover {
            background-color: #333 !important;
          }
          
          /* Links */
          .theme-high-contrast a {
            color: yellow !important;
            text-decoration: underline !important;
          }
          
          /* Forms */
          .theme-high-contrast input,
          .theme-high-contrast textarea {
            background-color: black !important;
            border: 2px solid white !important;
            color: white !important;
          }
          
          /* Exception for the accessibility panel itself */
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
          
          /* Progress bars */
          .theme-high-contrast [role="progressbar"] {
            border: 1px solid white !important;
          }
          
          .theme-high-contrast [role="progressbar"] > div {
            background-color: white !important;
          }
        `;
        break;
        
      default: // Default theme
        themeCss = ''; // Reset all custom styles
        // Remove the style element if it exists
        if (themeStyleEl) {
          themeStyleEl.textContent = '';
        }
        break;
    }
    
    themeStyleEl.textContent = themeCss;
  };

  // Apply screen reader optimizations
  const applyScreenReaderMode = (enabled) => {
    if (enabled) {
      // Add ARIA labels to all buttons without proper labels
      const unlabeledButtons = document.querySelectorAll('button:not([aria-label]):not(:has(*))');
      unlabeledButtons.forEach(button => {
        if (!button.textContent.trim()) {
          button.setAttribute('aria-label', 'Button');
        }
      });
      
      // Add role attributes where missing
      const navElements = document.querySelectorAll('nav:not([role])');
      navElements.forEach(nav => {
        nav.setAttribute('role', 'navigation');
      });
      
      // Improve tab sections
      const tabPanels = document.querySelectorAll('[role="tabpanel"]');
      tabPanels.forEach(panel => {
        if (!panel.getAttribute('aria-labelledby')) {
          const id = panel.id;
          const tabId = id.replace('-panel', '-tab');
          panel.setAttribute('aria-labelledby', tabId);
        }
      });
      
      // Add tabindex to interactive elements
      const interactiveElements = document.querySelectorAll('div[onclick]:not([tabindex])');
      interactiveElements.forEach(element => {
        element.setAttribute('tabindex', '0');
      });
      
      // Add skip-link if not present
      if (!document.querySelector('.skip-to-content')) {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-to-content';
        skipLink.textContent = 'Skip to content';
        document.body.insertBefore(skipLink, document.body.firstChild);
      }
      
      // Add main landmark if missing
      const mainContent = document.querySelector('#main-content');
      if (mainContent && !mainContent.getAttribute('role')) {
        mainContent.setAttribute('role', 'main');
      }
    }
  };

  // Text to speech functionality
  const speakText = (text) => {
    if (speechSynthesis && textToSpeechEnabled) {
      // Cancel any ongoing speech
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

  // Speak the page content section by section
  const speakPageContent = () => {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    
    // Get all headings and their associated content
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let textToRead = [];
    
    headings.forEach(heading => {
      const headingText = heading.textContent.trim();
      let contentText = '';
      
      // Get the content following this heading until the next heading
      let nextEl = heading.nextElementSibling;
      while (nextEl && !nextEl.matches('h1, h2, h3, h4, h5, h6')) {
        contentText += ' ' + nextEl.textContent.trim();
        nextEl = nextEl.nextElementSibling;
      }
      
      textToRead.push(`${headingText}. ${contentText}`);
    });
    
    // If no headings found, just read all paragraph content
    if (textToRead.length === 0) {
      const paragraphs = document.querySelectorAll('p');
      textToRead = Array.from(paragraphs).map(p => p.textContent.trim());
    }
    
    const fullText = textToRead.join('. ');
    speakText(fullText);
  };

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem("accessibility-fontSize", fontSize);
    localStorage.setItem("accessibility-colorTheme", colorTheme);
    localStorage.setItem("accessibility-textToSpeech", textToSpeechEnabled);
    localStorage.setItem("accessibility-screenReader", screenReaderMode);
    
    // Apply settings
    applyFontSize(fontSize);
    applyColorTheme(colorTheme);
    applyScreenReaderMode(screenReaderMode);
    
    // Show saved notification
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
    
    // Close menu after saving
    setIsOpen(false);
  };

  // Reset settings
  const resetSettings = () => {
    setFontSize("medium");
    setColorTheme("default");
    setTextToSpeechEnabled(false);
    setScreenReaderMode(false);
    
    // Remove from localStorage
    localStorage.removeItem("accessibility-fontSize");
    localStorage.removeItem("accessibility-colorTheme");
    localStorage.removeItem("accessibility-textToSpeech");
    localStorage.removeItem("accessibility-screenReader");
    
    // Apply reset settings
    applyFontSize("medium");
    applyColorTheme("default");
    
    // Reset speech synthesis
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  return (
    <div className="relative z-50">
      {/* Accessibility button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="accessibility-button fixed right-4 bottom-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="Accessibility Options"
      >
        <Settings className="h-6 w-6" />
      </button>
      
      {/* Accessibility menu panel */}
      {isOpen && (
        <div className="accessibility-menu-panel accessibility-menu-controls fixed right-4 bottom-20 w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-600" aria-hidden="true" />
              Accessibility Options
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="accessibility-button text-gray-500 hover:text-gray-700"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Font Size */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 flex items-center mb-3">
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
                    className={`accessibility-button px-3 py-2 rounded ${
                      fontSize === size
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Color Theme - Simplified */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 flex items-center mb-3">
                <Eye className="h-4 w-4 mr-2 text-blue-600" aria-hidden="true" />
                Color Theme
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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
                    className={`accessibility-button theme-button px-3 py-2 rounded text-center ${
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
            
            {/* Text to Speech */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 flex items-center mb-3">
                <Volume2 className="h-4 w-4 mr-2 text-blue-600" aria-hidden="true" />
                Text to Speech
              </h3>
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={textToSpeechEnabled}
                      onChange={() => setTextToSpeechEnabled(!textToSpeechEnabled)}
                    />
                    <div className={`block w-10 h-6 rounded-full ${
                      textToSpeechEnabled ? "bg-blue-600" : "bg-gray-300"
                    }`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                      textToSpeechEnabled ? "transform translate-x-4" : ""
                    }`}></div>
                  </div>
                  <span className="ml-3 text-sm text-gray-700">Enable text to speech</span>
                </label>
                
                <button
                  onClick={speakPageContent}
                  disabled={!textToSpeechEnabled}
                  className={`accessibility-button px-3 py-1 rounded ${
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
            
            {/* Screen Reader Mode */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 flex items-center mb-3">
                <Monitor className="h-4 w-4 mr-2 text-blue-600" aria-hidden="true" />
                Screen Reader Optimization
              </h3>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={screenReaderMode}
                    onChange={() => setScreenReaderMode(!screenReaderMode)}
                  />
                  <div className={`block w-10 h-6 rounded-full ${
                    screenReaderMode ? "bg-blue-600" : "bg-gray-300"
                  }`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                    screenReaderMode ? "transform translate-x-4" : ""
                  }`}></div>
                </div>
                <span className="ml-3 text-sm text-gray-700">Optimize for screen readers</span>
              </label>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3 pt-3 border-t border-gray-200">
              <button
                onClick={saveSettings}
                className="accessibility-button flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                Save Settings
              </button>
              <button
                onClick={resetSettings}
                className="accessibility-button flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
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