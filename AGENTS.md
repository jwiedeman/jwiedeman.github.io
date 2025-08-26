Codex Agent Development Guidelines (Astro Portfolio Project)
Project Overview

This repository hosts a personal portfolio website built with Astro, featuring a retro 1970s NASA-inspired design. The site will showcase the user's work, blog posts, lab projects, and personal info in a static site served via GitHub Pages. OpenAI Codex (or similar AI agent) will be writing code for this project, so these guidelines ensure the AI stays on track with the technology stack, design theme, and best practices.

Tech Stack: Astro framework (static site generator) with possible Tailwind CSS for styling. No backend or server-side code (GitHub Pages can only host static files).

Content Structure: Pages for Landing (home), Work, Blog, Lab, About, and possibly Contact or a Reading/Watch List. Content should be primarily written in Markdown (.md) for easy maintenance.

Goal: Maintain a clean, crisp, and timeless aesthetic (inspired by 1970s NASA designs) while achieving perfect Lighthouse scores (100 in Performance, Accessibility, Best Practices, SEO). The site should be fast, accessible, and easy to update.

Important: The current landing page design (including any canvas or unique visual elements) is already in place and should not be altered. Preserve the landing page layout and effects as-is. Focus development on expanding other sections (Work, Blog, Lab, About, etc.) in a way that isolates new features from the existing home page so nothing breaks.

Design Theme – 1970s NASA Retro Aesthetic

The website’s visual style must echo the 1970s NASA "worm" era design and a subtle SCP Foundation vibe. Because the AI cannot "see" a mockup, we describe the desired look in words and concrete style rules:

Color Scheme: Favor a high-contrast, minimal palette. Primarily use white or off-white backgrounds with black or dark-gray text for a clean look (similar to NASA documents). Introduce sparingly-used accent colors inspired by 1970s print design. For example, NASA’s 1975 guidelines used a black-and-white typographic style for a “futuristic and a little more grown up” look
itsnicethat.com
. In practice, this could mean an off-white #f3eddf background with charcoal-black #181818 text, and a limited set of retro accents like a deep red (#7e2522) or golden-orange (#bb8537) for highlights
scp-wiki.wikidot.com
. Keep the overall feel muted and professional, avoiding bright modern colors aside from the one or two vintage accent tones.

