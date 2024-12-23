import Pantry from 'pantry-node';
import { PANTRY_ID } from '$env/static/private'

const pantryClient = new Pantry(PANTRY_ID)

/**
 * @typedef {'advisors' | 'info' | 'programmes' | 'excos' | 'events' | 'blog'} PantryName
 */

/**
 *
 * @param {PantryName} type
 * @returns {Promise<Object>}
 */
const getPantry = async (type) => {
    return await pantryClient.basket.get(type, { parseJSON: true })
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