import { LLMResponseSchema } from '../../schemas/llm-response.schema.js';

export class MockLLMService {
  constructor(fixtureOverride = null) {
    this.fixtureOverride = fixtureOverride;
  }

  setFixture(fixture) {
    this.fixtureOverride = fixture;
  }

  clearFixture() {
    this.fixtureOverride = null;
  }

  async processMessage({ currentState, latestUserMessage }) {
    if (this.fixtureOverride) {
      if (this.fixtureOverride instanceof Error) {
        throw this.fixtureOverride;
      }
      return this.fixtureOverride;
    }

    const text = latestUserMessage.trim();
    const lower = text.toLowerCase();

    // 1. Multiple fields fixture
    if (lower.includes('rahul malani') && lower.includes('nagpur') && lower.includes('aarav')) {
      return LLMResponseSchema.parse({
        updates: {
          full_name: 'Rahul Malani',
          home_address: 'Nagpur',
          has_children: true,
          children: ['Aarav', 'Riya'],
          executor: {
            name: 'James',
            relationship: 'brother'
          }
        },
        conflicts: [],
        clarification_needed: false,
        clarification_question: null,
        next_question: 'Does this document cover worldwide assets?'
      });
    }

    // 2. Correction fixture
    if (lower.includes('actually') && lower.includes('john')) {
      return LLMResponseSchema.parse({
        updates: {
          executor: {
            name: 'John',
            relationship: currentState.executor?.relationship || null
          }
        },
        conflicts: [
          {
            field: 'executor.name',
            previous_value: currentState.executor?.name,
            proposed_value: 'John',
            reason: 'User explicitly corrected executor'
          }
        ],
        clarification_needed: false,
        clarification_question: null,
        next_question: 'Updated your executor to John. Do you have any specific gifts you would like to include?'
      });
    }

    // 3. Contradiction fixture: previously no children, now says has children
    if (lower.includes('actually') && lower.includes('two children')) {
      return LLMResponseSchema.parse({
        updates: {
          has_children: true,
          children: []
        },
        conflicts: [
          {
            field: 'has_children',
            previous_value: currentState.has_children,
            proposed_value: true,
            reason: 'User revised child status'
          }
        ],
        clarification_needed: false,
        clarification_question: null,
        next_question: 'Got it, I updated your records to reflect that you have children. What are their names?'
      });
    }

    // 4. Ambiguous fixture
    if (lower.includes('someone from my family')) {
      return LLMResponseSchema.parse({
        updates: {
          executor: {
            name: null,
            relationship: 'family member'
          }
        },
        conflicts: [],
        clarification_needed: true,
        clarification_question: 'What is the name of the family member you would like to appoint as executor?',
        next_question: 'What is the name of the family member you would like to appoint as executor?'
      });
    }

    // 5. Standard field-by-field extraction
    const updates = {};
    let nextQuestion = 'Do you have any additional wishes?';

    if (lower.startsWith('my name is ') || lower.startsWith("i'm ") || (!currentState.full_name && text.split(' ').length <= 3 && !lower.includes('yes') && !lower.includes('no'))) {
      const name = text.replace(/^my name is /i, '').replace(/^i'm /i, '').trim();
      updates.full_name = name;
      nextQuestion = `Thanks, ${name}. What is your home address? For example, Nagpur.`;
    } else if (!currentState.home_address && (lower.includes('nagpur') || lower.includes('street') || lower.includes('road') || lower.includes('city') || text.length > 3)) {
      updates.home_address = text;
      nextQuestion = 'Does this document cover assets worldwide? (Yes / No)';
    } else if (currentState.covers_worldwide_assets === null && (lower === 'yes' || lower === 'no')) {
      updates.covers_worldwide_assets = lower === 'yes';
      nextQuestion = 'Do you have any children?';
    } else if (currentState.has_children === null && (lower === 'yes' || lower === 'no')) {
      const hasKids = lower === 'yes';
      updates.has_children = hasKids;
      if (hasKids) {
        nextQuestion = 'What are the names of your children?';
      } else {
        nextQuestion = 'Who would you like to appoint as the executor of this document?';
      }
    } else if (currentState.has_children && (!currentState.children || currentState.children.length === 0)) {
      const names = text.split(/,|and/).map((n) => n.trim()).filter(Boolean);
      updates.children = names;
      nextQuestion = 'Who would you like to appoint as your executor, and what is their relationship to you?';
    } else if (!currentState.executor?.name) {
      updates.executor = {
        name: text,
        relationship: 'Personal Representative'
      };
      nextQuestion = 'Do you have any specific gifts you would like to leave?';
    } else if (!currentState.additional_wishes) {
      updates.additional_wishes = text;
      nextQuestion = 'Thank you! Your information is complete. You can review the draft document below.';
    }

    return LLMResponseSchema.parse({
      updates,
      conflicts: [],
      clarification_needed: false,
      clarification_question: null,
      next_question: nextQuestion
    });
  }
}