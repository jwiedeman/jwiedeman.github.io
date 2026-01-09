#!/usr/bin/env node
/**
 * Page Test Suite
 * Validates all generated pages for common issues:
 * - CSS properly linked
 * - No empty body content
 * - No raw HTML rendering (markdown parsing issues)
 * - Valid HTML structure
 * - Internal links resolve to existing pages
 */

import { readdir, readFile, access } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DIST_DIR = join(__dirname, '..', 'dist');

const issues = [];
let totalPages = 0;
let passedPages = 0;

// Link validation tracking
const allLinks = new Map(); // href -> [pages that contain it]
const brokenLinks = new Map(); // href -> [pages that contain it]

async function getAllHtmlFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

function checkPage(filePath, content) {
  const pagePath = '/' + relative(DIST_DIR, filePath).replace('/index.html', '').replace('index.html', '/');
  const pageIssues = [];

  // Check 1: Has DOCTYPE
  if (!content.toLowerCase().includes('<!doctype html>')) {
    pageIssues.push('Missing DOCTYPE');
  }

  // Check 2: Has CSS link
  const hasCssLink = content.includes('<link') && content.includes('.css');
  const hasStyleTag = content.includes('<style>') || content.includes('<style ');
  if (!hasCssLink && !hasStyleTag) {
    pageIssues.push('No CSS found (missing <link> to stylesheet or <style> tag)');
  }

  // Check 3: Check for raw HTML tags rendered as text (markdown parsing issue)
  const rawHtmlPatterns = [
    /&lt;article\s+class=/gi,
    /&lt;div\s+class=/gi,
    /&lt;span\s+class=/gi,
    /&lt;h[1-6]\s+class=/gi,
    /<pre[^>]*>&lt;/gi,  // HTML escaped inside pre tags unexpectedly
  ];

  for (const pattern of rawHtmlPatterns) {
    if (pattern.test(content)) {
      pageIssues.push('Raw HTML tags rendered as text (possible markdown parsing issue)');
      break;
    }
  }

  // Check 4: Has actual content in body
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    const bodyContent = bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, '').trim();
    if (bodyContent.length < 100) {
      pageIssues.push('Body content suspiciously short (< 100 chars)');
    }
  } else {
    pageIssues.push('No <body> tag found');
  }

  // Check 5: Has title
  if (!content.includes('<title>') || content.includes('<title></title>')) {
    pageIssues.push('Missing or empty <title> tag');
  }

  // Check 6: Layout wrapper present (should have main or similar structure)
  if (!content.includes('<main') && !content.includes('<article') && !content.includes('class="container"')) {
    pageIssues.push('Missing main content wrapper');
  }

  // Check 7: No Astro errors rendered
  if (content.includes('AstroError') || content.includes('Error:') && content.includes('at ')) {
    pageIssues.push('Astro error message found in output');
  }

  // Check 8: Check for broken frontmatter
  if (content.includes('---\n') && content.includes('layout:')) {
    pageIssues.push('Raw frontmatter found in output (not processed)');
  }

  return { pagePath, issues: pageIssues };
}

/**
 * Extract all internal links from HTML content
 */
function extractInternalLinks(content, pagePath) {
  const links = [];
  // Match href="/..." patterns (internal links)
  const hrefRegex = /href=["'](\/([\w\-\.\/]*))["']/g;
  let match;

  while ((match = hrefRegex.exec(content)) !== null) {
    const href = match[1];
    // Skip anchor-only links, external protocols, and asset files we don't check
    if (href.startsWith('/#') ||
        href.includes('://') ||
        href.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i)) {
      continue;
    }
    links.push(href);
  }

  return links;
}

/**
 * Check if a path exists in the dist directory
 */
async function pathExists(href) {
  // Normalize the path
  let checkPath = href;

  // Remove leading slash
  if (checkPath.startsWith('/')) {
    checkPath = checkPath.slice(1);
  }

  // Possible file locations to check
  const possiblePaths = [];

  if (checkPath === '' || checkPath === '/') {
    possiblePaths.push(join(DIST_DIR, 'index.html'));
  } else if (checkPath.endsWith('.html')) {
    // Direct HTML file reference
    possiblePaths.push(join(DIST_DIR, checkPath));
  } else if (checkPath.endsWith('/')) {
    // Directory with trailing slash - look for index.html
    possiblePaths.push(join(DIST_DIR, checkPath, 'index.html'));
  } else {
    // Could be either a directory or a file
    possiblePaths.push(join(DIST_DIR, checkPath, 'index.html'));
    possiblePaths.push(join(DIST_DIR, checkPath + '.html'));
    possiblePaths.push(join(DIST_DIR, checkPath));
  }

  for (const path of possiblePaths) {
    try {
      await access(path);
      return true;
    } catch {
      // Continue to next possible path
    }
  }

  return false;
}

