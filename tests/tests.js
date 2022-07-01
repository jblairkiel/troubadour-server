const request = require('supertest');
const app = require('../src/main.js')
//var expect = require("chai").expect;




describe('getSearchBeyonce() function', function() {
    it('return json response', function() {
      return request(app)
        .get('/search?q=beyonce')
        .expect(200)
        .expect('Content-Type',/json/)
        //.expect(getSearchBeyonce().ToString().to.equal(/'{"data":*}'/i.toString()))
    })
  })