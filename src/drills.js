require('dotenv').config()
const knex = require('knex')

const knexInstance = knex({
    client: 'pg',
    connection: process.env.DB_URL
})

console.log('knex and driver installed correctly');

function searchByTerm(searchTerm) {
    knexInstance
        .select('name', 'price', 'category')
        .from('shopping_list')
        .where('name', 'ILIKE', `%${searchTerm}%`)
        .then(result => {
            console.log(result)
        })
}

// searchByTerm('steak')

function paginateItems(pageNumber) {
    const itemsPerPage = 6
    const offset = itemsPerPage * (pageNumber - 1)
    knexInstance
        .select('id', 'name', 'price', 'category')
        .from('shopping_list')
        .limit(itemsPerPage)
        .offset(offset)
        .then(results => {
            console.log(results)
        })
}

// paginateItems(2)

function getItemsAfterDate(daysAgo) {
    knexInstance
        .select('name', 'price', 'category', 'date_added')
        .from('shopping_list')
        .where(
            'date_added', 
            '>', 
            knexInstance.raw(`now() - '?? days'::INTERVAL`, daysAgo)
        )
        .then(result => {
            console.log(result)
        })
}

// getItemsAfterDate(4)

function totalCostByCategory() {
    knexInstance
        .select('category')
        .sum('price as total')
        .from('shopping_list')
        .groupBy('category')
        .orderBy([
            { column: 'category', order: 'DESC' }
        ])
        .then(result => {
            console.log(result)
        })
}

totalCostByCategory()