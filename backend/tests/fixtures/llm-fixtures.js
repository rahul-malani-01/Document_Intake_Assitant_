export const validMultiFieldFixture = {
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
};

export const ambiguousFixture = {
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
};

export const contradictionCorrectionFixture = {
  updates: {
    executor: {
      name: 'John',
      relationship: 'brother'
    }
  },
  conflicts: [
    {
      field: 'executor.name',
      previous_value: 'James',
      proposed_value: 'John',
      reason: 'User explicitly changed executor'
    }
  ],
  clarification_needed: false,
  clarification_question: null,
  next_question: 'Updated your executor to John. Do you have any specific gifts you would like to leave?'
};