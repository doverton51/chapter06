'use strict';

const expect = require('chai').expect;
let service = require('../../src/services/games.js');

describe('Game service', () => {
    const firstUserId = 'user-id-1';
    const secondUserId = 'user-id-2';

    before(done => {
        require('../../src/config/mongoose.js')
        .then((mongoose) => {
            service = require('../../src/services/games.js')(mongoose);
            done();
        }).catch(done);
    });
    
    beforeEach((done) => {
        service.availableTo('not-a-user')
        .then(games => games.map(game => game.remove()))
        .then(gamesRemoved => Promise.all(gamesRemoved))
        .then(() => done(), done);
    });
    
    describe('list of available games', () => { 
        it('should include games set by other users', done => {
            // Given
            service.create(firstUserId, 'testing')
            .then(() => service.availableTo(secondUserId)
                .then(games => {
                    expect(games.length).to.equal(1);
                    const game = games[0];
                    expect(game.setBy).to.equal(firstUserId);
                    expect(game.word).to.equal('TESTING');        
                }))
            .then(() => done(), done);
        });
        
        it('should not include games set by the same user', done => {
            // Given
            service.create(firstUserId, 'first')
                .then(() => service.create(secondUserId, 'second'))
                .then(() => service.availableTo(secondUserId))
                .then(games => {
                    expect(games.length).to.equal(1);
                    const game = games[0];
                    expect(game.setBy).not.to.equal(secondUserId);
                })
                .then(() => done(), done);
        });
    });
});