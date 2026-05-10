import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

// Utility to analyze template content and find exact text
export class TemplateAnalyzer {
  static async analyzeTemplate(): Promise<string[]> {
    try {
      // Load the template
      const response = await fetch('/212-2026 New DAR Form (9).docx');
      if (!response.ok) {
        throw new Error('Failed to load template');
      }
      
      const templateArrayBuffer = await response.arrayBuffer();
      const zip = new PizZip(templateArrayBuffer);
      
      // Create docxtemplater instance to extract text
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Get the full text content
      const fullText = doc.getFullText();
      
      // Split into lines for analysis
      const lines = fullText.split('\n').filter(line => line.trim().length > 0);
      
      return lines;
    } catch (error) {
      console.error('Template analysis error:', error);
      return [];
    }
  }

  static async extractPlaceholders(): Promise<string[]> {
    try {
      const lines = await this.analyzeTemplate();
      
      // Find lines that look like they contain data (not just labels)
      const dataLines = lines.filter(line => {
        // Look for lines with specific patterns that might be placeholders
        return line.includes('212/') || 
               line.includes('ASI') || 
               line.includes('Mrs.') || 
               line.includes('S/o') || 
               line.includes('R/o') ||
               line.includes('Age-') ||
               line.includes('Mb No.') ||
               line.includes('HR64A') ||
               line.includes('Plaintiff Name') ||
               line.includes('Defendant Name') ||
               line.includes('Case FIR') ||
               line.includes('BJRM Hospital');
      });

      return dataLines;
    } catch (error) {
      console.error('Placeholder extraction error:', error);
      return [];
    }
  }
}
