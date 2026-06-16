// backend/scripts/migrateJobEmails.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from backend folder
dotenv.config({
  path: join(dirname(fileURLToPath(import.meta.url)), '../.env')
});

console.log('DEBUG: Value of MONGODB_URI is:', process.env.MONGODB_URI);

// --- Better Normalization ---
const normalize = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/&/g, 'and') // Replace '&' with 'and'
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Remove punctuation
    .replace(/\s+/g, '') // Remove spaces
    .replace(/private/g, 'pvt') // Standardize 'private' to 'pvt'
    .replace(/limited/g, 'ltd'); // Standardize 'limited' to 'ltd'
};


// --- Define Job Schema and Model ---
const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  domain: String,
  position: String,
  salary: Number,
  type: String,
  duration: String,
  description: String,
  requirements: [String],
  isActive: { type: Boolean, default: true },
  applicationCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  expiryDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  email: { type: String }
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);

// --- Load and Normalize company_mails.json ---
// Two maps: one for company+city, one for company only as fallback
const companyCityEmailMap = new Map();
const companyEmailMap = new Map(); // For company-only and partial matching

try {
  const dataFilePath = join(dirname(fileURLToPath(import.meta.url)), 'company_emails.json');
  const emailDataRaw = fs.readFileSync(dataFilePath, 'utf8');
  const emailDataArray = JSON.parse(emailDataRaw);

  emailDataArray.forEach(item => {
    // Corrected to use 'email' field from your JSON structure
    if (item.company && item.city && item.email) {
        const normalizedCompany = normalize(item.company);
        const normalizedCity = normalize(item.city);
        
        // Key for company + city for precise matching
        const combinedKey = `${normalizedCompany}:${normalizedCity}`;
        companyCityEmailMap.set(combinedKey, item.email);

        // Set company-only map (last one wins if duplicate companies exist)
        // This is used for fallback and partial matching
        companyEmailMap.set(normalizedCompany, item.email);
    }
  });

  console.log(`✅ Loaded ${companyCityEmailMap.size} company-city-email mappings.`);
  console.log(`✅ Loaded ${companyEmailMap.size} unique company-email mappings for fallback.`);
} catch (error) {
  console.error('❌ Error reading company_mails.json:', error);
  process.exit(1);
}

// --- Migration Function ---
async function migrateJobEmails() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected.');

    const jobsToUpdate = await Job.find({
      $or: [
        { email: { $exists: false } },
        { email: '' },
        { email: null }
]
    });

    console.log(`🔍 Found ${jobsToUpdate.length} jobs to update.`);

    let updatedCount = 0;
    let notFoundCount = 0;
    let processed = 0;
    const unmatchedCompanies = new Set();
    const matchedCompanies = new Map();


    for (const job of jobsToUpdate) {
        const jobNormalizedCompany = normalize(job.company);
        // Handle potentially null/undefined location and extract city
        const jobNormalizedCity = job.location ? normalize(job.location.split(',')[0]) : '';

        let email = null;
        let matchType = 'Not Found';

        // --- Matching Strategy ---
        // 1. Precise Match: Try to match on Company + City first.
        if (jobNormalizedCompany && jobNormalizedCity) {
            const combinedKey = `${jobNormalizedCompany}:${jobNormalizedCity}`;
            if (companyCityEmailMap.has(combinedKey)) {
                email = companyCityEmailMap.get(combinedKey);
                matchType = 'Exact (Company + City)';
            }
        }

        // 2. Exact Company Match: If no precise match, fall back to company name only.
        if (!email && jobNormalizedCompany) {
            if (companyEmailMap.has(jobNormalizedCompany)) {
                email = companyEmailMap.get(jobNormalizedCompany);
                matchType = 'Exact (Company Only)';
            }
        }

        // 3. Partial Company Match: As a last resort, find the best partial match.
        if (!email && jobNormalizedCompany) {
            let bestMatchKey = '';
            let bestMatchScore = 0;

            for (const [knownCompany, knownEmail] of companyEmailMap.entries()) {
                // Find the longest known company name that is part of the job's company name.
                if (jobNormalizedCompany.includes(knownCompany) && knownCompany.length > bestMatchScore) {
                    bestMatchScore = knownCompany.length;
                    bestMatchKey = knownCompany;
                    email = knownEmail;
                }
                // Also check the other way: if the job's company name is part of a known company name
                 if (knownCompany.includes(jobNormalizedCompany) && jobNormalizedCompany.length > bestMatchScore) {
                    bestMatchScore = jobNormalizedCompany.length;
                    bestMatchKey = knownCompany;
                    email = knownEmail;
                }
            }
            if (email) {
                matchType = `Partial (Best match on '${bestMatchKey}')`;
            }
        }

        if (email) {
            // We found a match, update the document with the email
            if (job.email !== email) {
                await Job.updateOne({ _id: job._id }, { $set: { email: email } });
                updatedCount++;
                if (!matchedCompanies.has(job.company)) {
                  matchedCompanies.set(job.company, { 
                      normalized: jobNormalizedCompany, 
                      email: email, 
                      matchType: matchType 
                  });
                }
            }
        } else {
            // No match found. Add to unmatched list.
            unmatchedCompanies.add(job.company || '(empty)');
            notFoundCount++;
            // As requested, ensure the 'email' field exists by setting it to null.
            if (job.email !== null) {
                await Job.updateOne({ _id: job._id }, { $set: { email: null } });
            }
        }

      processed++;
      if (processed % 100 === 0) {
        console.log(`⏳ Processed ${processed}/${jobsToUpdate.length}...`);
      }
    }

    // Write unmatched company names to file
    const unmatchedPath = join(dirname(fileURLToPath(import.meta.url)), 'unmatched_companies.txt');
    fs.writeFileSync(unmatchedPath, Array.from(unmatchedCompanies).join('\n'), 'utf8');

    // Write matched company names to a file for review, including how they were matched
    const matchedPath = join(dirname(fileURLToPath(import.meta.url)), 'matched_companies.txt');
    let matchedContent = '';
    for (const [company, data] of matchedCompanies) {
        matchedContent += `Original: ${company}\nNormalized: ${data.normalized}\nEmail: ${data.email}\nMatch Type: ${data.matchType}\n\n`;
    }
    fs.writeFileSync(matchedPath, matchedContent, 'utf8');


    console.log('\n✅ --- Migration Complete ---');
    console.log(`Jobs scanned: ${jobsToUpdate.length}`);
    console.log(`✅ Updated with emails: ${updatedCount}`);
    console.log(`❌ Company not found in JSON: ${notFoundCount}`);
    console.log(`📄 Unmatched company names written to: unmatched_companies.txt`);
    console.log(`📄 Matched company details written to: matched_companies.txt`);
  } catch (err) {
    console.error('❌ Migration error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB Disconnected.');
  }
}

migrateJobEmails();
