import { describe, it, expect } from 'vitest';
import { DocumentService } from '../src/services/document.service.js';

describe('DocumentService - Deterministic Generation', () => {
  it('Includes disclaimer and handles null fields with "Not provided"', () => {
    const state = {
      full_name: null,
      home_address: null,
      covers_worldwide_assets: null,
      has_children: null,
      children: [],
      executor: { name: null, relationship: null },
      specific_gifts: [],
      additional_wishes: null
    };

    const doc = DocumentService.generateDocument(state);
    expect(doc).toContain('FICTIONAL – NOT LEGAL ADVICE');
    expect(doc).toContain('Full Name:\nNot provided');
    expect(doc).toContain('Worldwide Assets:\nNot provided');
  });

  it('Renders populated values faithfully', () => {
    const state = {
      full_name: 'Rahul Malani',
      home_address: 'Nagpur, Maharashtra',
      covers_worldwide_assets: true,
      has_children: true,
      children: ['Aarav', 'Riya'],
      executor: { name: 'James', relationship: 'Brother' },
      specific_gifts: ['Vintage watch to nephew'],
      additional_wishes: 'Simple ceremony'
    };

    const doc = DocumentService.generateDocument(state);
    expect(doc).toContain('Rahul Malani');
    expect(doc).toContain('Nagpur, Maharashtra');
    expect(doc).toContain('Worldwide Assets:\nYes');
    expect(doc).toContain('- Aarav\n- Riya');
    expect(doc).toContain('Executor:\nJames');
    expect(doc).toContain('Relationship:\nBrother');
  });
});