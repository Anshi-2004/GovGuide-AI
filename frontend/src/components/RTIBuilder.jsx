import React, { useState } from 'react';
import { FileCheck, Copy, Check, Printer, Scale, Info, ShieldCheck, ExternalLink } from 'lucide-react';

export default function RTIBuilder() {
  const [department, setDepartment] = useState('District Revenue Office / Tehsildar');
  const [applicationNo, setApplicationNo] = useState('');
  const [subject, setSubject] = useState('Daily progress and reason for delay of pending certificate application');
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

    return `FORMAT OF APPLICATION FOR SEEKING INFORMATION UNDER THE RIGHT TO INFORMATION ACT, 2005 (SECTION 6(1))

To,
The Public Information Officer (PIO),
Office of: ${department || '[Name of Public Authority / Department]'}

Date: ${today}

1. Full Name of the Applicant: ${applicantName || '[Your Full Name]'}
2. Address for Correspondence: ${applicantAddress || '[Your Complete Postal Address with Pincode & Mobile No.]'}

3. Particulars of Information Required under Section 6(1):
   Subject Matter: ${subject}
   Reference Application / Registration No: ${applicationNo || 'N/A'}

   Requested Information & Certified Records:
   i. Provide the daily progress log and official movement history of my application reference number specified above.
   ii. Provide names, official designations, and contact details of all officers with whom the file remained pending along with period of delay.
   iii. Provide certified copies of all noting sheets, comments, and inspection reports recorded on this matter by processing officers.
   iv. Specify the statutory Citizen Charter time limit for completion of this public service and reasons recorded for delay beyond the prescribed period.

4. Fee Details:
   ${
     isBPL
       ? `Claiming Fee Exemption under Below Poverty Line (BPL) Category. Certified BPL Card No: ${bplCardNo || '[BPL Card Number]'}.`
       : 'Application Fee of ₹10 attached via Indian Postal Order (IPO) No / Online Payment Receipt.'
   }

5. Declaration:
   I hereby state that I am a citizen of India and the information requested falls within the definitions of Section 2(f) and 2(j) of the RTI Act 2005.

Place: __________________
Date:  ${today}

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
    printWindow.document.write(`
      <html>
        <head>
          <title>RTI Application Draft — Section 6(1) RTI Act 2005</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 40px; font-size: 13px; line-height: 1.6; color: #000; }
            .header { text-align: center; font-weight: bold; font-size: 15px; margin-bottom: 25px; text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="header">FORM OF APPLICATION FOR SEEKING INFORMATION UNDER THE RTI ACT, 2005</div>
          <pre style="font-family: inherit; whitespace: pre-wrap;">${rtiDraftText}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form Panel */}
      <div className="glass-card p-6 space-y-4 border-l-4 border-l-amber-500">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Scale size={20} className="text-amber-400" />
            <h2 className="text-base font-extrabold text-white">RTI Application Draft Generator</h2>
          </div>
          <span className="badge badge-saffron text-[10px]">Section 6(1) RTI Act 2005</span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Enter your application details to generate a legally formatted Right to Information (RTI) query to track pending government services and officer accountability.
        </p>

        <div className="space-y-3">
          <div>
            <label className="form-label">Target Public Authority / Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="form-input text-xs bg-slate-950 border-slate-800"
              placeholder="e.g. Office of Tehsildar / Municipal Corporation"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Applicant Full Name</label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="form-input text-xs bg-slate-950 border-slate-800"
                placeholder="Name as per Government ID"
              />
            </div>

            <div>
              <label className="form-label">Pending Ref / Application No.</label>
              <input
                type="text"
                value={applicationNo}
                onChange={(e) => setApplicationNo(e.target.value)}
                className="form-input text-xs bg-slate-950 border-slate-800"
                placeholder="e.g. REG-2024-88912"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Full Address & Contact Number</label>
            <textarea
              rows={2}
              value={applicantAddress}
              onChange={(e) => setApplicantAddress(e.target.value)}
              className="form-textarea text-xs bg-slate-950 border-slate-800"
              placeholder="Complete residential postal address with Pincode..."
            />
          </div>

          <div>
            <label className="form-label">RTI Query Specific Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="form-input text-xs bg-slate-950 border-slate-800"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="bplCheck"
              checked={isBPL}
              onChange={(e) => setIsBPL(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="bplCheck" className="text-xs text-slate-300 font-semibold cursor-pointer">
              Claim BPL Fee Exemption (Below Poverty Line)
            </label>
          </div>

          {isBPL && (
            <div className="animate-fade-in">
              <label className="form-label">Certified BPL Card / Certificate No.</label>
              <input
                type="text"
                value={bplCardNo}
                onChange={(e) => setBplCardNo(e.target.value)}
                className="form-input text-xs bg-slate-950 border-slate-800"
                placeholder="e.g. BPL-MH-99182"
              />
            </div>
          )}
        </div>
      </div>

      {/* Output Generated Draft Panel */}
      <div className="glass-card p-6 flex flex-col justify-between border-l-4 border-l-blue-600">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <FileCheck size={20} className="text-emerald-400" />
              <h3 className="text-base font-extrabold text-white">Formatted RTI Legal Letter Preview</h3>
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
                className="btn-saffron text-xs py-1.5 px-3"
              >
                <Printer size={14} />
                <span>Print Official Letter</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[480px] overflow-y-auto">
            {rtiDraftText}
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Info size={15} />
            <span>How to Submit This RTI Application:</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            1. For Central Government Ministries, file online at <a href="https://rtionline.gov.in" target="_blank" rel="noreferrer" className="text-amber-400 underline font-semibold">rtionline.gov.in</a>.<br/>
            2. For State Offices, print this letter and post with a ₹10 Postal Order (IPO) addressed to the Public Information Officer (PIO).
          </p>
        </div>
      </div>
    </div>
  );
}

