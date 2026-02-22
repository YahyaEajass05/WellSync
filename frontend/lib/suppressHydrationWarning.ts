/**
 * Suppress hydration warnings caused by browser extensions
 * This filters out warnings related to browser extensions injecting attributes
 */

if (typeof window !== 'undefined') {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args) => {
    const errorString = args.join(' ');
    
    // Suppress hydration warnings from browser extensions
    if (
      errorString.includes('Extra attributes from the server') ||
      errorString.includes('__processed_') ||
      errorString.includes('bis_register') ||
      errorString.includes('bis_skin_checked') ||
      errorString.includes('Hydration failed') ||
      errorString.includes('did not match. Server:') ||
      errorString.includes('Warning: Extra attributes')
    ) {
      return;
    }
    
    originalError.apply(console, args);
  };

  console.warn = (...args) => {
    const warnString = args.join(' ');
    
    // Suppress hydration warnings from browser extensions
    if (
      warnString.includes('Extra attributes from the server') ||
      warnString.includes('__processed_') ||
      warnString.includes('bis_register') ||
      warnString.includes('bis_skin_checked') ||
      warnString.includes('Warning: Extra attributes')
    ) {
      return;
    }
    
    originalWarn.apply(console, args);
  };
}

export {};
