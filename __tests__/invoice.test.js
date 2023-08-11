const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); 
describe('POST /invoice/scaninv', () => {
    
    test('should upload and process an image successfully', async () => {
      const response = await request(app)
        .post('/invoice/scaninv')
        .attach("invoice", "C:\\Users\\dell\\Desktop\\ESC\\50.003-Backend-Model\\__tests__\\invoice.jpg");
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('path');
    }, 60000);

    test ('should return error ocr failed on non invoices ', async () => {
      const response = await request(app)
        .post('/invoice/scaninv')
        .attach("invoice", "C:\\Users\\dell\\Desktop\\ESC\\50.003-Backend-Model\\__tests__\\water.JPG");
      expect(response.body.result).toHaveProperty('error');
    }, 30000);
    test ('Get non existent id', async () => {
      const id2 = "5f9e9b3b1c9d440000d1f1f0";

      const response = await request(app)
        .get('/invoice/')
        .query({id: id2});
      expect(response.statusCode).toEqual(404);
    });
    /*test ('Get existent id', async () => {
      const response = await request(app)
        .get('/invoice/')
        .query({id: ID}); 
      expect(response.statusCode).toEqual(200);
    });*/


  });