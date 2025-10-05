# JMdict CSV Export

This directory contains scripts for exporting JMdict data to CSV format for Supabase import.

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the export script:**
   ```bash
   npm run export:csv
   ```

## Usage

### Export JMdict Data to CSV

```bash
# Export all JMdict entries to CSV files
npm run export:csv
```

This will:

- Download the latest JMdict data from GitHub
- Parse and transform the data
- Export to CSV files (10,000 entries per file)
- Save files to `../csv-export/` directory

## Output

The script creates:

- **CSV files** - `jmdict_entries_1.csv`, `jmdict_entries_2.csv`, etc.
- **README.md** - Detailed import instructions
- **import_summary.txt** - File list and instructions

## Import into Supabase

After running the export, you can import the CSV files into Supabase using:

1. **Supabase Dashboard** (Recommended)

   - Go to Table Editor → slang table
   - Click "Insert" → "Import data from CSV"
   - Upload the CSV files one by one

2. **pgloader** (For large datasets)

   ```bash
   pgloader jmdict_entries_1.csv postgresql://user:pass@host:port/db
   ```

3. **Postgres COPY command**
   ```sql
   COPY slang FROM '/path/to/jmdict_entries_1.csv'
   WITH (FORMAT csv, HEADER true);
   ```

## Configuration

The export script:

- Downloads from the official JMdict Yomitan repository
- Parses 322,482+ dictionary entries
- Exports to CSV with proper formatting
- Sets all entries to `popularity: 0`
- Handles special characters and escaping

## Troubleshooting

### Download Issues

If the download fails:

1. **Check internet connection**
2. **Verify the JMdict URL is accessible**
3. **Check available disk space**

### Parsing Issues

If parsing fails:

1. **Check the JSON file format**
2. **Verify the data structure**
3. **Review the console output for errors**

### Export Issues

If CSV export fails:

1. **Check available disk space**
2. **Verify write permissions**
3. **Review the console output for errors**

## Data Structure

Each CSV file contains:

| Column          | Type    | Description                      |
| --------------- | ------- | -------------------------------- |
| `headword`      | text    | Japanese word (kanji)            |
| `reading`       | text    | Hiragana/katakana reading        |
| `pos`           | text    | Part of speech                   |
| `register`      | text    | Formality level                  |
| `definition_en` | text    | English definition               |
| `entry_type`    | text    | 'dictionary', 'slang', or 'both' |
| `popularity`    | integer | Set to 0 for seed data           |

## Notes

- All entries start with `popularity: 0` as requested
- CSV files are properly formatted and escaped
- The script handles large datasets efficiently
- Progress is shown during the export process

## Support

For issues with the export process:

1. Check the console output for error messages
2. Verify your internet connection
3. Ensure you have sufficient disk space
4. Check the CSV files for proper formatting
