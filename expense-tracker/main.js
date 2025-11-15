const express = require('express');
const fs = require('fs/promises');
const EXPENSES_FILE = './expenses.json';

const app = express()

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    try {
        const fileData = await fs.readFile(EXPENSES_FILE, 'utf-8');
        const expenses = JSON.parse(fileData);

        const { category } = req.query;
        let filteredExpenses = expenses;

        if (category) {
            filteredExpenses = expenses.filter(e =>
                e.category && e.category.toLowerCase().includes(category.toLowerCase())
            );
        }

        res.render('pages/home.ejs', { expenses: filteredExpenses });
    } catch (err) {
        console.error("Error reading file for home page:", err.message);
        res.render('pages/home.ejs', { expenses: [] });
    }
})

app.get('/create', (req, res) => {
    res.render('pages/create.ejs');
})

app.get('/expenses/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const fileData = await fs.readFile(EXPENSES_FILE, 'utf-8');
        const expenses = JSON.parse(fileData);

        const expense = expenses.find(e => e.id === id);
        res.render('pages/details.ejs', { expense });
    } catch (err) {
        console.error("Error reading file for details:", err.message);
        res.redirect('/');
    }
})

app.get('/expenses/:id/details', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const fileData = await fs.readFile(EXPENSES_FILE, 'utf-8');
        const expenses = JSON.parse(fileData);

        const expense = expenses.find(e => e.id === id);
        res.render('pages/update.ejs', { expense });
    } catch (err) {
        console.error("Error reading file for update page:", err.message);
        res.redirect('/');
    }
})


app.get('/api/expenses', async (req, res) => {
    try {
        const fileData = await fs.readFile(EXPENSES_FILE, 'utf-8');
        const expenses = JSON.parse(fileData);
        res.json(expenses);
    } catch (err) {
        console.error("Error reading file for API:", err.message);
        res.json([]);
    }
})

app.post('/api/expenses', async (req, res) => {
    try {
        let expenses = [];
        try {
            const fileData = await fs.readFile(EXPENSES_FILE, 'utf-8');
            expenses = JSON.parse(fileData);
        } catch (readErr) {
        }

        const { description, amount, category } = req.body;
        const lastId = expenses[expenses.length - 1]?.id || 0;
        const newExpense = {
            id: lastId + 1,
            description,
            amount: Number(amount),
            category
        };
        expenses.push(newExpense);

        await fs.writeFile(EXPENSES_FILE, JSON.stringify(expenses, null, 2));

        res.redirect('/');
    } catch (err) {
        console.error("Error creating expense:", err.message);
        res.redirect('/');
    }
})

app.get('/api/expenses/:id/delete', async (req, res) => {
    try {
        const fileData = await fs.readFile(EXPENSES_FILE, 'utf-8');
        let expenses = JSON.parse(fileData);

        const id = Number(req.params.id);
        const filteredExpenses = expenses.filter(e => e.id !== id);

        await fs.writeFile(EXPENSES_FILE, JSON.stringify(filteredExpenses, null, 2));

        res.redirect('/');
    } catch (err) {
        console.error("Error deleting expense:", err.message);
        res.redirect('/');
    }
})

app.post('/api/expenses/:id/update', async (req, res) => {
    try {
        const fileData = await fs.readFile(EXPENSES_FILE, 'utf-8');
        let expenses = JSON.parse(fileData);

        const id = Number(req.params.id);
        const index = expenses.findIndex(e => e.id === id);

        if (index === -1) {
            console.error("Tried to update expense that doesn't exist:", id);
            return res.redirect('/');
        }

        const { description, amount, category } = req.body;
        const updateReq = {};
        if (description) updateReq['description'] = description;
        if (amount) updateReq['amount'] = Number(amount);
        if (category) updateReq['category'] = category;

        expenses[index] = {
            ...expenses[index],
            ...updateReq
        };

        await fs.writeFile(EXPENSES_FILE, JSON.stringify(expenses, null, 2));

        res.redirect('/');
    } catch (err) {
        console.error("Error updating expense:", err.message);
        res.redirect('/');
    }
})

app.listen(3000, () => {
    console.log('server running on http://localhost:3000')
})