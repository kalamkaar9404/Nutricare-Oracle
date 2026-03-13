/**
 * Privacy Service - Local PII Redaction and Data Anonymization
 * Ensures no sensitive health data leaves the device
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import CryptoJS from 'crypto-js';

interface PIIPattern {
  type: 'name' | 'address' | 'phone' | 'email' | 'ssn' | 'mrn' | 'dob';
  regex: RegExp;
  replacement: string;
}

interface AnonymizedData {
  original: string;
  anonymized: string;
  redactions: Array<{
    type: string;
    position: number;
    length: number;
  }>;
  timestamp: Date;
}

interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
}

class PrivacyService {
  // PII detection patterns
  private piiPatterns: PIIPattern[] = [
    {
      type: 'name',
      regex: /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g,
      replacement: '[PATIENT_NAME]'
    },
    {
      type: 'email',
      regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      replacement: '[EMAIL]'
    },
    {
      type: 'phone',
      regex: /\b(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      replacement: '[PHONE]'
    },
    {
      type: 'ssn',
      regex: /\b\d{3}-\d{2}-\d{4}\b/g,
      replacement: '[SSN]'
    },
    {
      type: 'mrn',
      regex: /\b(MRN|Medical Record Number):?\s*\d+\b/gi,
      replacement: '[MRN]'
    },
    {
      type: 'dob',
      regex: /\b(DOB|Date of Birth):?\s*\d{1,2}\/\d{1,2}\/\d{2,4}\b/gi,
      replacement: '[DOB]'
    },
    {
      type: 'address',
      regex: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir)\b/gi,
      replacement: '[ADDRESS]'
    }
  ];

  /**
   * Redact PII from medical text
   * All processing happens locally on-device
   */
  async redactPII(rawData: string): Promise<AnonymizedData> {
    console.log('[Privacy] Redacting PII locally...');
    
    let anonymized = rawData;
    const redactions: Array<{ type: string; position: number; length: number }> = [];

    // Apply each PII pattern
    for (const pattern of this.piiPatterns) {
      const matches = [...rawData.matchAll(pattern.regex)];
      
      for (const match of matches) {
        if (match.index !== undefined) {
          redactions.push({
            type: pattern.type,
            position: match.index,
            length: match[0].length
          });
        }
      }
      
      anonymized = anonymized.replace(pattern.regex, pattern.replacement);
    }

    console.log(`[Privacy] Redacted ${redactions.length} PII instances`);

    return {
      original: rawData,
      anonymized,
      redactions,
      timestamp: new Date()
    };
  }

  /**
   * Encrypt data using AES-256
   * Key derived from user credentials using PBKDF2
   */
  async encryptData(data: any, userKey: string): Promise<EncryptedData> {
    console.log('[Privacy] Encrypting data with AES-256...');
    
    // Generate random salt
    const salt = CryptoJS.lib.WordArray.random(128/8).toString();
    
    // Derive encryption key using PBKDF2
    const key = CryptoJS.PBKDF2(userKey, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    
    // Generate random IV
    const iv = CryptoJS.lib.WordArray.random(128/8);
    
    // Encrypt data
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      key,
      { iv: iv }
    );

    return {
      ciphertext: encrypted.toString(),
      iv: iv.toString(),
      salt
    };
  }

  /**
   * Decrypt data using AES-256
   */
  async decryptData(encryptedData: EncryptedData, userKey: string): Promise<any> {
    console.log('[Privacy] Decrypting data...');
    
    try {
      // Derive same encryption key
      const key = CryptoJS.PBKDF2(userKey, encryptedData.salt, {
        keySize: 256/32,
        iterations: 10000
      });
      
      // Decrypt
      const decrypted = CryptoJS.AES.decrypt(
        encryptedData.ciphertext,
        key,
        { iv: CryptoJS.enc.Hex.parse(encryptedData.iv) }
      );
      
      const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedStr);
    } catch (error) {
      console.error('[Privacy] Decryption failed:', error);
      throw new Error('Failed to decrypt data. Invalid key or corrupted data.');
    }
  }

  /**
   * Validate that no PII exists in text
   * Returns true if text is clean, false if PII detected
   */
  async validateNoPII(text: string): Promise<boolean> {
    for (const pattern of this.piiPatterns) {
      if (pattern.regex.test(text)) {
        console.warn(`[Privacy] PII detected: ${pattern.type}`);
        return false;
      }
    }
    return true;
  }

  /**
   * Generate anonymized patient ID
   */
  generateAnonymousID(): string {
    return `ANON_${CryptoJS.lib.WordArray.random(16).toString()}`;
  }

  /**
   * Hash data for integrity verification (used with blockchain)
   */
  generateHash(data: any): string {
    return CryptoJS.SHA256(JSON.stringify(data)).toString();
  }
}

export default new PrivacyService();
export type { AnonymizedData, EncryptedData };
