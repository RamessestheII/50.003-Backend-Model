const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const MONGODB_URI =
'mongodb+srv://applea1630:l6c7HP41Egw1kmIl@cluster0.yxdttqy.mongodb.net/?retryWrites=true&w=majority';
describe('GET /', () => {
    let server;

    const request = require('supertest');
    const app = require('../index'); // Adjust the path to your Express app (index.js)
    
    describe('GET /', () => {
      let server;    
      it('should render the "add invoice" page', async () => {
        const res = await request(app).get('/i');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Add Invoice');
      });
    
      // Add more test cases as needed
    });
  });

