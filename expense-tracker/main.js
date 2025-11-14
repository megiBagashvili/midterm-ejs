const express = require('express');
const app = express()

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));

const expenses = [
    {
        id: 1,
        description: "Groceries",
        amount: 50,
        category: "Food"
    },
    {
        id: 2,
        description: "Electricity Bill",
        amount: 75,
        category: "Utilities"
    },
    {
        id: 3,
        description: "Movie Tickets",
        amount: 25,
        category: "Entertainment"
    },
]

app.get('/', (req, res) => {
    res.render('pages/home.ejs', { expenses })
})

app.get('/create', (req, res) => {
    res.render('pages/create.ejs')
})

app.get('/expenses/:id', (req, res) => {
    const id = Number(req.params.id)
    const expense = expenses.find(e => e.id === id)
    res.render('pages/details.ejs', { expense })
})

app.get('/expenses/:id/details', (req, res) => {
    const id = Number(req.params.id)
    const expense = expenses.find(e => e.id === id)
    res.render('pages/update.ejs', { expense })
})


app.get('/api/expenses', (req, res) => {
    res.json(expenses)
})

app.post('/api/expenses', (req, res) => {
    const { description, amount, category } = req.body
    const lastId = expenses[expenses.length - 1]?.id || 0
    const newExpense = {
        id: lastId + 1,
        description,
        amount: Number(amount),
        category
    }
    expenses.push(newExpense)

    res.redirect('/')
})

app.get('/api/expenses/:id/delete', (req, res) => {
    const id = Number(req.params.id)
    const index = expenses.findIndex(e => e.id === id)
    expenses.splice(index, 1)

    res.redirect('/')
})

app.post('/api/expenses/:id/update', (req, res) => {
    const id = Number(req.params.id)
    const index = expenses.findIndex(e => e.id === id)
    const { description, amount, category } = req.body

    const updateReq = {}
    if (description) updateReq['description'] = description
    if (amount) updateReq['amount'] = Number(amount)
    if (category) updateReq['category'] = category

    expenses[index] = {
        ...expenses[index],
        ...updateReq
    }

    res.redirect('/')
})

app.listen(3000, () => {
    console.log('server running on http://localhost:3000')
})