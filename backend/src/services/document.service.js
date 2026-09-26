export class DocumentService {
  static generateDocument(state) {
    if (!state) {
      return 'No document state available.';
    }

    const formatField = (val) => (val === null || val === undefined || val === '' ? 'Not provided' : val);
    const formatBoolean = (val) => (val === null || val === undefined ? 'Not provided' : val ? 'Yes' : 'No');

    const childrenSection =
      state.has_children === false
        ? 'None'
        : Array.isArray(state.children) && state.children.length > 0
        ? state.children.map((c) => `- ${c}`).join('\n')
        : 'Not provided';

    const giftsSection =
      Array.isArray(state.specific_gifts) && state.specific_gifts.length > 0
        ? state.specific_gifts.map((g) => `- ${g}`).join('\n')
        : 'Not provided';

    return `==================================================
PERSONAL WISHES DOCUMENT
FICTIONAL – NOT LEGAL ADVICE
==================================================

Full Name:
${formatField(state.full_name)}

Home Address:
${formatField(state.home_address)}

Worldwide Assets:
${formatBoolean(state.covers_worldwide_assets)}

Children:
${childrenSection}

Executor:
${formatField(state.executor?.name)}

Relationship:
${formatField(state.executor?.relationship)}

Specific Gifts:
${giftsSection}

Additional Wishes:
${formatField(state.additional_wishes)}

==================================================
DISCLAIMER:
This document is generated strictly for informational and administrative intake demonstration.
It does not constitute legal advice and has no legal validity.
==================================================`;
  }
}