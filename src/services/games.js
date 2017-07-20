'use strict';
module.exports = (mongoose) => {
    let Game = mongoose.models['Game'];

    if(!Game) {
        const Schema = mongoose.Schema;
        const gameSchema = new Schema({
            word: String,
            setBy: String
        });

        gameSchema.methods.positionsOf = function(character) {
            let positions = [];
            for (let i in this.word) {
                if (this.word[i] === character.toUpperCase()) {
                    positions.push(i);
                }
            }
            return positions;
        };            

        Game = mongoose.model('Game', gameSchema);
    }

    return {
        availableTo: (userId) => Game.find({setBy: {$ne: userId}}),
        create: (userId, word) => {
            const game = new Game({setBy: userId, word: word.toUpperCase()});
            return game.save();
        },
        createdBy: (userId) => Game.find({setBy: userId}),
        get: (id) => Game.findById(id)
    };
};