#!/usr/bin/env node
/**
 * Page Test Suite
 * Validates all generated pages for common issues:
 * - CSS properly linked
 * - No empty body content
 * - No raw HTML rendering (markdown parsing issues)
 * - Valid HTML structure
 */

import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DIST_DIR = join(__dirname, '..', 'dist');

const issues = [];
let totalPages = 0;
let passedPages = 0;

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
    console.log('  SUMMARY');
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
      process.exit(1);
    } else {
      console.log('\n\x1b[32mAll pages passed!\x1b[0m\n');
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
