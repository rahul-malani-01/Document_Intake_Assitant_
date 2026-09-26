import { describe, it, expect } from 'vitest';
import { StateService } from '../src/services/state.service.js';

describe('StateService - Selective Update Application', () => {
  it('CASE 1: Applies single field without wiping other fields', () => {
    const current = {
      full_name: null,
      home_address: null,
      covers_worldwide_assets: null,
      has_children: null,
      children: [],
      executor: { name: null, relationship: null },
      specific_gifts: [],
      additional_wishes: null
    };

    const updated = StateService.applyProposedUpdates(current, { full_name: 'Rahul Malani' });
    expect(updated.full_name).toBe('Rahul Malani');
    expect(updated.home_address).toBeNull();
  });

  it('CASE 4 & 5: Applies correction cleanly to nested fields', () => {
    const current = {
      full_name: 'Rahul Malani',
      home_address: 'Nagpur',
      covers_worldwide_assets: true,
      has_children: true,
      children: ['Aarav'],
      executor: { name: 'James', relationship: 'brother' },
      specific_gifts: [],
      additional_wishes: null
    };

    const updated = StateService.applyProposedUpdates(current, {
      executor: { name: 'John' }
    });

    expect(updated.executor.name).toBe('John');
    expect(updated.executor.relationship).toBe('brother'); // Preserved
  });

  it('Preserves nested fields when a correction returns null for an untouched field', () => {
    const current = {
      full_name: 'Rahul Malani',
      home_address: 'Nagpur',
      covers_worldwide_assets: true,
      has_children: true,
      children: ['Aarav'],
      executor: { name: 'James', relationship: 'brother' },
      specific_gifts: [],
      additional_wishes: null
    };

    const updated = StateService.applyProposedUpdates(current, {
      executor: { name: 'Satvik', relationship: null }
    });

    expect(updated.executor.name).toBe('Satvik');
    expect(updated.executor.relationship).toBe('brother');
  });

  it('CASE 10: State remains unchanged if updates are empty or invalid', () => {
    const current = {
      full_name: 'Rahul Malani',
      home_address: 'Nagpur',
      covers_worldwide_assets: true,
      has_children: false,
      children: [],
      executor: { name: null, relationship: null },
      specific_gifts: [],
      additional_wishes: null
    };

    const updated = StateService.applyProposedUpdates(current, {});
    expect(updated.full_name).toBe('Rahul Malani');
    expect(updated.has_children).toBe(false);
  });
});