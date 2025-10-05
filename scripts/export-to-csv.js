#!/usr/bin/env node

/**
 * Export JMdict data to CSV for Supabase import
 * Based on: https://supabase.com/docs/guides/database/import-data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const JMdict_URL =
  'https://github.com/yomidevs/jmdict-yomitan/releases/download/2025-10-04/JMdict_english.zip';
const DOWNLOAD_DIR = path.join(__dirname, '../temp');
const ZIP_FILE = path.join(DOWNLOAD_DIR, 'jmdict.zip');
const OUTPUT_DIR = path.join(__dirname, '../csv-export');

/**
 * Download file from URL using curl
 */
async function downloadFile(url, filepath) {
  const execAsync = promisify(exec);

  try {
    console.log(`📥 Downloading from: ${url}`);
    await execAsync(`curl -L -o "${filepath}" "${url}"`);
    console.log(`✅ Download complete: ${filepath}`);
  } catch (error) {
    throw new Error(`Failed to download: ${error.message}`);
  }
}

/**
 * Extract ZIP file using unzip command
 */
async function extractZip(zipPath, extractPath) {
  const execAsync = promisify(exec);

  try {
    console.log(`📦 Extracting: ${zipPath}`);
    await execAsync(`unzip -o "${zipPath}" -d "${extractPath}"`);
    console.log(`✅ Extraction complete: ${extractPath}`);
  } catch (error) {
    throw new Error(`Failed to extract ZIP: ${error.message}`);
  }
}

/**
 * Parse JMdict JSON data and convert to CSV format
 */
function parseJMdictData(jsonData) {
  const entries = [];

  for (const entry of jsonData) {
    // Yomitan format: [headword, reading, pos, register, frequency, definitions, ...]
    const headword = entry[0] || '';
    const reading = entry[1] || '';
    const pos = entry[2] || 'unknown';
    const frequency = entry[4] || null;
    const definitions = entry[5] || [];

    // Skip entries without headword or reading
    if (!headword && !reading) continue;

    // Extract definition text from structured content, separating Japanese and English
    const definitionTextsEn = [];
    const definitionTextsJa = [];

    for (const def of definitions) {
      if (def.type === 'structured-content' && def.content) {
        const extractText = (content, lang = null) => {
          if (typeof content === 'string') {
            return content;
          } else if (content.content) {
            if (Array.isArray(content.content)) {
              return content.content
                .map((c) => extractText(c, content.lang || lang))
                .join('');
            } else {
              return extractText(content.content, content.lang || lang);
            }
          }
          return '';
        };

        const text = extractText(def.content);
        if (text && text.trim()) {
          // Use the lang attribute if available, otherwise fall back to character detection
          const lang = def.content?.lang || def.content?.content?.lang;
          const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(
            text
          );

          if (lang === 'ja' || (lang !== 'en' && hasJapanese)) {
            definitionTextsJa.push(text.trim());
          } else if (
            lang === 'en' ||
            (!hasJapanese && text.match(/[a-zA-Z]/))
          ) {
            definitionTextsEn.push(text.trim());
          } else {
            // Fallback: if no clear language indicator, use character detection
            if (hasJapanese) {
              definitionTextsJa.push(text.trim());
            } else {
              definitionTextsEn.push(text.trim());
            }
          }
        }
      }
    }

    // Skip entries without definitions
    if (definitionTextsEn.length === 0 && definitionTextsJa.length === 0)
      continue;

    // Determine register based on content analysis
    let register = 'neutral';
    const allDefinitions = [...definitionTextsEn, ...definitionTextsJa]
      .join(' ')
      .toLowerCase();

    // Check for formality indicators in definitions
    if (
      allDefinitions.includes('vulgar') ||
      allDefinitions.includes('slang') ||
      allDefinitions.includes('rude') ||
      allDefinitions.includes('offensive')
    ) {
      register = 'vulgar';
    } else if (
      allDefinitions.includes('casual') ||
      allDefinitions.includes('informal') ||
      allDefinitions.includes('colloquial')
    ) {
      register = 'casual';
    } else if (
      allDefinitions.includes('polite') ||
      allDefinitions.includes('formal') ||
      allDefinitions.includes('honorific')
    ) {
      register = 'polite';
    }

    // Determine entry type based on register and content
    let entryType = 'dictionary';
    if (register === 'vulgar' || register === 'casual') {
      entryType = 'slang';
    }

    // Create entry
    entries.push({
      headword,
      reading,
      pos,
      register,
      dialect: '{}', // Empty array as JSON string
      tags: '{}', // Empty array as JSON string
      definition_ja: definitionTextsJa.join('; '),
      definition_en: definitionTextsEn.join('; '),
      entry_type: entryType,
      jlpt_level: null,
      frequency_rank: frequency,
      popularity: 0, // Seed data starts with 0 popularity
      notes: null,
    });
  }

  return entries;
}

