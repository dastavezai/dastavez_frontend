/** Detect placeholder / blank values in counter affidavit fields. */

/** Align with backend counterAffidavitAutofill.isBlankCounterField */
export const isPlaceholderValue = (value) => {
  const s = String(value ?? '').trim();
  if (!s) return true;
  if (/\[INSERT FROM RECORD\]/i.test(s)) return true;
  if (/^to be completed/i.test(s)) return true;
  if (/_{4,}/.test(s)) return true;
  if (/_{2,}\s*OF\s*_{2,}/i.test(s)) return true;
  if (/NO\.\s*_{2,}/i.test(s)) return true;
  if (/20_{2,}/.test(s)) return true;
  if (/^MJC\s+NO\.\s*$/i.test(s)) return true;
  return false;
};

export const countBlanksInResult = (result) => {
  if (!result) return 0;
  let n = 0;
  const scalarFields = [
    'court',
    'caseNumber',
    'petitionerName',
    'respondentName',
    'documentTitle',
    'jurisdictionLine',
    'deponentDetails',
    'prayer',
    'verification',
    'oppositePartyNo',
    'showCauseOnBehalfOfOpNo',
  ];
  scalarFields.forEach((key) => {
    if (isPlaceholderValue(result[key])) n += 1;
  });
  (result.defenceSection || []).forEach((para) => {
    if (isPlaceholderValue(para)) n += 1;
  });
  (result.preliminaryObjections || []).forEach((obj) => {
    if (isPlaceholderValue(obj)) n += 1;
  });
  (result.statementOfAdditionalFacts || []).forEach((f) => {
    if (isPlaceholderValue(f)) n += 1;
  });
  (result.counterDraft || []).forEach((item) => {
    if (isPlaceholderValue(item?.counterArgument)) n += 1;
    if (isPlaceholderValue(item?.supportingLaw)) n += 1;
  });
  return n;
};