Typography: Use clean, sans-serif fonts reminiscent of the era. The NASA style was very typographic and sans-serif heavy
itsnicethat.com
. Choose a geometric sans-serif (for example, a font like Josefin Sans or Helvetica/Futura for headings to echo the NASA logotype style) and a highly legible sans-serif (or a subtle humanist sans like Nunito or system UI font) for body text. You may also incorporate a monospace or typewriter-style font for certain elements (like subheadings or meta text) to give an engineered, utilitarian feel (similar to text in technical manuals or the SCP site's computer-esque annotations). All text should be easily readable with clear hierarchy:

Top-level headings can be uppercase or have increased letter-spacing to suggest the NASA worm logo style.

Body text should be normal case for readability. Ensure sufficient line-height for a clean look.

Avoid overly decorative or script fonts—stick to functional, modernist typography.

Layout and Spacing: Embrace a grid-based, structured layout. The design should feel “engineered” – use consistent spacing, alignment, and sizing to convey stability. Leverage Astro/Tailwind to create a responsive grid or flex layouts that keep content orderly. Plenty of whitespace is key (margin and padding around sections and text) to achieve that liminal, uncluttered 1970s feel. NASA’s own design manual emphasizes using an underlying grid to give a publication a cohesive style and continuity
nasa.gov
. In practice:

Use consistent margins and padding (e.g., Tailwind utility classes like py-8, px-4, md:py-12 etc.) so elements aren’t cramped.

Stick to a limited set of font sizes and weights for headings vs body (Tailwind headings classes or utilities can help maintain consistency).

Align elements to a baseline grid where possible and use uniform column widths for multi-column sections (e.g., in a Work portfolio grid or a blog list).

Imagery and Graphics: The 1970s NASA aesthetic is minimalist. Favor simple geometric elements or engineering diagrams over glossy illustrations. If using images or media:

Integrate them sparingly and ensure they match the retro tone (perhaps desaturated or black-and-white images, or images with a slight grain to feel retro-futuristic).

All images must have descriptive alt text for accessibility.

Consider using CSS/Canvas for simple graphic touches (the landing page already has a canvas – keep such special effects isolated to where they belong, e.g., the homepage hero). Other pages can be mostly text-focused with perhaps small icons or motifs if needed (for example, an SVG of the NASA "worm" logo style in a corner, or simple line icons). But do not clutter – empty space and text are itself part of the aesthetic.

Overall Vibe: The site should feel like a blend of a NASA technical memo and an SCP archive:

Timeless and engineered to last – designs should not chase trendy web fads, but feel like they could be from any era (no excessive animations or ultra-modern gradients). Solid colors, clear borders or dividing lines, and a focus on content are preferred.

Slightly Liminal/Government Style – channel the SCP Foundation vibe by keeping the interface simple and serious. For example, you might include small details like coordinates (the homepage currently displays coordinates, which adds a mysterious technical touch), file numbers, or classifications in small text to enhance the theme (only as non-intrusive embellishments).

Consistency – apply the same style rules across all pages so the user experience is unified. Navigation, footers, and headings should appear in the same places and style site-wide, reinforcing continuity (just as NASA manuals enforce consistent layouts for cohesion
nasa.gov
).

By adhering to this design theme description, Codex should have a clear "mental image" of the style to implement via code (CSS classes, HTML structure). Every visual decision in code (colors, spacing, font sizing) should refer back to these principles.

Astro Framework Best Practices

It’s crucial that all development stays within Astro’s conventions – Codex should not introduce incompatible structures or stray into unsupported territory. Key guidelines for working with Astro:

Use Astro Components and Pages: Structure the site using Astro’s file-based routing. Each top-level page (Work, Blog, Lab, About, etc.) should be an Astro page component (e.g., src/pages/work.astro or a Markdown page). If common elements (like the header navigation or footer) are needed across pages, implement them as Astro components (e.g., src/components/Header.astro) and include in layouts. Do not attempt to use Next.js or React Router conventions – Astro has its own system (each .astro or .md in src/pages becomes a page). Follow Astro’s project structure for all content.

Prefer Markdown for Content: Non-interactive content pages (like blog posts, about page, lab write-ups) should be written in Markdown (.md or .mdx) whenever possible, so the user can easily edit text. Astro will render markdown pages using a layout. For example, the About page could be src/pages/about.md with frontmatter specifying a layout component for consistent header/footer. The blog can be a collection of markdown posts. Do set up Astro Content Collections for structured content like blog posts or project entries if there will be many of them – this provides typing and easy listing of entries. (E.g., define a content/blog/ collection, and have Astro generate a list page). If Content Collections are used, ensure to update the config and type definitions accordingly. If not using collections, a simpler approach is to place blog post MD files under src/pages/blog/ (using Astro’s filesystem routing for nested pages). Either approach is acceptable, but the former scales better.

Astro Islands & Frameworks: Keep the site mostly static. Astro allows using frameworks like React/Vue/Svelte for interactive components (Astro Islands), but use these sparingly and only when needed (for example, an interactive widget in the Lab section). The portfolio should largely be SSR static HTML for performance. If an interactive canvas or animation is present on the landing page (as already implemented), that can remain (likely plain JS in a script tag or a small component). Ensure any new interactive elements follow Astro’s pattern (e.g., an Astro component with a <script> for browser, or using client:load/client:idle directives if using a framework component). Do not introduce heavy client-side routing or single-page app behavior – we want each page as a static, server-rendered page (Astro’s default).

Integration Compliance: Make sure to integrate any tools via Astro’s official methods. For example, if using Tailwind CSS, use the Astro Tailwind integration or proper Vite plugin so that Tailwind classes work out-of-the-box
docs.astro.build
. Similarly, manage assets (images, icons) via Astro’s asset handling (you can import images in Astro components or use <Image /> component for automatic optimization). Codex should not hardcode paths that won’t work after build (use relative paths or Astro’s built-in utilities). Also, avoid using Node-specific APIs or modules in the front-end code since this must run in a static site context.

SEO and Meta: Each page should have appropriate <title> and meta description. Astro pages can set these in frontmatter or via a head block. Codex should ensure new pages include meaningful titles (e.g., "Blog – [Site Name]") and descriptions, helping achieve the 100 SEO score. Use semantic HTML5 elements (e.g., <main>, <header>, <footer>, <section>, <article> for blog posts, etc.) so that the document structure is clear to browsers and assistive technologies.

No External Conflicts: Do not modify or remove the existing global setup unless necessary. For instance, if the project already has a certain config for base URL or integration (the astro.config.mjs sets site: https://jwiedeman.github.io which is needed for correct asset paths). Keep such configurations intact. Any new config (like adding Tailwind, Markdown content collections, etc.) should be added in a way that doesn’t break the existing build or content.

Content Organization and Pages

The site is divided into several sections. Codex should manage content in a clear, maintainable way, preferably using Markdown files for textual content and Astro components for structure. Below are the main sections and how to handle them:

Landing Page: The home page (likely src/pages/index.astro) is already designed with a canvas or special visuals. Do not overhaul this page. If changes are needed, keep them minimal and do not disturb the existing canvas effect or layout. The landing page serves as a gateway with the user’s name/logo "JWIEDEMAN" and possibly a cool background (e.g., coordinates display, etc.). Ensure any site-wide changes (like CSS resets or global styles) do not unintentionally alter this page’s appearance. If necessary, isolate its custom styles (e.g., scope any canvas CSS/JS to only the index page).

Work: A page showcasing projects or work experience. Possibly a portfolio grid or list of the user’s notable projects, jobs, or art pieces. This can be a Markdown page with structured content (like a list of projects with titles, descriptions, and links), or an Astro page that programmatically lists items from a collection. Start simple: e.g., src/pages/work.md with sections for each project (title, role, description, tech used, etc.). Use consistent formatting (perhaps use <article> for each project, with a heading and paragraph). Ensure the styling matches the theme (maybe project titles in bold or all-caps, etc.). This page should be easy to update with new projects.

Blog: A section for the user’s blog posts or deep research articles. This likely requires multiple entries. Implement a Blog index page (src/pages/blog.astro or .md) that lists summaries of each post, and individual blog post pages. Use Astro’s content collection for “blog” if possible:

Define a schema (frontmatter fields like title, publish date, summary, tags).

Write posts in markdown in src/content/blog/*.md.

Generate the list automatically on the blog index page by retrieving all posts from the collection, sorted by date.
Each blog post page should have a consistent layout (perhaps a layout component BlogPostLayout.astro that includes the header, and maybe a table of contents or author info if needed). Important: Blog content will be text-heavy, so apply the Tailwind Typography plugin or appropriate CSS so that things like headings, paragraphs, lists in the Markdown are styled in keeping with our theme (e.g., proper font sizes, colors, and margins for h1, h2, p, li etc.). Maintain high readability – comfortable line lengths (maybe max-width around 60-70ch for text blocks) and sufficient line spacing.

Lab: A playground for fun projects, experiments, art, or research that doesn’t fit in the blog. You can treat Lab similar to Blog in structure if it will contain multiple entries (like case studies or experiments). Alternatively, if Lab will initially be a single page listing a bunch of things, you can make lab.md with an index of mini-projects (each could link to a detail page or an external link if it's hosted elsewhere). Given the user said "everything fun will go under lab," it might contain subpages for each experiment. Consider using a content collection or folder for Lab entries (like src/content/lab/ or simply multiple markdown files under src/pages/lab/). If using subpages, update navigation to handle a drop-down or list of lab items. But a simpler start: one Lab page listing all items with brief descriptions, and later each item could become its own page as needed.

About: A page about the user (personal background, contact info, etc.). This can be a static Markdown page (about.md) containing a biography, links to social media, maybe a profile picture (make sure to style any image to fit the theme, e.g., perhaps display it in a circle or a Polaroid-like frame with a caption if going retro). Include contact information here unless a dedicated Contact page is desired. Ensure to keep it professional and consistent in style (no wildly different design elements; use the same typography and spacing as elsewhere). Since this is personal, it can be slightly warmer in tone, but still within the designed aesthetic.

Contact: If the user wants a separate Contact page or section (they mentioned "contact" as a section), this could be combined with About or stand alone. If standalone (contact.md), keep it simple – perhaps a copy of the user's email, LinkedIn, or a contact form (though a form won’t work without server support on GH Pages, so better to provide an email/mailto link or use a service). Ensure any email is encoded or presented in a way to avoid spam bots (Astro can help by injecting email via script or using HTML entities). Design-wise, it should just follow the same style as About (maybe an <address> element or list of contacts).

Read/Watch List (Optional): The user suggested a possible "read/watch list" tab for fun. This would be a page where they list books, articles, or media they recommend or are currently consuming. If implemented, do so as a simple Markdown list of items (perhaps with sections for "Reading" and "Watching"). This page again should fit the theme (maybe styled like an index of documents or media). Use bullet points or numbered list as appropriate. This is lower priority, but if Codex adds it, ensure to also add a nav link for it.

General Content Guidelines:

Frontmatter: Use YAML frontmatter in Markdown pages for metadata. At minimum, each page or post should have a title. For blog posts, include date, description (for meta), and possibly tags. Use these in layouts for consistency (e.g., display the title in an <h1>, show the date).

Navigation: The top navigation menu (likely already present on the site with links for Work, Blog, Lab, About) must be updated to include any new sections (e.g., add Contact or Read/Watch if those become separate pages). Keep nav order logical (perhaps: Work, Blog, Lab, About, Contact). Make sure the nav styling stays consistent and is responsive (likely a simple horizontal list on desktop, maybe a burger or wrap on mobile if too many items). Do not remove the existing "JWIEDEMAN" title in the header – that's the site branding (ensure it links to home). If needed, implement the nav as a component and include it on all pages for easy maintenance.

Footer: If not already present, consider adding a minimal footer for completeness (could contain a copyright notice, or even just repeat the coordinates or a motto). This is optional; if added, style it unobtrusively (small text, perhaps centered). Ensure it doesn’t clash with the retro theme (it could even mimic the look of an old document footer or a terminal output).

By organizing content this way, the site remains maintainable. The user can add a new blog post by dropping a MD file in the folder, or update About.md easily. Codex should ensure any time new content features are added, they integrate smoothly with this structure (for example, if adding a new section later, follow the same patterns established).

Styling Implementation (Using Tailwind CSS)

We will use Tailwind CSS for styling utility classes (the user is fine with this). Tailwind allows rapid styling with low-specificity, which is good for keeping the design consistent. Follow these Tailwind-related guidelines:

Integration: Make sure Tailwind is set up in the project. The preferred method is using the official Astro Tailwind integration (@astrojs/tailwind)
docs.astro.build
. Check astro.config.mjs – if Tailwind is not already integrated, Codex should add it (install @astrojs/tailwind and add to integrations). Also include a Tailwind config file (tailwind.config.cjs or .js) if not present, and a base CSS file (likely src/styles/global.css) that imports Tailwind’s base, components, and utilities. Ensuring this setup will allow using class names like bg-gray-900 text-white directly in Astro components/MD content.

CSS Organization: Favor using Tailwind classes in the markup for most styling (colors, spacing, typography) rather than writing large custom CSS. This keeps styles co-located with components. However, for repeating complex styles or theme values, define them in the Tailwind config (for example, define custom colors for nasa-red or custom font families if using Google Fonts). This way, you can use text-nasa-red in classes after configuration. If needed, include a small amount of global CSS for things Tailwind utilities can’t easily handle (e.g., a complex CSS selector for the canvas background, or scroll bar styling), but keep it minimal.

Apply Theme through Classes: Use classes to implement the NASA aesthetic:

Colors: Use Tailwind’s palette for neutrals and our accent. For example, use bg-neutral-50 (which is an off-white) or define a custom color in config for the exact creamy tone. Text can be text-neutral-900 or custom text-charcoal if defined. Accent color (like red) can be one of Tailwind’s reds (e.g., text-red-600 for a deep red) or the custom #7e2522 we want (define it as say brandRed in the config and then text-brandRed). Use accent colors for small emphasis (links, icons, or section headings) to maintain impact.

Typography: Set global font family via Tailwind (in tailwind.config under theme.extend.fontFamily). For example:

fontFamily: {
  sans: ['Helvetica', 'Arial', 'sans-serif'], // or a specific imported font like 'Josefin Sans'
  mono: ['"Courier New"', 'monospace'] // if we want monospace for special text
}


Then use classes like font-sans for normal text (Tailwind uses sans by default for prose if configured) and font-mono where a typewriter effect is needed. Use tracking-wide or tracking-widest on heading text to get that spaced-out feel reminiscent of the NASA worm logo lettering.

Sizing: Use relative units (Tailwind default uses rems) so everything scales. Headings might use text-2xl, text-3xl etc., but adjust to look balanced. The design calls for big bold headings (maybe the site title uses something huge like text-5xl with font-bold and letter-spacing). Body text should be comfortable (text-base or lg for larger screens). Ensure responsive adjustments: Tailwind allows md:text-xl etc. for scaling font on larger screens.

Spacing: Apply generous padding and margin with Tailwind classes. For instance, wrap main content in a container with p-4 md:p-8 to give margins on small and more on large screens. Use space-y-4 to separate paragraphs or items nicely. The goal is an airy layout (it's better to err on more whitespace than too little for this aesthetic).

Components styling: For elements like navigation, use Tailwind to style the links (e.g., px-3 py-2 text-sm font-semibold uppercase hover:text-brandRed for nav links, as an example). For any card or panel (say if listing projects in Work or posts in Blog index), use simple borders or shadows sparingly: a thin border in a neutral color or a subtle shadow can add a 1970s print feel (the SCP retro theme uses double-line borders in places
scp-wiki.wikidot.com
scp-wiki.wikidot.com
 – we can simulate something similar if desired using Tailwind utilities for borders, e.g., border-2 border-t-0 border-b-0 border-l-0 border-r-0 border-neutral-300 to mimic a horizontal rule, or use divide-y classes for lists). Keep corners square or slightly rounded (sharp corners feel more utilitarian, but a small rounded class on cards is okay).

Dark Mode: Likely not needed unless explicitly desired. The theme is imagined in light mode (white background). We can forego dark mode for now to keep design consistent with the brief (1970s documents were obviously not dark-mode). If later needed, it can be added, but Codex should focus on the provided aesthetic.

Tailwind Typography: If not already, consider adding @tailwindcss/typography plugin. This gives a prose class that nicely styles raw HTML content (like generated from Markdown). We can then do something like <article class="prose prose-lg"> to automatically apply typography styling to blog content (headings, lists, code, etc.). Be sure to customize it to match our theme: e.g., in the Tailwind config:

typography: {
  DEFAULT: {
    css: {
      color: '#181818', // base text color
      a: { color: '#7e2522', textDecoration: 'none' },
      'a:hover': { textDecoration: 'underline' },
      h1: { fontFamily: 'Helvetica, Arial, sans-serif', textTransform: 'uppercase' },
      // ... other element customizations
    }
  }
}


This ensures any Markdown content automatically gets the right look without manually adding tons of classes in the MD files. If Codex is not comfortable with the plugin, it can also manually style elements in the markdown by adding classes via MDX or wrapping content in appropriate <div class="...">. The key is to not leave the default browser styles (which may be unstyled or inconsistent).

Testing Styles: After applying styles, Codex should verify the site design by running it and possibly comparing to design goals:

Check that text is easily readable (no tiny font, no low-contrast).

Check that the accent color is used sparingly and consistently (e.g., all hyperlinks could be the same accent color, and maybe on hover they underline or invert color as a nice touch).

Ensure the layout doesn’t break on mobile: use responsive classes to stack layouts vertically on small screens (Tailwind’s md:flex etc. can help). The nav might need a mobile treatment (stack links or a simple menu icon) – if implementing, keep it simple (maybe a <details> dropdown or just a vertical list).

Confirm the site still scores ~100 on Lighthouse. Things that might affect performance: large unoptimized images (so use appropriate sizes or Astro <Image>), excessive JS (avoid that), huge font files (if importing multiple custom fonts, consider performance; maybe use font-display: swap in CSS or host the fonts locally to avoid CDN issues).

By following these styling rules, Codex will implement the desired look and feel in actual CSS terms, keeping the site visually consistent with the theme.

Accessibility & Performance Considerations

To maintain a perfect Lighthouse score (100%) on all metrics, the agent must be diligent about accessibility, performance, and best practices:

Accessibility: All pages must be accessible:

Use semantic HTML tags (as noted earlier) – e.g., wrap page content in <main>, use <nav> for navigation, use headings in logical order (<h1> per page, then <h2> for sub-sections, etc.).

Ensure alt attributes on all images. Alt text should be descriptive of the image content or purpose. If an image is purely decorative, still provide an empty alt="" to indicate it’s intentional.

Ensure sufficient color contrast. The chosen black text on off-white easily passes contrast checks. If using the deep red on off-white for text, ensure it’s mainly for larger or bold text (as smaller red on white might be slightly low contrast; test with contrast ratio tools if uncertain).

Forms or interactive controls (if any) should have associated labels. (Probably this site has no extensive forms aside maybe a contact form or search bar in future – in which case, label them).

Use ARIA roles or labels if needed for any custom components (for example, if using a <canvas>, ensure there’s an aria-label or descriptive text for screen readers describing what the visual is).

Test keyboard navigation – all interactive elements (links, buttons) should be reachable and usable via keyboard (Tailwind classes don’t hinder this inherently, but if any custom JS, ensure it’s accessible).

Performance:

Optimize images: If the site uses any large images (like project screenshots or blog post images), utilize Astro’s built-in optimizations. The @astrojs/image integration or <Image> component can generate responsive image sets. Alternatively, manually ensure images are compressed and not much larger than needed for the layout. For example, an image meant to display at 800px width should not be a 4000px wide file.

Minimize JavaScript: Astro by default will remove any unused JS. Only include scripts when necessary (e.g., the homepage canvas script). Do not import large JS libraries unless absolutely needed. No client-side routing frameworks, etc. The smaller the JS bundle, the faster the site.

Use appropriate <link rel="preload"> or other hints if needed for critical assets (like if a particular font or hero image is crucial, ensure it loads quickly). Astro can inject some of these if configured (e.g., the prefetch: true in astro.config is already on, which helps performance by prefetching next pages).

Keep CSS efficient: Tailwind will purge unused styles, so that’s good. Avoid inline styles or large style blocks that aren’t needed.

Lighthouse also checks Best Practices: e.g., using async on scripts where possible, avoiding deprecated APIs, etc. Codex should follow modern best practices (Astro largely covers these by design). Just be careful with any custom code to not introduce warnings (for example, don’t use document.write, avoid large DOM sizes, etc., none of which should happen here).

SEO:

Each page should have a unique <title> and a meta description. Astro allows setting these in a layout or per page frontmatter. Codex should implement that: e.g., the layout could accept a title and use <title>{title} | JWiedeman Portfolio</title>. For blog posts, use the post title and maybe blog name.

Use headings meaningfully – the homepage might have a <h1>JWIEDEMAN</h1> as a logo text. Each sub-page should start with a clear <h1> (e.g., "Work", "Blog", etc.) for structure.

If the site has a blog, adding structured data (like JSON-LD for blog posts) is nice-to-have but not required for initial version. At minimum, make sure the HTML outlines the content clearly.

Ensure links have descriptive text (no “click here” – use the title of the target as the link text when possible).

If any external links exist, add rel="noopener" to them (Lighthouse checks for that on target _blank links).

Create a simple sitemap.xml if Astro doesn’t by default, or just rely on Astro’s build (Astro may not auto-generate one, but given the site is small, it’s okay).

By following these, the site should continue to hit top Lighthouse scores. Codex should run Lighthouse or at least manually verify each category after changes:

Performance: Check for 100 (or close) and optimize if not (maybe unoptimized images or too much JS are common culprits).

Accessibility: Ensure no obvious issues (Astro has good defaults, but missing alt text or improper heading order are typical issues to watch).

Best Practices: Usually about using HTTPS, correct image aspect ratios, etc. With GH Pages and Astro, most are fine by default. Just avoid introducing any.

SEO: If any SEO item is missing (like a <meta>), add it.

Quality Assurance & Self-Testing

Codex must QA its own changes before considering the task done. This means every time a new feature or page is added, the agent should verify functionality and fix issues proactively. The QA checklist for the agent:

Build and Dev Test: After making code changes, run the site locally (using npm start or astro dev) and also build it (astro build) to catch any issues. Fix any errors or warnings that appear in the terminal. For example, Astro will warn about missing modules, unreachable links, etc. Codex should address those (install any missing dependency, correct broken links, etc.). The site must build without errors and render properly.

Visual Inspection: Open the local site in a browser at various pages:

Check that the new pages (Work, Blog, Lab, etc.) load and display content correctly. No layout glitches, no obviously missing styles.

Ensure the navigation links all work (click through each link in the header; no 404s or console errors).

If there's dynamic content (like blog list generation), ensure all expected items show up and links lead to the correct pages.

Look at the site on different screen sizes if possible (at least simulate a mobile width vs desktop width in dev tools) to ensure responsiveness.

Verify that the landing page canvas or special effects still function as before and are not affected by new CSS. If any regression is found (e.g., a new global style broke the canvas sizing), adjust the code to fix it.

Linting and Formatting: If the project has ESLint, Prettier or other linters configured, run them (e.g., npm run lint or npm run format). The agent should fix any lint issues (like unused variables, inconsistent indentations, etc.) automatically. Code style should remain consistent. Even if no formal lint is present, Codex should follow standard conventions:

Indent code properly (2 spaces by default for HTML/JS in Astro).

Use consistent quotes, preferably single quotes in JS, and double quotes in HTML attributes (unless the project uses a different style).

Remove any debugging code or console.log statements before commit.

Ensure file naming conventions are followed (lowercase, no spaces, Astro components capitalized if they export a component).

Automated Testing: If the repository has tests (which is unlikely for a simple portfolio, but just in case), run them (npm test) and ensure they pass. If no tests exist, the agent might consider adding simple tests (for example, a link checker or unit tests for any significant JavaScript logic). However, given this is a static site, focus can be on manual testing and maybe adding a Markdown link checker to avoid broken links in content.

Content Verification: Double-check written content for typos or placeholder text. The agent is writing not just code but also initial content (perhaps sample project descriptions, blog post template). Make sure everything is spelled correctly and is in a consistent, professional tone that matches the user’s style (likely a mix of research/tech and personal). The user can edit later, but we should not introduce glaring mistakes.

No Merge Conflicts: Before finalizing changes, Codex should update its branch with the latest main (or target branch) to ensure no merge conflicts. If the user made changes outside Codex’s knowledge, integrate them:

Perform a git pull origin main (or equivalent fetch/merge) in the working copy.

If conflicts occur, resolve them carefully. Typically, keep both the user’s changes and Codex’s improvements if they pertain to different things. For example, if the user edited some text in a file and Codex is also editing that file, merge the content logically so nothing is lost. Never leave conflict markers (<<<<<< HEAD etc.) in files – these must be cleaned up before commit.

After resolving, run the site build/test again to ensure the merge didn’t break anything unexpectedly.

Commit the merged result.

Final Review: As a last step, Codex should review the diff of its changes. Ensure that only intended files are changed. Remove any debug artifacts or unnecessary files (sometimes AI might create stray files; make sure to delete those if not needed). The final state should be a clean, cohesive set of changes that add the intended features.

By performing this self-QA, Codex will significantly reduce the burden on the user to fix things. The goal is that when Codex opens a Pull Request, it’s essentially ready to merge: no obvious bugs, conflicts resolved, coding style consistent, and meets all criteria (design and technical).

Git Workflow & PR Guidelines

To streamline collaboration, Codex should follow a proper Git workflow. This prevents messy PRs and ensures changes integrate smoothly:

Stay Updated: Before starting work on a new feature or fix, pull the latest changes from the main branch. Work in a feature branch (e.g., codex-blog-section for adding the blog) branched off of up-to-date main. This minimizes the chance of large conflicts later.

Granular Commits: Make frequent commits with clear messages. For example, commit after scaffolding a new page (feat: add basic Blog index page), after styling it (style: apply NASA theme styles to Blog page), etc. This makes it easier to troubleshoot specific changes. Use conventional commits style if possible (feat, fix, docs, etc.), or at least descriptive phrases.

Testing Before Commit: As noted in QA, test changes locally before committing. It’s easier to fix issues in your working directory than after pushing.

Resolve Conflicts Early: If you see that the main branch has moved forward while you were working, consider merging or rebasing your branch periodically. It is often easier to resolve a small conflict earlier than many conflicts later. For instance, if both Codex and the user are editing the nav menu, integrate those changes sooner rather than later.

Pre-Push Checklist: Before pushing a branch to origin:

Run npm run build to ensure it builds.

Run linters/tests, fix any errors.

Ensure no <<<< HEAD markers in code (search the repository for <<<< just in case).

Double-check that no unintended files are included (e.g., no local config or Node modules got in).

Pull Request (PR): When opening a PR, Codex should provide a clear description of what the PR does. Enumerate new features or changes, e.g.:

Added Blog and Lab sections. This PR introduces a new /blog page listing posts and the ability to add Markdown blog posts. It also adds a /lab page for experimental content. Navigation updated accordingly. Also includes Tailwind integration for styling, and all pages follow the retro NASA theme.
Mention that all tests pass and highlight any areas where you want the user’s feedback (maybe on content or design tweaks). A well-written PR message helps the user understand and trust the changes.

Self-Merge: The user explicitly wants Codex to resolve merge conflicts before finalizing the PR. That means the PR should be mergeable automatically. If the PR shows conflicts, Codex must fix them (either in the branch or by closing and re-opening a fresh PR after rebasing). The user should not have to manually resolve conflicts in order to accept Codex’s work.

Post-Merge Checks: After a PR is merged (or if Codex has push access and pushes directly to main with user’s go-ahead), verify the live site if possible. Because this is GitHub Pages, merging into main (assuming it’s the publishing branch) will trigger a Pages deploy. Codex can check the deployment status (if accessible) or at least confirm that the site builds on CI (if CI is set up). If any issue arises in production (maybe a case-sensitive path on Linux breaking an image load, etc.), promptly address it with a follow-up fix commit/PR.

By following this Git workflow, Codex will greatly reduce the “merge conflict hell” that the user wants to avoid. The key is to be proactive and thorough: always integrate changes cleanly and test them, so the user can confidently merge the PR without cleanup.

Continuous Improvement and Maintenance

Lastly, as an AI developer, Codex should treat these guidelines as a living document. Always adhere to them, and update its approach when the project evolves. A few parting recommendations:

Stay in Astro Compliance: Any future feature (say adding a gallery, search functionality, etc.) should be implemented the “Astro way.” If unsure, Codex should research Astro documentation or this agents.md for guidance rather than guess with a different framework. Consistency in approach will keep the codebase clean.

Preserve Design Consistency: When adding new pages or elements, always apply the established design theme. For example, if a new section “Gallery” is added in the future, it should look like it belongs to the same site (same fonts, colors, spacing). Codex can refer back to the theme description here for each new addition. Consistency is what makes the site feel “engineered to last” and professional.

Refactor when Needed: If Codex notices duplication or suboptimal code structure during future tasks, it should gently refactor to improve it within the scope of its work. For instance, if multiple pages use the same chunk of HTML for a hero banner, consider abstracting it into a component. Or if the CSS grows, maybe introduce design tokens in Tailwind config. Always ensure refactors don’t change the external behavior/design, just make the code cleaner. And of course, test after refactoring.

Document Changes: Update documentation or comments in the code when making non-trivial changes. For example, if adding a complex interactive feature in the Lab, comment the code so the user (and future Codex runs) can understand it. If adding a new library or dependency, note why. This agents.md itself can be updated if major shifts occur (e.g., if the design theme changes or new conventions are adopted, the guidelines should be revised for the AI). For now, it reflects the current goals.

Self-Check Before Finalizing: Cultivate a habit of reviewing these guidelines before concluding each development session. This ensures nothing is forgotten – e.g., “Did I remember to add alt tags? Are all new pages in the nav? Does it still match the NASA theme?” Use this document as a checklist.

By following all the above guidelines, the Codex agent will produce work that is high-quality, on-brand, and low-friction for the user. The portfolio site will remain a clean, crisp, retro-modern showcase for the user’s content, and future additions will integrate smoothly.

Let’s keep the site stellar and on-course – much like a well-run space mission, with every component in the right place, working in unison. Good luck, and happy coding! 🚀
