// src/utils/proxy.js
export async function fetchProxyUrl(targetUrl: string) {
  const useCloudKernel = localStorage.getItem('mathspot_use_cloud_kernel') === 'true';
  const apiKey = localStorage.getItem('mathspot_kernel_api_key') || '';

  if (useCloudKernel && apiKey) {
    try {
      // Route via Steel.dev or Hyperbrowser endpoint
      const response = await fetch('https://api.steel.dev/v1/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ url: targetUrl })
      });
      const session = await response.json();
      return session.proxyUrl || targetUrl;
    } catch (error) {
      console.error('Kernel routing failed, falling back to standard proxy:', error);
    }
  }
  
  // Standard direct URL or Cloudflare fallback route
  return targetUrl;
}