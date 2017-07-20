'use strict';

const request = require('supertest');
const expect = require('chai').expect;

const userId = 'test-user-id';

describe('/games', () => {
    let agent;
    let gamesService, app;
    
    before((done) => {
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
            app = require('../../src/app.js')(mongoose);
            gamesService = require('../../src/services/games.js')(mongoose);
            d();
        })
        .catch(d);
    });
    
    beforeEach(() => {
        agent = request.agent(app);
    });
    
   describe('/:id DELETE', () => {
        it('should allow users to delete their own games', done => {
            var d = (err) => {
                console.log('DONE: Should allow... ' + err);
                if(err) {
                    done(err);
                } else {
                    done();
                }
            };
            gamesService.create(userId, 'test')
                .then(game => {
                    agent
                        .delete('/games/' + game.id)
                        .set('Cookie', ['userId=' + userId])
                        .expect(200)
                        .end(function(err) {
                            if (err) {
                                d(err);
                            } else {
                            gamesService.createdBy(userId)
                                    .then(createdGames => { expect(createdGames).to.be.empty; })
                                    .then(() => d(), d);
                            }
                });
            });
        });
        
        it('should not allow users to delete games that they did not set', done => {
            var d = (err) => {
                console.log('DONE: should not allow ' + err);
                if(err) {
                    done(err);
                } else {
                    done();
                }
            };
            gamesService.create('another-user-id', 'test')
                .then(game => { agent
                    .delete('/games/' + game.id)
                    .set('Cookie', ['userId=' + userId])
                    .expect(403)
                    .end(function(err) {
                        if(err) {
                            d(err);
                        } else {
                            gamesService.get(game.id)
                                .then(game => expect(game).ok)
                                .then(() => d(), d);
                        }
                    });  
                });  
        });

        it('should return a 404 for requests to delete a game that no longer exists', done => {
            var d = (err) => {
                console.log('DONE: should return ' + err);
                if(err) {
                    done(err);
                } else {
                    done();
                }
            };
            gamesService.create(userId, 'test')
                .then(game => {
                    agent
                    .delete(`/games/${game.id}`)
                    .set('Cookie', ['userId=' + userId])
                    .expect(200)
                    .end(err => {
                        if(err) {
                            d(err);
                        } else {
                            agent
                                .delete('/games/' + game.id)
                                .expect(404, d);
                        }
                    });
                });
            });
   });
});
