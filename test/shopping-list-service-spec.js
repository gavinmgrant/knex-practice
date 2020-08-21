const { expect } = require("chai")
const ShoppingListService = require('../src/shopping-list-service')
const knex = require('knex')
const { getAllItems } = require("../src/shopping-list-service")

describe(`Articles service object`, function() {
    let db

    // this is an array of mock data that represents valid content for the database
    let testItems = [
        {
            id: 1,
            name: 'Item 1',
            price: '5',
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            category: 'Main',
        },
        {
            id: 2,
            name: 'Item 2',
            price: '10',
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            category: 'Main',
        },
        {
            id: 3,
            name: 'Item 3',
            price: '15',
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            category: 'Main',
        }
    ]

    // prepare the database connection using the 'db' variable
    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    })

    // clear the table before all test runs and after each individual test
    before(() => db('shopping_list').truncate())
    afterEach(() => db('shopping_list').truncate())

    // after all test runs, let go of the db connection
    after(() => db.destroy())
    
    context(`Given 'shopping_list' table has data`, () => {
        beforeEach(() => {
            return db
                .into('shopping_list')
                .insert(testItems)
        })
        
        it(`getAllItems() resolves all items from 'shopping_list' table`, () => {
            const expectedItems = testItems.map(item => ({
                ...item,
                checked: false,
            }))
            return ShoppingListService.getAllItems(db)
            .then(actual => {
                expect(actual).to.eql(expectedItems)
            })
        })

        it(`getById() resolves an item by id from 'shopping_list' table`, () => {
            const idToGet = 3
            const thirdTestItem = testItems[idToGet - 1]
            return ShoppingListService.getById(db, idToGet)
                .then(actual => {
                    expect(actual).to.eql({
                        id: idToGet,
                        name: thirdTestItem.name,
                        price: thirdTestItem.price,
                        date_added: thirdTestItem.date_added,
                        checked: false,
                        category: thirdTestItem.category 
                    })
                })
        })

        it(`deleteItem() removes an item by id from 'shopping_list' table`, () => {
            const itemId = 3
            return ShoppingListService.deleteItem(db, itemId)
                .then(() => ShoppingListService.getAllItems(db))
                .then(allItems => {
                    // copy the test items array without the "deleted" article
                    const expected = testItems
                        .filter(item => item.id !== itemId)
                        .map(item => ({
                            ...item,
                            checked: false,
                        }))
                    expect(allItems).to.eql(expected)
                })
        })

        it(`updateItem() updates an item from the 'shopping_list' table`, () => {
            const idOfItemToUpdate = 3
            const newItemData = {
                name: 'Updated item name',
                price: '5',
                date_added: new Date(),
                checked: true,
                category: 'Main'
            }
            const originalItem = testItems[idOfItemToUpdate - 1]
            return ShoppingListService.updateItem(db, idOfItemToUpdate, newItemData)
                .then(() => ShoppingListService.getById(db, idOfItemToUpdate))
                .then(item => {
                    expect(item).to.eql({
                        id: idOfItemToUpdate,
                        ...originalItem,
                        ...newItemData,
                    })
                })
        })
    })

    context(`Given 'shopping_list' has no data`, () => {
        it(`getAllItems() resolves an empty array`, () => {
            return ShoppingListService.getAllItems(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })

        it(`insertItem() inserts a new item and resolves the new item with an 'id'`, () => {
            const newItem = {
                name: 'Test item name',
                price: '5',
                date_added: new Date('2020-01-01T00:00:00.000Z'),
                checked: true,
                category: 'Main'
            }
            return ShoppingListService.insertItem(db, newItem)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        name: newItem.name,
                        price: newItem.price,
                        date_added: newItem.date_added,
                        checked: newItem.checked,
                        category: newItem.category,
                    })
                })
        })
    })
})