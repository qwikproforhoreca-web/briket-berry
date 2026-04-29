const assert = require('node:assert/strict')

function getOrderPricingBySku(sku, dbRegularPrice = 0) {
  const normalizedSku = String(sku || '').toUpperCase()

  if (normalizedSku === 'PFR-8') return { regular: 120, wholesale: 100, wholesaleMin: 50 }
  if (normalizedSku === 'PKB-10') return { regular: 890, wholesale: 835, wholesaleMin: 20 }

  return { regular: Number(dbRegularPrice || 0), wholesale: Number(dbRegularPrice || 0), wholesaleMin: 1 }
}

function getUnitPrice(sku, qty) {
  const { regular, wholesale, wholesaleMin } = getOrderPricingBySku(sku)
  return qty >= wholesaleMin ? wholesale : regular
}

function run() {
  // Firestarters (PFR-8): 120 regular, 100 wholesale from 50.
  assert.equal(getUnitPrice('PFR-8', 1), 120)
  assert.equal(getUnitPrice('PFR-8', 49), 120)
  assert.equal(getUnitPrice('PFR-8', 50), 100)
  assert.equal(getUnitPrice('PFR-8', 180), 100)

  // Briquettes (PKB-10): 890 regular, 835 wholesale from 20.
  assert.equal(getUnitPrice('PKB-10', 1), 890)
  assert.equal(getUnitPrice('PKB-10', 19), 890)
  assert.equal(getUnitPrice('PKB-10', 20), 835)
  assert.equal(getUnitPrice('PKB-10', 40), 835)

  // Cart total check from the screenshot scenario after fix:
  // 180 * 100 + 20 * 835 = 34_700.
  const fixedTotal = 180 * getUnitPrice('PFR-8', 180) + 20 * getUnitPrice('PKB-10', 20)
  assert.equal(fixedTotal, 34700)

  console.log('order-pricing tests passed')
}

run()
