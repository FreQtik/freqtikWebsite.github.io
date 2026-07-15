FREQTIK.COM SAFE HOMEPAGE + COPY CLEANUP
===========================================

WHAT THIS DOES
--------------
1. Uses your repository's own current impulse-anvil.html as the exact source for index.html.
   It does not rebuild or imitate the product page.
2. Keeps impulse-anvil.html working for old links, but makes https://freqtik.com/ the canonical product homepage.
3. Simplifies the visible Connect heading to:

   Connect

4. Keeps the existing Email, Discord, YouTube and Instagram cards.
5. Removes only these two card descriptions:

   Installation videos, activation guidance, demonstrations and longer explanations of FreQtik tools and development work.

   Short-form project posts, visual development updates and selected work from the broader FreQtik catalogue.

6. Removes the old repeated AI-process messaging from public HTML, the shared JavaScript fallback content and the machine-readable llms files.
7. Creates a complete timestamped backup OUTSIDE the repository before changing anything.
8. Validates the homepage identity, Connect copy, AI-copy removal, sitemap XML and JavaScript syntax when Node.js is available.

EXACT STEPS
-----------
1. Open your freqtikWebsite.github.io repository in GitHub Desktop.
2. Fetch/Pull so your local repository is fully current.
3. Make a normal manual backup of the repository as an extra precaution.
4. Extract this ZIP.
5. Copy the complete folder named:

   freqtik_site_cleanup_safe

   into the repository root, beside:

   impulse-anvil.html
   connect.html
   assets

6. Open the freqtik_site_cleanup_safe folder.
7. Double-click:

   RUN_FREQTIK_CLEANUP.bat

8. The window must finish with:

   PASS — cleanup completed safely.

9. Delete the extracted freqtik_site_cleanup_safe folder from the repository before committing.
10. Review every change in GitHub Desktop.
11. Commit and push.

EXPECTED CHANGES
----------------
- index.html becomes the exact current Impulse Anvil product page.
- impulse-anvil.html receives root canonical metadata and remains available.
- connect.html receives the requested simplified heading/copy removal.
- assets/freqtik-site.js receives the same fallback/dynamic cleanup.
- assets/freqtik-site.css may only receive a harmless internal class rename.
- about.html or another root HTML file changes only if obsolete AI-process wording is actually present.
- llms.txt and llms-full.txt become clean factual summaries.
- sitemap.xml stops advertising the duplicated /impulse-anvil.html URL as a separate canonical page.

BACKUP / RESTORE
----------------
The script creates a folder beside your repository named similar to:

freqtik_cleanup_backup_20260715_154500

It contains every original file that was changed plus CLEANUP_REPORT.txt.
To restore, copy the files from that backup folder back into the repository using the same paths.

AFTER GITHUB PAGES DEPLOYS
--------------------------
Check these in a private/incognito browser:

https://freqtik.com/
https://freqtik.com/impulse-anvil.html
https://freqtik.com/connect.html
https://freqtik.com/about.html
https://freqtik.com/llms.txt
https://freqtik.com/llms-full.txt
https://freqtik.com/sitemap.xml

The root and old product URL should both show Impulse Anvil. Connect should have only the simple Connect heading above the existing cards, with no descriptive paragraph inside the YouTube or Instagram cards.

SEARCH / LLM CACHES
-------------------
Publishing corrected files does not instantly erase old search snippets or cached model summaries. After deployment, use Google Search Console URL Inspection to request indexing for the root, About and Connect pages, and resubmit sitemap.xml. Do the equivalent URL submission in Bing Webmaster Tools.
