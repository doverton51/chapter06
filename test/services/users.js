'use strict';

const expect = require('chai').expect;
const uuid = require('uuid');
const service = require('../../src/services/users.js');

describe('User Service', function() {
    describe('getUsername', function() {
        it('should return a previously set username', done => {
            const userId = uuid.v4();
            const name = 'User name';

            service.setUsername(userId, name)
            .then(() => service.getUsername(userId))
            .then(actual => expect(actual).to.equal(name))
            .then(() => done(), done);
        });
        
        it('should return null if no username is set', done => {
            const userId = uuid.v4();

            service.getUsername(userId)
            .then(actual => expect(actual).to.be.null)
            .then(() => done(), done);
        });
    });
});
