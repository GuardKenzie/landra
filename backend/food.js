const { food_emotes } = require('./food.json')
const crypto = require('crypto')

function foodEmoji(string) {
    // Converts string into a food emoji
    const hash = crypto.createHash("sha256")
        .update(string)
        .digest('hex')

    return food_emotes[parseInt(hash, 16) % food_emotes.length]
}

module.exports = foodEmoji