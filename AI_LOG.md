# AI Log & Engineering Decision Records

This document details how AI assistance was leveraged, reviewed, and critiqued during the architecture and implementation of the Document Intake Assistant[cite: 4].

---

### Log Entry 1: Architecture of State vs. Conversation History

* **Context:** Determining how LLM context should be managed across multiple conversational turns[cite: 4].
* **Initial AI Suggestion:**  
  *Store the accumulating state JSON directly in the chat message log as system messages or metadata on each assistant message, and pass the entire transcript to the LLM on every turn.*
* **Critique & Engineering Objection:**  
  Relying on chat history as the database causes conversational drift. If an earlier turn contained hallucinated text, slang, or an unconfirmed assumption, echoing that back into the LLM context allows the model to treat its own previous hallucinations as confirmed facts.
* **Adopted Solution:**  
  Strictly separate storage into two independent Mongoose models: `Message` (unstructured log for UX display) and `DocumentState` (the single canonical source of truth)[cite: 4]. On each turn, the latest canonical state is injected into the prompt as a clean reference block[cite: 4].

---

### Log Entry 2: Direct State Mutation Privileges

* **Context:** Establishing how updates are written to MongoDB[cite: 4].
* **Initial AI Suggestion:**  
  *Have the LLM output MongoDB update operations (e.g. `{ "$set": { "executor.name": "Satvik" } }`) so the backend can execute `collection.updateOne(query, llmOutput)` directly.*
* **Critique & Engineering Objection:**  
  Granting an LLM direct database write capability violates zero-trust principles. An unexpected or prompt-injected JSON payload could drop fields, insert malicious types, or corrupt records.
* **Adopted Solution:**  
  The LLM is restricted to proposing a structured delta payload (`ProposedUpdatesSchema`). A backend service (`StateService.applyProposedUpdates`) reviews the proposed changes, selectively merges them with existing values, and runs the entire resulting object through `DocumentStateSchema.parse()` prior to persistence[cite: 4].

---

### Log Entry 3: Schema Validation Failure on Conflicts Array

* **Context:** Encountered runtime error when processing user corrections:
  ```text
  Schema validation error on gemini-3.7-flash: {"conflicts":{"0":{"_errors":["Expected object, received string"]}}}