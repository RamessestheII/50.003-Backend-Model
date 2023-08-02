const request = require('supertest');
const app = require('../index'); 

// unfinished test cases
const testInvoiceOne = {
    InvoiceNumber: "00021562",
    Path: "\\uploads\\invoices\\invoice-1690859650983-928784063-1.jpg",
    Discount: 3.18,
    GrandTotal: 110.02,
    Product: [{"Product":"64c87e4039e32a9b93e5dba5","Quantity":20,"UnitCost":2},
            {"Product":"64c87e8639e32a9b93e5dba7","Quantity":10,"UnitCost":1},
            {"Product":"64c87ec339e32a9b93e5dba9","Quantity":10,"UnitCost":1.85},
            {"Product":"64c87f8f1b2eb3ec50aad72c","Quantity":5,"UnitCost":1},
            {"Product":"64c87fe11b2eb3ec50aad72e","Quantity":10,"UnitCost":1.6},
            {"Product":"64c880021b2eb3ec50aad730","Quantity":10,"UnitCost":0.9},
            {"Product":"64c8802c1b2eb3ec50aad732","Quantity":5,"UnitCost":1.5}],
      Supplier: "64c87cfe39e32a9b93e5dba3"
  }
async function testAddInvoice(invoice){
    const response = await request(app).post('/invoice/add')
        .send(invoice)
    expect(response.statusCode).toBe(200);
    // expect(response.body).toHaveProperty('');
}

async function testGetAll(){
      const response = await request(app).get('/invoice/all');
      expect(response.statusCode).toBe(200);
}

async function testGetByID(id, invoice){
    const response = await request(app).get(`/invoice/${id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('Product');
    expect(response.body).toHaveProperty('Paid');
    expect(response.body).toHaveProperty('PaidDate');
    expect(response.body).toHaveProperty('Soa');
    expect(response.body).toHaveProperty('Supplier');
}
describe('Invoice endpoint tests', ()=>{
    test('POST invoice/add should return the invoice retrived after adding to the database')
    // test('GET /invoice/:id should return the invoice of the given ID', testGetByID(id))
    test('GET /invoice/all should return a list of invoices', testGetAll())
    }
);