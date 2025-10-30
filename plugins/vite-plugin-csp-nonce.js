import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

/**
 * Vite plugin to generate nonces and hashes for CSP compliance
 * Eliminates the need for 'unsafe-inline' in CSP headers
 */
export default function cspNoncePlugin() {
  let scriptNonces = new Set();
  let styleNonces = new Set();
  let scriptHashes = new Set();
  let styleHashes = new Set();

  return {
    name: 'csp-nonce-plugin',
    
    // Generate nonces for inline scripts and styles during build
    transformIndexHtml: {
      enforce: 'post',
      transform(html) {
        // No-op: we will read nonces/hashes from the final HTML in writeBundle
        return html;
      }
    },

    // Process and add nonces to inline scripts/styles
    writeBundle(options, bundle) {
      // Read nonces and hashes from the final HTML output (do not modify content)
      Object.keys(bundle).forEach(fileName => {
        const file = bundle[fileName];
        if (!fileName.endsWith('.html')) return;

        // Vite outputs HTML as assets
        const html = typeof file.source === 'string' ? file.source : (file.source ? String(file.source) : '');
        if (!html) return;

        // Collect nonces and hashes for inline <script> without src
        const scriptRegex = /<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/gi;
        let scriptMatch;
        while ((scriptMatch = scriptRegex.exec(html)) !== null) {
          const attrs = scriptMatch[1] || '';
          const content = (scriptMatch[2] || '').trim();
          const nonceMatch = attrs.match(/nonce\s*=\s*["']([^"']+)["']/i);
          if (nonceMatch) {
            scriptNonces.add ? scriptNonces.add(nonceMatch[1]) : scriptNonces.set(nonceMatch[1], true);
          }
          if (content) {
            const hash = crypto.createHash('sha256').update(content).digest('base64');
            scriptHashes.add(hash);
          }
        }

        // Collect nonces and hashes for inline <style>
        const styleRegex = /<style([^>]*)>([\s\S]*?)<\/style>/gi;
        let styleMatch;
        while ((styleMatch = styleRegex.exec(html)) !== null) {
          const attrs = styleMatch[1] || '';
          const content = (styleMatch[2] || '').trim();
          const nonceMatch = attrs.match(/nonce\s*=\s*["']([^"']+)["']/i);
          if (nonceMatch) {
            styleNonces.add ? styleNonces.add(nonceMatch[1]) : styleNonces.set(nonceMatch[1], true);
          }
          if (content) {
            const hash = crypto.createHash('sha256').update(content).digest('base64');
            styleHashes.add(hash);
          }
        }
      });
      
      // Generate CSP header values file for server configuration
      const cspValues = {
        scriptNonces: Array.from(scriptNonces),
        styleNonces: Array.from(styleNonces),
        scriptHashes: Array.from(scriptHashes),
        styleHashes: Array.from(styleHashes),
        timestamp: new Date().toISOString()
      };

      // Generate CSP directives
      const scriptSrc = [
        "'self'",
        ...cspValues.scriptNonces.map(nonce => `'nonce-${nonce}'`),
        ...cspValues.scriptHashes.map(hash => `'sha256-${hash}'`)
      ].join(' ');

      const styleSrc = [
        "'self'",
        ...cspValues.styleNonces.map(nonce => `'nonce-${nonce}'`),
        ...cspValues.styleHashes.map(hash => `'sha256-${hash}'`)
      ].join(' ');

      const cspHeader = [
        `default-src 'self'`,
        `script-src ${scriptSrc}`,
        `style-src ${styleSrc}`,
        `img-src 'self' data: https:`,
        `font-src 'self' https:`,
        `connect-src 'self' https: wss:`,
        `frame-ancestors 'self'`,
        `base-uri 'self'`,
        `form-action 'self'`
      ].join('; ');

      // Write CSP configuration file
      const cspConfig = {
        header: cspHeader,
        values: cspValues,
        usage: {
          apache: `Header always set Content-Security-Policy "${cspHeader}"`,
          nginx: `add_header Content-Security-Policy "${cspHeader}" always;`,
          meta: `<meta http-equiv="Content-Security-Policy" content="${cspHeader}">`
        }
      };

      // Write to dist folder
      const outputDir = options.dir || 'dist';
      const configPath = path.join(outputDir, 'csp-config.json');
      fs.writeFileSync(configPath, JSON.stringify(cspConfig, null, 2));

      // Try to update .htaccess in the output dir with the strict CSP
      try {
        const htaccessPath = path.join(outputDir, '.htaccess');
        if (fs.existsSync(htaccessPath)) {
          const htContent = fs.readFileSync(htaccessPath, 'utf8');
          const cspLine = `Header always set Content-Security-Policy "${cspHeader}"`;
          const updated = htContent.match(/Header\s+always\s+set\s+Content-Security-Policy\s+"[^"]*"/)
            ? htContent.replace(/Header\s+always\s+set\s+Content-Security-Policy\s+"[^"]*"/, cspLine)
            : htContent.replace(/<IfModule\s+mod_headers\.c>\s*/i, (m) => `${m}\n  ${cspLine}\n`);
          fs.writeFileSync(htaccessPath, updated);
        }
      } catch (e) {
        console.warn('[csp-nonce-plugin] Failed to update .htaccess with CSP:', e?.message || e);
      }

      console.log('\n🔒 CSP Configuration generated:');
      console.log('📄 File: dist/csp-config.json');
      console.log('🔑 Script nonces:', cspValues.scriptNonces.length);
      console.log('🎨 Style nonces:', cspValues.styleNonces.length);
      console.log('🔐 Script hashes:', cspValues.scriptHashes.length);
      console.log('🎯 Style hashes:', cspValues.styleHashes.length);
    }
  };
}