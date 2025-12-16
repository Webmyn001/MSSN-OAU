import Pantry from 'pantry-node';
import { PANTRY_ID } from '$env/static/private'

const pantryClient = new Pantry(PANTRY_ID)

/**
 * @typedef {'advisors' | 'info' | 'programmes' | 'excos' | 'events' | 'blog' | 'committees'} PantryName
 */

/**
 *
 * @param {PantryName} type
 * @returns {Promise<Object>}
 */
/**
 * * Fetches data from Pantry API with graceful error handling.
 * * Returns null if the API fails, allowing the app to continue without external dependencies.
 * @param {PantryName} type
 * @returns {Promise<Object | null>}
 */
const getPantry = async (type) => {
    try {
        return await pantryClient.basket.get(type, { parseJSON: true })
    } catch (error) {
        console.error(`Pantry API error for ${type}:`, error);
        // * Return null instead of throwing to allow graceful degradation
        return null;
    }
}

/**
 *
 * @param {PantryName} type
 * @param {Object} content
 * @returns {Promise<Object>}
 */
const updatePantry = async (type, content) => {
    return await  pantryClient.update(type, { parseJSON: true })
}

export { getPantry, updatePantry }