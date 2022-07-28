const chai = require("chai");
const request = require("supertest");

const expect = chai.expect;
const app = require('../src/main.js')

//var expect = require("chai").expect;
describe("Search", function () {
  describe("GET /getSearchBeyonce", function () {
    it("should return 200 OK with beyonce", async function () {
      const response = await request(app)
        .get("/search?q=beyonce")
        .expect(200)
        .expect("Content-Type", /json/);

      const movies = response.body;
      expect(movies).to.be.an("object");
      //expect(movies).length.to.be.greaterThan(0);
    });

    // it("should have valid movies", async function () {
    //   const response = await request(app)
    //     .get("/movies")
    //     .expect(200)
    //     .expect("Content-Type", /json/);

    //   const movies = response.body;
    //   expect(movies).to.be.an("array");

    //   movies.forEach(movie => {
    //     expect(movie.name).to.be.a("string");
    //     expect(movie.year).to.be.a("number");
    //     expect(movie.rating).to.be.a("number");
    //     expect(movie.description).to.be.a("string");
    //     expect(movie.director).to.be.a("string");
    //     expect(movie.genres).to.be.an("array");
    //   });
    // });
  });
});


// describe('getSearchBeyonce() function', function() {
//     it('return json response', function() {
//       return request(app)
//         .get('/search?q=beyonce')
//         .expect(200)
//         .expect('Content-Type',/json/)
//         //.expect(getSearchBeyonce().ToString().to.equal(/'{"data":*}'/i.toString()))
//     })
//   })


//Token issue
// describe('getSearchBeyonce() function', function() {
//     it('return json response', function() {
//       return request(app)
//         .get('/search?q=beyonce')
//         .expect(200)
//         .expect('Content-Type',/json/)
//         //.expect(getSearchBeyonce().ToString().to.equal(/'{"data":*}'/i.toString()))
//     })
//   })