/**
 * Convert entries to CSV format
 */
function entriesToCSV(entries) {
  if (entries.length === 0) return '';

  // Get headers from the first entry
  const headers = Object.keys(entries[0]);

  // Create CSV header row
  const csvHeader = headers.join(',');

  // Create CSV data rows
  const csvRows = entries.map((entry) => {
    return headers
      .map((header) => {
        const value = entry[header];
        if (value === null || value === undefined) {
          return '';
        }
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const stringValue = String(value);
        if (
          stringValue.includes(',') ||
          stringValue.includes('"') ||
          stringValue.includes('\n')
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(',');
  });

  return [csvHeader, ...csvRows].join('\n');
}

/**
 * Main export function
 */
async function main() {
  try {
    console.log('🚀 Starting JMdict CSV export...');

    // Create directories
    if (!fs.existsSync(DOWNLOAD_DIR)) {
      fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
    }
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Download JMdict
    console.log('📥 Downloading JMdict...');
    await downloadFile(JMdict_URL, ZIP_FILE);
    console.log('✅ Download complete');

    // Extract ZIP
    console.log('📦 Extracting ZIP...');
    await extractZip(ZIP_FILE, DOWNLOAD_DIR);
    console.log('✅ Extraction complete');

    // Find all term bank JSON files
    const files = fs.readdirSync(DOWNLOAD_DIR);
    const termBankFiles = files
      .filter((f) => f.startsWith('term_bank_') && f.endsWith('.json'))
      .sort((a, b) => {
        const aNum = parseInt(a.match(/term_bank_(\d+)\.json/)?.[1] || '0');
        const bNum = parseInt(b.match(/term_bank_(\d+)\.json/)?.[1] || '0');
        return aNum - bNum;
      });

    if (termBankFiles.length === 0) {
      throw new Error('No term bank files found in extracted archive');
    }

    console.log(`📖 Found ${termBankFiles.length} term bank files`);

    // Parse all term bank files
    console.log('📖 Parsing JMdict data...');
    let allEntries = [];

    for (const termBankFile of termBankFiles) {
      const jsonPath = path.join(DOWNLOAD_DIR, termBankFile);
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const entries = parseJMdictData(jsonData);
      allEntries = allEntries.concat(entries);
      console.log(`✅ Parsed ${termBankFile}: ${entries.length} entries`);
    }

    console.log(`✅ Total entries: ${allEntries.length}`);

    // Split into chunks for better CSV management
    const CHUNK_SIZE = 10000; // 10k entries per CSV file
    const chunks = [];
    for (let i = 0; i < allEntries.length; i += CHUNK_SIZE) {
      chunks.push(allEntries.slice(i, i + CHUNK_SIZE));
    }

    console.log(`📝 Creating ${chunks.length} CSV files...`);

    // Export to CSV files
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const csvContent = entriesToCSV(chunk);
      const csvPath = path.join(OUTPUT_DIR, `jmdict_entries_${i + 1}.csv`);

      fs.writeFileSync(csvPath, csvContent, 'utf8');
      console.log(`✅ Created ${csvPath} (${chunk.length} entries)`);
    }

    // Create a summary file
    const summaryPath = path.join(OUTPUT_DIR, 'import_summary.txt');
    const summary = `JMdict CSV Export Summary
=======================

Total entries: ${allEntries.length}
CSV files created: ${chunks.length}
Chunk size: ${CHUNK_SIZE} entries per file

Files:
${chunks.map((_, i) => `- jmdict_entries_${i + 1}.csv`).join('\n')}

Import Instructions:
1. Go to your Supabase dashboard
2. Navigate to Table Editor > slang table
3. Click "Insert" > "Import data from CSV"
4. Upload the CSV files one by one
5. Make sure to match the column headers

Note: The CSV files are ready for import into the 'slang' table.
All entries have popularity set to 0 as requested.
`;

    fs.writeFileSync(summaryPath, summary, 'utf8');
    console.log(`✅ Created summary: ${summaryPath}`);

    // Cleanup temp files
    console.log('🧹 Cleaning up...');
    fs.rmSync(DOWNLOAD_DIR, { recursive: true, force: true });
    console.log('✅ Cleanup complete');

    console.log('🎉 CSV export completed successfully!');
    console.log(`📁 CSV files saved to: ${OUTPUT_DIR}`);
    console.log('📋 Check import_summary.txt for detailed instructions');
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

main();
