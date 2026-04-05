// Memory monitoring utility for API routes (since middleware can't use Node.js APIs)
export function logMemoryUsage(context?: string) {
  if (typeof process !== 'undefined') {
    const memUsage = process.memoryUsage();
    const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    
    // Log warning if memory usage is high (>200MB for server)
    if (memUsedMB > 200) {
      console.warn(`⚠️ High memory usage${context ? ` (${context})` : ''}: ${memUsedMB}MB / ${memTotalMB}MB`);
    }
    
    // Log memory stats occasionally for monitoring (1% chance)
    if (Math.random() < 0.01) {
      console.log(`📊 Memory${context ? ` (${context})` : ''}: ${memUsedMB}MB used, ${memTotalMB}MB total`);
    }
    
    return { memUsedMB, memTotalMB };
  }
  return { memUsedMB: 0, memTotalMB: 0 };
}

// Force garbage collection if available (for development)
export function forceGC() {
  if (typeof global !== 'undefined' && (global as any).gc) {
    (global as any).gc();
    console.log('🗑️ Forced garbage collection');
  }
}

// Memory-efficient response helper
export function createResponse(data: any, status = 200) {
  // Log memory before response
  logMemoryUsage('API Response');
  
  return Response.json(data, { 
    status,
    headers: {
      'Cache-Control': 'no-store', // Prevent memory bloat from caching large responses
    }
  });
}