import { DocumentState } from '../models/DocumentState.js';
import { DocumentStateSchema } from '../schemas/document.schema.js';

export class StateService {
  static async getOrCreateState(sessionId) {
    let state = await DocumentState.findOne({ sessionId });
    if (!state) {
      state = await DocumentState.create({
        sessionId,
        full_name: null,
        home_address: null,
        covers_worldwide_assets: null,
        has_children: null,
        children: [],
        executor: { name: null, relationship: null },
        specific_gifts: [],
        additional_wishes: null
      });
    }
    return state;
  }

  static applyProposedUpdates(currentStateDoc, proposedUpdates) {
    if (!proposedUpdates || Object.keys(proposedUpdates).length === 0) {
      return currentStateDoc;
    }

    const stateObj = currentStateDoc.toObject ? currentStateDoc.toObject() : { ...currentStateDoc };

    // Selective merge without overwriting untouched properties
    if (proposedUpdates.full_name !== undefined && proposedUpdates.full_name !== null) {
      stateObj.full_name = proposedUpdates.full_name;
    }
    if (proposedUpdates.home_address !== undefined && proposedUpdates.home_address !== null) {
      stateObj.home_address = proposedUpdates.home_address;
    }
    if (proposedUpdates.covers_worldwide_assets !== undefined && proposedUpdates.covers_worldwide_assets !== null) {
      stateObj.covers_worldwide_assets = proposedUpdates.covers_worldwide_assets;
    }
    if (proposedUpdates.has_children !== undefined && proposedUpdates.has_children !== null) {
      stateObj.has_children = proposedUpdates.has_children;
      if (proposedUpdates.has_children === false) {
        stateObj.children = [];
      }
    }
    if (Array.isArray(proposedUpdates.children) && proposedUpdates.children.length > 0) {
      stateObj.children = proposedUpdates.children;
    }
    if (proposedUpdates.executor) {
      stateObj.executor = {
        name: proposedUpdates.executor.name !== undefined && proposedUpdates.executor.name !== null
          ? proposedUpdates.executor.name
          : stateObj.executor?.name ?? null,
        relationship: proposedUpdates.executor.relationship !== undefined && proposedUpdates.executor.relationship !== null
          ? proposedUpdates.executor.relationship
          : stateObj.executor?.relationship ?? null
      };
    }
    if (Array.isArray(proposedUpdates.specific_gifts) && proposedUpdates.specific_gifts.length > 0) {
      stateObj.specific_gifts = proposedUpdates.specific_gifts;
    }
    if (proposedUpdates.additional_wishes !== undefined && proposedUpdates.additional_wishes !== null) {
      stateObj.additional_wishes = proposedUpdates.additional_wishes;
    }

    // Validate the resulting shape before persisting
    const validated = DocumentStateSchema.parse(stateObj);
    return validated;
  }

  static async persistState(sessionId, validatedState) {
    const updated = await DocumentState.findOneAndUpdate(
      { sessionId },
      { $set: validatedState },
      { new: true, upsert: true }
    );
    return updated;
  }
}