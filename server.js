import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'path'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import {userService} from './services/user.service.js'
import { authService } from './services/auth.service.js'

const app = express()

// Express Config
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

//LIST
app.get('/api/bug', (req, res) => {
    const { txt, minSeverity, label, sortBy, sortDir, pageIdx } = req.query

    const filterBy = {
        txt: txt,
        minSeverity: minSeverity,
        label: label,
        sortBy: sortBy,
        sortDir: +sortDir,
        pageIdx: +pageIdx || 0
    }

    bugService.query(filterBy)
        .then(bugs => {
            res.json(bugs)
        })
        .catch(err => {
            loggerService.error('ERROR: Cannot get bugs:', err)
            res.status(400).send('Cannot get bugs')
        })
})

// UPDATE
app.put('/api/bug', (req, res) => {
    const bug = req.body

    console.log(bug);
    

    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    // console.log(loggedinUser);
    
    if (!loggedinUser) return res.status(401).send('Cannot update bug')

    bugService.save(bug, loggedinUser)
        .then(bug => res.send(bug, loggedinUser))
        .catch((err) => {
            loggerService.error('Cannot update bug', err)
            res.status(400).send('Cannot update bug')
        })
})

// ADD
app.post('/api/bug', (req, res) => {
    const bug = req.body

    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot add bug')

    bugService.save(bug, loggedinUser)
        .then(bug => res.send(bug))
        .catch((err) => {
            loggerService.error('Cannot add bug', err)
            res.status(400).send('Cannot add bug')
        })


})

//READ
app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    const { visitedBugs = [] } = req.cookies

    if (!visitedBugs.includes(bugId)) {
        if (visitedBugs.length >= 3) return res.status(401).send('Wait for a bit')
        else visitedBugs.push(bugId)

        res.cookie('visitedBugs', visitedBugs, { maxAge: 1000 * 70 })
    }

    bugService.getById(bugId)
        .then(bug => {
            res.json(bug)
        })
        .catch(err => {
            loggerService.error('ERROR: Cannot get bug:', err)
            res.status(400).send('Cannot get bug')
        })
})

app.delete('/api/bug/:bugId/', (req, res) => {
    const { bugId } = req.params

    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot remove bug')


    bugService.remove(bugId, loggedinUser)
        .then(() => {
            res.send('Bug removed')
        })
        .catch(err => {
            loggerService.error('ERROR: Cannot remove bug:', err)
            res.status(400).send('Cannot remove bug')
        })
})

// User API
app.get('/api/user', (req, res) => {
    userService
        .query()
        .then(users => res.send(users))
        .catch(err => {
            loggerService.error('Cannot load users', err)
            res.status(400).send('Cannot load users')
        })
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params

    userService
        .getById(userId)
        .then(user => res.send(user))
        .catch(err => {
            loggerService.error('Cannot load user', err)
            res.status(400).send('Cannot load user')
        })
})

// Auth API
app.post('/api/auth/login', (req, res) => {
    const credentials = req.body

    authService
        .checkLogin(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(() => res.status(404).send('Invalid Credentials'))
})

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body

    userService
        .add(credentials)
        .then(user => {
            if (user) {
                const loginToken = authService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(400).send('Cannot signup')
            }
        })
        .catch(err => res.status(400).send('Username taken.'))
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})

// Fallback route
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = 3030
app.listen(port, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)