// utils/buildReviewFormData.ts
export function buildReviewFormData(values: any) {
  const fd = new FormData();

  // Jurisdiction
  if (values.jurisdictionType) fd.append("jurisdictionType", values.jurisdictionType);
  if (values.country)          fd.append("country", values.country);

  // Contact  ✅ make sure these exist
  if (values.email)    fd.append("email", values.email);
  if (values.telegram) fd.append("telegram", values.telegram);
  if (values.website)  fd.append("website", values.website);

  // Knowledge (files + urls)
  const toFiles = (v: any): File[] =>
    !v ? [] :
    v instanceof File ? [v] :
    Array.isArray(v) ? v :
    Array.from(v as FileList);

  toFiles(values.knowledgeFiles).forEach((f) => fd.append("knowledgeFiles", f));

  const urlArray = values.knowledgeFileUrls ?? values.websiteUrls ?? [];
  if (Array.isArray(urlArray) && urlArray.length) {
    fd.append("knowledgeFileUrls", JSON.stringify(urlArray));
  }

  // Visual
  if (values.spokespersonType) fd.append("spokespersonType", values.spokespersonType);
  if (values.spokespersonType === "upload" && values.spokespersonUpload instanceof File) {
    fd.append("spokespersonUpload", values.spokespersonUpload);
  }

  // Voice (see section 2 below for mapping)
  if (values.voiceType) fd.append("voiceType", values.voiceType);
  if (values.voiceType === "custom" && values.voiceCustomUrl) {
    fd.append("voiceCustomUrl", values.voiceCustomUrl);
  }

  // Agents extras (optional)
  if (values.tradingModel) fd.append("tradingModel", values.tradingModel);
  if (Array.isArray(values.predictionMarkets)) {
    fd.append("predictionMarkets", JSON.stringify(values.predictionMarkets));
  }
  if (Array.isArray(values.selectedAgents)) {
    fd.append("selectedAgents", JSON.stringify(values.selectedAgents));
  }

  return fd;
}