/**
 * Validate all collected links
 */
async function validateLinks() {
  console.log('\n========================================');
  console.log('  LINK VALIDATION');
  console.log('========================================\n');

  const uniqueLinks = [...allLinks.keys()];
  console.log(`Found ${uniqueLinks.length} unique internal links to validate\n`);

  let validCount = 0;
  let brokenCount = 0;

  for (const href of uniqueLinks) {
    const exists = await pathExists(href);
    const sourcePages = allLinks.get(href);

    if (exists) {
      validCount++;
      console.log(`\x1b[32m✓\x1b[0m ${href}`);
    } else {
      brokenCount++;
      brokenLinks.set(href, sourcePages);
      console.log(`\x1b[31m✗\x1b[0m ${href}`);
      console.log(`    Found in: ${sourcePages.slice(0, 3).join(', ')}${sourcePages.length > 3 ? ` (+${sourcePages.length - 3} more)` : ''}`);
    }
  }

  console.log('\n----------------------------------------');
  console.log(`\x1b[32mValid links: ${validCount}\x1b[0m`);
  console.log(`\x1b[31mBroken links: ${brokenCount}\x1b[0m`);

  return brokenCount;
}

async function runTests() {
  console.log('\n========================================');
  console.log('  PAGE TEST SUITE');
  console.log('========================================\n');

  try {
    const htmlFiles = await getAllHtmlFiles(DIST_DIR);
    totalPages = htmlFiles.length;

    console.log(`Found ${totalPages} pages to test\n`);

    for (const file of htmlFiles) {
      const content = await readFile(file, 'utf-8');
      const result = checkPage(file, content);

      // Extract links for validation
      const links = extractInternalLinks(content, result.pagePath);
      for (const href of links) {
        if (!allLinks.has(href)) {
          allLinks.set(href, []);
        }
        allLinks.get(href).push(result.pagePath);
      }

      if (result.issues.length > 0) {
        issues.push(result);
        console.log(`\x1b[31m✗\x1b[0m ${result.pagePath}`);
        result.issues.forEach(issue => {
          console.log(`    - ${issue}`);
        });
      } else {
        passedPages++;
        console.log(`\x1b[32m✓\x1b[0m ${result.pagePath}`);
      }
    }

    console.log('\n========================================');
    console.log('  PAGE STRUCTURE SUMMARY');
    console.log('========================================');
    console.log(`Total pages: ${totalPages}`);
    console.log(`\x1b[32mPassed: ${passedPages}\x1b[0m`);
    console.log(`\x1b[31mFailed: ${issues.length}\x1b[0m`);

    if (issues.length > 0) {
      console.log('\n\x1b[31mFailing pages:\x1b[0m');
      issues.forEach(({ pagePath, issues: pageIssues }) => {
        console.log(`  ${pagePath}:`);
        pageIssues.forEach(issue => console.log(`    - ${issue}`));
      });
    }

    // Validate all collected links
    const brokenLinkCount = await validateLinks();

    // Final summary
    console.log('\n========================================');
    console.log('  FINAL RESULTS');
    console.log('========================================');

    const totalIssues = issues.length + brokenLinkCount;

    if (totalIssues > 0) {
      if (issues.length > 0) {
        console.log(`\x1b[31m${issues.length} page(s) with structural issues\x1b[0m`);
      }
      if (brokenLinkCount > 0) {
        console.log(`\x1b[31m${brokenLinkCount} broken internal link(s)\x1b[0m`);
        console.log('\nBroken links:');
        brokenLinks.forEach((pages, href) => {
          console.log(`  ${href}`);
          console.log(`    → Found in: ${pages.slice(0, 3).join(', ')}${pages.length > 3 ? ` (+${pages.length - 3} more)` : ''}`);
        });
      }
      console.log('\n\x1b[31mTests failed!\x1b[0m\n');
      process.exit(1);
    } else {
      console.log('\x1b[32mAll pages passed structural checks!\x1b[0m');
      console.log('\x1b[32mAll internal links are valid!\x1b[0m');
      console.log('\n\x1b[32m✓ All tests passed!\x1b[0m\n');
      process.exit(0);
    }

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('\x1b[31mError: dist/ directory not found. Run `npm run build` first.\x1b[0m\n');
    } else {
      console.error('\x1b[31mError:\x1b[0m', error.message);
    }
    process.exit(1);
  }
}

runTests();
