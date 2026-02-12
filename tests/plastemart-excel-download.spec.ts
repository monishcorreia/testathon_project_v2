import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const xlsx = require('xlsx');

test.describe('Plastemart Excel Price Sheet Extract Multiple Values', () => {
  test('should download price lists and extract prices from multiple rows and columns', async ({ page, context }) => {
    console.log('[[PROPERTY|id=PLASTEMART_MULTI]]');
    
    // Create downloads directory
    const downloadPath = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath, { recursive: true });
    }
    
    // Define the data to fetch
    const priceData = [
      { sr: 1, grade: 'H030SG', description: 'PP Raffia', pricingSection: 'Polypropylene -> Reliance', fileType: 'PP', column: 'E', columnIndex: 4, row: 319 },
      { sr: 2, grade: 'H350EC', description: 'PP Extrusion', pricingSection: 'Polypropylene -> Reliance', fileType: 'PP', column: 'E', columnIndex: 4, row: 651 },
      { sr: 3, grade: 'E52009', description: 'HDPE Raffia', pricingSection: 'High Density Polyethylene -> Reliance', fileType: 'HDPE', column: 'J', columnIndex: 9, row: 70 },
      { sr: 4, grade: 'E24065', description: 'LLDPE Extrusion', pricingSection: 'High Density Polyethylene -> Reliance', fileType: 'HDPE', column: 'G', columnIndex: 6, row: 402 },
      { sr: 5, grade: '1070LA17', description: 'LDPE Extrusion', pricingSection: 'High Density Polyethylene -> Reliance', fileType: 'HDPE', column: 'G', columnIndex: 6, row: 2228 },
      { sr: 6, grade: 'JF19010', description: 'LLDPE Film', pricingSection: 'High Density Polyethylene -> Reliance', fileType: 'HDPE', column: 'I', columnIndex: 8, row: 900 },
      { sr: 7, grade: '24FS040', description: 'LDPE Film', pricingSection: 'High Density Polyethylene -> Reliance', fileType: 'HDPE', column: 'K', columnIndex: 10, row: 2394 },
      { sr: 8, grade: 'HM F5400', description: 'HM FILM', pricingSection: 'High Density Polyethylene -> Reliance', fileType: 'HDPE', column: 'E', columnIndex: 4, row: 21 }
    ];
    
    // Prepare to store results
    const results: any[] = [];
    
    // Map to store loaded workbooks to avoid re-downloading
    const workbookCache: { [key: string]: any } = {};
    
    // Download function
    const downloadFile = async (url: string): Promise<string> => {
      const fileName = url.split('/').pop() || 'file.xlsx';
      const filePath = path.join(downloadPath, fileName);
      
      // Skip if already downloaded
      if (fs.existsSync(filePath)) {
        console.log(`File already exists: ${filePath}`);
        return filePath;
      }
      
      console.log(`Downloading: ${url}`);
      
      return new Promise((resolve, reject) => {
        https.get(url, (response) => {
          if (response.statusCode === 200) {
            const fileStream = fs.createWriteStream(filePath);
            response.pipe(fileStream);
            fileStream.on('finish', () => {
              fileStream.close();
              console.log(`Downloaded to: ${filePath}`);
              resolve(filePath);
            });
            fileStream.on('error', reject);
          } else {
            reject(new Error(`Failed to download: ${response.statusCode}`));
          }
        }).on('error', reject);
      });
    };
    
    // Get workbook
    const getWorkbook = async (fileType: string) => {
      if (workbookCache[fileType]) {
        return workbookCache[fileType];
      }
      
      let fileName: string;
      
      // Try different filename patterns for HDPE (it might be named differently)
      if (fileType === 'PP') {
        fileName = '09-02-2026-PP-Reliance.xlsx';
      } else if (fileType === 'HDPE') {
        // Try HDPE first, then PE (which includes HDPE, LDPE, LLDPE)
        fileName = '09-02-2026-HDPE-Reliance.xlsx';
      }
      
      let url = `https://www.plastemart.com/Upload/pricelist/${fileName}`;
      let filePath;
      
      try {
        filePath = await downloadFile(url);
      } catch (error) {
        // If HDPE fails, try PE
        if (fileType === 'HDPE') {
          console.log('HDPE file not found, trying PE file...');
          fileName = '09-02-2026-PE-Reliance.xlsx';
          url = `https://www.plastemart.com/Upload/pricelist/${fileName}`;
          filePath = await downloadFile(url);
        } else {
          throw error;
        }
      }
      
      const workbook = xlsx.readFile(filePath);
      workbookCache[fileType] = { workbook, filePath };
      
      return { workbook, filePath };
    };
    
    // Extract prices for each row
    for (const item of priceData) {
      try {
        const { workbook, filePath } = await getWorkbook(item.fileType);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Row index is 0-based, so subtract 1
        const rowIndex = item.row - 1;
        const colIndex = item.columnIndex;
        
        let price = 'N/A';
        
        if (data[rowIndex] && data[rowIndex][colIndex] !== undefined) {
          price = data[rowIndex][colIndex];
        } else {
          console.warn(`Row ${item.row} or Column ${item.column} not found in ${item.fileType} sheet`);
        }
        
        results.push({
          sr: item.sr,
          grade: item.grade,
          description: item.description,
          pricingSection: item.pricingSection,
          column: item.column,
          row: item.row,
          price: price
        });
        
        console.log(`[${item.sr}] ${item.grade} (${item.description}): ${price}`);
        
      } catch (error) {
        console.error(`Error processing item ${item.sr}:`, error);
        results.push({
          sr: item.sr,
          grade: item.grade,
          description: item.description,
          pricingSection: item.pricingSection,
          column: item.column,
          row: item.row,
          price: 'ERROR'
        });
      }
    }
    
    // Print results table
    console.log('\n=== PRICE EXTRACTION RESULTS ===\n');
    console.log('Sr.No | Grade      | Description        | Pricing Section                     | Column | Row  | Price');
    console.log('------|------------|--------------------|------------------------------------|--------|------|--------');
    
    results.forEach(r => {
      console.log(`${r.sr.toString().padEnd(5)} | ${r.grade.padEnd(10)} | ${r.description.padEnd(18)} | ${r.pricingSection.padEnd(34)} | ${r.column.padEnd(6)} | ${r.row.toString().padEnd(4)} | ${r.price}`);
    });
    
    // Output results as JSON for easy parsing
    console.log('\n=== JSON OUTPUT ===');
    console.log(JSON.stringify(results, null, 2));
    
    // Don't fail on missing HDPE data - just report what we found
    console.log('\n=== SUMMARY ===');
    const successCount = results.filter(r => r.price !== 'N/A' && r.price !== 'ERROR').length;
    console.log(`Successfully retrieved ${successCount} out of ${results.length} prices`);
  });
});
