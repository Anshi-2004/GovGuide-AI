import React, { useState } from 'react';
import { FileCheck, Copy, Check, Printer, Scale, Info } from 'lucide-react';

export default function RTIBuilder() {
  const [department, setDepartment] = useState('District Revenue Office / Tehsildar');
  const [applicationNo, setApplicationNo] = useState('');
  const [subject, setSubject] = useState('Status and daily progress of pending certificate application');
  const [applicantName, setApplicantName] = useState('');
  const [applicantAddress, setApplicantAddress] = useState('');
  const [isBPL, setIsBPL] = useState(false);
  const [bplCardNo, setBplCardNo] = useState('');
  const [copied, setCopied] = useState(false);

  const generateRTIText = () => {
    const today = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return `FORMAT OF APPLICATION FOR SEEKING INFORMATION UNDER THE RIGHT TO INFORMATION ACT, 2005

To,
The Public Information Officer (PIO),
Office of: ${department || '[Name of Department / Ministry]'}

Date: ${today}

1. Full Name of the Applicant: ${applicantName || '[Your Full Name]'}
2. Address: ${applicantAddress || '[Your Residential Address & Mobile No.]'}

3. Particulars of Information Required:
   Subject: ${subject}
   Reference Application / Registration No: ${applicationNo || 'N/A'}

   Requested Information:
   i. Daily progress log and file movement records of my application/case referenced above.
   ii. Names, designations, and official contact details of all officers/staff with whom the application remained pending.
   iii. Certified copy of the official file noting sheets and inspection reports recorded by officers on this matter.
   iv. Statutory time limits prescribed by the department for processing this service and reasons for delay beyond the prescribed timeframe.

4. Fee Details:
   ${
     isBPL
       ? `Claiming exemption under Below Poverty Line (BPL) category. BPL Card No: ${bplCardNo || '[BPL Card Number]'}.`
       : 'Application Fee of ₹10 attached via Indian Postal Order (IPO) / Online Receipt Payment.'
   }

5. Declaration:
   I state that I am a citizen of India and the information sought falls within the scope of Section 2(j) of the RTI Act 2005.

Signature of Applicant:
________________________
(${applicantName || 'Applicant Name'})`;
  };

  const rtiDraftText = generateRTIText();

  const handleCopy = () => {
    navigator.clipboard.writeText(rtiDraftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<pre style="font-family: monospace; padding: 20px; font-size: 13px;">${rtiDraftText}</pre>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form Panel */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
          <Scale size={20} className="text-blue-400" />
          <h2 className="text-lg font-bold text-white">RTI Application Draft Builder</h2>
        </div>

        <p className="text-xs text-gray-400">
          Fill in your details below to instantly format a legally compliant Right to Information (RTI) application under Section 6(1) of the RTI Act, 2005.
        </p>

        <div>
          <label className="form-label">Target Department / Public Authority</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="form-input text-xs"
            placeholder="e.g. Revenue Department, Municipal Corporation"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Applicant Full Name</label>
            <input
              type="text"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              className="form-input text-xs"
              placeholder="Your Name as per Aadhaar"
            />
          </div>

          <div>
            <label className="form-label">Pending Application Ref. No.</label>
            <input
              type="text"
              value={applicationNo}
              onChange={(e) => setApplicationNo(e.target.value)}
              className="form-input text-xs"
              placeholder="e.g. APP-2024-99120"
            />
          </div>
        </div>

        <div>
          <label className="form-label">Full Address & Mobile</label>
          <textarea
            rows={2}
            value={applicantAddress}
            onChange={(e) => setApplicantAddress(e.target.value)}
            className="form-textarea text-xs"
            placeholder="Complete address for receiving RTI response post..."
          />
        </div>

        <div>
          <label className="form-label">RTI Query Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="form-input text-xs"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="bplCheck"
            checked={isBPL}
            onChange={(e) => setIsBPL(e.target.checked)}
            className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-0"
          />
          <label htmlFor="bplCheck" className="text-xs text-gray-300 font-semibold cursor-pointer">
            Claim BPL Fee Exemption (Below Poverty Line)
          </label>
        </div>

        {isBPL && (
          <div>
            <label className="form-label">BPL Card Number</label>
            <input
              type="text"
              value={bplCardNo}
              onChange={(e) => setBplCardNo(e.target.value)}
              className="form-input text-xs"
              placeholder="e.g. BPL-882190"
            />
          </div>
        )}
      </div>

      {/* Output Generated Draft Panel */}
      <div className="glass-card p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
            <div className="flex items-center gap-2">
              <FileCheck size={20} className="text-emerald-400" />
              <h3 className="text-base font-bold text-white">Official RTI Application Draft</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="btn-primary text-xs py-1.5 px-3"
              >
                <Printer size={14} />
                <span>Print Draft</span>
              </button>
            </div>
          </div>

          <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
            {rtiDraftText}
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-300 flex items-start gap-2">
          <Info size={16} className="shrink-0 mt-0.5" />
          <span>
            Submit this draft on <strong>rtionline.gov.in</strong> for Central Government departments or post it with a ₹10 Postal Order (IPO) addressed to the Public Information Officer (PIO).
          </span>
        </div>
      </div>
    </div>
  );
}
