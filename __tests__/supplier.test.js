const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const faker = require('faker');

function generatePhoneNumber() {
    const phoneNumber = faker.phone.phoneNumber();
    const numericPhoneNumber = parseInt(phoneNumber.replace(/\D/g, ''), 10); // Remove non-numeric characters
  
    return numericPhoneNumber;
  }

describe('Supplier fuzz testing', () => {
    let id;
    describe('POST /supplier/add', () => {
        it ('should add a supplier', async () => {
            const res = await request(app)
            .post('/supplier/add')
            .send({
                "SupplierName": faker.company.companyName(),
                "Contact": generatePhoneNumber(),
                "Address": faker.address.streetAddress(),
                "Email" : faker.internet.email(),
            });
            expect(res.statusCode).toEqual(200);
            id = res.body._id;
        });
    });
    describe('GET /supplier/', () => {
        it ('should get a supplier', async () => {
            const res = await request(app)
            .get('/supplier/')
            .query({id : id});
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('SupplierName');
        });
    });
    describe ('DELETE /delete/:id', () => {
        it ('should delete a supplier', async () => {
            const res = await request(app)
            .delete('/supplier/delete/' + id);
            expect(res.statusCode).toEqual(200);
        });
    });
    describe ('Get /sublier/non existent', () => {
        it ('should not get a supplier', async () => {
            const res = await request(app)
            .get('/supplier/')
            .query({id: id});
            expect(res.statusCode).toEqual(404);
        });
    });

    let id2;
    describe('POST /supplier/add', () => {
        it ('should add a supplier 2', async () => {
            const res = await request(app)
            .post('/supplier/add')
            .send({
                "SupplierName": faker.company.companyName(),
                "Contact": generatePhoneNumber(),
                "Address": faker.address.streetAddress(),
                "Email" : faker.internet.email(),
            });
            expect(res.statusCode).toEqual(200);
            id2 = res.body._id;
        });
    });
    describe('GET /supplier/', () => {
        it ('should get a supplier 2', async () => {
            const res = await request(app)
            .get('/supplier/')
            .query({id : id2});
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('SupplierName');
        });
    });
    describe ('DELETE /delete/:id', () => {
        it ('should delete a supplier 2', async () => {
            const res = await request(app)
            .delete('/supplier/delete/' + id2);
            expect(res.statusCode).toEqual(200);
        });
    });
    describe ('Get /sublier/non existent', () => {
        it ('should not get a supplier 2', async () => {
            const res = await request(app)
            .get('/supplier/')
            .query({id: id2});
            expect(res.statusCode).toEqual(404);
        });
    });
});
/*describe('test supplier', () => {
    let id;
    describe('POST /supplier/add', () => {
        it ('should add a supplier', async () => {
            const res = await request(app)
            .post('/supplier/add')
            .send({
                "SupplierName": "Test Supplier"",
                "Contact": 1234566789,
                "Address": "Test Address",
                "Email" : "test@testing.com",
            });
            expect(res.statusCode).toEqual(200);
            id = res.body._id;
        });
    });
    describe('GET /supplier/', () => {
        it ('should get a supplier', async () => {
            const res = await request(app)
            .get('/supplier/')
            .query({id : id});
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('SupplierName');
        });
    });
    describe ('DELETE /delete/:id', () => {
        it ('should delete a supplier', async () => {
            const res = await request(app)
            .delete('/supplier/delete/' + id);
            expect(res.statusCode).toEqual(200);
        });
    });
    describe ('Get /sublier/non existent', () => {
        it ('should not get a supplier', async () => {
            const res = await request(app)
            .get('/supplier/')
            .query({id: id});
            expect(res.statusCode).toEqual(404);
        });
    });
});*/