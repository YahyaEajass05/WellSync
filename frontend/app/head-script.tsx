'use client';

import { useEffect } from 'react';

/**
 * Client-side script to clean up browser extension attributes
 * This removes attributes injected by browser extensions like Bitwarden, LastPass, etc.
 */
export function HeadScript() {
  useEffect(() => {
    // Clean up browser extension attributes on mount
    const cleanupAttributes = () => {
      const body = document.body;
      const html = document.documentElement;
      
      // List of known browser extension attributes
      const extensionAttributes = [
        '__processed_',
        'bis_register',
        'bis_skin_checked',
        'bis_size',
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed',
        'data-gr-c-s-loaded',
        'cz-shortcut-listen',
        'data-lastpass',
        'data-lpignore',
      ];
      
      // Remove from body
      extensionAttributes.forEach(attr => {
        Array.from(body.attributes).forEach(attribute => {
          if (attribute.name.includes(attr)) {
            body.removeAttribute(attribute.name);
          }
        });
        
        Array.from(html.attributes).forEach(attribute => {
          if (attribute.name.includes(attr)) {
            html.removeAttribute(attribute.name);
          }
        });
      });
    };
    
    // Run on mount
    cleanupAttributes();
    
    // Also run after a short delay to catch late injections
    const timer = setTimeout(cleanupAttributes, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return null;
}
