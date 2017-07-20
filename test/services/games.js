'use strict';

const expect = require('chai').expect;
let service = require('../../src/services/games.js');

describe('Game service', () => {
    const firstUserId = 'user-id-1';
    const secondUserId = 'user-id-2';

    before(done => {
        var d = (err) => {
                console.log('DONE: before ' + err);
                if(err) {
                    done(err);
                } else {
                    done();
                }
        };

        require('../../src/config/mongoose.js')
        .then((mongoose) => {
            service = require('../../src/services/games.js')(mongoose);
            d();
        }).catch(d);
    });
    
    beforeEach((done) => {
        var d = (err) => {
                console.log('DONE: beforeEach ' + err);
                if(err) {
                    done(err);
                } else {
                    done();
                }
        };

        service.availableTo('not-a-user')
        .then(games => games.map(game => game.remove()))
        .then(gamesRemoved => Promise.all(gamesRemoved))
        .then(() => d(), d);
    });
    
    describe('list of available games', () => { 
        it('should include games set by other users', done => {
            var d = (err) => {
                console.log('DONE: should include ' + err);
                if(err) {
                    done(err);
                } else {
                    done();
                }
            };
            // Given
            service.create(firstUserId, 'testing')
            .then(() => service.availableTo(secondUserId)
                .then(games => {
                    expect(games.length).to.equal(1);
                    const game = games[0];
                    expect(game.setBy).to.equal(firstUserId);
                    expect(game.word).to.equal('TESTING');        
                }))
            .then(() => d(), d);
        });
        
        it('should not include games set by the same user', done => {
            var d = (err) => {
                console.log('DONE: should not include ' + err);
                if(err) {
                    done(err);
                } else {
                    done();
                }
            };
            // Given
            service.create(firstUserId, 'first')
                .then(() => service.create(secondUserId, 'second'))
                .then(() => service.availableTo(secondUserId))
                .then(games => {
                    expect(games.length).to.equal(1);
                    const game = games[0];
                    expect(game.setBy).not.to.equal(secondUserId);
                })
                .then(() => d(), d);
        });
    });
});