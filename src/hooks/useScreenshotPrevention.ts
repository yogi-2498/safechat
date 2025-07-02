import { useEffect } from 'react';

export const useScreenshotPrevention = () => {
  useEffect(() => {
    // Prevent screenshot shortcuts
    const preventScreenshot = (e: KeyboardEvent) => {
      // Common screenshot shortcuts
      if (
        (e.key === 'PrintScreen') ||
        (e.ctrlKey && e.shiftKey && e.key === 'S') ||
        (e.metaKey && e.shiftKey && e.key === '3') ||
        (e.metaKey && e.shiftKey && e.key === '4') ||
        (e.metaKey && e.shiftKey && e.key === '5') ||
        (e.ctrlKey && e.key === 'p') ||
        (e.metaKey && e.key === 'p')
      ) {
        e.preventDefault();
        e.stopPropagation();
        console.warn('Screenshot attempt blocked for security');
        return false;
      }
    };

    // Prevent right-click context menu
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent drag and drop
    const preventDragDrop = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent text selection in sensitive areas
    const preventSelection = (e: Event) => {
      if ((e.target as HTMLElement).classList.contains('no-select')) {
        e.preventDefault();
        return false;
      }
    };

    // Detect developer tools (best effort)
    let devtools = { open: false, orientation: null };
    const threshold = 160;

    const detectDevTools = () => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools.open) {
          devtools.open = true;
          console.clear();
          console.log('%c🔒 SecureChat - Security Notice', 'color: #ff4444; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);');
          console.log('%c⚠️ Developer tools detected!', 'color: #ff8800; font-size: 18px; font-weight: bold;');
          console.log('%cFor security reasons, please close developer tools while using SecureChat.', 'color: #ffaa00; font-size: 14px;');
          console.log('%cThis helps protect your private conversations from potential security threats.', 'color: #ffaa00; font-size: 14px;');
          
          // Blur the page content when dev tools are open
          document.body.style.filter = 'blur(5px)';
          document.body.style.pointerEvents = 'none';
          
          // Show warning overlay
          const overlay = document.createElement('div');
          overlay.id = 'security-overlay';
          overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
            padding: 20px;
          `;
          overlay.innerHTML = `
            <div style="max-width: 500px;">
              <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
              <h2 style="color: #ff4444; margin-bottom: 20px; font-size: 24px;">Security Warning</h2>
              <p style="margin-bottom: 20px; font-size: 16px; line-height: 1.5;">
                Developer tools detected. For your security and privacy, 
                please close the developer tools to continue using SecureChat.
              </p>
              <p style="color: #ffaa00; font-size: 14px;">
                This protection helps keep your private conversations secure.
              </p>
            </div>
          `;
          document.body.appendChild(overlay);
        }
      } else {
        if (devtools.open) {
          devtools.open = false;
          document.body.style.filter = '';
          document.body.style.pointerEvents = '';
          const overlay = document.getElementById('security-overlay');
          if (overlay) {
            overlay.remove();
          }
        }
      }
    };

    // Disable common inspection shortcuts
    const disableInspection = (e: KeyboardEvent) => {
      if (
        (e.key === 'F12') ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.metaKey && e.altKey && e.key === 'I') ||
        (e.metaKey && e.altKey && e.key === 'C') ||
        (e.metaKey && e.altKey && e.key === 'J')
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('keydown', preventScreenshot, { capture: true });
    document.addEventListener('keydown', disableInspection, { capture: true });
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('dragstart', preventDragDrop);
    document.addEventListener('drop', preventDragDrop);
    document.addEventListener('selectstart', preventSelection);

    // Monitor for dev tools
    const devToolsInterval = setInterval(detectDevTools, 500);

    // Disable image dragging
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.draggable = false;
      img.addEventListener('dragstart', preventDragDrop);
    });

    // Add CSS to prevent text selection on sensitive elements
    const style = document.createElement('style');
    style.textContent = `
      .no-select {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      /* Prevent screenshot via CSS (limited effectiveness) */
      .secure-content {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        pointer-events: auto;
      }
      
      /* Hide content when printing */
      @media print {
        body * {
          visibility: hidden !important;
        }
        body::before {
          content: "🔒 This content is protected and cannot be printed for security reasons.";
          visibility: visible !important;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 24px;
          color: #333;
        }
      }
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', preventScreenshot, { capture: true });
      document.removeEventListener('keydown', disableInspection, { capture: true });
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('dragstart', preventDragDrop);
      document.removeEventListener('drop', preventDragDrop);
      document.removeEventListener('selectstart', preventSelection);
      clearInterval(devToolsInterval);
      
      // Remove security overlay if it exists
      const overlay = document.getElementById('security-overlay');
      if (overlay) {
        overlay.remove();
      }
      
      // Reset body styles
      document.body.style.filter = '';
      document.body.style.pointerEvents = '';
      
      // Remove added styles
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);
};