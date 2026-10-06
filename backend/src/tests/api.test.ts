import http from 'http';

const BASE_URL = 'http://localhost:5000/api/products';

function makeRequest(
  url: string,
  method: string,
  data?: any
): Promise<{ statusCode: number; body: any }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options: http.RequestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let bodyStr = '';
      res.on('data', (chunk) => (bodyStr += chunk));
      res.on('end', () => {
        try {
          const json = bodyStr ? JSON.parse(bodyStr) : {};
          resolve({ statusCode: res.statusCode || 500, body: json });
        } catch {
          resolve({ statusCode: res.statusCode || 500, body: bodyStr });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('==================================================');
  console.log(' RUNNING COMPREHENSIVE BACKEND API TEST SUITE');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.log(`❌ [FAIL] ${testName} ${detail ? `-> ${detail}` : ''}`);
      failed++;
    }
  }

  try {
    let createdId = '';

    // TEST 1: Create product
    const createRes = await makeRequest(BASE_URL, 'POST', {
      name: 'Automated Test Headset',
      category: 'Electronics',
      price: 3999,
      stockQuantity: 15,
      reorderPoint: 20,
      description: 'High quality automated testing wireless headset',
    });
    assert(
      createRes.statusCode === 201 && createRes.body.success === true && !!createRes.body.data._id,
      'TEST 1: Create product (POST /api/products)'
    );
    if (createRes.body?.data?._id) {
      createdId = createRes.body.data._id;
    }

    // TEST 2: Retrieve created product
    const getCreatedRes = await makeRequest(`${BASE_URL}/${createdId}`, 'GET');
    assert(
      getCreatedRes.statusCode === 200 &&
        getCreatedRes.body.success === true &&
        getCreatedRes.body.data.name === 'Automated Test Headset' &&
        getCreatedRes.body.data.reorderPoint === 20 &&
        getCreatedRes.body.data.stockStatus === 'Low Stock',
      'TEST 2: Retrieve created product (GET /api/products/:id)'
    );

    // TEST 3: Update created product
    const updateRes = await makeRequest(`${BASE_URL}/${createdId}`, 'PUT', {
      name: 'Automated Test Headset V2',
      category: 'Electronics',
      price: 4499,
      stockQuantity: 5,
      reorderPoint: 4,
      description: 'Updated description for automated test headset',
    });
    assert(
      updateRes.statusCode === 200 &&
        updateRes.body.success === true &&
        updateRes.body.data.name === 'Automated Test Headset V2' &&
        updateRes.body.data.stockStatus === 'In Stock' &&
        updateRes.body.data.reorderPoint === 4,
      'TEST 3: Update created product (PUT /api/products/:id)'
    );

    // TEST 4: Retrieve updated product
    const getUpdatedRes = await makeRequest(`${BASE_URL}/${createdId}`, 'GET');
    assert(
      getUpdatedRes.statusCode === 200 &&
        getUpdatedRes.body.data.price === 4499 &&
        getUpdatedRes.body.data.stockStatus === 'In Stock',
      'TEST 4: Retrieve updated product (GET /api/products/:id)'
    );

    // TEST 5: Stock adjustments are recorded and cannot create negative stock
    const adjustmentRes = await makeRequest(`${BASE_URL}/${createdId}/adjustments`, 'POST', {
      delta: 2,
      reason: 'Received supplier shipment',
    });
    assert(
      adjustmentRes.statusCode === 200 &&
        adjustmentRes.body.data.stockQuantity === 7 &&
        adjustmentRes.body.data.stockAdjustments.at(-1).reason === 'Received supplier shipment',
      'TEST 5: Record stock adjustment and history'
    );
    const underflowRes = await makeRequest(`${BASE_URL}/${createdId}/adjustments`, 'POST', {
      delta: -20,
      reason: 'Invalid issue',
    });
    assert(underflowRes.statusCode === 409, 'TEST 6: Reject stock adjustment below zero');

    // TEST 7: Bulk category and quantity changes
    const bulkCategoryRes = await makeRequest(`${BASE_URL}/bulk`, 'POST', {
      ids: [createdId],
      action: 'category',
      category: 'Bulk Test',
    });
    const bulkAdjustmentRes = await makeRequest(`${BASE_URL}/bulk`, 'POST', {
      ids: [createdId],
      action: 'adjustStock',
      delta: 3,
      reason: 'Bulk count correction',
    });
    assert(
      bulkCategoryRes.statusCode === 200 && bulkCategoryRes.body.data.affectedCount === 1 &&
        bulkAdjustmentRes.statusCode === 200 && bulkAdjustmentRes.body.data.affectedCount === 1,
      'TEST 7: Apply bulk category and stock actions'
    );

    // TEST 8: Delete product
    const deleteRes = await makeRequest(`${BASE_URL}/${createdId}`, 'DELETE');
    assert(
      deleteRes.statusCode === 200 && deleteRes.body.success === true,
      'TEST 8: Delete product (DELETE /api/products/:id)'
    );

    // TEST 9: Retrieve deleted product (Expected: 404)
    const getDeletedRes = await makeRequest(`${BASE_URL}/${createdId}`, 'GET');
    assert(
      getDeletedRes.statusCode === 404 && getDeletedRes.body.success === false,
      'TEST 9: Retrieve deleted product (Expected: 404)'
    );

    // TEST 10: Invalid input (price = -100, Expected: 400)
    const invalidRes = await makeRequest(BASE_URL, 'POST', {
      name: 'Bad Price Product',
      category: 'Electronics',
      price: -100,
      stockQuantity: 10,
      description: 'Invalid price test',
    });
    assert(
      invalidRes.statusCode === 400 && invalidRes.body.success === false,
      'TEST 10: Invalid input handling (price = -100, Expected: 400)'
    );

    // TEST 11: Missing record (Non-existent MongoDB ID, Expected: 404)
    const missingRes = await makeRequest(`${BASE_URL}/507f1f77bcf86cd799439011`, 'GET');
    assert(
      missingRes.statusCode === 404 && missingRes.body.success === false,
      'TEST 11: Missing record handling (Non-existent valid ID, Expected: 404)'
    );

    // TEST 12: Invalid ID format (Malformed ID, Expected: 400)
    const malformedRes = await makeRequest(`${BASE_URL}/invalid-mongo-id`, 'GET');
    assert(
      malformedRes.statusCode === 400 && malformedRes.body.success === false,
      'TEST 12: Malformed ID handling (Invalid format, Expected: 400)'
    );

    // TEST 13: Search (GET /api/products?search=Headphones)
    const searchRes = await makeRequest(`${BASE_URL}?search=Headphones`, 'GET');
    assert(
      searchRes.statusCode === 200 && Array.isArray(searchRes.body.data),
      'TEST 13: Search query parameter (GET /api/products?search=Headphones)'
    );

    // TEST 14: Category filtering (GET /api/products?category=Electronics)
    const categoryRes = await makeRequest(`${BASE_URL}?category=Electronics`, 'GET');
    assert(
      categoryRes.statusCode === 200 && Array.isArray(categoryRes.body.data),
      'TEST 14: Category filter query parameter (GET /api/products?category=Electronics)'
    );

    // TEST 15: Price sorting (GET /api/products?sort=price_asc)
    const sortRes = await makeRequest(`${BASE_URL}?sort=price_asc`, 'GET');
    assert(
      sortRes.statusCode === 200 && Array.isArray(sortRes.body.data),
      'TEST 15: Price sort query parameter (GET /api/products?sort=price_asc)'
    );

    // TEST 16: Server-side pagination returns total and page metadata
    const pageRes = await makeRequest(`${BASE_URL}?page=1&limit=2`, 'GET');
    assert(
      pageRes.statusCode === 200 && pageRes.body.data.length <= 2 &&
        pageRes.body.pagination.page === 1 && pageRes.body.pagination.limit === 2 &&
        pageRes.body.count >= pageRes.body.data.length,
      'TEST 16: Paginated product response'
    );

    // TEST 17: Bulk CSV import and cleanup
    const importRes = await makeRequest(`${BASE_URL}/import`, 'POST', {
      products: [{
        name: 'Automated CSV Import Product',
        category: 'Books',
        price: 25,
        stockQuantity: 4,
        reorderPoint: 5,
        description: 'Imported through the API test suite',
      }],
    });
    const importedRes = await makeRequest(`${BASE_URL}?search=Automated%20CSV%20Import%20Product`, 'GET');
    const importedId = importedRes.body.data?.[0]?._id;
    const bulkDeleteRes = importedId
      ? await makeRequest(`${BASE_URL}/bulk`, 'POST', { ids: [importedId], action: 'delete' })
      : { statusCode: 0, body: {} };
    assert(
      importRes.statusCode === 201 && importRes.body.data.importedCount === 1 &&
        importedRes.body.data?.[0]?.stockStatus === 'Low Stock' &&
        bulkDeleteRes.statusCode === 200 && bulkDeleteRes.body.data.affectedCount === 1,
      'TEST 17: Import products with reorder points and bulk delete'
    );

    console.log('\n==================================================');
    console.log(` TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
